import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('transfer_integrity', Path(__file__).resolve().parents[1] / 'scripts/transfer-integrity.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class TransferIntegrityTests(unittest.TestCase):
    def test_binary_files_have_portable_names_and_change_detection(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'media').mkdir()
            path = root / 'media' / 'room photo.webp'
            path.write_bytes(b'\x00photo\xff')
            original = module.inventory(root)
            self.assertIn('media/room photo.webp', original)
            path.write_bytes(b'changed')
            self.assertNotEqual(module.inventory(root), original)
            path.unlink()
            self.assertNotIn('media/room photo.webp', module.inventory(root))

    def test_manifest_does_not_hash_itself(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / module.MANIFEST).write_text('{}')
            self.assertEqual(module.inventory(root), {})


if __name__ == '__main__':
    unittest.main()
