import os
import unittest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
INDEX_HTML = os.path.join(ROOT_DIR, "index.html")
SW_JS = os.path.join(ROOT_DIR, "sw.js")
CACHE_JS = os.path.join(ROOT_DIR, "js", "cache.js")
APP_JS = os.path.join(ROOT_DIR, "js", "app.js")
VENDOR_DIR = os.path.join(ROOT_DIR, "vendor")
ANDROID_ASSETS_DIR = os.path.join(ROOT_DIR, "android", "app", "src", "main", "assets")

class TestBatch3OfflineQuality(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(INDEX_HTML, "r", encoding="utf-8") as f:
            cls.html_content = f.read()
        with open(SW_JS, "r", encoding="utf-8") as f:
            cls.sw_content = f.read()
        with open(CACHE_JS, "r", encoding="utf-8") as f:
            cls.cache_js_content = f.read()
        with open(APP_JS, "r", encoding="utf-8") as f:
            cls.app_js_content = f.read()

    def test_local_vendor_assets_exist_and_sized(self):
        """Vendor directory must contain local Tailwind and Phosphor assets for zero-network execution."""
        tw_path = os.path.join(VENDOR_DIR, "tailwindcss.js")
        bold_font = os.path.join(VENDOR_DIR, "phosphor", "Phosphor-Bold.woff2")
        bold_css = os.path.join(VENDOR_DIR, "phosphor", "style.css")

        self.assertTrue(os.path.exists(tw_path), "vendor/tailwindcss.js missing")
        self.assertGreater(os.path.getsize(tw_path), 100000, "Tailwind file size suspiciously small")

        self.assertTrue(os.path.exists(bold_font), "vendor/phosphor/Phosphor-Bold.woff2 missing")
        self.assertGreater(os.path.getsize(bold_font), 50000, "Phosphor Bold woff2 size suspiciously small")

        self.assertTrue(os.path.exists(bold_css), "vendor/phosphor/style.css missing")
        self.assertGreater(os.path.getsize(bold_css), 10000, "Phosphor style.css size suspiciously small")

    def test_index_html_loads_local_vendor_and_cache(self):
        """index.html must load local vendor assets and js/cache.js before app.js."""
        self.assertIn('src="vendor/tailwindcss.js"', self.html_content)
        self.assertIn('href="vendor/phosphor/style.css"', self.html_content)
        self.assertIn('src="js/cache.js?v=3.3"', self.html_content)

        idx_cache = self.html_content.find('js/cache.js')
        idx_engine = self.html_content.find('js/aiEngine.js')
        idx_app = self.html_content.find('js/app.js')
        self.assertLess(idx_cache, idx_engine, "cache.js must be loaded before aiEngine.js")
        self.assertLess(idx_engine, idx_app, "aiEngine.js must be loaded before app.js")

    def test_no_unsupported_icon_weights_remain(self):
        """All icons in HTML and app.js must use ph-bold to guarantee 100% offline local rendering."""
        self.assertNotIn("ph-fill", self.html_content, "Found ph-fill icon in index.html; replace with ph-bold")
        self.assertNotIn("ph-fill", self.app_js_content, "Found ph-fill icon in app.js; replace with ph-bold")

    def test_service_worker_caches_offline_assets(self):
        """sw.js ASSETS_TO_CACHE must include vendor files and js/cache.js."""
        self.assertIn("'./vendor/tailwindcss.js'", self.sw_content)
        self.assertIn("'./vendor/phosphor/style.css'", self.sw_content)
        self.assertIn("'./vendor/phosphor/Phosphor-Bold.woff2'", self.sw_content)
        self.assertIn("'./js/cache.js'", self.sw_content)

    def test_lexi_cache_module_api(self):
        """js/cache.js must implement standard LexiCache interface."""
        self.assertIn("function normalizeKey", self.cache_js_content)
        self.assertIn("async function get", self.cache_js_content)
        self.assertIn("async function set", self.cache_js_content)
        self.assertIn("async function getAll", self.cache_js_content)
        self.assertIn("async function clear", self.cache_js_content)
        self.assertIn("lexibridge_db", self.cache_js_content)
        self.assertIn("query_cache", self.cache_js_content)

    def test_app_js_integrates_lexi_cache_and_offline_mode(self):
        """app.js handleSearch and renderResult must integrate LexiCache and offline state."""
        self.assertIn("LexiCache.get", self.app_js_content)
        self.assertIn("LexiCache.set", self.app_js_content)
        self.assertIn("_isCached", self.app_js_content)
        self.assertIn("refreshCachedBtn", self.app_js_content)
        self.assertIn("Çevrimdışı Önbellek", self.app_js_content)
        self.assertIn("window.addEventListener('online'", self.app_js_content)
        self.assertIn("window.addEventListener('offline'", self.app_js_content)

    def test_android_assets_vendor_and_cache_parity(self):
        """Android assets directory must contain the synchronized vendor and cache files."""
        android_tw = os.path.join(ANDROID_ASSETS_DIR, "vendor", "tailwindcss.js")
        android_font = os.path.join(ANDROID_ASSETS_DIR, "vendor", "phosphor", "Phosphor-Bold.woff2")
        android_cache = os.path.join(ANDROID_ASSETS_DIR, "js", "cache.js")

        self.assertTrue(os.path.exists(android_tw), "android vendor/tailwindcss.js missing")
        self.assertTrue(os.path.exists(android_font), "android vendor/phosphor/Phosphor-Bold.woff2 missing")
        self.assertTrue(os.path.exists(android_cache), "android js/cache.js missing")

        with open(android_cache, "r", encoding="utf-8") as f:
            android_cache_content = f.read()
        self.assertEqual(len(self.cache_js_content), len(android_cache_content), "cache.js size drift detected")

if __name__ == "__main__":
    unittest.main()
