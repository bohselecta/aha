#!/usr/bin/env python3
"""Validate the specification artifacts, not an implementation of the app."""
from pathlib import Path
import copy
import hashlib
import json
import sqlite3
import tempfile
from datetime import datetime
from jsonschema import Draft202012Validator, FormatChecker
from openapi_spec_validator import validate as validate_openapi

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = json.loads((ROOT / 'schemas/contracts.schema.json').read_text())
CHECKS = []

def load(p):
    return json.loads((ROOT / p).read_text())

def check(label, condition):
    if not condition:
        raise AssertionError(label)
    CHECKS.append(label)

def validator(name):
    selected = copy.deepcopy(SCHEMA)
    selected['$ref'] = '#/$defs/' + name
    return Draft202012Validator(selected, format_checker=FormatChecker())

def walk(value):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from walk(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk(item)

def semantic_errors(bundle):
    errors = []
    records = bundle['records']
    by_key = {(r['id'], r['revision']): r for r in records}
    if len(by_key) != len(records):
        errors.append('duplicate record version')
    kinds = {}
    for r in records:
        if r['case_id'] != bundle['case']['id']:
            errors.append('wrong case scope')
        if r['id'] in kinds and kinds[r['id']] != r['kind']:
            errors.append('record kind changed')
        kinds[r['id']] = r['kind']
        for node in walk(r):
            if set(node) == {'id', 'revision'} and (node['id'], node['revision']) not in by_key:
                errors.append('reference does not exist')
            if 'precision' in node and 'clock_source' in node:
                start, end = node['start'], node['end']
                if start and end and datetime.fromisoformat(start) > datetime.fromisoformat(end):
                    errors.append('start after end')
                if node['precision'] == 'EXACT' and start != end:
                    errors.append('exact time has unequal bounds')
                if start and end and start == end and not (node['start_inclusive'] and node['end_inclusive']):
                    errors.append('empty exact interval')
            if 'evidence_sha256' in node:
                e = by_key.get((node['evidence']['id'], node['evidence']['revision']))
                if not e or e['kind'] != 'Evidence' or e['sha256'] != node['evidence_sha256']:
                    errors.append('invalid evidence citation')
                dref = node['derivative']
                if dref:
                    d = by_key.get((dref['id'], dref['revision']))
                    if not d or d['kind'] != 'Derivative' or d['sha256'] != node['derivative_sha256']:
                        errors.append('invalid derivative citation')
                    elif d['evidence'] != node['evidence']:
                        errors.append('derivative belongs to other evidence')
                elif node['derivative_sha256'] is not None or node['locator']['type'] == 'text':
                    errors.append('text citation missing immutable derivative')
                if node['locator']['type'] == 'text' and e:
                    p = ROOT / 'fixtures/demo/originals' / e['original_filename']
                    if p.exists():
                        text = p.read_text()
                        a, b = node['locator']['start'], node['locator']['end']
                        if not 0 <= a <= b <= len(text):
                            errors.append('text locator out of bounds')
                        elif node['quote'] is not None and text[a:b] != node['quote']:
                            errors.append('quote mismatch')
        if r.get('tier') in ('DOCUMENTED', 'OBSERVED', 'INFERRED'):
            for support in r.get('support_refs', []):
                source = by_key.get((support['id'], support['revision']))
                if source and (source.get('origin') == 'AI_SYNTHETIC' or source.get('tier') == 'SPECULATIVE'):
                    errors.append('synthetic/speculative support promoted')
        if r['kind'] == 'Anchor':
            a = by_key.get((r['proposition']['id'], r['proposition']['revision']))
            if not a or a.get('review') != 'ACCEPTED' or a.get('tier') not in ('DOCUMENTED', 'OBSERVED'):
                errors.append('invalid anchor basis')
        if r['kind'] == 'Scenario':
            run = kinds.get(r['run_id']) or next((x['kind'] for x in records if x['id']==r['run_id']), None)
            if run != 'ModelRun': errors.append('scenario missing run')
            for q in r['question_ids']:
                if not any(x['id']==q and x['kind']=='Question' for x in records): errors.append('scenario missing question')
    return errors

def main():
    Draft202012Validator.check_schema(SCHEMA)
    check('JSON Schema meta-validation', True)
    api = load('api/openapi.json')
    validate_openapi(api)
    check('OpenAPI 3.1 validation', True)
    # All local references must resolve; no runtime network resolution.
    for label, document in [('schema', SCHEMA), ('OpenAPI', api)]:
        for node in walk(document):
            if '$ref' in node:
                target = document
                check(label + ' reference is local', node['$ref'].startswith('#/'))
                for component in node['$ref'][2:].split('/'):
                    target = target[component]
    bundle = load('fixtures/demo/case.json')
    validator('CaseExchange').validate(bundle)
    check('synthetic case schema', True)
    check('synthetic case semantic references and citations', not semantic_errors(bundle))
    for filename, definition in [
        ('manifest.json','Manifest'), ('lens-plan.json','LensPlan'),
        ('lens-result.json','LensResult'), ('aha-request.json','AhaRequest'),
        ('aha-result.json','AhaResult'), ('model-aha-output.json','ModelAhaOutput')
    ]:
        validator(definition).validate(load('fixtures/demo/'+filename))
        check(filename + ' validates', True)
    for item in load('fixtures/demo/manifest.json')['files']:
        raw = (ROOT/'fixtures/demo'/item['path']).read_bytes()
        check('source hash '+item['path'], hashlib.sha256(raw).hexdigest()==item['sha256'])
        check('source size '+item['path'], len(raw)==item['bytes'])
    for item in load('fixtures/invalid/index.json'):
        data = load(item['file'])
        schema_errors = list(validator(item['definition']).iter_errors(data))
        if item['category']=='schema':
            check('reject '+item['file'], bool(schema_errors))
        else:
            check('semantic fixture is structurally valid '+item['file'], not schema_errors)
            check('semantic rejection '+item['file'], bool(semantic_errors(data)))
    with tempfile.TemporaryDirectory() as tmp:
        conn=sqlite3.connect(Path(tmp)/'case.sqlite')
        conn.executescript((ROOT/'api/reference.sql').read_text())
        c=bundle['case']
        conn.execute('INSERT INTO case_meta VALUES(?,?,?,?,?,?)', (c['id'],c['schema_version'],c['case_revision'],c['title'],c['timezone'],int(c['synthetic'])))
        for r in bundle['records']:
            conn.execute('INSERT INTO records VALUES(?,?,?,?,?,?)',(r['case_id'],r['id'],r['revision'],r['kind'],json.dumps(r),r['introduced_case_revision']))
            conn.execute('INSERT INTO current_records VALUES(?,?,?)',(r['case_id'],r['id'],r['revision']))
        conn.commit()
        check('reference SQL fixture load', conn.execute('SELECT count(*) FROM records').fetchone()[0]==len(bundle['records']))
        try:
            conn.execute('UPDATE records SET kind=kind')
            raise AssertionError('append-only trigger failed')
        except sqlite3.IntegrityError:
            conn.rollback()
            check('append-only record trigger', True)
        check('SQLite integrity', conn.execute('PRAGMA integrity_check').fetchone()[0]=='ok')
        conn.close()
    ids=[x['id'] for x in load('acceptance-matrix.json')]
    check('unique acceptance IDs',len(ids)==len(set(ids)))
    check('all invariants represented',set(x['invariant'] for x in load('acceptance-matrix.json'))=={f'INV-{i:02d}' for i in range(1,15)})
    # Check package-local Markdown links when present.
    import re
    for file in ROOT.rglob('*.md'):
        for link in re.findall(r'\]\(([^)]+)\)',file.read_text()):
            if '://' in link or link.startswith('#'): continue
            check('Markdown link '+str(file.relative_to(ROOT)), (file.parent/link.split('#')[0]).exists())
    print(f'PASS: {len(CHECKS)} contract assertions; {len(SCHEMA["$defs"])} definitions; {sum(len(p) for p in api["paths"].values())} API operations; {len(bundle["records"])} synthetic records; {len(ids)} acceptance gates.')
    print('This validates the specification artifacts only. Application acceptance remains NOT_RUN.')

if __name__=='__main__':
    main()
