import unittest
import os
import re

class TestMobileTypography(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        with open(os.path.join(cls.root_dir, 'index.html'), 'r', encoding='utf-8') as f:
            cls.index_html = f.read()
        with open(os.path.join(cls.root_dir, 'js', 'app.js'), 'r', encoding='utf-8') as f:
            cls.app_js = f.read()
        with open(os.path.join(cls.root_dir, 'css', 'styles.css'), 'r', encoding='utf-8') as f:
            cls.styles_css = f.read()

    def test_no_micro_fonts_in_index_html(self):
        """Verify index.html contains zero micro-fonts (<12px: 9px, 10px, 11px)"""
        micro_matches = re.findall(r'text-\[(9|10|11)px\]', self.index_html)
        self.assertEqual(len(micro_matches), 0, f"Found micro-fonts in index.html: {micro_matches}")

    def test_no_micro_fonts_in_app_js(self):
        """Verify js/app.js contains zero micro-fonts (<12px: 9px, 10px, 11px)"""
        micro_matches = re.findall(r'text-\[(9|10|11)px\]', self.app_js)
        self.assertEqual(len(micro_matches), 0, f"Found micro-fonts in js/app.js: {micro_matches}")

    def test_styles_css_ios_hig_zoom_prevention(self):
        """Verify css/styles.css enforces 16px base font and prevents iOS auto-zoom on form controls"""
        self.assertIn('font-size: 16px', self.styles_css)
        self.assertIn('text-size-adjust: 100%', self.styles_css)
        self.assertRegex(
            self.styles_css,
            r'input,\s*textarea,\s*select\s*\{[^}]*font-size:\s*16px\s*!important',
            "Missing iOS HIG 16px !important override for form controls"
        )

    def test_index_html_accessible_type_scale(self):
        """Verify settings modal, flag modal, and language switcher use accessible type scales"""
        self.assertIn('text-sm font-semibold text-slate-800">Google Gemini', self.index_html)
        self.assertIn('text-sm font-semibold text-slate-800">NVIDIA NIM', self.index_html)
        self.assertIn('text-sm font-semibold text-slate-800">Yerel LLM (Ollama)', self.index_html)
        self.assertIn('text-sm font-semibold text-slate-800">Hızlı REST', self.index_html)
        self.assertIn('id="saveSettingsBtn" class="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold', self.index_html)

    def test_app_js_accessible_card_typography(self):
        """Verify result cards in app.js use 16px card headers and legible secondary typography"""
        self.assertIn('font-bold text-base text-slate-800">Detaylı Anlamlar & Bağlam', self.app_js)
        self.assertIn('font-bold text-base text-slate-800">Doğal Örnek Cümleler', self.app_js)
        self.assertIn('font-bold text-sm md:text-base text-slate-700', self.app_js)
        self.assertIn('font-semibold text-sm md:text-base text-slate-800', self.app_js)

    def test_android_assets_parity(self):
        """Verify android/app/src/main/assets copies are synchronized and have zero micro-fonts"""
        android_assets_dir = os.path.join(self.root_dir, 'android', 'app', 'src', 'main', 'assets')
        if os.path.exists(android_assets_dir):
            with open(os.path.join(android_assets_dir, 'index.html'), 'r', encoding='utf-8') as f:
                android_index = f.read()
            with open(os.path.join(android_assets_dir, 'js', 'app.js'), 'r', encoding='utf-8') as f:
                android_js = f.read()
            self.assertEqual(len(re.findall(r'text-\[(9|10|11)px\]', android_index)), 0)
            self.assertEqual(len(re.findall(r'text-\[(9|10|11)px\]', android_js)), 0)

    def test_mode_toggle_button_located_in_header(self):
        """Verify modeToggleBtn is located inside header directly before historyBtn."""
        header_end = self.index_html.find('</header>')
        self.assertGreater(header_end, 0)
        header_part = self.index_html[:header_end]
        
        mode_btn_pos = header_part.find('id="modeToggleBtn"')
        history_btn_pos = header_part.find('id="historyBtn"')
        
        self.assertGreater(mode_btn_pos, 0, "modeToggleBtn must be inside header")
        self.assertGreater(history_btn_pos, 0, "historyBtn must be inside header")
        self.assertLess(mode_btn_pos, history_btn_pos, "modeToggleBtn must be placed before historyBtn")

if __name__ == '__main__':
    unittest.main()
