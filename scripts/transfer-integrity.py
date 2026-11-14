"""Create/verify a portable data-transfer checksum manifest; never copies or restores data."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath

MANIFEST = 'TRANSFER-MANIFEST.json'


def inventory(directory):
    files = {}
    for path in sorted(directory.rglob('*')):
        if path.is_symlink():
            raise ValueError('Transfer folders must not contain symbolic links.')
        if not path.is_file() or path == directory / MANIFEST:
            continue
        digest = hashlib.sha256()
        with path.open('rb') as stream:
            for block in iter(lambda: stream.read(1024 * 1024), b''):
                digest.update(block)
        files[path.relative_to(directory).as_posix()] = {'bytes': path.stat().st_size, 'sha256': digest.hexdigest()}
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path)
    parser.add_argument('--write', action='store_true', help='Create/replace the manifest on the source computer.')
    args = parser.parse_args()
    directory = args.directory.resolve(strict=True)
    if not directory.is_dir():
        parser.error('Choose the transfer directory.')
    actual = inventory(directory)
    manifest = directory / MANIFEST
    if args.write:
        manifest.write_text(json.dumps({'version': 1, 'files': actual}, indent=2) + '\n', encoding='utf-8')
        print(f'Manifest written for {len(actual)} files. Keep it with the private transfer folder.')
        return
    expected = json.loads(manifest.read_text(encoding='utf-8'))
    if expected.get('version') != 1 or not isinstance(expected.get('files'), dict):
        raise ValueError('Invalid transfer manifest.')
    for name in expected['files']:
        path = PurePosixPath(name)
        if path.is_absolute() or '..' in path.parts or '\\' in name or ':' in name:
            raise ValueError('Unsafe path in transfer manifest.')
    if actual != expected['files']:
        missing = len(expected['files'].keys() - actual.keys())
        extra = len(actual.keys() - expected['files'].keys())
        changed = sum(actual[name] != expected['files'][name] for name in actual.keys() & expected['files'].keys())
        raise ValueError(f'Transfer verification failed: {missing} missing, {extra} extra, {changed} changed files. Do not restore this copy.')
    print(f'Transfer verified: {len(actual)} files match. This verifies bytes, not database restore success or encryption.')


if __name__ == '__main__':
    main()
