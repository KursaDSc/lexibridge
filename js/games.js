/**
 * LingoMate Games Engine (Mini Oyunlar Modülü)
 * 3 Mini Oyun:
 *  1. Hızlı Eşleştirme (Speed Matching - 30s)
 *  2. Boşluk Doldur (Fill in the Blank - 10 Soru)
 *  3. Kelime Avı (Word Hunt - 90s)
 *
 * Tamamen çevrimdışı, sıfır harici bağımlılık, Web Audio API ve SpeechSynthesis entegreli.
 */

window.GamesEngine = (function() {
  'use strict';

  // ── Ses Sistemi (Web Audio API - Sıfır Dış Dosya) ───────────────────────────
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      if (type === 'success') {
        // Melodik C5 -> E5 -> G5
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.12, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.19);
        });
      } else if (type === 'wrong') {
        // Düşük uyarı sesi
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'tap') {
        // Yumuşak tıklama
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'fanfare') {
        // Zafer melodisi
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.15, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.36);
        });
      }
    } catch (e) {
      // Audio autoplay policy veya kısıtlama durumu sessiz geçilir
    }
  }

  function speakDutch(text) {
    if (!text || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'nl-NL';
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ── Kelime Havuzu Sağlayıcı ───────────────────────────────────────────────
  function getGameVocabulary() {
    const list = [];
    const seen = new Set();

    // 1. Kullanıcının favorileri
    try {
      const favs = JSON.parse(localStorage.getItem('lexi_favorites') || '[]');
      favs.forEach(f => {
        const word = (f.word || f.nl || '').trim().toLowerCase();
        const tr = (f.meaning || f.tr || '').trim();
        if (word && tr && !seen.has(word)) {
          seen.add(word);
          list.push({
            nl: word,
            tr: tr.split('/')[0].split(',')[0].trim(),
            fullTr: tr,
            example: f.example || null,
            cefr: f.cefr || 'A1'
          });
        }
      });
    } catch (e) {}

    // 2. Çevrimdışı sözlük tohumları (LEXI_DICTIONARY_SEEDS)
    if (window.LEXI_DICTIONARY_SEEDS && Array.isArray(window.LEXI_DICTIONARY_SEEDS)) {
      window.LEXI_DICTIONARY_SEEDS.forEach(s => {
        const word = (s.nl || s.word || '').trim().toLowerCase();
        const tr = (s.tr || s.meaning || '').trim();
        if (word && tr && !seen.has(word)) {
          seen.add(word);
          list.push({
            nl: word,
            tr: tr.split('/')[0].split(',')[0].trim(),
            fullTr: tr,
            example: s.example || (s.examples && s.examples[0]) || null,
            cefr: s.cefr || 'A1'
          });
        }
      });
    }

    // Yedek tohumlar (Sözlük seeds henüz yüklenmediyse bile oyunun çökmemesi için garanti fallback)
    if (list.length < 15) {
      const fallbackList = [
        { nl: "water", tr: "su", example: { source: "Ik drink graag water.", translation: "Ben su içmeyi severim." } },
        { nl: "brood", tr: "ekmek", example: { source: "Het brood is vers.", translation: "Ekmek tazedir." } },
        { nl: "huis", tr: "ev", example: { source: "Wij wonen in een mooi huis.", translation: "Biz güzel bir evde oturuyoruz." } },
        { nl: "boek", tr: "kitap", example: { source: "Zij leest een goed boek.", translation: "O iyi bir kitap okuyor." } },
        { nl: "stad", tr: "şehir", example: { source: "Amsterdam is een grote stad.", translation: "Amsterdam büyük bir şehirdir." } },
        { nl: "eten", tr: "yemek", example: { source: "Wat wil je vanavond eten?", translation: "Bu akşam ne yemek istersin?" } },
        { nl: "spreken", tr: "konuşmak", example: { source: "Ik spreek een beetje Nederlands.", translation: "Ben biraz Felemenkçe konuşuyorum." } },
        { nl: "leren", tr: "öğrenmek", example: { source: "Wij leren nieuwe woorden.", translation: "Biz yeni kelimeler öğreniyoruz." } },
        { nl: "zien", tr: "görmek", example: { source: "Ik zie de mooie zon.", translation: "Ben güzel güneşi görüyorum." } },
        { nl: "tijd", tr: "zaman", example: { source: "Hoeveel tijd hebben we nog?", translation: "Daha ne kadar zamanımız var?" } },
        { nl: "vriend", tr: "arkadaş", example: { source: "Hij is mijn beste vriend.", translation: "O benim en iyi arkadaşım." } },
        { nl: "goed", tr: "iyi", example: { source: "Goed gedaan!", translation: "İyi iş çıkardın!" } },
        { nl: "mooi", tr: "güzel", example: { source: "Het weer is erg mooi vandaag.", translation: "Hava bugün çok güzel." } },
        { nl: "klein", tr: "küçük", example: { source: "Het is een klein kind.", translation: "O küçük bir çocuktur." } },
        { nl: "groot", tr: "büyük", example: { source: "Dit is een groot gebouw.", translation: "Bu büyük bir binadır." } }
      ];
      fallbackList.forEach(fb => {
        if (!seen.has(fb.nl)) {
          seen.add(fb.nl);
          list.push(fb);
        }
      });
    }

    return list;
  }

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ── Skor ve İstatistik Deposu ──────────────────────────────────────────────
  const STORAGE_KEYS = {
    TOTAL_SCORE: 'lexi_games_total_score',
    STREAK: 'lexi_games_streak',
    LAST_PLAYED: 'lexi_games_last_played',
    MATCH_HIGHSCORE: 'lexi_match_highscore',
    FILL_HIGHSCORE: 'lexi_fill_highscore',
    HUNT_HIGHSCORE: 'lexi_hunt_highscore'
  };

  function getStats() {
    return {
      totalScore: parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_SCORE) || '0', 10),
      streak: parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0', 10),
      matchHighscore: parseInt(localStorage.getItem(STORAGE_KEYS.MATCH_HIGHSCORE) || '0', 10),
      fillHighscore: parseInt(localStorage.getItem(STORAGE_KEYS.FILL_HIGHSCORE) || '0', 10),
      huntHighscore: parseInt(localStorage.getItem(STORAGE_KEYS.HUNT_HIGHSCORE) || '0', 10)
    };
  }

  function recordGameResult(gameKey, score) {
    const stats = getStats();
    let isNewHighscore = false;

    // High score kontrolü
    const highscoreKey = {
      match: STORAGE_KEYS.MATCH_HIGHSCORE,
      fill: STORAGE_KEYS.FILL_HIGHSCORE,
      hunt: STORAGE_KEYS.HUNT_HIGHSCORE
    }[gameKey];

    const currentHigh = stats[gameKey + 'Highscore'] || 0;
    if (score > currentHigh) {
      localStorage.setItem(highscoreKey, score.toString());
      isNewHighscore = true;
    }

    // Toplam puana ekle
    const newTotal = stats.totalScore + score;
    localStorage.setItem(STORAGE_KEYS.TOTAL_SCORE, newTotal.toString());

    // Günlük seri hesabı
    const today = new Date().toISOString().slice(0, 10);
    const lastPlayed = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
    let newStreak = stats.streak;

    if (lastPlayed !== today) {
      if (lastPlayed) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (lastPlayed === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      localStorage.setItem(STORAGE_KEYS.STREAK, newStreak.toString());
      localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, today);
    }

    updateStatsBar();
    return { isNewHighscore, previousHigh: currentHigh, newTotal, streak: newStreak };
  }

  function updateStatsBar() {
    const stats = getStats();
    const totalEl = document.getElementById('gamesTotalScore');
    const streakEl = document.getElementById('gamesStreak');
    const matchHighEl = document.getElementById('gamesMatchHigh');
    const fillHighEl = document.getElementById('gamesFillHigh');
    const huntHighEl = document.getElementById('gamesHuntHigh');

    if (totalEl) totalEl.textContent = stats.totalScore.toLocaleString();
    if (streakEl) streakEl.textContent = `${stats.streak} Gün`;
    if (matchHighEl) matchHighEl.textContent = stats.matchHighscore.toString();
    if (fillHighEl) fillHighEl.textContent = stats.fillHighscore.toString();
    if (huntHighEl) huntHighEl.textContent = stats.huntHighscore.toString();
  }

  // ── Ekran Geçişleri (View Router) ──────────────────────────────────────────
  function showScreen(screenId) {
    const screens = ['gamesHubView', 'gameMatchView', 'gameFillView', 'gameHuntView'];
    screens.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.toggle('hidden', id !== screenId);
      }
    });
    // Aktif oyundan çıkıldığında timerları temizle
    if (screenId === 'gamesHubView') {
      MatchGame.cleanup();
      FillGame.cleanup();
      HuntGame.cleanup();
      updateStatsBar();
    }
  }

  function showResultModal(data) {
    const modal = document.getElementById('gameResultModal');
    if (!modal) return;

    const titleEl = document.getElementById('gameResultTitle');
    const subtitleEl = document.getElementById('gameResultSubtitle');
    const scoreEl = document.getElementById('gameResultScore');
    const badgeEl = document.getElementById('gameResultBadge');
    const statsEl = document.getElementById('gameResultStats');
    const retryBtn = document.getElementById('gameResultRetryBtn');

    if (titleEl) titleEl.textContent = data.title || 'Tebrikler!';
    if (subtitleEl) subtitleEl.textContent = data.subtitle || 'Oyunu tamamladınız.';
    if (scoreEl) scoreEl.textContent = data.score.toString();

    if (badgeEl) {
      if (data.isNewHighscore) {
        badgeEl.classList.remove('hidden');
        badgeEl.textContent = '🎉 YENİ REKOR!';
        playSound('fanfare');
      } else {
        badgeEl.classList.add('hidden');
        playSound('success');
      }
    }

    if (statsEl && data.details) {
      statsEl.innerHTML = data.details.map(d => `
        <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span class="text-slate-500 dark:text-slate-400">${d.label}</span>
          <span class="font-bold text-slate-800 dark:text-slate-100">${d.value}</span>
        </div>
      `).join('');
    }

    if (retryBtn) {
      retryBtn.onclick = () => {
        closeResultModal();
        if (typeof data.onRetry === 'function') data.onRetry();
      };
    }

    modal.classList.remove('hidden');
  }

  function closeResultModal() {
    const modal = document.getElementById('gameResultModal');
    if (modal) modal.classList.add('hidden');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. OYUN: HIZLI EŞLEŞTİRME (MatchGame - 30 sn)
  // ═══════════════════════════════════════════════════════════════════════════
  const MatchGame = {
    state: {
      pairs: [],
      tiles: [],
      firstSelection: null,
      matchedPairsCount: 0,
      totalMatchedAllRounds: 0,
      score: 0,
      streak: 0,
      timeLeft: 30,
      timerId: null,
      isLocked: false
    },

    init() {
      showScreen('gameMatchView');
      this.state.score = 0;
      this.state.streak = 0;
      this.state.matchedPairsCount = 0;
      this.state.totalMatchedAllRounds = 0;
      this.state.timeLeft = 30;
      this.state.firstSelection = null;
      this.state.isLocked = false;

      this.updateHeader();
      this.loadRound();
      this.startTimer();
    },

    cleanup() {
      if (this.state.timerId) {
        clearInterval(this.state.timerId);
        this.state.timerId = null;
      }
    },

    startTimer() {
      this.cleanup();
      const timerBar = document.getElementById('matchProgressBar');
      const timerText = document.getElementById('matchTimerText');

      this.state.timerId = setInterval(() => {
        this.state.timeLeft -= 1;
        if (timerText) timerText.textContent = `${this.state.timeLeft}s`;
        if (timerBar) {
          const percent = Math.max(0, (this.state.timeLeft / 30) * 100);
          timerBar.style.width = `${percent}%`;
          if (this.state.timeLeft <= 5) {
            timerBar.className = 'h-full bg-red-500 transition-all duration-300';
          } else {
            timerBar.className = 'h-full bg-primary-600 transition-all duration-300';
          }
        }

        if (this.state.timeLeft <= 0) {
          this.cleanup();
          this.endGame();
        }
      }, 1000);
    },

    loadRound() {
      const vocab = shuffle(getGameVocabulary());
      const selected = vocab.slice(0, 6);
      this.state.pairs = selected;
      this.state.matchedPairsCount = 0;
      this.state.firstSelection = null;

      // 6 Hollandaca + 6 Türkçe karo
      const tiles = [];
      selected.forEach((item, idx) => {
        tiles.push({ id: `nl_${idx}`, pairId: idx, text: item.nl, lang: 'nl' });
        tiles.push({ id: `tr_${idx}`, pairId: idx, text: item.tr, lang: 'tr' });
      });

      this.state.tiles = shuffle(tiles);
      this.renderTiles();
    },

    renderTiles() {
      const grid = document.getElementById('matchTilesGrid');
      if (!grid) return;

      grid.innerHTML = '';
      this.state.tiles.forEach(tile => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = tile.id;
        btn.dataset.pairId = tile.pairId;
        btn.dataset.lang = tile.lang;
        btn.className = 'match-tile min-h-[58px] p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm transition-all duration-150 flex items-center justify-center text-center shadow-xs select-none active:scale-95';
        btn.textContent = tile.text;

        btn.onclick = () => this.handleTileClick(tile, btn);
        grid.appendChild(btn);
      });
    },

    handleTileClick(tile, btnEl) {
      if (this.state.isLocked) return;
      if (btnEl.classList.contains('matched') || btnEl.classList.contains('selected')) return;

      playSound('tap');

      // İlk seçim
      if (!this.state.firstSelection) {
        this.state.firstSelection = { tile, el: btnEl };
        btnEl.classList.add('selected', 'border-primary-500', 'bg-primary-50', 'dark:bg-primary-950/60', 'text-primary-600', 'dark:text-primary-400');
        return;
      }

      // Aynı dilde iki karo seçilmişse ilkini bırak, yenisini seç
      if (this.state.firstSelection.tile.lang === tile.lang) {
        this.state.firstSelection.el.classList.remove('selected', 'border-primary-500', 'bg-primary-50', 'dark:bg-primary-950/60', 'text-primary-600', 'dark:text-primary-400');
        this.state.firstSelection = { tile, el: btnEl };
        btnEl.classList.add('selected', 'border-primary-500', 'bg-primary-50', 'dark:bg-primary-950/60', 'text-primary-600', 'dark:text-primary-400');
        return;
      }

      // İki farklı dil seçildi: Eşleşmeyi kontrol et
      const first = this.state.firstSelection;
      const second = { tile, el: btnEl };
      second.el.classList.add('selected');

      if (first.tile.pairId === second.tile.pairId) {
        // DOĞRU EŞLEŞME
        this.state.streak += 1;
        const points = 10 + (this.state.streak * 2);
        this.state.score += points;
        this.state.matchedPairsCount += 1;
        this.state.totalMatchedAllRounds += 1;

        // Hollandaca telaffuz
        const dutchWord = first.tile.lang === 'nl' ? first.tile.text : second.tile.text;
        speakDutch(dutchWord);
        playSound('success');

        [first.el, second.el].forEach(el => {
          el.className = 'match-tile min-h-[58px] p-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center text-center opacity-40 pointer-events-none matched transition-all duration-300 scale-95';
        });

        this.state.firstSelection = null;
        this.updateHeader();

        // 6 çiftin tamamı bitti mi?
        if (this.state.matchedPairsCount >= 6) {
          this.state.timeLeft = Math.min(45, this.state.timeLeft + 5);
          if (typeof window.showToast === 'function') {
            window.showToast('+5 Saniye Bonus! Yeni Tur!', 'ph-bold ph-lightning text-amber-500');
          }
          setTimeout(() => this.loadRound(), 400);
        }
      } else {
        // YANLIŞ EŞLEŞME
        this.state.isLocked = true;
        this.state.streak = 0;
        playSound('wrong');

        [first.el, second.el].forEach(el => {
          el.classList.add('border-red-500', 'bg-red-50', 'dark:bg-red-950/40', 'text-red-600', 'animate-shake');
        });

        setTimeout(() => {
          [first.el, second.el].forEach(el => {
            el.className = 'match-tile min-h-[58px] p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm transition-all duration-150 flex items-center justify-center text-center shadow-xs select-none active:scale-95';
          });
          this.state.firstSelection = null;
          this.state.isLocked = false;
          this.updateHeader();
        }, 500);
      }
    },

    updateHeader() {
      const scoreEl = document.getElementById('matchScoreText');
      const streakEl = document.getElementById('matchStreakText');
      if (scoreEl) scoreEl.textContent = this.state.score.toString();
      if (streakEl) streakEl.textContent = `${this.state.streak}x`;
    },

    endGame() {
      const result = recordGameResult('match', this.state.score);
      showResultModal({
        title: 'Süre Doldu!',
        subtitle: 'Hızlı Eşleştirme turu tamamlandı.',
        score: this.state.score,
        isNewHighscore: result.isNewHighscore,
        details: [
          { label: 'Eşleştirilen Kelime Çifti', value: `${this.state.totalMatchedAllRounds} Çift` },
          { label: 'En Yüksek Seri', value: `${this.state.streak}x` },
          { label: 'Kazanılan Puan', value: `+${this.state.score}` }
        ],
        onRetry: () => this.init()
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. OYUN: BOŞLUK DOLDUR (FillGame - 10 Soru)
  // ═══════════════════════════════════════════════════════════════════════════
  const FillGame = {
    state: {
      questions: [],
      currentIndex: 0,
      score: 0,
      streak: 0,
      correctCount: 0,
      isAnswered: false
    },

    init() {
      showScreen('gameFillView');
      const vocab = shuffle(getGameVocabulary());
      
      // Örnek cümlesi olan kelimeleri topla
      const withExamples = vocab.filter(v => v.example && v.example.source && v.example.source.length > 5);
      const pool = withExamples.length >= 10 ? withExamples : vocab;
      
      this.state.questions = pool.slice(0, 10).map(item => {
        const word = item.nl;
        const sourceSentence = (item.example && item.example.source) ? item.example.source : `Dit is het woord ${word}.`;
        const translation = (item.example && item.example.translation) ? item.example.translation : item.fullTr;

        // Kelimeyi cümleden gizle
        let blanked = sourceSentence;
        const reg = new RegExp(`\\b${word}\\b`, 'i');
        if (reg.test(sourceSentence)) {
          blanked = sourceSentence.replace(reg, '_____');
        } else {
          // Basit içeren kelime değişimi
          const simpleReg = new RegExp(word, 'i');
          blanked = sourceSentence.replace(simpleReg, '_____');
        }

        // 3 çeldirici üret
        const distractors = vocab
          .filter(v => v.nl !== word)
          .slice(0, 8);
        const randomDistractors = shuffle(distractors).slice(0, 3).map(d => d.nl);
        const options = shuffle([word, ...randomDistractors]);

        return {
          word,
          sentence: blanked,
          fullSentence: sourceSentence,
          translation,
          options
        };
      });

      this.state.currentIndex = 0;
      this.state.score = 0;
      this.state.streak = 0;
      this.state.correctCount = 0;
      this.state.isAnswered = false;

      this.renderQuestion();
    },

    cleanup() {},

    renderQuestion() {
      this.state.isAnswered = false;
      const q = this.state.questions[this.state.currentIndex];
      if (!q) {
        this.endGame();
        return;
      }

      // Soru Başlığı & Progress
      const countEl = document.getElementById('fillQuestionCount');
      const progressEl = document.getElementById('fillProgressBar');
      const scoreEl = document.getElementById('fillScoreText');
      const streakEl = document.getElementById('fillStreakText');

      if (countEl) countEl.textContent = `${this.state.currentIndex + 1} / 10`;
      if (progressEl) progressEl.style.width = `${((this.state.currentIndex + 1) / 10) * 100}%`;
      if (scoreEl) scoreEl.textContent = this.state.score.toString();
      if (streakEl) streakEl.textContent = `${this.state.streak}x`;

      // Cümle & Çeviri
      const sentenceEl = document.getElementById('fillSentenceText');
      const transEl = document.getElementById('fillTranslationText');
      if (sentenceEl) {
        sentenceEl.innerHTML = q.sentence.replace('_____', '<span class="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border-b-2 border-amber-500">_____</span>');
      }
      if (transEl) transEl.textContent = q.translation;

      // Seçenekler
      const optionsContainer = document.getElementById('fillOptionsGrid');
      if (!optionsContainer) return;

      optionsContainer.innerHTML = '';
      q.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fill-opt-btn min-h-[52px] p-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-all flex items-center justify-between text-left shadow-xs active:scale-98 select-none';
        btn.innerHTML = `
          <span class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold flex items-center justify-center">${['A','B','C','D'][idx]}</span>
            <span>${optText}</span>
          </span>
          <i class="ph-bold ph-caret-right text-slate-400"></i>
        `;

        btn.onclick = () => this.handleAnswer(optText, btn, q);
        optionsContainer.appendChild(btn);
      });

      // Telaffuz butonu
      const audioBtn = document.getElementById('fillSpeakBtn');
      if (audioBtn) {
        audioBtn.onclick = () => speakDutch(q.fullSentence);
      }
    },

    handleAnswer(selectedWord, btnEl, question) {
      if (this.state.isAnswered) return;
      this.state.isAnswered = true;

      const isCorrect = (selectedWord.toLowerCase() === question.word.toLowerCase());
      const sentenceEl = document.getElementById('fillSentenceText');

      if (isCorrect) {
        this.state.correctCount += 1;
        this.state.streak += 1;
        const points = 15 + (this.state.streak * 3);
        this.state.score += points;

        playSound('success');
        speakDutch(question.word);

        btnEl.className = 'fill-opt-btn min-h-[52px] p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold text-sm flex items-center justify-between text-left transition-all scale-102';
        btnEl.querySelector('i').className = 'ph-bold ph-check text-emerald-600 text-lg';

        if (sentenceEl) {
          sentenceEl.innerHTML = question.fullSentence.replace(new RegExp(`(${question.word})`, 'gi'), '<span class="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold underline">$1</span>');
        }
      } else {
        this.state.streak = 0;
        playSound('wrong');

        btnEl.className = 'fill-opt-btn min-h-[52px] p-3 rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 font-bold text-sm flex items-center justify-between text-left transition-all animate-shake';
        btnEl.querySelector('i').className = 'ph-bold ph-x text-red-600 text-lg';

        // Doğru şıkkı yeşille parlat
        const allBtns = document.querySelectorAll('.fill-opt-btn');
        allBtns.forEach(b => {
          if (b.textContent.includes(question.word)) {
            b.className = 'fill-opt-btn min-h-[52px] p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-sm flex items-center justify-between text-left';
          }
        });
      }

      const scoreEl = document.getElementById('fillScoreText');
      const streakEl = document.getElementById('fillStreakText');
      if (scoreEl) scoreEl.textContent = this.state.score.toString();
      if (streakEl) streakEl.textContent = `${this.state.streak}x`;

      setTimeout(() => {
        this.state.currentIndex += 1;
        this.renderQuestion();
      }, 1000);
    },

    endGame() {
      const result = recordGameResult('fill', this.state.score);
      showResultModal({
        title: 'Quiz Bitti!',
        subtitle: '10 soruluk cümle analizi tamamlandı.',
        score: this.state.score,
        isNewHighscore: result.isNewHighscore,
        details: [
          { label: 'Doğru Cevap', value: `${this.state.correctCount} / 10` },
          { label: 'Başarı Oranı', value: `%${Math.round((this.state.correctCount / 10) * 100)}` },
          { label: 'Kazanılan Puan', value: `+${this.state.score}` }
        ],
        onRetry: () => this.init()
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. OYUN: KELİME AVI (HuntGame - 90 sn Harf Avı)
  // ═══════════════════════════════════════════════════════════════════════════
  const HuntGame = {
    state: {
      letters: [],
      usedIndices: [],
      currentInput: '',
      targetWords: [],
      foundWords: [],
      score: 0,
      timeLeft: 90,
      timerId: null
    },

    init() {
      showScreen('gameHuntView');
      this.state.score = 0;
      this.state.timeLeft = 90;
      this.state.foundWords = [];
      this.state.currentInput = '';
      this.state.usedIndices = [];

      this.setupLetters();
      this.render();
      this.startTimer();
    },

    cleanup() {
      if (this.state.timerId) {
        clearInterval(this.state.timerId);
        this.state.timerId = null;
      }
    },

    startTimer() {
      this.cleanup();
      const timerBar = document.getElementById('huntProgressBar');
      const timerText = document.getElementById('huntTimerText');

      this.state.timerId = setInterval(() => {
        this.state.timeLeft -= 1;
        if (timerText) timerText.textContent = `${this.state.timeLeft}s`;
        if (timerBar) {
          const percent = Math.max(0, (this.state.timeLeft / 90) * 100);
          timerBar.style.width = `${percent}%`;
          if (this.state.timeLeft <= 10) {
            timerBar.className = 'h-full bg-red-500 transition-all duration-300';
          } else {
            timerBar.className = 'h-full bg-emerald-500 transition-all duration-300';
          }
        }

        if (this.state.timeLeft <= 0) {
          this.cleanup();
          this.endGame();
        }
      }, 1000);
    },

    setupLetters() {
      const vocab = getGameVocabulary();
      // En az 4 harfli kelimelerden bir çekirdek kelime seçelim
      const longWords = vocab.filter(v => v.nl.length >= 5 && v.nl.length <= 7 && /^[a-z]+$/i.test(v.nl));
      const coreWord = (longWords.length > 0 ? shuffle(longWords)[0].nl : 'spreken').toLowerCase();

      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'z'];

      // Çekirdek kelimenin harfleri + eksik varsa 7'ye tamamla
      let letterList = [...coreWord];
      while (letterList.length < 7) {
        const vCount = letterList.filter(ch => vowels.includes(ch)).length;
        if (vCount < 3) {
          letterList.push(shuffle(vowels)[0]);
        } else {
          letterList.push(shuffle(consonants)[0]);
        }
      }
      this.state.letters = shuffle(letterList.slice(0, 7));

      // Bu 7 harften üretilebilecek geçerli kelimeleri sözlükten tespit et
      const valid = new Set();
      vocab.forEach(item => {
        const w = item.nl.toLowerCase();
        if (w.length >= 3 && /^[a-z]+$/i.test(w) && this.canFormWord(w, this.state.letters)) {
          valid.add(w);
        }
      });
      this.state.targetWords = Array.from(valid);
    },

    canFormWord(word, letterPool) {
      const pool = [...letterPool];
      for (const ch of word) {
        const idx = pool.indexOf(ch);
        if (idx === -1) return false;
        pool.splice(idx, 1);
      }
      return true;
    },

    render() {
      const currentWordEl = document.getElementById('huntCurrentWord');
      const scoreEl = document.getElementById('huntScoreText');
      const foundCountEl = document.getElementById('huntFoundCountText');
      const tilesContainer = document.getElementById('huntLetterTiles');
      const foundListEl = document.getElementById('huntFoundList');

      if (currentWordEl) currentWordEl.textContent = this.state.currentInput.toUpperCase() || '...';
      if (scoreEl) scoreEl.textContent = this.state.score.toString();
      if (foundCountEl) foundCountEl.textContent = `${this.state.foundWords.length} Kelime`;

      // 7 Harf Karosu
      if (tilesContainer) {
        tilesContainer.innerHTML = '';
        this.state.letters.forEach((letter, idx) => {
          const isUsed = this.state.usedIndices.includes(idx);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = `w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-lg sm:text-xl border-2 transition-all select-none active:scale-90 flex items-center justify-center shadow-xs ${
            isUsed 
              ? 'opacity-30 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400 pointer-events-none'
              : 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
          }`;
          btn.textContent = letter.toUpperCase();
          btn.onclick = () => this.addLetter(letter, idx);
          tilesContainer.appendChild(btn);
        });
      }

      // Bulunan kelimeler çipleri
      if (foundListEl) {
        foundListEl.innerHTML = this.state.foundWords.map(w => `
          <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-scale-in">
            <i class="ph-bold ph-check text-xs"></i>
            <span>${w}</span>
          </span>
        `).join('');
      }
    },

    addLetter(letter, index) {
      if (this.state.usedIndices.includes(index)) return;
      playSound('tap');
      this.state.currentInput += letter.toLowerCase();
      this.state.usedIndices.push(index);
      this.render();
    },

    backspace() {
      if (this.state.currentInput.length === 0) return;
      playSound('tap');
      this.state.currentInput = this.state.currentInput.slice(0, -1);
      this.state.usedIndices.pop();
      this.render();
    },

    clear() {
      if (this.state.currentInput.length === 0) return;
      playSound('tap');
      this.state.currentInput = '';
      this.state.usedIndices = [];
      this.render();
    },

    shuffleLetters() {
      playSound('tap');
      this.state.letters = shuffle(this.state.letters);
      this.state.usedIndices = [];
      this.state.currentInput = '';
      this.render();
    },

    submit() {
      const word = this.state.currentInput.trim().toLowerCase();
      if (!word) return;

      if (word.length < 3) {
        playSound('wrong');
        if (typeof window.showToast === 'function') {
          window.showToast('En az 3 harfli kelimeler geçerlidir!', 'ph-bold ph-warning-circle text-amber-500');
        }
        this.shakeInput();
        return;
      }

      if (this.state.foundWords.includes(word)) {
        playSound('wrong');
        if (typeof window.showToast === 'function') {
          window.showToast('Bu kelimeyi zaten buldunuz!', 'ph-bold ph-info text-sky-500');
        }
        this.shakeInput();
        this.clear();
        return;
      }

      // Geçerli hedef kelimeler içinde var mı veya sözlük tohumlarında kayıtlı mı?
      const isKnownWord = this.state.targetWords.includes(word) || 
        getGameVocabulary().some(v => v.nl.toLowerCase() === word);

      if (isKnownWord) {
        const points = word.length * 10;
        this.state.score += points;
        this.state.foundWords.push(word);

        playSound('success');
        speakDutch(word);

        if (typeof window.showToast === 'function') {
          window.showToast(`Harika! +${points} Puan (${word})`, 'ph-bold ph-check-circle text-emerald-400');
        }

        this.clear();
      } else {
        playSound('wrong');
        if (typeof window.showToast === 'function') {
          window.showToast('Geçersiz Felemenkçe kelime!', 'ph-bold ph-x-circle text-red-500');
        }
        this.shakeInput();
      }
    },

    shakeInput() {
      const box = document.getElementById('huntCurrentWordBox');
      if (box) {
        box.classList.add('animate-shake', 'border-red-500');
        setTimeout(() => {
          box.classList.remove('animate-shake', 'border-red-500');
        }, 500);
      }
    },

    endGame() {
      const result = recordGameResult('hunt', this.state.score);
      showResultModal({
        title: 'Süre Doldu!',
        subtitle: 'Kelime Avı oturumu tamamlandı.',
        score: this.state.score,
        isNewHighscore: result.isNewHighscore,
        details: [
          { label: 'Bulunan Kelime Sayısı', value: `${this.state.foundWords.length} Adet` },
          { label: 'Oluşturulabilen Kelimeler', value: `${this.state.targetWords.length} Olası Kelime` },
          { label: 'Kazanılan Toplam Puan', value: `+${this.state.score}` }
        ],
        onRetry: () => this.init()
      });
    }
  };

  // ── Genel Başlatıcı ve Dışa Aktarım ───────────────────────────────────────
  function init() {
    updateStatsBar();

    // Kart butonları
    document.getElementById('gameMatchBtn')?.addEventListener('click', () => MatchGame.init());
    document.getElementById('gameFillBtn')?.addEventListener('click', () => FillGame.init());
    document.getElementById('gameHuntBtn')?.addEventListener('click', () => HuntGame.init());

    // Geri Dön butonları
    document.getElementById('matchBackBtn')?.addEventListener('click', () => showScreen('gamesHubView'));
    document.getElementById('fillBackBtn')?.addEventListener('click', () => showScreen('gamesHubView'));
    document.getElementById('huntBackBtn')?.addEventListener('click', () => showScreen('gamesHubView'));

    // Sonuç modalı butonları
    document.getElementById('gameResultCloseBtn')?.addEventListener('click', () => {
      closeResultModal();
      showScreen('gamesHubView');
    });

    // Kelime Avı Aksiyonları
    document.getElementById('huntSubmitBtn')?.addEventListener('click', () => HuntGame.submit());
    document.getElementById('huntBackspaceBtn')?.addEventListener('click', () => HuntGame.backspace());
    document.getElementById('huntClearBtn')?.addEventListener('click', () => HuntGame.clear());
    document.getElementById('huntShuffleBtn')?.addEventListener('click', () => HuntGame.shuffleLetters());

    // Klavye Desteği (Kelime Avı açıkken doğrudan yazabilme)
    document.addEventListener('keydown', (e) => {
      const huntView = document.getElementById('gameHuntView');
      if (!huntView || huntView.classList.contains('hidden')) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        HuntGame.submit();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        HuntGame.backspace();
      } else if (e.key === 'Escape') {
        HuntGame.clear();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const char = e.key.toLowerCase();
        // Henüz kullanılmamış karo indeksini bul
        const availableIdx = HuntGame.state.letters.findIndex((l, i) => l === char && !HuntGame.state.usedIndices.includes(i));
        if (availableIdx !== -1) {
          HuntGame.addLetter(char, availableIdx);
        }
      }
    });
  }

  // Sayfa açıldığında veya DOM hazır olduğunda
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    onTabOpen: () => {
      showScreen('gamesHubView');
      updateStatsBar();
    },
    initMatch: () => MatchGame.init(),
    initFill: () => FillGame.init(),
    initHunt: () => HuntGame.init(),
    getStats: () => getStats()
  };
})();
