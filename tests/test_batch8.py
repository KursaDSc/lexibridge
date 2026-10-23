import unittest
import os
import re

class TestBatch8NewFeatures(unittest.TestCase):
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

    def test_voice_search_ui_and_integration(self):
        """Verify voice search button exists with accessible touch target and SpeechRecognition logic"""
        self.assertIn('id="voiceSearchBtn"', self.index_html, "Missing voiceSearchBtn in index.html")
        self.assertIn('min-h-[44px]', self.index_html, "Missing WCAG AA touch target min-height")
        self.assertIn('ph-bold ph-microphone', self.index_html, "Missing microphone icon")
        self.assertIn('setupVoiceSearch', self.app_js, "Missing setupVoiceSearch in js/app.js")
        self.assertIn('SpeechRecognition', self.app_js, "Missing SpeechRecognition check in js/app.js")
        self.assertIn('.is-listening', self.styles_css, "Missing is-listening animation in css/styles.css")

    def test_flashcard_quiz_system(self):
        """Verify 3D flip flashcard modal and quiz logic exist"""
        self.assertTrue('id="viewPractice"' in self.index_html or 'id="flashcardModal"' in self.index_html, "Missing viewPractice in index.html")
        self.assertIn('id="flashcardInner"', self.index_html, "Missing flashcardInner in index.html")
        self.assertIn('id="fcNeedPracticeBtn"', self.index_html, "Missing fcNeedPracticeBtn in index.html")
        self.assertIn('id="fcMasteredBtn"', self.index_html, "Missing fcMasteredBtn in index.html")
        self.assertIn('id="quizFavoritesBtn"', self.index_html, "Missing quizFavoritesBtn in index.html")
        self.assertIn('.flashcard-container', self.styles_css, "Missing 3D flashcard container styles")
        self.assertIn('.flashcard-inner.flipped', self.styles_css, "Missing 3D flashcard flipped styles")
        self.assertIn('initFlashcards', self.app_js, "Missing initFlashcards in js/app.js")
        self.assertIn('DEFAULT_FLASHCARDS', self.app_js, "Missing default flashcard deck in js/app.js")

    def test_dutch_compound_word_decomposer(self):
        """Verify Dutch compound words dictionary and decomposition card in app.js and aiEngine.js"""
        self.assertIn('DUTCH_COMPOUND_DICTIONARY', self.app_js, "Missing DUTCH_COMPOUND_DICTIONARY in js/app.js")
        self.assertIn('ziekenhuis', self.app_js, "Missing ziekenhuis in compound dictionary")
        self.assertIn('afwasmachine', self.app_js, "Missing afwasmachine in compound dictionary")
        self.assertIn('getCompoundInfo', self.app_js, "Missing getCompoundInfo in js/app.js")
        self.assertIn('compound-part-btn', self.app_js, "Missing compound-part-btn interactive lookup chips")
        self.assertIn('"compound"', self.ai_engine_js, "Missing compound schema in aiEngine.js")

    def test_no_micro_fonts_or_ph_fill(self):
        """Verify no micro fonts and no ph-fill icons were introduced in new features"""
        micro_matches = re.findall(r'text-\[(9|10|11)px\]', self.index_html)
        self.assertEqual(len(micro_matches), 0, f"Found micro fonts in index.html: {micro_matches}")
        self.assertNotIn('ph-fill', self.index_html, "Found ph-fill icon in index.html")
        self.assertNotIn('ph-fill', self.app_js, "Found ph-fill icon in app.js")

if __name__ == '__main__':
    unittest.main()
