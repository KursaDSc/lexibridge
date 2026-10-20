import unittest
import os
import re

class TestBatch11FlagshipCustomerExperience(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        with open(os.path.join(cls.root_dir, 'index.html'), 'r', encoding='utf-8') as f:
            cls.index_html = f.read()
        with open(os.path.join(cls.root_dir, 'js', 'app.js'), 'r', encoding='utf-8') as f:
            cls.app_js = f.read()
        with open(os.path.join(cls.root_dir, 'js', 'dictionary_seeds.js'), 'r', encoding='utf-8') as f:
            cls.dictionary_seeds_js = f.read()

    def test_srs_leitner_box_dom_elements(self):
        """Verify SRS streak badge, due deck chip, and box indicator badge exist in index.html."""
        self.assertIn('id="fcStreakBadge"', self.index_html, "fcStreakBadge missing in index.html")
        self.assertIn('id="fcStreakText"', self.index_html, "fcStreakText missing in index.html")
        self.assertIn('data-deck="due"', self.index_html, "data-deck='due' chip missing in index.html")
        self.assertIn('id="fcDueBadge"', self.index_html, "fcDueBadge missing in index.html")
        self.assertIn('id="fcBoxBadge"', self.index_html, "fcBoxBadge missing in index.html")

    def test_srs_leitner_box_logic_in_app_js(self):
        """Verify SRS Leitner Box data functions and streak updater exist in app.js."""
        self.assertIn('SRS_INTERVALS_MS', self.app_js)
        self.assertIn('getSRSData', self.app_js)
        self.assertIn('updateCardSRS', self.app_js)
        self.assertIn('isWordDue', self.app_js)
        self.assertIn('updateStreak', self.app_js)
        self.assertIn('renderStreakBadge', self.app_js)
        self.assertIn('updateDueBadge', self.app_js)
        self.assertIn('deckType === \'due\'', self.app_js)

    def test_favorites_search_filter_and_backup_dom(self):
        """Verify live search filter input, clear filter button, and JSON export/import buttons exist."""
        self.assertIn('id="favSearchFilterInput"', self.index_html, "favSearchFilterInput missing in index.html")
        self.assertIn('id="clearFavFilterBtn"', self.index_html, "clearFavFilterBtn missing in index.html")
        self.assertIn('id="exportFavoritesBtn"', self.index_html, "exportFavoritesBtn missing in index.html")
        self.assertIn('id="importFavoritesBtn"', self.index_html, "importFavoritesBtn missing in index.html")
        self.assertIn('id="importFavoritesFile"', self.index_html, "importFavoritesFile missing in index.html")

    def test_favorites_search_and_backup_logic(self):
        """Verify favorites live filter, JSON download, and JSON restore file reader in app.js."""
        self.assertIn('favSearchFilterInput', self.app_js)
        self.assertIn('exportFavoritesBtn', self.app_js)
        self.assertIn('importFavoritesBtn', self.app_js)
        self.assertIn('importFavoritesFile', self.app_js)
        self.assertIn('renderFavorites(val)', self.app_js)
        self.assertIn('downloadAnchor.setAttribute(\'download\'', self.app_js)
        self.assertIn('new FileReader()', self.app_js)

    def test_dictionary_seeds_expansion(self):
        """Verify offline dictionary seeds have essential healthcare, NS, and civic entries."""
        for word in ['huisarts', 'apotheek', 'perron', 'spoor', 'inchecken', 'burgerservicenummer', 'supermarkt', 'pinnen']:
            self.assertIn(f'"{word}"', self.dictionary_seeds_js, f"Seed word '{word}' missing in dictionary_seeds.js")

    def test_no_micro_fonts_or_ph_fill_in_new_features(self):
        """Verify zero micro fonts and zero ph-fill icons in all updated files."""
        micro_matches = re.findall(r'text-\[(9|10|11)px\]', self.index_html)
        self.assertEqual(len(micro_matches), 0, f"Found micro fonts in index.html: {micro_matches}")
        micro_app = re.findall(r'text-\[(9|10|11)px\]', self.app_js)
        self.assertEqual(len(micro_app), 0, f"Found micro fonts in app.js: {micro_app}")
        self.assertNotIn('ph-fill', self.index_html, "Found ph-fill in index.html")
        self.assertNotIn('ph-fill', self.app_js, "Found ph-fill in app.js")

if __name__ == '__main__':
    unittest.main()
