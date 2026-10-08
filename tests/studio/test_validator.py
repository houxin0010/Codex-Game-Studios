"""Prove that malformed roles and incompatible skills fail the release validator."""
import importlib.util
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('validator', ROOT / 'tools/validate_studio.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)

class ValidatorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='studio-negative-test-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / '.codex/agents', self.root / '.codex/agents')
        shutil.copytree(ROOT / '.agents/skills', self.root / '.agents/skills')

    def test_malformed_role_cannot_pass(self):
        (self.root / '.codex/agents/producer.toml').write_text('name = [')
        with self.assertRaises(validator.tomllib.TOMLDecodeError):
            validator.validate(self.root)

    def test_legacy_tool_metadata_cannot_pass(self):
        path = self.root / '.agents/skills/start/SKILL.md'
        path.write_text(path.read_text().replace('---\n', '---\nallowed-tools: Bash\n', 1))
        with self.assertRaisesRegex(ValueError, 'nonportable metadata'):
            validator.validate(self.root)

if __name__ == '__main__':
    unittest.main()
