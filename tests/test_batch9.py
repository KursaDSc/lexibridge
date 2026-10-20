import unittest
import os
import re

class TestBatch9FlagshipFeatures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        with open(os.path.join(cls.root_dir, 'index.html'), 'r', encoding='utf-8') as f:
            cls.index_html = f.read()
        with open(os.path.join(cls.root_dir, 'js', 'app.js'), 'r', encoding='utf-8') as f:
            cls.app_js = f.read()
        with open(os.path.join(cls.root_dir, 'css', 'styles.css'), 'r', encoding='utf-8') as f:
            cls.styles_css = f.read()
        with open(os.path.join(cls.root_dir, 'js', 'aiEngine.js'), 'r', encoding='utf-8') as f:
            cls.ai_engine_js = f.read()
        with open(os.path.join(cls.root_dir, 'js', 'dictionary_seeds.js'), 'r', encoding='utf-8') as f:
            cls.dictionary_seeds_js = f.read()

    def test_quick_peek_sheet_dom_structure(self):
        """Verify Quick-Peek bottom sheet exists in index.html with all essential controls."""
        self.assertIn('id="quickPeekSheet"', self.index_html, "quickPeekSheet missing in index.html")
        self.assertIn('id="qpWord"', self.index_html, "qpWord missing")
        self.assertIn('id="qpArticleBadge"', self.index_html, "qpArticleBadge missing")
        self.assertIn('id="qpTranslation"', self.index_html, "qpTranslation missing")
        self.assertIn('id="qpSpeakBtn"', self.index_html, "qpSpeakBtn missing")
        self.assertIn('id="qpFavBtn"', self.index_html, "qpFavBtn missing")
        self.assertIn('id="qpFullAnalyzeBtn"', self.index_html, "qpFullAnalyzeBtn missing")
        self.assertIn('id="qpCloseBtn"', self.index_html, "qpCloseBtn missing")

    def test_quick_peek_logic_and_styles(self):
        """Verify Quick-Peek JS logic in app.js and CSS transitions in styles.css."""
        self.assertIn('openQuickPeek', self.app_js, "openQuickPeek function missing in app.js")
        self.assertIn('closeQuickPeek', self.app_js, "closeQuickPeek function missing in app.js")
        self.assertIn('setupQuickPeek', self.app_js, "setupQuickPeek function missing in app.js")
        self.assertIn('#quickPeekSheet.is-visible', self.styles_css, "is-visible CSS class missing in styles.css")

    def test_linguistic_dna_de_het_and_grammar(self):
        """Verify Hero De/Het badges, diminutives, and fixed prepositions (vaste voorzetsels)."""
        # Hero badges in app.js
        self.assertIn('title="De Belirteci"', self.app_js)
        self.assertIn('title="Het Belirteci"', self.app_js)
        # Fixed prepositions card in app.js
        self.assertIn('data.grammar?.fixedPreposition', self.app_js)
        self.assertIn('Sabit Edat (Vast Voorzetsel)', self.app_js)
        # Diminutives in app.js
        self.assertIn('data.grammar?.diminutive', self.app_js)
        self.assertIn('küçültme:', self.app_js)

    def test_dictionary_seeds_enrichment(self):
        """Verify curated seeds have fixedPreposition and diminutive data."""
        self.assertIn('fixedPreposition:', self.dictionary_seeds_js)
        self.assertIn('wachten', self.dictionary_seeds_js)
        self.assertIn('wachten op', self.dictionary_seeds_js)
        self.assertIn('diminutive:', self.dictionary_seeds_js)
        self.assertIn('huisje', self.dictionary_seeds_js)

    def test_ai_engine_schema_enrichment(self):
        """Verify aiEngine.js prompt schema includes fixedPreposition and diminutive."""
        self.assertIn('"fixedPreposition"', self.ai_engine_js)
        self.assertIn('"diminutive"', self.ai_engine_js)
        self.assertIn('fixedPreposition: raw.grammar.fixedPreposition', self.ai_engine_js)
        self.assertIn('diminutive: raw.grammar.diminutive', self.ai_engine_js)

    def test_no_micro_fonts_or_ph_fill(self):
        """Verify no micro fonts and no ph-fill icons were introduced."""
        micro_matches = re.findall(r'text-\[(9|10|11)px\]', self.index_html)
        self.assertEqual(len(micro_matches), 0, f"Found micro fonts in index.html: {micro_matches}")
        self.assertNotIn('ph-fill', self.index_html, "Found ph-fill icon in index.html")
        self.assertNotIn('ph-fill', self.app_js, "Found ph-fill icon in app.js")

if __name__ == '__main__':
    unittest.main()
