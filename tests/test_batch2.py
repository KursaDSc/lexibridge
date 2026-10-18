import os
import re
import unittest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
INDEX_HTML = os.path.join(ROOT_DIR, "index.html")
APP_JS = os.path.join(ROOT_DIR, "js", "app.js")
ANDROID_ASSETS_DIR = os.path.join(ROOT_DIR, "android", "app", "src", "main", "assets")

class TestBatch2Quality(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(INDEX_HTML, "r", encoding="utf-8") as f:
            cls.html_content = f.read()
        with open(APP_JS, "r", encoding="utf-8") as f:
            cls.app_js_content = f.read()

    def test_no_sm_studio_jargon_in_user_facing_html(self):
        """User-facing HTML should not contain internal developer jargon 'SM Studio'."""
        self.assertNotIn("SM Studio", self.html_content, 
                         "Found 'SM Studio' developer jargon in user-facing index.html")

    def test_touch_targets_meet_minimum_dimensions(self):
        """Touch targets on primary interactive buttons must meet >= 44px sizing requirements."""
        buttons_to_check = [
            'id="historyBtn"',
            'id="settingsBtn"',
            'id="swapLangBtn"',
            'id="clearBtn"',
            'id="pasteBtn"',
            'id="searchBtn"',
            'id="closeHistoryBtn"',
            'id="closeSettingsBtn"',
            'id="closeFlagModalBtn"'
        ]
        for btn_id in buttons_to_check:
            self.assertIn(btn_id, self.html_content, f"Button {btn_id} missing in index.html")
            pattern = re.compile(rf'<button[^>]*{re.escape(btn_id)}[^>]*>', re.IGNORECASE)
            match = pattern.search(self.html_content)
            self.assertIsNotNone(match, f"Could not find opening tag for {btn_id}")
            tag = match.group(0)
            has_min_touch = (
                "min-h-[44px]" in tag or 
                "min-h-[48px]" in tag or
                "min-w-[44px]" in tag or 
                "h-11" in tag or 
                "h-12" in tag or
                "p-3" in tag
            )
            self.assertTrue(has_min_touch, f"Touch target {btn_id} does not satisfy >= 44px minimum sizing: {tag}")

    def test_accessibility_roles_and_aria_attributes(self):
        """Modals and alerts must declare standard ARIA roles and live regions."""
        self.assertIn('id="historyModal"', self.html_content)
        self.assertIn('id="settingsModal"', self.html_content)
        self.assertIn('id="flagModal"', self.html_content)

        # Check role="dialog" and aria-modal="true"
        for modal_id in ['historyModal', 'settingsModal', 'flagModal']:
            pattern = re.compile(rf'<div[^>]*id="{modal_id}"[^>]*>', re.IGNORECASE)
            match = pattern.search(self.html_content)
            self.assertIsNotNone(match, f"Modal {modal_id} not found")
            tag = match.group(0)
            self.assertIn('role="dialog"', tag, f"{modal_id} missing role='dialog'")
            self.assertIn('aria-modal="true"', tag, f"{modal_id} missing aria-modal='true'")
            self.assertIn('aria-labelledby=', tag, f"{modal_id} missing aria-labelledby")

        # Check aria-live on results and role="alert" on errorBox
        self.assertIn('aria-live="polite"', self.html_content)
        self.assertIn('role="alert"', self.html_content)

    def test_localization_mappings_exist(self):
        """app.js must provide complete Turkish localization mappings for frequency, register, and pos."""
        self.assertIn("FREQUENCY_MAP_TR", self.app_js_content)
        self.assertIn("REGISTER_MAP_TR", self.app_js_content)
        self.assertIn("POS_MAP_TR", self.app_js_content)

        # Key translations
        self.assertIn("'Çok Yaygın'", self.app_js_content)
        self.assertIn("'Günlük / Samimi'", self.app_js_content)
        self.assertIn("'İsim'", self.app_js_content)
        self.assertIn("'Fiil'", self.app_js_content)
        self.assertIn("'Sıfat'", self.app_js_content)

    def test_bidirectional_dynamic_seeds(self):
        """app.js must define SEED_EXAMPLES for both nl and tr, and dynamic container in html."""
        self.assertIn('id="seedChipsContainer"', self.html_content)
        self.assertIn("SEED_EXAMPLES", self.app_js_content)
        self.assertIn("nl:", self.app_js_content)
        self.assertIn("tr:", self.app_js_content)
        self.assertIn("renderSeedChips", self.app_js_content)

    def test_asset_synchronization_parity(self):
        """Root index.html and app.js must match their counterparts in android/app/src/main/assets."""
        android_index = os.path.join(ANDROID_ASSETS_DIR, "index.html")
        android_app = os.path.join(ANDROID_ASSETS_DIR, "js", "app.js")

        self.assertTrue(os.path.exists(android_index), "android assets index.html missing")
        self.assertTrue(os.path.exists(android_app), "android assets app.js missing")

        with open(android_index, "r", encoding="utf-8") as f:
            android_index_content = f.read()
        with open(android_app, "r", encoding="utf-8") as f:
            android_app_content = f.read()

        self.assertEqual(len(self.html_content), len(android_index_content), "index.html size drift detected")
        self.assertEqual(len(self.app_js_content), len(android_app_content), "app.js size drift detected")

if __name__ == "__main__":
    unittest.main()
