import unittest
import os
import re

class TestBatch10BottomNavigation(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        with open(os.path.join(cls.root_dir, 'index.html'), 'r', encoding='utf-8') as f:
            cls.index_html = f.read()
        with open(os.path.join(cls.root_dir, 'js', 'app.js'), 'r', encoding='utf-8') as f:
            cls.app_js = f.read()
        with open(os.path.join(cls.root_dir, 'css', 'styles.css'), 'r', encoding='utf-8') as f:
            cls.styles_css = f.read()

    def test_bottom_nav_bar_dom_structure(self):
        """Verify modern 4-tab bottom navigation bar exists in index.html with all tabs."""
        self.assertIn('id="bottomNavBar"', self.index_html, "Missing bottomNavBar in index.html")
        self.assertIn('id="navTabDictionary"', self.index_html, "Missing navTabDictionary")
        self.assertIn('id="navTabPractice"', self.index_html, "Missing navTabPractice")
        self.assertIn('id="navTabFavorites"', self.index_html, "Missing navTabFavorites")
        self.assertIn('id="navTabSettings"', self.index_html, "Missing navTabSettings")

    def test_bottom_nav_labels(self):
        """Verify tab labels are clear, user-facing, and localized."""
        self.assertIn('Sözlük', self.index_html)
        self.assertIn('Pratik', self.index_html)
        self.assertIn('Kelimelerim', self.index_html)
        self.assertIn('Ayarlar', self.index_html)

    def test_touch_targets_and_accessibility(self):
        """Verify all bottom nav tabs satisfy WCAG AA >= 44px touch target height."""
        nav_section = self.index_html[self.index_html.find('id="bottomNavBar"'):self.index_html.find('</nav>')]
        tab_buttons = re.findall(r'<button[^>]+id="navTab[^"]+"[^>]*>', nav_section)
        self.assertEqual(len(tab_buttons), 4, "Expected 4 bottom nav buttons")
        for btn in tab_buttons:
            self.assertIn('min-h-[44px]', btn, f"Tab button missing min-h-[44px]: {btn}")

    def test_tab_controller_functions(self):
        """Verify switchMainTab and setActiveNavTab exist in head script."""
        self.assertIn('window.switchMainTab = function', self.index_html)
        self.assertIn('window.setActiveNavTab = function', self.index_html)
        self.assertIn("window.setActiveNavTab('dictionary')", self.app_js)

    def test_bottom_nav_styles(self):
        """Verify bottom nav styles and active states exist in styles.css."""
        self.assertIn('#bottomNavBar', self.styles_css)
        self.assertIn('.nav-tab-btn.active', self.styles_css)
        self.assertIn('#toast', self.styles_css)

    def test_no_micro_fonts_or_ph_fill(self):
        """Verify zero micro fonts and zero ph-fill icons are present in bottom nav."""
        micro_matches = re.findall(r'text-\[(9|10|11)px\]', self.index_html)
        self.assertEqual(len(micro_matches), 0, f"Found micro fonts in index.html: {micro_matches}")
        self.assertNotIn('ph-fill', self.index_html, "Found ph-fill icon in index.html")

if __name__ == '__main__':
    unittest.main()
