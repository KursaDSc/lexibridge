import os
import re
import unittest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AI_ENGINE_JS = os.path.join(ROOT_DIR, "js", "aiEngine.js")
SHORTCUT_PS1 = os.path.join(ROOT_DIR, "scripts", "update_desktop_shortcut.ps1")
APP_ICON_ICO = os.path.join(ROOT_DIR, "app_icon.ico")

class TestBatch6ResilienceAndShortcut(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(AI_ENGINE_JS, "r", encoding="utf-8") as f:
            cls.engine_content = f.read()

    def test_max_output_tokens_prevent_truncation(self):
        """Gemini generationConfig must allow at least 2048 tokens to prevent JSON cutoff."""
        self.assertIn("maxOutputTokens: 2048", self.engine_content, "maxOutputTokens should be at least 2048")

    def test_parse_json_response_auto_repair_logic(self):
        """parseJSONResponse must contain regex repair for trailing commas, comments, and unquoted keys."""
        self.assertIn("replace(/,\\s*([}\\]])/g", self.engine_content, "Missing trailing comma cleanup")
        self.assertIn("replace(/\\/\\/[^\\n\\r]*/g", self.engine_content, "Missing single-line comment cleanup")
        self.assertIn("transMatches = clean.matchAll", self.engine_content, "Missing heuristic translation extractor")

    def test_analyze_seamless_quick_rest_fallback(self):
        """analyze() must provide seamless automatic Quick REST fallback for all providers."""
        self.assertIn("restResult._provider = \"Hızlı REST (Gemini Yedeği)\"", self.engine_content)
        self.assertIn("restResult._provider = \"Hızlı REST (NVIDIA Yedeği)\"", self.engine_content)
        self.assertIn("finalRest._provider = \"Hızlı REST (Yedek Çeviri)\"", self.engine_content)

    def test_desktop_shortcut_script_and_ico_exist(self):
        """update_desktop_shortcut.ps1 and app_icon.ico must exist."""
        self.assertTrue(os.path.exists(SHORTCUT_PS1), "scripts/update_desktop_shortcut.ps1 missing")
        self.assertTrue(os.path.exists(APP_ICON_ICO), "app_icon.ico missing")
        self.assertGreater(os.path.getsize(APP_ICON_ICO), 1000, "app_icon.ico too small")

if __name__ == "__main__":
    unittest.main()
