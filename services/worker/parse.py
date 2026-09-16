"""Bounded child process. Runs only inside the parser OS sandbox."""

import csv
import io
import json
import os
from pathlib import Path
import resource
import subprocess
import sys
import zipfile

MAX_TEXT = 20 * 1024**2
MAX_ARCHIVE = 1024**3


def linux_sandbox(work):
    import ctypes as c
    import ctypes.util
    import errno

    libc = c.CDLL(None, use_errno=True)
    if libc.prctl(38, 1, 0, 0, 0):
        raise RuntimeError("SANDBOX_UNAVAILABLE")
    abi = libc.syscall(444, 0, 0, 1)
    if abi < 3:
        raise RuntimeError("SANDBOX_UNAVAILABLE")

    class Ruleset(c.Structure):
        _fields_ = [("fs", c.c_uint64)]

    class PathRule(c.Structure):
        _pack_ = 1
        _fields_ = [("access", c.c_uint64), ("fd", c.c_int32)]

    handled = (1 << 15) - 1
    attrs = Ruleset(handled)
    fd = libc.syscall(444, c.byref(attrs), c.sizeof(attrs), 0)
    if fd < 0:
        raise RuntimeError("SANDBOX_UNAVAILABLE")
    paths = [
        Path("/usr"),
        Path("/lib"),
        Path("/lib64"),
        Path(sys.prefix),
        Path(sys.base_prefix),
        Path(__file__).parent,
        Path("/etc/fonts"),
        Path("/etc/ld.so.cache"),
        Path("/etc/localtime"),
        Path("/dev/null"),
        Path("/dev/urandom"),
    ]
    try:
        for p in paths + [work]:
            if not p.exists():
                continue
            access = handled if p == work else (1 | 4 | 8 if p.is_dir() else 4)
            handle = os.open(p, os.O_PATH | os.O_CLOEXEC)
            try:
                rule = PathRule(access, handle)
                if libc.syscall(445, fd, 1, c.byref(rule), 0):
                    raise RuntimeError("SANDBOX_UNAVAILABLE")
            finally:
                os.close(handle)
        if libc.syscall(446, fd, 0):
            raise RuntimeError("SANDBOX_UNAVAILABLE")
    finally:
        os.close(fd)
    restrict_syscalls()


def restrict_syscalls():
    import ctypes as c
    import ctypes.util
    import errno

    sec = c.CDLL(
        ctypes.util.find_library("seccomp") or "libseccomp.so.2", use_errno=True
    )
    sec.seccomp_init.argtypes = [c.c_uint32]
    sec.seccomp_init.restype = c.c_void_p
    sec.seccomp_rule_add.argtypes = [c.c_void_p, c.c_uint32, c.c_int, c.c_uint]
    sec.seccomp_load.argtypes = [c.c_void_p]
    sec.seccomp_release.argtypes = [c.c_void_p]
    sec.seccomp_syscall_resolve_name.argtypes = [c.c_char_p]
    ctx = sec.seccomp_init(0x7FFF0000)
    if not ctx:
        raise RuntimeError("SANDBOX_UNAVAILABLE")
    try:
        for name in [
            "socket",
            "connect",
            "bind",
            "listen",
            "accept",
            "accept4",
            "socketpair",
            "sendto",
            "sendmsg",
            "sendmmsg",
            "ptrace",
            "process_vm_readv",
            "process_vm_writev",
            "mount",
            "bpf",
            "keyctl",
            "open_by_handle_at",
            "io_uring_setup",
            "io_uring_enter",
            "io_uring_register",
        ]:
            number = sec.seccomp_syscall_resolve_name(name.encode())
            if number >= 0 and sec.seccomp_rule_add(
                ctx, 0x00050000 | errno.EPERM, number, 0
            ):
                raise RuntimeError("SANDBOX_UNAVAILABLE")
        if sec.seccomp_load(ctx):
            raise RuntimeError("SANDBOX_UNAVAILABLE")
    finally:
        sec.seccomp_release(ctx)


def archive_check(path):
    with zipfile.ZipFile(path) as z:
        entries = z.infolist()
        if len(entries) > 10000 or sum(i.file_size for i in entries) > MAX_ARCHIVE:
            raise ValueError("ARCHIVE_LIMIT")
        if len({i.filename for i in entries}) != len(entries):
            raise ValueError("DUPLICATE_ARCHIVE_PATH")
        for item in entries:
            if item.file_size > max(1, item.compress_size) * 100 or item.flag_bits & 1:
                raise ValueError("LOCKED_OR_ARCHIVE_LIMIT")
            if ".." in Path(item.filename).parts or item.filename.startswith(
                ("/", "\\")
            ):
                raise ValueError("UNSAFE_ARCHIVE_PATH")


def extract(path, suffix, work):
    parts = []
    locations = []
    warnings = []
    count = 0

    def add(text, **location):
        nonlocal count
        if count + len(text) > MAX_TEXT:
            raise ValueError("EXTRACTED_TEXT_LIMIT")
        start = count
        parts.append(text)
        count += len(text)
        locations.append(dict(start=start, end=count, **location))
        parts.append("\n")
        count += 1

    tool = "aha-safe-extract"
    version = "1.0.0"
    if suffix == ".txt":
        data = path.read_bytes()
        text = data.decode("utf-8")
        if "\x00" in text:
            raise ValueError("BINARY_TEXT")
        if len(data) > MAX_TEXT:
            raise ValueError("EXTRACTED_TEXT_LIMIT")
        return dict(
            text=text,
            locations=[dict(start=0, end=len(text))],
            warnings=[],
            tool="identity-utf8",
            version="1.0.0",
        )
    if suffix == ".csv":
        with path.open(encoding="utf-8-sig", newline="") as source:
            for row_index, row in enumerate(csv.reader(source), 1):
                if row_index > 50001 or len(row) > 16384:
                    raise ValueError("ROW_LIMIT")
                add("\t".join(row), row=row_index, header=row_index == 1)
        warnings.append(
            "CSV row 1 is treated as the header. Formulas remain literal text."
        )
    elif suffix == ".docx":
        from defusedxml import ElementTree as ET

        archive_check(path)
        with zipfile.ZipFile(path) as z:
            names = [
                n
                for n in z.namelist()
                if n == "word/document.xml"
                or n.startswith(
                    ("word/header", "word/footer", "word/footnotes", "word/endnotes")
                )
                and n.endswith(".xml")
            ]
            if "word/document.xml" not in names:
                raise ValueError("FORMAT_MISMATCH")
            for name in sorted(names):
                root = ET.fromstring(z.read(name))
                for index, p in enumerate(
                    root.iter(
                        "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"
                    ),
                    1,
                ):
                    text = "".join(
                        t.text or ""
                        for t in p.iter(
                            "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"
                        )
                    )
                    if text:
                        add(text, part=name, paragraph=index)
        warnings.append(
            "Text and tables extracted in document order; embedded objects and external links are not opened."
        )
    elif suffix == ".xlsx":
        # openpyxl initializes Python's MIME database. Use built-in mappings so
        # extraction does not depend on (or need access to) host MIME config.
        import mimetypes

        mimetypes.knownfiles = []
        mimetypes.init(files=[])
        import openpyxl

        archive_check(path)
        book = openpyxl.load_workbook(
            path, read_only=True, data_only=False, keep_links=False
        )
        try:
            if len(book.worksheets) > 200:
                raise ValueError("SHEET_LIMIT")
            for sheet in book.worksheets:
                for row_index, row in enumerate(sheet.iter_rows(values_only=True), 1):
                    if row_index > 50001 or len(row) > 16384:
                        raise ValueError("ROW_LIMIT")
                    add(
                        "\t".join("" if x is None else str(x) for x in row),
                        sheet=sheet.title,
                        row=row_index,
                    )
        finally:
            book.close()
        tool = "openpyxl"
        version = openpyxl.__version__
        warnings.append(
            "Workbook formulas are preserved as text and never calculated. External links are not opened."
        )
    elif suffix == ".pdf":
        import pypdf

        with path.open("rb") as source:
            if not source.read(8).startswith(b"%PDF-"):
                raise ValueError("FORMAT_MISMATCH")
        reader = pypdf.PdfReader(path, strict=True)
        if reader.is_encrypted:
            raise ValueError("LOCKED")
        if len(reader.pages) > 5000:
            raise ValueError("PAGE_LIMIT")
        for i, page in enumerate(reader.pages, 1):
            text = page.extract_text() or ""
            if text.strip():
                add(text, page=i, method="embedded-text")
            else:
                image = work / f"page-{i}"
                subprocess.run(
                    [
                        "pdftoppm",
                        "-f",
                        str(i),
                        "-l",
                        str(i),
                        "-scale-to",
                        "2000",
                        "-singlefile",
                        "-png",
                        str(path),
                        str(image),
                    ],
                    check=True,
                    timeout=60,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                text, words = ocr(Path(str(image) + ".png"), work)
                add(text, page=i, method="ocr", words=words)
                warnings.append(
                    f"Page {i}: OCR text requires comparison with the original image."
                )
                Path(str(image) + ".png").unlink(missing_ok=True)
        tool = "pypdf"
        version = pypdf.__version__
        if any(location.get("method") == "ocr" for location in locations):
            tool = "pypdf+tesseract+poppler"
            version += (
                "; "
                + subprocess.check_output(
                    ["tesseract", "--version"], text=True
                ).splitlines()[0]
            )
            version += (
                "; "
                + subprocess.run(
                    ["pdftoppm", "-v"], capture_output=True, text=True, check=True
                ).stderr.splitlines()[0]
            )
    elif suffix in (".png", ".jpg", ".jpeg", ".tif", ".tiff"):
        from PIL import Image, ImageSequence

        Image.MAX_IMAGE_PIXELS = 40000000
        with Image.open(path) as image:
            for i, frame in enumerate(ImageSequence.Iterator(image), 1):
                if i > 5000 or frame.width * frame.height > 40000000:
                    raise ValueError("IMAGE_LIMIT")
                frame_path = work / f"frame-{i}.png"
                frame.convert("RGB").save(frame_path)
                text, words = ocr(frame_path, work)
                add(text, page=i, method="ocr", words=words)
                frame_path.unlink(missing_ok=True)
        tool = "tesseract"
        version = subprocess.check_output(
            ["tesseract", "--version"], text=True
        ).splitlines()[0]
        warnings.append(
            "OCR text requires comparison with the original image. Recognition quality does not establish truth."
        )
    else:
        raise ValueError("UNSUPPORTED_FORMAT")
    return dict(
        text="".join(parts),
        locations=locations,
        warnings=warnings,
        tool=tool,
        version=version,
    )


def ocr(path, work):
    from PIL import Image

    with Image.open(path) as img:
        width, height = img.size
    out = work / "ocr"
    subprocess.run(
        ["tesseract", str(path), str(out), "-l", "eng", "--psm", "3", "tsv"],
        check=True,
        timeout=120,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    words = []
    texts = []
    with (work / "ocr.tsv").open(encoding="utf-8") as data:
        for row in csv.DictReader(data, delimiter="\t", quoting=csv.QUOTE_NONE):
            if row.get("text", "").strip():
                texts.append(row["text"])
                words.append(
                    dict(
                        text=row["text"],
                        confidence=float(row["conf"]),
                        bbox=[
                            int(row["left"]) / width,
                            int(row["top"]) / height,
                            int(row["width"]) / width,
                            int(row["height"]) / height,
                        ],
                    )
                )
    return " ".join(texts), words


def main():
    work = Path(sys.argv[1]).resolve()
    suffix = sys.argv[2]
    os.chdir(work)
    resource.setrlimit(resource.RLIMIT_CPU, (120, 120))
    resource.setrlimit(resource.RLIMIT_FSIZE, (64 * 1024**2, 64 * 1024**2))
    if sys.platform == "linux":
        resource.setrlimit(resource.RLIMIT_AS, (2 * 1024**3, 2 * 1024**3))
        if os.environ.get("AHA_ISOLATED_PARSER") == "1":
            restrict_syscalls()
        else:
            linux_sandbox(work)
    elif sys.platform != "darwin":
        raise RuntimeError("SANDBOX_UNAVAILABLE")
    try:
        value = extract(work / ("input" + suffix), suffix, work)
        (work / "result.json").write_text(
            json.dumps(value, ensure_ascii=False), encoding="utf-8"
        )
    except FileNotFoundError:
        (work / "result.json").write_text(json.dumps(dict(error="OCR_UNAVAILABLE")))
    except Exception as error:
        # Only stable codes leave the worker; source content never enters diagnostics.
        code = (
            str(error)
            if str(error)
            in {
                "LOCKED",
                "LOCKED_OR_ARCHIVE_LIMIT",
                "ARCHIVE_LIMIT",
                "UNSUPPORTED_FORMAT",
                "EXTRACTED_TEXT_LIMIT",
                "ROW_LIMIT",
                "SHEET_LIMIT",
                "PAGE_LIMIT",
                "IMAGE_LIMIT",
                "UNSAFE_ARCHIVE_PATH",
                "BINARY_TEXT",
                "DUPLICATE_ARCHIVE_PATH",
                "FORMAT_MISMATCH",
            }
            else "EXTRACTION_FAILED"
        )
        (work / "result.json").write_text(json.dumps(dict(error=code)))


if __name__ == "__main__":
    main()
