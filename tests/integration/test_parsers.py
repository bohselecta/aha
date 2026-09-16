import io
import json
import zipfile
import os
import pytest
from aha.parsing import extract_file
from aha.storage.intake import receive


def test_real_csv_docx_and_workbook_extraction(tmp_path):
    from openpyxl import Workbook

    csv = tmp_path / "sample.csv"
    csv.write_text(
        'name,note\nSYNTHETIC,"café, receipt"\nformula,=HYPERLINK(""https://invalid.test"")\n'
    )
    result = extract_file(csv, "sample.csv")
    assert "café, receipt" in result["text"]
    assert result["locations"][1]["row"] == 2
    docx = tmp_path / "sample.docx"
    with zipfile.ZipFile(docx, "w") as z:
        z.writestr(
            "word/document.xml",
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>SYNTHETIC café paragraph</w:t></w:r></w:p></w:body></w:document>',
        )
    result = extract_file(docx, "sample.docx")
    assert "SYNTHETIC café paragraph" in result["text"]
    assert result["locations"][0]["paragraph"] == 1
    workbook = Workbook()
    workbook.active.append(["SYNTHETIC", "=1+1"])
    xlsx = tmp_path / "sample.xlsx"
    workbook.save(xlsx)
    result = extract_file(xlsx, "sample.xlsx")
    assert "=1+1" in result["text"]
    assert result["locations"][0]["sheet"] == "Sheet"


def test_locked_pdf_and_hostile_xml_are_preserved_without_execution(store, tmp_path):
    from pypdf import PdfWriter

    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    writer.encrypt("synthetic-password")
    out = io.BytesIO()
    writer.write(out)
    job = receive(
        store,
        out.getvalue(),
        "locked.pdf",
        "application/pdf",
        "reviewer",
        0,
        "locked",
        "Synthetic locked file",
    )
    summary = json.loads(
        store.db.execute(
            "SELECT result_json FROM jobs WHERE id=?", (job["id"],)
        ).fetchone()[0]
    )
    assert len(summary["evidence_refs"]) == 1
    assert not summary["derivative_refs"]
    assert "password protected" in " ".join(summary["warnings"])
    secret = tmp_path / "outside.txt"
    secret.write_text("SYNTHETIC_HIDDEN_SENTINEL")
    hostile = tmp_path / "hostile.docx"
    with zipfile.ZipFile(hostile, "w") as z:
        z.writestr(
            "word/document.xml",
            f'<!DOCTYPE doc [<!ENTITY x SYSTEM "{secret.as_uri()}">]><doc>&x;</doc>',
        )
    result = extract_file(hostile, "hostile.docx")
    assert "error" in result
    assert "SYNTHETIC_HIDDEN_SENTINEL" not in json.dumps(result)


def test_real_text_pdf_with_page_map(tmp_path):
    from pypdf import PdfWriter
    from pypdf.generic import DictionaryObject, NameObject, DecodedStreamObject

    writer = PdfWriter()
    page = writer.add_blank_page(width=600, height=400)
    font = DictionaryObject(
        {
            NameObject("/Type"): NameObject("/Font"),
            NameObject("/Subtype"): NameObject("/Type1"),
            NameObject("/BaseFont"): NameObject("/Helvetica"),
        }
    )
    page[NameObject("/Resources")] = DictionaryObject(
        {
            NameObject("/Font"): DictionaryObject(
                {NameObject("/F1"): writer._add_object(font)}
            )
        }
    )
    stream = DecodedStreamObject()
    stream.set_data(b"BT /F1 20 Tf 40 300 Td (SYNTHETIC PDF passage 7342) Tj ET")
    page[NameObject("/Contents")] = writer._add_object(stream)
    path = tmp_path / "source.pdf"
    writer.write(path)
    result = extract_file(path, path.name)
    assert "SYNTHETIC PDF passage 7342" in result["text"]
    assert result["locations"][0]["page"] == 1


@pytest.mark.skipif(
    not os.environ.get("AHA_PARSER_SPOOL"),
    reason="OCR is verified in the isolated container runtime",
)
def test_real_image_and_scanned_pdf_ocr(tmp_path):
    from PIL import Image, ImageDraw, ImageFont

    image = Image.new("RGB", (1400, 400), "white")
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 55)
    draw.text((60, 120), "SYNTHETIC RECEIPT 7342", fill="black", font=font)
    for extension in ("png", "jpg", "tiff", "pdf"):
        path = tmp_path / ("scan." + extension)
        image.save(path)
        result = extract_file(path, path.name)
        assert "SYNTHETIC RECEIPT 7342" in result["text"], result
        location = result["locations"][0]
        assert location["method"] == "ocr"
        assert location["words"]
        assert all(0 <= v <= 1 for word in location["words"] for v in word["bbox"])
