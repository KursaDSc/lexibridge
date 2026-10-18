"""
LexiBridge Batch 1 (FAZ A: Risk, Doğruluk ve Güvenlik) Automated Verification Test Suite
Tests:
  1. Secrets Hygiene (config.local.js)
  2. Prompt Sanitization & XML Boundary Isolation (SEC-02)
  3. Schema Validation & Normalization with Fallbacks (REL-01)
  4. Web vs Android Asset Synchronization (BLD-01)
  5. Google Play In-App AI Flagging Compliance (STR-01)
"""

import os
import re
import hashlib
import unittest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class TestBatch1SecurityAndReliability(unittest.TestCase):

    def test_secrets_hygiene(self):
        """Verify config.local.js has zero hardcoded secret keys."""
        config_path = os.path.join(ROOT_DIR, "js", "config.local.js")
        self.assertTrue(os.path.exists(config_path), "js/config.local.js should exist")
        with open(config_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Check for typical API key patterns (AQ..., AIza..., nvapi-...)
        self.assertNotIn("AQ.", content, "Private Google API key leaked in config.local.js")
        self.assertNotIn("AIzaSy", content, "Private Google API key leaked in config.local.js")
        self.assertNotIn("nvapi-", content, "Private NVIDIA API key leaked in config.local.js")
        self.assertIn('google: ""', content, "Template should have empty google key")
        self.assertIn('nvidia: ""', content, "Template should have empty nvidia key")

    def test_prompt_sanitization_in_code(self):
        """Verify aiEngine.js implements XML isolation and length truncation."""
        engine_path = os.path.join(ROOT_DIR, "js", "aiEngine.js")
        with open(engine_path, "r", encoding="utf-8") as f:
            code = f.read()

        self.assertIn("function formatLinguisticUserPrompt", code)
        self.assertIn("<girdi_metni>", code, "Prompt must use XML boundary tags")
        self.assertIn("</girdi_metni>", code, "Prompt must close XML boundary tags")
        self.assertIn(".slice(0, 500)", code, "User query must be length-limited")

    def test_schema_normalization_in_code(self):
        """Verify aiEngine.js implements robust normalization function."""
        engine_path = os.path.join(ROOT_DIR, "js", "aiEngine.js")
        with open(engine_path, "r", encoding="utf-8") as f:
            code = f.read()

        self.assertIn("function normalizeLinguisticResult", code)
        self.assertIn("translations", code)
        self.assertIn("meanings", code)
        self.assertIn("grammar", code)
        self.assertIn("etymology", code)
        self.assertIn("pronunciation", code)
        self.assertIn("normalizeLinguisticResult", code.split("return {")[-1], "Must be exported in AIEngine")

    def test_web_and_android_asset_sync(self):
        """Verify root assets and android assets have identical content/hashes."""
        files_to_check = [
            ("index.html", os.path.join("android", "app", "src", "main", "assets", "index.html")),
            (os.path.join("js", "app.js"), os.path.join("android", "app", "src", "main", "assets", "js", "app.js")),
            (os.path.join("js", "aiEngine.js"), os.path.join("android", "app", "src", "main", "assets", "js", "aiEngine.js")),
            (os.path.join("css", "styles.css"), os.path.join("android", "app", "src", "main", "assets", "css", "styles.css")),
            ("manifest.json", os.path.join("android", "app", "src", "main", "assets", "manifest.json")),
            ("sw.js", os.path.join("android", "app", "src", "main", "assets", "sw.js")),
        ]

        for root_rel, android_rel in files_to_check:
            root_full = os.path.join(ROOT_DIR, root_rel)
            android_full = os.path.join(ROOT_DIR, android_rel)

            self.assertTrue(os.path.exists(root_full), f"Missing root file: {root_rel}")
            self.assertTrue(os.path.exists(android_full), f"Missing android asset: {android_rel}")

            with open(root_full, "rb") as rf, open(android_full, "rb") as af:
                root_hash = hashlib.sha256(rf.read()).hexdigest()
                android_hash = hashlib.sha256(af.read()).hexdigest()

            self.assertEqual(
                root_hash,
                android_hash,
                f"Asset sync drift detected between {root_rel} and {android_rel}!"
            )

    def test_google_play_flagging_elements(self):
        """Verify presence of in-app flagging button and modal for Google Play GenAI compliance."""
        html_path = os.path.join(ROOT_DIR, "index.html")
        with open(html_path, "r", encoding="utf-8") as f:
            html = f.read()

        self.assertIn('id="flagModal"', html, "Modal #flagModal must exist in index.html")
        self.assertIn('id="submitFlagBtn"', html, "Submit button #submitFlagBtn must exist")
        self.assertIn('name="flagReason"', html, "Radio reason options must exist")
        self.assertIn('role="dialog"', html, "flagModal must have accessibility role=dialog")
        self.assertIn('aria-modal="true"', html, "flagModal must have aria-modal=true")

        app_js_path = os.path.join(ROOT_DIR, "js", "app.js")
        with open(app_js_path, "r", encoding="utf-8") as f:
            app_js = f.read()

        self.assertIn("flag-response-btn", app_js, "Flag button must be rendered on result card")
        self.assertIn("lexi_flagged_reports", app_js, "Reports must be saved locally")

if __name__ == "__main__":
    unittest.main()
