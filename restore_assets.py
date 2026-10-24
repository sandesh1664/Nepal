"""Restore original website media from the repository using Python 3."""
from pathlib import Path
import hashlib
import json
import shutil
import tempfile
import zipfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'MEDIA-MANIFEST.json').read_text(encoding='utf-8'))
parts = root / 'media-parts'
def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()
for part in manifest['parts']:
    path = parts / part['file']
    if not path.is_file() or path.stat().st_size != part['bytes'] or sha256(path) != part['sha256']:
        raise SystemExit('Missing or incomplete media part: ' + part['file'] + '. Download or pull the complete repository again.')
with tempfile.TemporaryDirectory(prefix='nepal-media-') as temp:
    archive_path = Path(temp) / 'media.zip'
    with archive_path.open('wb') as target:
        for part in manifest['parts']:
            with (parts / part['file']).open('rb') as source:
                shutil.copyfileobj(source, target)
    if sha256(archive_path) != manifest['archive_sha256']:
        raise SystemExit('Combined media checksum failed.')
    with zipfile.ZipFile(archive_path) as archive:
        if set(archive.namelist()) != set(manifest['files']):
            raise SystemExit('Unexpected archive contents.')
        for name, expected in manifest['files'].items():
            destination = (root / name).resolve()
            if root not in destination.parents or not name.startswith('dist/assets/'):
                raise SystemExit('Unexpected media path.')
            if destination.is_file() and sha256(destination) == expected:
                continue
            destination.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(name) as source, destination.open('wb') as target:
                shutil.copyfileobj(source, target)
            if sha256(destination) != expected:
                raise SystemExit('Restored file checksum failed: ' + name)
print('Ready: all 225 JPG images, 14 local videos and the font are restored.')
print('Run: python3 -m http.server 8000 --bind 127.0.0.1 --directory dist')
print('Open: http://localhost:8000')
