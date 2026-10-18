import os
import unittest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
INDEX_HTML = os.path.join(ROOT_DIR, "index.html")
APP_JS = os.path.join(ROOT_DIR, "js", "app.js")
ANDROID_ASSETS_DIR = os.path.join(ROOT_DIR, "android", "app", "src", "main", "assets")

class TestBatch5UserExperienceAndDesign(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(INDEX_HTML, "r", encoding="utf-8") as f:
            cls.html_content = f.read()
        with open(APP_JS, "r", encoding="utf-8") as f:
            cls.app_js_content = f.read()

    def test_header_uses_flagship_brand_icon(self):
        """Header must feature the official 3D LexiBridge brand icon (icon-192.png)."""
        self.assertIn('src="icon-192.png', self.html_content, "Header should display icon-192.png")
        self.assertIn('alt="LexiBridge App Icon"', self.html_content)

    def test_empty_state_situational_practice_hub(self):
        """Empty state must feature interactive situational practice categories and the grammar pro-tip."""
        self.assertIn("Kafe & Restoran", self.html_content)
        self.assertIn("Gemeente & İşlemler", self.html_content)
        self.assertIn("Market & Alışveriş", self.html_content)
        self.assertIn("Ulaşım & Seyahat", self.html_content)
        self.assertIn("Altın Dilbilgisi Kuralı", self.html_content)
        self.assertIn("topic-chip", self.html_content)

    def test_article_badges_distinction(self):
        """app.js must provide renderArticleBadge with visual distinction between 'de' and 'het'."""
        self.assertIn("function renderArticleBadge", self.app_js_content)
        self.assertIn("bg-sky-100 text-sky-800", self.app_js_content, "'de' badge missing sapphire sky style")
        self.assertIn("bg-emerald-100 text-emerald-800", self.app_js_content, "'het' badge missing emerald style")

    def test_example_keyword_highlighting(self):
        """app.js must implement highlightKeyword to highlight search terms in example sentences."""
        self.assertIn("function highlightKeyword", self.app_js_content)
        self.assertIn("<mark", self.app_js_content)
        self.assertIn("highlightKeyword(ex.source, data.input)", self.app_js_content)

    def test_plural_and_infinitive_in_primary_card(self):
        """Primary header card must show plural and infinitive tags at top for instant learning."""
        self.assertIn("data.grammar?.plural", self.app_js_content)
        self.assertIn("çoğul:", self.app_js_content)
        self.assertIn("data.grammar?.infinitive", self.app_js_content)
        self.assertIn("mastar:", self.app_js_content)

    def test_topic_chip_click_listener_registered(self):
        """init() must register click listeners for .topic-chip to trigger instant searches."""
        self.assertIn("querySelectorAll('.topic-chip')", self.app_js_content)

    def test_android_assets_parity(self):
        """Android assets must match root index.html and app.js."""
        android_index = os.path.join(ANDROID_ASSETS_DIR, "index.html")
        android_app = os.path.join(ANDROID_ASSETS_DIR, "js", "app.js")

        with open(android_index, "r", encoding="utf-8") as f:
            android_index_content = f.read()
        with open(android_app, "r", encoding="utf-8") as f:
            android_app_content = f.read()

        self.assertEqual(len(self.html_content), len(android_index_content), "index.html drift detected")
        self.assertEqual(len(self.app_js_content), len(android_app_content), "app.js drift detected")

if __name__ == "__main__":
    unittest.main()
