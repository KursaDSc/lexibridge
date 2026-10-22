import os
import unittest
import hashlib

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANDROID_ASSETS_DIR = os.path.join(ROOT_DIR, "android", "app", "src", "main", "assets")

class TestBatch12GamesFeature(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with open(os.path.join(ROOT_DIR, "index.html"), "r", encoding="utf-8") as f:
            cls.html_content = f.read()
        with open(os.path.join(ROOT_DIR, "sw.js"), "r", encoding="utf-8") as f:
            cls.sw_content = f.read()
        with open(os.path.join(ROOT_DIR, "js", "games.js"), "r", encoding="utf-8") as f:
            cls.games_js_content = f.read()

    def test_bottom_nav_5th_tab(self):
        """Bottom nav must declare navTabGames with role='tab' and aria-controls='viewGames'."""
        self.assertIn('id="navTabGames"', self.html_content)
        self.assertIn('aria-controls="viewGames"', self.html_content)
        self.assertIn('window.switchMainTab(\'games\')', self.html_content)
        self.assertIn('ph-game-controller', self.html_content)

    def test_view_games_structure(self):
        """index.html must define viewGames with all 3 game cards and screens."""
        self.assertIn('id="viewGames"', self.html_content)
        self.assertIn('data-tab="games"', self.html_content)
        self.assertIn('id="gameMatchBtn"', self.html_content)
        self.assertIn('id="gameFillBtn"', self.html_content)
        self.assertIn('id="gameHuntBtn"', self.html_content)
        self.assertIn('id="gameMatchView"', self.html_content)
        self.assertIn('id="gameFillView"', self.html_content)
        self.assertIn('id="gameHuntView"', self.html_content)
        self.assertIn('id="gameResultModal"', self.html_content)

    def test_games_engine_api(self):
        """js/games.js must expose GamesEngine with the 3 mini-games and stats."""
        self.assertIn("window.GamesEngine", self.games_js_content)
        self.assertIn("onTabOpen", self.games_js_content)
        self.assertIn("initMatch", self.games_js_content)
        self.assertIn("initFill", self.games_js_content)
        self.assertIn("initHunt", self.games_js_content)
        self.assertIn("lexi_match_highscore", self.games_js_content)
        self.assertIn("lexi_fill_highscore", self.games_js_content)
        self.assertIn("lexi_hunt_highscore", self.games_js_content)

    def test_sw_caches_games_module(self):
        """Service Worker must cache ./js/games.js for offline gaming."""
        self.assertIn("'./js/games.js'", self.sw_content)

    def test_android_games_parity(self):
        """Android assets must match root index.html and js/games.js."""
        android_games = os.path.join(ANDROID_ASSETS_DIR, "js", "games.js")
        self.assertTrue(os.path.exists(android_games), "android/app/src/main/assets/js/games.js missing")
        with open(android_games, "r", encoding="utf-8") as f:
            android_content = f.read()
        self.assertEqual(
            hashlib.sha256(self.games_js_content.encode("utf-8")).hexdigest(),
            hashlib.sha256(android_content.encode("utf-8")).hexdigest(),
            "Android games.js hash mismatch"
        )

if __name__ == '__main__':
    unittest.main()
