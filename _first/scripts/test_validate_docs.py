#!/usr/bin/env python3
"""Regression tests for FIRST's documentation validator."""

import shutil
import tempfile
import unittest
from pathlib import Path

import validate_docs


class DocumentationValidationTests(unittest.TestCase):
    def setUp(self):
        self.sourceRoot = validate_docs.root
        self.temporary = tempfile.TemporaryDirectory(prefix="first-docs-test-")
        self.fixtureRoot = Path(self.temporary.name)
        for name in validate_docs.rootFiles:
            shutil.copy2(self.sourceRoot / name, self.fixtureRoot / name)
        for name in ("articles", "principles"):
            shutil.copytree(self.sourceRoot / name, self.fixtureRoot / name)
        validate_docs.root = self.fixtureRoot

    def tearDown(self):
        validate_docs.root = self.sourceRoot
        self.temporary.cleanup()

    def replace(self, relativePath, old, new):
        path = self.fixtureRoot / relativePath
        text = path.read_text(encoding="utf-8")
        self.assertIn(old, text)
        path.write_text(text.replace(old, new, 1), encoding="utf-8")

    def testValidSet(self):
        self.assertEqual(validate_docs.validate(), [])

    def testMissingPair(self):
        (self.fixtureRoot / "articles/DATA.md").unlink()
        self.assertTrue(any("missing articles pair" in item for item in validate_docs.validate()))

    def testPrincipleMismatch(self):
        self.replace("articles/DATA.md", "## Principle", "## Principle\n\nDifferent principle.")
        self.assertIn("principle mismatch: DATA.md", validate_docs.validate())

    def testRequiredHeading(self):
        self.replace("principles/DATA.md", "## Minimum Useful Artifact", "## Example")
        self.assertTrue(any("missing heading 'Minimum Useful Artifact'" in item for item in validate_docs.validate()))

    def testBrokenLocalLink(self):
        self.replace("articles/DATA.md", "../ABOUT.md", "../MISSING.md")
        self.assertTrue(any("broken local link" in item for item in validate_docs.validate()))

    def testInvalidStatus(self):
        self.replace("articles/DATA.md", "status: draft", "status: unknown")
        self.assertTrue(any("invalid status" in item for item in validate_docs.validate()))

    def testCanonicalOrder(self):
        self.replace("README.md", "| 4 | Architecture |", "| 4 | Data |")
        self.assertIn("canonical station list or order is wrong: README.md", validate_docs.validate())


if __name__ == "__main__":
    unittest.main()
