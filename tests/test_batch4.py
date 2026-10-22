import json
import os
import unittest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PRIVACY_MD = os.path.join(ROOT_DIR, "PRIVACY_POLICY.md")
INDEX_HTML = os.path.join(ROOT_DIR, "index.html")
CAPACITOR_CONFIG = os.path.join(ROOT_DIR, "capacitor.config.json")
PACKAGE_JSON = os.path.join(ROOT_DIR, "package.json")
WORKFLOW_YML = os.path.join(ROOT_DIR, ".github", "workflows", "build-apk.yml")

class TestBatch4StoreReadiness(unittest.TestCase):
    def test_privacy_policy_completeness(self):
        """PRIVACY_POLICY.md must exist and satisfy Apple & Google Play AI store requirements."""
        self.assertTrue(os.path.exists(PRIVACY_MD), "PRIVACY_POLICY.md missing")
        with open(PRIVACY_MD, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Gizlilik Politikası", content)
        self.assertIn("Kişisel Veri", content)
        self.assertIn("BYOK", content)
        self.assertIn("Google Gemini", content)
        self.assertIn("IndexedDB", content)
        self.assertIn("Yanıtı Bildir", content)

    def test_in_app_privacy_disclosure_in_settings(self):
        """Settings modal in index.html must feature an in-app privacy & data safety disclosure."""
        with open(INDEX_HTML, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("Gizlilik & Veri Güvenliği Beyanı", content)
        self.assertIn("Sıfır Kişisel Veri", content)
        self.assertIn("BYOK Güvenliği", content)

    def test_capacitor_config_validity(self):
        """capacitor.config.json must define appId matching com.visualdutch.lexibridge."""
        self.assertTrue(os.path.exists(CAPACITOR_CONFIG), "capacitor.config.json missing")
        with open(CAPACITOR_CONFIG, "r", encoding="utf-8") as f:
            cfg = json.load(f)

        self.assertEqual(cfg.get("appId"), "com.visualdutch.lexibridge")
        self.assertEqual(cfg.get("appName"), "LingoMate")

    def test_package_json_scripts(self):
        """package.json must declare sync-assets, test, and android build scripts."""
        self.assertTrue(os.path.exists(PACKAGE_JSON), "package.json missing")
        with open(PACKAGE_JSON, "r", encoding="utf-8") as f:
            pkg = json.load(f)

        scripts = pkg.get("scripts", {})
        self.assertIn("sync-assets", scripts)
        self.assertIn("test", scripts)
        self.assertIn("build:android", scripts)

    def test_github_actions_workflow_builds_aab_bundle(self):
        """.github/workflows/build-apk.yml must build bundleRelease (AAB) for Google Play submission."""
        self.assertTrue(os.path.exists(WORKFLOW_YML), "build-apk.yml missing")
        with open(WORKFLOW_YML, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertIn("bundleRelease", content, "Missing bundleRelease task for Google Play AAB")
        self.assertIn("LingoMate.aab", content, "Missing LingoMate.aab artifact handling")

if __name__ == "__main__":
    unittest.main()
