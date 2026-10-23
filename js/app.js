/**
 * LingoMate Mobile Application Controller
 * Handles UI interactions, multi-provider configuration, search history, and speech synthesis.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Elements ────────────────────────────────────────────────────────────
  const headerProviderBadge = document.getElementById('headerProviderBadge');
  const headerProviderIcon = document.getElementById('headerProviderIcon');
  const headerProviderName = document.getElementById('headerProviderName');

  const settingsBtn = document.getElementById('settingsBtn');
  const viewSettings = document.getElementById('viewSettings');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const saveStatusText = document.getElementById('saveStatusText');

  const historyBtn = document.getElementById('historyBtn');
  const historyModal = document.getElementById('historyModal');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historyList = document.getElementById('historyList');

  const sourceLangBtn = document.getElementById('sourceLangBtn');
  const targetLangBtn = document.getElementById('targetLangBtn');
  const sourceLangText = document.getElementById('sourceLangText');
  const targetLangText = document.getElementById('targetLangText');
  const swapLangBtn = document.getElementById('swapLangBtn');

  const modeToggleBtn = document.getElementById('modeToggleBtn');
  const modeToggleIcon = document.getElementById('modeToggleIcon');
  const modeToggleText = document.getElementById('modeToggleText');

  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchBtnText = document.getElementById('searchBtnText');
  const searchBtnIcon = document.getElementById('searchBtnIcon');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const clearBtn = document.getElementById('clearBtn');
  const pasteBtn = document.getElementById('pasteBtn');

  const errorBox = document.getElementById('errorBox');
  const errorMsg = document.getElementById('errorMsg');
  const quickFallbackBtn = document.getElementById('quickFallbackBtn');
  const emptyState = document.getElementById('emptyState');
  const skeletonLoader = document.getElementById('skeletonLoader');
  const resultsContainer = document.getElementById('resultsContainer');

  // Settings Modal Elements
  const providerTabs = document.querySelectorAll('.provider-tab');
  const modelSelect = document.getElementById('modelSelect');
  const refreshModelsBtn = document.getElementById('refreshModelsBtn');
  const refreshModelsBtnText = document.getElementById('refreshModelsBtnText');
  const modelDetectionStatus = document.getElementById('modelDetectionStatus');
  const googleKeySection = document.getElementById('googleKeySection');
  const nvidiaKeySection = document.getElementById('nvidiaKeySection');
  const localConfigSection = document.getElementById('localConfigSection');
  const googleKeyInput = document.getElementById('googleKeyInput');
  const nvidiaKeyInput = document.getElementById('nvidiaKeyInput');
  const localUrlInput = document.getElementById('localUrlInput');
  const seedChipsContainer = document.getElementById('seedChipsContainer');

  // ── Localization Mappings (L10N-01, L10N-02, L10N-03) ──────────────────
  const FREQUENCY_MAP_TR = {
    very_common: 'Çok Yaygın',
    common: 'Yaygın',
    less_common: 'Daha Az Yaygın',
    rare: 'Nadir'
  };

  const REGISTER_MAP_TR = {
    informal: 'Günlük / Samimi',
    formal: 'Resmi',
    slang: 'Argo',
    vulgar: 'Kaba / Argo',
    colloquial: 'Konuşma Dili',
    archaic: 'Eski Dil / Tarihî',
    poetic: 'Edebi / Şiirsel'
  };

  const POS_MAP_TR = {
    noun: 'İsim',
    verb: 'Fiil',
    adjective: 'Sıfat',
    adverb: 'Zarf',
    pronoun: 'Zamir',
    preposition: 'Edat',
    conjunction: 'Bağlaç',
    interjection: 'Ünlem',
    expression: 'Deyim / İfade',
    phrase: 'Deyim / Kelime Grubu',
    sentence: 'Cümle',
    idiom: 'Deyim',
    kelime: 'Kelime',
    'cümle / ifade': 'Cümle / İfade'
  };

  function localizeFrequency(freq) {
    if (!freq) return '';
    const clean = String(freq).toLowerCase().trim().replace(/[\s-]+/g, '_');
    return FREQUENCY_MAP_TR[clean] || clean.replace('_', ' ').toUpperCase();
  }

  function localizeRegister(reg) {
    if (!reg) return '';
    const clean = String(reg).toLowerCase().trim();
    return REGISTER_MAP_TR[clean] || clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  function localizePos(pos) {
    if (!pos) return '';
    const clean = String(pos).toLowerCase().trim();
    return POS_MAP_TR[clean] || pos;
  }

  function renderArticleBadge(article) {
    if (!article) return '';
    const clean = String(article).trim().toLowerCase();
    if (clean === 'de') {
      return `
        <span class="text-xs px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-bold border border-sky-300 shadow-2xs inline-flex items-center gap-1" title="De Artikeli">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
          <span>de</span>
        </span>
      `;
    } else if (clean === 'het') {
      return `
        <span class="text-xs px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 shadow-2xs inline-flex items-center gap-1" title="Het Artikeli">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>het</span>
        </span>
      `;
    } else {
      return `
        <span class="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200 inline-flex items-center">
          ${escapeHtml(article)}
        </span>
      `;
    }
  }

  function highlightKeyword(sentence, keyword) {
    if (!sentence) return '';
    const escapedText = escapeHtml(sentence);
    if (!keyword || !keyword.trim()) return escapedText;

    try {
      const trimmed = keyword.trim();
      if (trimmed.length < 2) return escapedText;
      const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');
      return escapedText.replace(regex, '<mark class="bg-primary-100 text-primary-900 font-semibold px-1 py-0.5 rounded">$1</mark>');
    } catch {
      return escapedText;
    }
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ── Dynamic Seed Chips (UX-02) ──────────────────────────────────────────
  const SEED_EXAMPLES = {
    nl: [
      'gezellig',
      'uitwaaien',
      'alsjeblieft',
      'boodschappen doen',
      'de aap komt uit de mouw'
    ],
    tr: [
      'kolay gelsin',
      'afiyet olsun',
      'gözden geçirmek',
      'eline sağlık',
      'hoşça kal'
    ]
  };

  function renderSeedChips() {
    if (!seedChipsContainer) return;
    const list = SEED_EXAMPLES[sourceLang] || SEED_EXAMPLES.nl;
    seedChipsContainer.innerHTML = list
      .map(
        (word) => `
        <button class="seed-chip px-3 py-1.5 min-h-[38px] bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium whitespace-nowrap shadow-2xs transition-all active:scale-95" data-word="${escapeHtml(word)}">
          ${escapeHtml(word)}
        </button>
      `
      )
      .join('');

    seedChipsContainer.querySelectorAll('.seed-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(10);
        const word = chip.dataset.word || chip.textContent.trim();
        searchInput.value = word;
        searchBtn.disabled = false;
        clearBtn.classList.remove('hidden');
        handleSearch();
      });
    });
  }

  // ── State ───────────────────────────────────────────────────────────────
  let sourceLang = 'nl'; // 'nl' | 'tr'
  let isLoading = false;
  let activeProvider = 'google';
  let activeModel = 'gemini-flash-latest';
  let isQuickMode = false;

  // ── UI Enhancements Elements ─────────────────────────────────────────────
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleIcon = document.getElementById('themeToggleIcon');
  const autocompleteDropdown = document.getElementById('autocompleteDropdown');
  const toastEl = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimeout = null;

  // Sticky Mini Search Bar
  const stickySearchBar = document.getElementById('stickySearchBar');
  const stickySearchTrigger = document.getElementById('stickySearchTrigger');
  const stickySearchText = document.getElementById('stickySearchText');
  const stickyScrollTopBtn = document.getElementById('stickyScrollTopBtn');

  // Accessibility state
  let announce = null;         // screen reader live-region announcer
  let historyTrap = null;      // focus trap for the history dialog
  let flagTrap = null;         // focus trap for the AI-flag dialog

  function showToast(msg, iconClass = 'ph-bold ph-check-circle text-emerald-400') {
    if (!toastEl || !toastMessage) return;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage.textContent = msg;
    if (toastIcon) toastIcon.className = iconClass;
    toastEl.classList.add('show');
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2000);
  }

  // Fallback toast - longer duration, warning style
  function showFallbackToast(providerName, errorMsg) {
    const msg = `${providerName} kullanılamadı, Hızlı REST'e geçildi: ${errorMsg || 'bilinmeyen hata'}`;
    showToast(msg, 'ph-bold ph-warning-circle text-amber-500');
    // Longer duration for fallback warnings
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 5000);
  }
  window.showFallbackToast = showFallbackToast;

  let lastThemeToggle = 0;
  window.toggleTheme = function() {
    const now = Date.now();
    if (now - lastThemeToggle < 250) return;
    lastThemeToggle = now;
    const isDark = document.documentElement.classList.toggle('dark');
    try {
      localStorage.setItem('lexi_theme', isDark ? 'dark' : 'light');
    } catch(e) {}
    updateThemeIcon();
    showToast(isDark ? 'Karanlık Mod Açık' : 'Aydınlık Mod Açık', isDark ? 'ph-bold ph-moon text-indigo-400' : 'ph-bold ph-sun text-amber-500');
  };

  function updateThemeIcon() {
    if (!themeToggleIcon) return;
    const isDark = document.documentElement.classList.contains('dark');
    themeToggleIcon.className = isDark ? 'ph-bold ph-sun text-xl text-amber-400' : 'ph-bold ph-moon text-xl';
  }

  function renderInteractiveSentence(sentence, lang, keyword = '') {
    if (!sentence) return '';
    if (lang !== 'nl') {
      return highlightKeyword(sentence, keyword);
    }
    const tokens = sentence.split(/(\s+|[.,!?:;"'()\[\]]+)/);
    return tokens.map(token => {
      const clean = token.replace(/[.,!?:;"'()\[\]]/g, '').trim();
      const isWord = /^[a-zA-ZÀ-ÿ-]+$/.test(clean) && clean.length > 1;
      const isKey = keyword && clean.toLowerCase() === keyword.toLowerCase();

      if (isWord) {
        const keyClass = isKey
          ? 'text-amber-600 dark:text-amber-400 font-black bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-800/80 shadow-2xs'
          : '';
        return `<span class="lookup-word ${keyClass}" data-word="${escapeHtml(clean)}" title="'${escapeHtml(clean)}' anlamını gör">${escapeHtml(token)}</span>`;
      }
      return escapeHtml(token);
    }).join('');
  }

  // ── Quick-Peek Word Inspector (Dokun-Öğren Cümle Motoru) ─────────────────
  const quickPeekSheet = document.getElementById('quickPeekSheet');
  const qpWord = document.getElementById('qpWord');
  const qpArticleBadge = document.getElementById('qpArticleBadge');
  const qpPos = document.getElementById('qpPos');
  const qpCefr = document.getElementById('qpCefr');
  const qpTranslation = document.getElementById('qpTranslation');
  const qpExtraNote = document.getElementById('qpExtraNote');
  const qpSpeakBtn = document.getElementById('qpSpeakBtn');
  const qpFavBtn = document.getElementById('qpFavBtn');
  const qpFavIcon = document.getElementById('qpFavIcon');
  const qpCloseBtn = document.getElementById('qpCloseBtn');
  const qpFullAnalyzeBtn = document.getElementById('qpFullAnalyzeBtn');
  let currentQpWord = '';

  function openQuickPeek(rawWord, lang = 'nl') {
    if (!quickPeekSheet) return;
    const cleanWord = (rawWord || '').trim().replace(/[.,!?;:"'()\[\]]/g, '');
    if (!cleanWord || cleanWord.length < 2) return;

    currentQpWord = cleanWord;
    if (qpWord) qpWord.textContent = cleanWord;

    // Reset badges
    if (qpArticleBadge) {
      qpArticleBadge.className = 'hidden text-xs px-2 py-0.5 rounded-md font-bold uppercase shrink-0';
      qpArticleBadge.textContent = '';
    }
    if (qpPos) {
      qpPos.className = 'hidden text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium';
      qpPos.textContent = '';
    }
    if (qpCefr) {
      qpCefr.className = 'hidden text-xs px-1.5 py-0.5 rounded font-bold uppercase';
      qpCefr.textContent = '';
    }
    if (qpExtraNote) {
      qpExtraNote.className = 'text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 hidden';
      qpExtraNote.textContent = '';
    }

    updateQpFavState();

    // 1. Instant check in curated seeds (0ms local lookup)
    const lowerWord = cleanWord.toLowerCase();
    let seedMatch = null;
    if (window.LEXI_DICTIONARY_SEEDS && Array.isArray(window.LEXI_DICTIONARY_SEEDS)) {
      seedMatch = window.LEXI_DICTIONARY_SEEDS.find(s => s.nl && s.nl.toLowerCase() === lowerWord);
    }

    if (seedMatch) {
      if (qpTranslation) qpTranslation.textContent = seedMatch.tr;
      if (seedMatch.article && qpArticleBadge) {
        const art = seedMatch.article.toLowerCase();
        qpArticleBadge.textContent = art;
        qpArticleBadge.className = art === 'de'
          ? 'text-xs px-2 py-0.5 rounded-md font-bold uppercase shrink-0 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
          : 'text-xs px-2 py-0.5 rounded-md font-bold uppercase shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      }
      if (seedMatch.pos && qpPos) {
        qpPos.textContent = seedMatch.pos;
        qpPos.classList.remove('hidden');
      }
      if (seedMatch.cefr && qpCefr) {
        qpCefr.textContent = seedMatch.cefr;
        qpCefr.className = 'text-xs px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
        qpCefr.classList.remove('hidden');
      }
      if (seedMatch.fixedPreposition && qpExtraNote) {
        qpExtraNote.textContent = '🔗 Sabit Edat: ' + seedMatch.fixedPreposition;
        qpExtraNote.classList.remove('hidden');
      } else if (seedMatch.plural && qpExtraNote) {
        qpExtraNote.textContent = `çoğul: de ${seedMatch.plural}${seedMatch.diminutive ? ' | küçültme: het ' + seedMatch.diminutive : ''}`;
        qpExtraNote.classList.remove('hidden');
      }
    } else {
      if (qpTranslation) qpTranslation.textContent = 'Anlam aranıyor...';
      if (typeof AIEngine !== 'undefined' && AIEngine.quickTranslateRest) {
        AIEngine.quickTranslateRest(cleanWord, lang, 'tr').then(res => {
          if (currentQpWord === cleanWord && qpTranslation) {
            const firstTrans = res.translations?.[0]?.text || 'Çeviri bulunamadı';
            qpTranslation.textContent = firstTrans;
            if (res.grammar?.article && qpArticleBadge) {
              const art = res.grammar.article.toLowerCase();
              qpArticleBadge.textContent = art;
              qpArticleBadge.className = art === 'de'
                ? 'text-xs px-2 py-0.5 rounded-md font-bold uppercase shrink-0 bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                : 'text-xs px-2 py-0.5 rounded-md font-bold uppercase shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
            }
            if (res.partOfSpeech && qpPos) {
              qpPos.textContent = res.partOfSpeech;
              qpPos.classList.remove('hidden');
            }
            if (res.cefr && qpCefr) {
              qpCefr.textContent = res.cefr;
              qpCefr.className = 'text-xs px-1.5 py-0.5 rounded font-bold uppercase bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800';
              qpCefr.classList.remove('hidden');
            }
            if (res.grammar?.fixedPreposition && qpExtraNote) {
              qpExtraNote.textContent = '🔗 Sabit Edat: ' + res.grammar.fixedPreposition;
              qpExtraNote.classList.remove('hidden');
            }
          }
        }).catch(() => {
          if (currentQpWord === cleanWord && qpTranslation) {
            qpTranslation.textContent = cleanWord;
          }
        });
      }
    }

    // Reveal sheet with smooth transition
    quickPeekSheet.classList.remove('hidden');
    requestAnimationFrame(() => {
      quickPeekSheet.classList.add('is-visible');
    });
  }

  function updateQpFavState() {
    if (!qpFavIcon) return;
    const isFav = isFavorite(currentQpWord);
    qpFavIcon.className = isFav ? 'ph-bold ph-star text-lg text-amber-500' : 'ph-bold ph-star text-lg text-slate-400';
    if (qpFavBtn) {
      qpFavBtn.title = isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
    }
  }

  function closeQuickPeek(opts) {
    const options = opts || {};
    if (!quickPeekSheet) return;
    quickPeekSheet.classList.remove('is-visible');
    setTimeout(() => {
      quickPeekSheet.classList.add('hidden');
    }, 250);
    // Focus is only restored when the sheet is dismissed on its own.
    // When a view switch closes it, the view switcher owns focus policy.
    if (options.restoreFocus !== false && searchInput) {
      setTimeout(() => searchInput.focus(), 300);
    }
  }
  window.openQuickPeek = openQuickPeek;
  window.closeQuickPeek = closeQuickPeek;

  function setupQuickPeek() {
    if (!quickPeekSheet) return;

    if (qpSpeakBtn) {
      qpSpeakBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentQpWord) speakText(currentQpWord, 'nl', 1.0);
      });
    }

    if (qpFavBtn) {
      qpFavBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentQpWord) {
          toggleFavorite(currentQpWord);
          updateQpFavState();
        }
      });
    }

    if (qpCloseBtn) {
      qpCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeQuickPeek();
      });
    }

    if (qpFullAnalyzeBtn) {
      qpFullAnalyzeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetWord = currentQpWord;
        closeQuickPeek();
        if (targetWord) {
          searchInput.value = targetWord;
          if (searchBtn) searchBtn.disabled = false;
          if (clearBtn) clearBtn.classList.remove('hidden');
          showToast(`'${targetWord}' aranıyor...`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          handleSearch();
        }
      });
    }

    // Dismiss when clicking outside
    document.addEventListener('click', (e) => {
      if (!quickPeekSheet.classList.contains('hidden') &&
          !quickPeekSheet.contains(e.target) &&
          !e.target.closest('.lookup-word')) {
        closeQuickPeek();
      }
    });
  }

  // ── Voice Search (Web Speech API STT) ────────────────────────────────────
  const voiceSearchBtn = document.getElementById('voiceSearchBtn');
  const voiceSearchLabel = document.getElementById('voiceSearchLabel');
  let isListening = false;
  let recognitionInstance = null;

  function setupVoiceSearch() {
    if (!voiceSearchBtn) return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
      voiceSearchBtn.addEventListener('click', () => {
        showToast('Tarayıcınız ses tanımayı desteklemiyor.');
      });
      return;
    }

    voiceSearchBtn.addEventListener('click', () => {
      if (isListening && recognitionInstance) {
        recognitionInstance.stop();
        return;
      }

      try {
        recognitionInstance = new SpeechRec();
        recognitionInstance.lang = sourceLang === 'nl' ? 'nl-NL' : 'tr-TR';
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.maxAlternatives = 1;

        recognitionInstance.onstart = () => {
          isListening = true;
          voiceSearchBtn.classList.add('is-listening');
          if (voiceSearchLabel) voiceSearchLabel.textContent = 'Dinliyor...';
          showToast(sourceLang === 'nl' ? 'Felemenkçe konuşun...' : 'Türkçe konuşun...', 'ph-bold ph-microphone text-primary-500');
        };

        recognitionInstance.onresult = (event) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript && transcript.trim()) {
            searchInput.value = transcript.trim();
            if (searchBtn) searchBtn.disabled = false;
            if (clearBtn) clearBtn.classList.remove('hidden');
            handleSearch();
          }
        };

        recognitionInstance.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            showToast('Mikrofon erişim izni verilmedi.', 'ph-bold ph-warning-circle text-amber-500');
          } else if (event.error !== 'no-speech') {
            showToast('Ses algılanamadı, tekrar deneyin.', 'ph-bold ph-warning-circle text-amber-500');
          }
        };

        recognitionInstance.onend = () => {
          isListening = false;
          voiceSearchBtn.classList.remove('is-listening');
          if (voiceSearchLabel) voiceSearchLabel.textContent = 'Sesle Ara';
        };

        recognitionInstance.start();
      } catch (err) {
        console.warn('Recognition start exception:', err);
        isListening = false;
        voiceSearchBtn.classList.remove('is-listening');
        if (voiceSearchLabel) voiceSearchLabel.textContent = 'Sesle Ara';
        showToast('Mikrofon başlatılamadı.');
      }
    });
  }

  // ── Dutch Compound Words Dictionary & Decomposer (Samenstellingen) ────────
  const DUTCH_COMPOUND_DICTIONARY = {
    'ziekenhuis': { parts: [{ word: 'ziek', meaning: 'hasta' }, { word: 'huis', meaning: 'ev' }], resultMeaning: 'hastane (hasta evi)' },
    'afwasmachine': { parts: [{ word: 'afwas', meaning: 'bulaşık' }, { word: 'machine', meaning: 'makine' }], resultMeaning: 'bulaşık makinesi' },
    'woordenboek': { parts: [{ word: 'woorden', meaning: 'kelimeler' }, { word: 'boek', meaning: 'kitap' }], resultMeaning: 'sözlük (kelime kitabı)' },
    'treinstation': { parts: [{ word: 'trein', meaning: 'tren' }, { word: 'station', meaning: 'istasyon' }], resultMeaning: 'tren istasyonu' },
    'handschoen': { parts: [{ word: 'hand', meaning: 'el' }, { word: 'schoen', meaning: 'ayakkabı' }], resultMeaning: 'eldiven (el ayakkabısı)' },
    'zonnebril': { parts: [{ word: 'zon', meaning: 'güneş' }, { word: 'bril', meaning: 'gözlük' }], resultMeaning: 'güneş gözlüğü' },
    'slaapkamer': { parts: [{ word: 'slapen', meaning: 'uyumak' }, { word: 'kamer', meaning: 'oda' }], resultMeaning: 'yatak odası' },
    'badkamer': { parts: [{ word: 'bad', meaning: 'banyo' }, { word: 'kamer', meaning: 'oda' }], resultMeaning: 'banyo odası' },
    'tandpasta': { parts: [{ word: 'tand', meaning: 'diş' }, { word: 'pasta', meaning: 'macun' }], resultMeaning: 'diş macunu' },
    'tandenborstel': { parts: [{ word: 'tanden', meaning: 'dişler' }, { word: 'borstel', meaning: 'fırça' }], resultMeaning: 'diş fırçası' },
    'koelkast': { parts: [{ word: 'koel', meaning: 'serin / soğuk' }, { word: 'kast', meaning: 'dolap' }], resultMeaning: 'buzdolabı (serin dolap)' },
    'stofzuiger': { parts: [{ word: 'stof', meaning: 'toz' }, { word: 'zuiger', meaning: 'emici' }], resultMeaning: 'elektrikli süpürge (toz emici)' },
    'verjaardag': { parts: [{ word: 'verjaren', meaning: 'yıllanmak' }, { word: 'dag', meaning: 'gün' }], resultMeaning: 'doğum günü' },
    'fietsenmaker': { parts: [{ word: 'fiets', meaning: 'bisiklet' }, { word: 'maker', meaning: 'tamirci / yapan' }], resultMeaning: 'bisiklet tamircisi' },
    'vliegtuig': { parts: [{ word: 'vliegen', meaning: 'uçmak' }, { word: 'tuig', meaning: 'araç / alet' }], resultMeaning: 'uçak (uçuş aracı)' },
    'aardappel': { parts: [{ word: 'aard', meaning: 'yer / toprak' }, { word: 'appel', meaning: 'elma' }], resultMeaning: 'patates (yer elması)' },
    'stadhuis': { parts: [{ word: 'stad', meaning: 'şehir' }, { word: 'huis', meaning: 'bina / ev' }], resultMeaning: 'belediye binası (şehir evi)' },
    'zaklamp': { parts: [{ word: 'zak', meaning: 'cep' }, { word: 'lamp', meaning: 'lamba' }], resultMeaning: 'el feneri (cep lambası)' },
    'bloempot': { parts: [{ word: 'bloem', meaning: 'çiçek' }, { word: 'pot', meaning: 'saksı' }], resultMeaning: 'çiçek saksısı' },
    'voetbal': { parts: [{ word: 'voet', meaning: 'ayak' }, { word: 'bal', meaning: 'top' }], resultMeaning: 'futbol (ayak topu)' },
    'werkwoord': { parts: [{ word: 'werk', meaning: 'iş / eylem' }, { word: 'woord', meaning: 'kelime' }], resultMeaning: 'fiil (eylem kelimesi)' },
    'regenjas': { parts: [{ word: 'regen', meaning: 'yağmur' }, { word: 'jas', meaning: 'ceket / mont' }], resultMeaning: 'yağmurluk' },
    'vuurtoren': { parts: [{ word: 'vuur', meaning: 'ateş' }, { word: 'toren', meaning: 'kule' }], resultMeaning: 'deniz feneri (ateş kulesi)' },
    'hoofdpijn': { parts: [{ word: 'hoofd', meaning: 'baş / kafa' }, { word: 'pijn', meaning: 'ağrı' }], resultMeaning: 'baş ağrısı' },
    'postkantoor': { parts: [{ word: 'post', meaning: 'posta' }, { word: 'kantoor', meaning: 'ofis' }], resultMeaning: 'postane' },
    'rijbewijs': { parts: [{ word: 'rijden', meaning: 'sürmek' }, { word: 'bewijs', meaning: 'belge / kanıt' }], resultMeaning: 'sürücü belgesi / ehliyet' },
    'spoorwegen': { parts: [{ word: 'spoor', meaning: 'ray / iz' }, { word: 'wegen', meaning: 'yollar' }], resultMeaning: 'demiryolları' },
    'vluchtheuvel': { parts: [{ word: 'vlucht', meaning: 'kaçış / sığınak' }, { word: 'heuvel', meaning: 'tepe' }], resultMeaning: 'yaya adacığı / refüj' },
    'vrachtwagen': { parts: [{ word: 'vracht', meaning: 'yük' }, { word: 'wagen', meaning: 'araba' }], resultMeaning: 'kamyon / tır (yük arabası)' },
    'vrijdag': { parts: [{ word: 'vrij', meaning: 'özgür' }, { word: 'dag', meaning: 'gün' }], resultMeaning: 'cuma (özgür gün)' }
  };

  function getCompoundInfo(query, data) {
    if (!query) return null;
    const clean = query.trim().toLowerCase();

    // Check pre-configured compound dictionary
    if (DUTCH_COMPOUND_DICTIONARY[clean]) {
      return DUTCH_COMPOUND_DICTIONARY[clean];
    }

    // Check if AI payload provided compound decomposition
    if (data && data.compound && Array.isArray(data.compound.parts) && data.compound.parts.length >= 2) {
      return {
        parts: data.compound.parts.map(p => ({ word: p.word || p.part, meaning: p.meaning || '' })),
        resultMeaning: data.compound.meaning || (data.translations && data.translations[0]?.text) || clean
      };
    }
    if (data && data.compoundBreakdown && Array.isArray(data.compoundBreakdown) && data.compoundBreakdown.length >= 2) {
      return {
        parts: data.compoundBreakdown.map(p => ({ word: p.word || p.part, meaning: p.meaning || '' })),
        resultMeaning: (data.translations && data.translations[0]?.text) || clean
      };
    }

    return null;
  }

  // ── Interactive Flashcard / Quiz System ──────────────────────────────────
  const DEFAULT_FLASHCARDS = [
    { word: 'ziekenhuis', article: 'het', cefr: 'A1', translation: 'hastane', pronunciation: '/ˈzi.kə(n)ˌɦœy̯s/', example: 'Hij ligt in het ziekenhuis.', exampleTr: 'O hastanede yatıyor.' },
    { word: 'station', article: 'het', cefr: 'A1', translation: 'istasyon / gar', pronunciation: '/staːˈʃɔn/', example: 'We ontmoeten elkaar op het station.', exampleTr: 'İstasyonda buluşuyoruz.' },
    { word: 'afspraak', article: 'de', cefr: 'A1', translation: 'randevu / anlaşma', pronunciation: '/ˈɑf.spraːk/', example: 'Ik heb morgen een afspraak bij de dokter.', exampleTr: 'Yarın doktorda randevum var.' },
    { word: 'rekening', article: 'de', cefr: 'A1', translation: 'hesap / fatura', pronunciation: '/ˈreːkə.nɪŋ/', example: 'Mag ik de rekening, alstublieft?', exampleTr: 'Hesabı alabilir miyim, lütfen?' },
    { word: 'vergunning', article: 'de', cefr: 'A2', translation: 'izin / ruhsat', pronunciation: '/vərˈɣʏ.nɪŋ/', example: 'U heeft een parkeervergunning nodig.', exampleTr: 'Park iznine ihtiyacınız var.' },
    { word: 'overstappen', article: '', cefr: 'A2', translation: 'aktarma yapmak', pronunciation: '/ˈoːvərˌstɑpə(n)/', example: 'U moet overstappen in Utrecht.', exampleTr: 'Utrecht\'te aktarma yapmalısınız.' },
    { word: 'belasting', article: 'de', cefr: 'A2', translation: 'vergi', pronunciation: '/bəˈlɑs.tɪŋ/', example: 'De belastingaangifte moet voor mei ingevuld worden.', exampleTr: 'Vergi beyannamesi mayıstan önce doldurulmalı.' },
    { word: 'duurzaam', article: '', cefr: 'B1', translation: 'sürdürülebilir', pronunciation: '/ˈdyːr.zaːm/', example: 'We investeren in duurzame energie.', exampleTr: 'Sürdürülebilir enerjiye yatırım yapıyoruz.' },
    { word: 'uitdaging', article: 'de', cefr: 'B1', translation: 'zorluk / meydan okuma', pronunciation: '/ˈœy̯tˌdaː.ɣɪŋ/', example: 'Dit project is een grote uitdaging.', exampleTr: 'Bu proje büyük bir meydan okuma.' },
    { word: 'solliciteren', article: '', cefr: 'B1', translation: 'iş başvurusu yapmak', pronunciation: '/sɔ.li.siˈteː.rə(n)/', example: 'Ik ga solliciteren op die vacature.', exampleTr: 'O açık iş pozisyonuna başvuracağım.' }
  ];

  // ── Leitner SRS (Spaced Repetition System) Engine ──────────────────────────
  // Box 1: 1 gün, Box 2: 3 gün, Box 3: 7 gün, Box 4: 14 gün, Box 5: 30 gün
  const SRS_INTERVALS_MS = {
    1: 1 * 24 * 60 * 60 * 1000,
    2: 3 * 24 * 60 * 60 * 1000,
    3: 7 * 24 * 60 * 60 * 1000,
    4: 14 * 24 * 60 * 60 * 1000,
    5: 30 * 24 * 60 * 60 * 1000
  };

  function getSRSData() {
    try {
      const raw = localStorage.getItem('lexi_srs');
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  function saveSRSData(data) {
    try {
      localStorage.setItem('lexi_srs', JSON.stringify(data));
    } catch (_) {}
  }

  function getCardSRS(word) {
    if (!word) return { box: 1, lastReviewed: 0, nextDue: 0, reviewCount: 0, correctCount: 0 };
    const srs = getSRSData();
    const key = word.trim().toLowerCase();
    return srs[key] || { box: 1, lastReviewed: 0, nextDue: 0, reviewCount: 0, correctCount: 0 };
  }

  function updateCardSRS(word, isKnown) {
    if (!word) return;
    const key = word.trim().toLowerCase();
    const srs = getSRSData();
    const current = srs[key] || { box: 1, lastReviewed: 0, nextDue: 0, reviewCount: 0, correctCount: 0 };
    const now = Date.now();
    let newBox = current.box || 1;
    if (isKnown) {
      newBox = Math.min(5, (current.reviewCount === 0 ? 2 : newBox + 1));
    } else {
      newBox = 1;
    }
    const nextDue = now + (SRS_INTERVALS_MS[newBox] || SRS_INTERVALS_MS[1]);
    srs[key] = {
      box: newBox,
      lastReviewed: now,
      nextDue: nextDue,
      reviewCount: (current.reviewCount || 0) + 1,
      correctCount: (current.correctCount || 0) + (isKnown ? 1 : 0)
    };
    saveSRSData(srs);
    updateStreak();
    updateDueBadge();
  }

  function isWordDue(word) {
    if (!word) return true;
    const key = word.trim().toLowerCase();
    const srs = getSRSData();
    const entry = srs[key];
    if (!entry || !entry.nextDue) return true;
    return entry.nextDue <= Date.now();
  }

  // ── Streak Tracker ───────────────────────────────────────────────────────
  function getStreak() {
    try {
      const raw = localStorage.getItem('lexi_streak');
      return raw ? JSON.parse(raw) : { streak: 0, lastDate: '' };
    } catch (_) {
      return { streak: 0, lastDate: '' };
    }
  }

  function updateStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const data = getStreak();
    let streak = data.streak || 0;
    if (data.lastDate === today) {
      // Bugün zaten kaydedildi
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (data.lastDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
      data.streak = streak;
      data.lastDate = today;
      try {
        localStorage.setItem('lexi_streak', JSON.stringify(data));
      } catch (_) {}
    }
    renderStreakBadge();
  }

  function renderStreakBadge() {
    const streakEl = document.getElementById('fcStreakBadge');
    const textEl = document.getElementById('fcStreakText');
    if (!streakEl || !textEl) return;
    const data = getStreak();
    if (data.streak > 0) {
      textEl.textContent = `${data.streak} Gün`;
      streakEl.classList.remove('hidden');
    } else {
      streakEl.classList.add('hidden');
    }
  }

  function getComprehensiveFlashcardPool() {
    const pool = [];
    const seen = new Set();

    // 1. DEFAULT_FLASHCARDS (guaranteed presence)
    if (typeof DEFAULT_FLASHCARDS !== 'undefined' && Array.isArray(DEFAULT_FLASHCARDS)) {
      DEFAULT_FLASHCARDS.forEach((c) => {
        if (!c || !c.word) return;
        const k = c.word.trim().toLowerCase();
        if (!seen.has(k)) {
          seen.add(k);
          pool.push({ ...c });
        }
      });
    }

    // 2. Curated LEXI_DICTIONARY_SEEDS (130+ words with examples and CEFR)
    if (typeof window.LEXI_DICTIONARY_SEEDS !== 'undefined' && Array.isArray(window.LEXI_DICTIONARY_SEEDS)) {
      window.LEXI_DICTIONARY_SEEDS.forEach((s) => {
        if (!s || !s.nl) return;
        const k = s.nl.trim().toLowerCase();
        if (!seen.has(k)) {
          seen.add(k);
          pool.push({
            word: s.nl,
            article: s.article || '',
            cefr: s.cefr || 'A1',
            translation: s.tr || 'Çeviri mevcut değil',
            pronunciation: '',
            example: (s.example && s.example.source) || `Belangrijk woord: ${s.nl}`,
            exampleTr: (s.example && s.example.translation) || s.tr || ''
          });
        }
      });
    }

    // 3. User Saved Favorites
    const favs = getFavorites();
    if (Array.isArray(favs)) {
      favs.forEach((f) => {
        if (!f || !f.word) return;
        const k = f.word.trim().toLowerCase();
        if (!seen.has(k)) {
          seen.add(k);
          pool.push({
            word: f.word,
            article: f.article || '',
            cefr: f.cefr || 'A1',
            translation: f.translation || 'Çeviri mevcut değil',
            pronunciation: '',
            example: `Belangrijk woord: ${f.word}`,
            exampleTr: f.translation || ''
          });
        }
      });
    }

    return pool;
  }

  function updateDueBadge() {
    const badge = document.getElementById('fcDueBadge');
    if (!badge) return;
    const allPool = getComprehensiveFlashcardPool();
    const dueCount = allPool.filter((c) => isWordDue(c.word)).length;
    if (dueCount > 0) {
      badge.textContent = String(dueCount);
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  window.getSRSData = getSRSData;
  window.updateCardSRS = updateCardSRS;
  window.getStreak = getStreak;
  window.getComprehensiveFlashcardPool = getComprehensiveFlashcardPool;

  let currentDeckType = 'auto';
  let flashcardDeck = [];
  let flashcardIdx = 0;
  let flashcardKnown = 0;
  let isCardFlipped = false;

  function initFlashcards(deckType = 'auto') {
    currentDeckType = deckType;
    document.querySelectorAll('.fc-deck-chip').forEach((chip) => {
      const on = chip.dataset.deck === deckType;
      chip.setAttribute('aria-selected', String(on));
      chip.classList.toggle('bg-primary-600', on);
      chip.classList.toggle('text-white', on);
      chip.classList.toggle('border-primary-600', on);
      chip.classList.toggle('bg-white', !on);
      chip.classList.toggle('dark:bg-slate-800', !on);
      chip.classList.toggle('text-slate-600', !on);
      chip.classList.toggle('dark:text-slate-300', !on);
      chip.classList.toggle('border-slate-200', !on);
      chip.classList.toggle('dark:border-slate-700', !on);
    });
    const favs = getFavorites();
    const fullPool = getComprehensiveFlashcardPool();
    const label = document.getElementById('flashcardDeckLabel');

    if (deckType === 'due') {
      const dueCards = fullPool.filter((c) => isWordDue(c.word));
      flashcardDeck = dueCards.length > 0 ? dueCards.slice(0, 20) : fullPool.slice(0, 15);
      if (label) label.textContent = `Aralıklı Tekrar (${flashcardDeck.length} Kart / ${dueCards.length} Zamanı Gelen)`;
    } else if (deckType === 'favorites' && favs.length > 0) {
      flashcardDeck = favs.map(f => ({
        word: f.word,
        article: f.article || '',
        cefr: f.cefr || 'A1',
        translation: f.translation || 'Çeviri mevcut değil',
        pronunciation: '',
        example: `Belangrijk woord: ${f.word}`,
        exampleTr: f.translation || ''
      }));
      if (label) label.textContent = `Favori Kelimelerim (${flashcardDeck.length} Kart)`;
    } else if (deckType === 'a1') {
      const a1Pool = fullPool.filter(c => (c.cefr || '').toUpperCase() === 'A1');
      a1Pool.sort(() => Math.random() - 0.5);
      flashcardDeck = a1Pool.slice(0, 15);
      if (label) label.textContent = `A1 Başlangıç Seviyesi (${flashcardDeck.length} Kart / Havuz: ${a1Pool.length})`;
    } else if (deckType === 'a2') {
      const a2Pool = fullPool.filter(c => (c.cefr || '').toUpperCase() === 'A2');
      a2Pool.sort(() => Math.random() - 0.5);
      flashcardDeck = a2Pool.slice(0, 15);
      if (label) label.textContent = `A2 Temel Seviye (${flashcardDeck.length} Kart / Havuz: ${a2Pool.length})`;
    } else if (deckType === 'b1') {
      const b1Pool = fullPool.filter(c => (c.cefr || '').toUpperCase().startsWith('B'));
      b1Pool.sort(() => Math.random() - 0.5);
      flashcardDeck = b1Pool.slice(0, 15);
      if (label) label.textContent = `B1-B2 Orta Seviye (${flashcardDeck.length} Kart / Havuz: ${b1Pool.length})`;
    } else if (deckType === 'cefr') {
      const cefrPool = [...fullPool];
      cefrPool.sort(() => Math.random() - 0.5);
      flashcardDeck = cefrPool.slice(0, 20);
      if (label) label.textContent = `A1-B2 Karma Seviye (${flashcardDeck.length} Kart / Havuz: ${fullPool.length})`;
    } else if (favs.length >= 4 && deckType !== 'cefr' && deckType !== 'auto') {
      flashcardDeck = favs.map(f => ({
        word: f.word,
        article: f.article || '',
        cefr: f.cefr || 'A1',
        translation: f.translation || 'Çeviri mevcut değil',
        pronunciation: '',
        example: `Belangrijk woord: ${f.word}`,
        exampleTr: f.translation || ''
      }));
      if (label) label.textContent = `Favori Kelimelerim (${flashcardDeck.length} Kart)`;
    } else {
      // 'auto' mode: 15-card smart practice set from 130+ pool
      const autoPool = [...fullPool];
      autoPool.sort(() => Math.random() - 0.5);
      flashcardDeck = autoPool.slice(0, 15);
      if (label) label.textContent = `Günlük Pratik (${flashcardDeck.length} Kart / Havuz: ${fullPool.length})`;
    }

    renderStreakBadge();
    updateDueBadge();

    // Shuffle deck
    flashcardDeck.sort(() => Math.random() - 0.5);
    flashcardIdx = 0;
    flashcardKnown = 0;
    isCardFlipped = false;

    const finishScreen = document.getElementById('flashcardFinishScreen');
    const stage = document.getElementById('flashcardElement');
    const controls = document.getElementById('flashcardControls');
    if (finishScreen) finishScreen.classList.add('hidden');
    if (stage) stage.classList.remove('hidden');
    if (controls) controls.classList.remove('hidden');

    renderCurrentCard();
  }
  window.initFlashcards = initFlashcards;

  function renderCurrentCard() {
    if (flashcardIdx >= flashcardDeck.length) {
      showFlashcardFinish();
      return;
    }

    const card = flashcardDeck[flashcardIdx];
    isCardFlipped = false;
    const inner = document.getElementById('flashcardInner');
    if (inner) inner.classList.remove('flipped');

    // Update Counter & Progress Bar
    const counter = document.getElementById('flashcardCounter');
    if (counter) counter.textContent = `${flashcardIdx + 1} / ${flashcardDeck.length}`;
    const pBar = document.getElementById('flashcardProgressBar');
    if (pBar) {
      const pct = (flashcardIdx / flashcardDeck.length) * 100;
      pBar.style.width = `${pct}%`;
    }

    // Populate Front
    const fcArticleBadge = document.getElementById('fcArticleBadge');
    if (fcArticleBadge) {
      if (card.article) {
        fcArticleBadge.textContent = card.article;
        fcArticleBadge.className = `text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${card.article === 'de' ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'}`;
        fcArticleBadge.classList.remove('hidden');
      } else {
        fcArticleBadge.classList.add('hidden');
      }
    }

    const fcCefrBadge = document.getElementById('fcCefrBadge');
    if (fcCefrBadge) fcCefrBadge.textContent = card.cefr || 'A1';

    const fcBoxBadge = document.getElementById('fcBoxBadge');
    if (fcBoxBadge) {
      const srsEntry = getCardSRS(card.word);
      if (srsEntry.reviewCount === 0) {
        fcBoxBadge.textContent = 'Yeni';
        fcBoxBadge.className = 'text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60';
        fcBoxBadge.title = 'Henüz çalışılmadı (Yeni)';
      } else {
        fcBoxBadge.textContent = `Kutu ${srsEntry.box}`;
        const boxStyles = {
          1: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
          2: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
          3: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60',
          4: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
          5: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60'
        };
        fcBoxBadge.className = `text-xs font-bold px-2 py-0.5 rounded border ${boxStyles[srsEntry.box] || boxStyles[1]}`;
        fcBoxBadge.title = `Leitner Kutusu ${srsEntry.box} (${srsEntry.correctCount || 0}/${srsEntry.reviewCount || 0} doğru)`;
      }
    }

    const fcWord = document.getElementById('fcWord');
    if (fcWord) fcWord.textContent = card.word;

    const fcPronunciation = document.getElementById('fcPronunciation');
    if (fcPronunciation) {
      fcPronunciation.textContent = card.pronunciation || '';
      fcPronunciation.classList.toggle('hidden', !card.pronunciation);
    }

    // Highlight target word inside example sentences
    function formatCardExample(sentence, targetWord) {
      if (!sentence) return '';
      const cleanTarget = (targetWord || '').trim();
      const escapedSentence = escapeHtml(sentence);
      if (!cleanTarget) return `"${escapedSentence}"`;

      const escapedWord = cleanTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-ZÀ-ÿ])(${escapedWord})([^a-zA-ZÀ-ÿ]|$)`, 'gi');
      const highlighted = escapedSentence.replace(regex, (match, p1, p2, p3) => {
        return `${p1}<strong class="text-amber-300 font-black underline decoration-amber-400/80 underline-offset-2">${p2}</strong>${p3}`;
      });
      return `"${highlighted}"`;
    }

    // Populate Back
    const fcBackWord = document.getElementById('fcBackWord');
    if (fcBackWord) fcBackWord.textContent = card.word;

    const fcTranslation = document.getElementById('fcTranslation');
    if (fcTranslation) fcTranslation.textContent = card.translation;

    const fcExample = document.getElementById('fcExample');
    if (fcExample) {
      fcExample.innerHTML = formatCardExample(card.example, card.word);
      fcExample.classList.toggle('hidden', !card.example);
    }

    const fcExampleTr = document.getElementById('fcExampleTr');
    if (fcExampleTr) {
      fcExampleTr.textContent = card.exampleTr ? `(${card.exampleTr})` : '';
      fcExampleTr.classList.toggle('hidden', !card.exampleTr);
    }

    const fcFrontExample = document.getElementById('fcFrontExample');
    if (fcFrontExample) {
      if (card.example) {
        fcFrontExample.innerHTML = formatCardExample(card.example, card.word);
        fcFrontExample.classList.remove('hidden');
      } else {
        fcFrontExample.classList.add('hidden');
      }
    }
  }

  function toggleCardFlip() {
    isCardFlipped = !isCardFlipped;
    const inner = document.getElementById('flashcardInner');
    if (inner) inner.classList.toggle('flipped', isCardFlipped);
  }

  function handleCardRating(known) {
    if (flashcardDeck[flashcardIdx]) {
      updateCardSRS(flashcardDeck[flashcardIdx].word, known);
    }
    if (known) flashcardKnown++;
    flashcardIdx++;
    renderCurrentCard();
  }

  function showFlashcardFinish() {
    const finishScreen = document.getElementById('flashcardFinishScreen');
    const stage = document.getElementById('flashcardElement');
    const controls = document.getElementById('flashcardControls');
    const scoreText = document.getElementById('flashcardScoreText');
    const counter = document.getElementById('flashcardCounter');
    const pBar = document.getElementById('flashcardProgressBar');

    if (pBar) pBar.style.width = '100%';
    if (counter) counter.textContent = `${flashcardDeck.length} / ${flashcardDeck.length}`;
    if (stage) stage.classList.add('hidden');
    if (controls) controls.classList.add('hidden');
    if (scoreText) scoreText.textContent = `${flashcardDeck.length} kelimeden ${flashcardKnown} tanesini bildiniz.`;
    if (finishScreen) finishScreen.classList.remove('hidden');
  }

  function setupFlashcardListeners() {
    const cardEl = document.getElementById('flashcardElement');
    if (cardEl) cardEl.addEventListener('click', toggleCardFlip);

    const kbdLegend = document.getElementById('kbdLegend');
    const kbdLegendClose = document.getElementById('kbdLegendClose');
    if (kbdLegendClose) {
      kbdLegendClose.addEventListener('click', () => kbdLegend.classList.add('hidden'));
    }

    document.addEventListener('keydown', (e) => {
      if (window.__activeTab !== 'practice') return;
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const finish = document.getElementById('flashcardFinishScreen');
      if (finish && !finish.classList.contains('hidden')) return;
      if ((e.key === ' ' || e.key === 'Enter') && e.target === cardEl) {
        e.preventDefault();
        toggleCardFlip();
      } else if (e.key === 'ArrowRight' && flashcardDeck.length) {
        handleCardRating(true);
      } else if (e.key === 'ArrowLeft' && flashcardDeck.length) {
        handleCardRating(false);
      } else if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        if (kbdLegend) kbdLegend.classList.toggle('hidden');
      } else if (e.key === 'Escape') {
        window.switchMainTab('dictionary');
      }
    });

    const fcSpeakBtn = document.getElementById('fcSpeakBtn');
    if (fcSpeakBtn) {
      fcSpeakBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = flashcardDeck[flashcardIdx];
        if (card && card.word) {
          speak(card.word, 'nl', 1.0, fcSpeakBtn);
        }
      });
    }

    const needPracticeBtn = document.getElementById('fcNeedPracticeBtn');
    if (needPracticeBtn) {
      needPracticeBtn.addEventListener('click', () => handleCardRating(false));
    }

    const masteredBtn = document.getElementById('fcMasteredBtn');
    if (masteredBtn) {
      masteredBtn.addEventListener('click', () => handleCardRating(true));
    }

    const restartBtn = document.getElementById('fcRestartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => initFlashcards(currentDeckType || 'auto'));
    }
  }

  function renderAutocomplete(query) {
    if (!autocompleteDropdown) return;
    if (!query || query.length < 2 || typeof window.LEXI_DICTIONARY_SEEDS === 'undefined') {
      autocompleteDropdown.classList.add('hidden');
      if (searchInput) searchInput.setAttribute('aria-expanded', 'false');
      return;
    }

    const q = query.toLowerCase();
    const matches = window.LEXI_DICTIONARY_SEEDS.filter(s =>
      s.nl.toLowerCase().startsWith(q) || s.tr.toLowerCase().includes(q)
    ).slice(0, 5);

    if (matches.length === 0) {
      autocompleteDropdown.classList.add('hidden');
      if (searchInput) searchInput.setAttribute('aria-expanded', 'false');
      return;
    }

    autocompleteDropdown.innerHTML = matches.map((s, i) => `
      <div id="ac-opt-${i}" role="option" aria-selected="false" class="autocomplete-item p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors" data-word="${escapeHtml(s.nl)}">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-800 dark:text-slate-100 text-sm">${escapeHtml(s.nl)}</span>
          ${s.article ? `<span class="px-2 py-0.5 rounded text-xs font-bold uppercase ${s.article === 'de' ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'}">${escapeHtml(s.article)}</span>` : ''}
          <span class="text-slate-400" aria-hidden="true">➔</span>
          <span class="text-slate-600 dark:text-slate-300 font-medium">${escapeHtml(s.tr)}</span>
        </div>
        <span class="text-xs font-bold text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">${escapeHtml(s.cefr || 'A1')}</span>
      </div>
    `).join('');

    autocompleteDropdown.querySelectorAll('.autocomplete-item').forEach(el => {
      el.addEventListener('click', () => {
        searchInput.value = el.dataset.word;
        clearBtn.classList.remove('hidden');
        searchBtn.disabled = false;
        autocompleteDropdown.classList.add('hidden');
        handleSearch();
      });
    });

    autocompleteDropdown.classList.remove('hidden');
    if (searchInput) searchInput.setAttribute('aria-expanded', 'true');
  }

  // ── Accessibility Layer (keyboard navigation + screen reader semantics) ──
  function setupAccessibility() {
    if (typeof window.LexiA11y === 'undefined') {
      console.warn('LexiA11y not loaded - keyboard navigation disabled');
      return;
    }

    const A11y = window.LexiA11y;
    announce = A11y.createAnnouncer();
    window.lexiAnnounce = announce;

    // 1. Bottom navigation: roving tabindex + arrow key navigation
    const navContainer = document.querySelector('#bottomNavBar [role="tablist"]');
    if (navContainer) {
      A11y.initRovingTabIndex(navContainer, '[role="tab"]', {
        autoActivate: true,
        orientation: 'horizontal',
        onActivate: (tab) => {
          const map = {
            navTabDictionary: 'dictionary',
            navTabPractice: 'practice',
            navTabFavorites: 'favorites',
            navTabSettings: 'settings'
          };
          const name = map[tab.id];
          if (name && window.switchMainTab) {
            // Keep focus on the nav button: arrow navigation must not lose
            // the user's place, so the search field is not focused here.
            window.switchMainTab(name, undefined, { focusSearch: false });
          }
        }
      });
    }

    // 2. Flashcard deck chips: roving tabindex + arrow key navigation
    const deckContainer = document.querySelector('#viewPractice [role="tablist"]');
    if (deckContainer) {
      A11y.initRovingTabIndex(deckContainer, '.fc-deck-chip', {
        autoActivate: true,
        orientation: 'horizontal',
        onActivate: (chip) => {
          if (typeof window.initFlashcards === 'function' && chip.dataset.deck) {
            window.initFlashcards(chip.dataset.deck);
          }
        }
      });
    }

    // 3. Search autocomplete: combobox keyboard navigation
    if (searchInput && autocompleteDropdown) {
      A11y.initCombobox(searchInput, autocompleteDropdown, (el) => {
        searchInput.value = el.dataset.word || '';
        if (clearBtn) clearBtn.classList.remove('hidden');
        if (searchBtn) searchBtn.disabled = false;
        autocompleteDropdown.classList.add('hidden');
        searchInput.setAttribute('aria-expanded', 'false');
        handleSearch();
      });
    }

    // 4. Focus traps for modal dialogs
    historyTrap = A11y.createFocusTrap(historyModal);
    flagTrap = A11y.createFocusTrap(document.getElementById('flagModal'));

    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        if (historyTrap) historyTrap.activate();
      });
    }
  }

  // ── Init Settings ───────────────────────────────────────────────────────
  function init() {
    // API anahtarı içe aktarma yalnızca URL parmak izinden (#key=...) yapılır.
    // ?key=... sorgu parametresi sunucuya, proxy ve günlüklere gittiği için kabul edilmez.
    try {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const keyFromUrl = hashParams.get('key');
      if (keyFromUrl) {
        localStorage.setItem('gemini_api_key', keyFromUrl.trim());
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {}

    const settings = AIEngine.getSettings();
    activeProvider = settings.provider || 'google';
    activeModel = settings.model || (activeProvider === 'local' ? settings.localModel : AIEngine.PROVIDERS[activeProvider]?.default_model);

    googleKeyInput.value = settings.googleKey || AIEngine.SM_STUDIO_KEYS.google;
    nvidiaKeyInput.value = settings.nvidiaKey || AIEngine.SM_STUDIO_KEYS.nvidia;
    localUrlInput.value = settings.localUrl || AIEngine.PROVIDERS.local.default_url;

    updateHeaderBadge();
    updateProviderModalUI();
    renderHistory();
    renderFavorites();
    renderSeedChips();
    renderDiacriticsBar();
    renderWordOfTheDay();
    updateThemeIcon();
    setupVoiceSearch();
    setupQuickPeek();
    setupFlashcardListeners();
    setupAccessibility();
    if (window.setActiveNavTab) window.setActiveNavTab('dictionary');

    // Focus search input on initial load (mobile + desktop)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }

    // Autocomplete on search input
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderAutocomplete(searchInput.value.trim());
      });
    }

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
      if (autocompleteDropdown && !autocompleteDropdown.contains(e.target) && e.target !== searchInput) {
        autocompleteDropdown.classList.add('hidden');
        if (searchInput) searchInput.setAttribute('aria-expanded', 'false');
      }
    });

    // Attach click events to situational practice topic chips in empty state
    document.querySelectorAll('.topic-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(10);
        if (sourceLang !== 'nl') toggleLanguage();
        const word = chip.dataset.word || chip.textContent.trim();
        searchInput.value = word;
        searchBtn.disabled = false;
        clearBtn.classList.remove('hidden');
        handleSearch();
      });
    });

    // Clear favorites button
    const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
    if (clearFavoritesBtn) {
      clearFavoritesBtn.addEventListener('click', () => {
        if (confirm('Tüm favori kelimeler silinsin mi?')) {
          localStorage.removeItem('lexi_favorites');
          renderFavorites();
          showToast('Favoriler temizlendi.');
        }
      });
    }

    // Favorites Live Search Filter
    const favFilterInput = document.getElementById('favSearchFilterInput');
    const clearFavFilterBtn = document.getElementById('clearFavFilterBtn');
    if (favFilterInput) {
      favFilterInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (clearFavFilterBtn) clearFavFilterBtn.classList.toggle('hidden', !val);
        renderFavorites(val);
      });
    }
    if (clearFavFilterBtn && favFilterInput) {
      clearFavFilterBtn.addEventListener('click', () => {
        favFilterInput.value = '';
        clearFavFilterBtn.classList.add('hidden');
        renderFavorites('');
        favFilterInput.focus();
      });
    }

    // Favorites JSON Export & Backup
    const exportFavoritesBtn = document.getElementById('exportFavoritesBtn');
    if (exportFavoritesBtn) {
      exportFavoritesBtn.addEventListener('click', () => {
        const favs = getFavorites();
        if (!favs || favs.length === 0) {
          showToast('Dışa aktarılacak favori kelime bulunamadı.');
          return;
        }
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(favs, null, 2));
        const downloadAnchor = document.createElement('a');
        const todayStr = new Date().toISOString().slice(0, 10);
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `lexibridge_favoriler_${todayStr}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast(`${favs.length} favori kelime JSON olarak indirildi.`, 'ph-bold ph-download-simple text-primary-500');
      });
    }

    // Favorites JSON Import & Restore
    const importFavoritesBtn = document.getElementById('importFavoritesBtn');
    const importFavoritesFile = document.getElementById('importFavoritesFile');
    if (importFavoritesBtn && importFavoritesFile) {
      importFavoritesBtn.addEventListener('click', () => {
        importFavoritesFile.click();
      });

      importFavoritesFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target.result);
            if (!Array.isArray(parsed)) {
              showToast('Geçersiz dosya formatı. JSON dizi bekleniyor.');
              return;
            }
            const validItems = parsed.filter(item => item && typeof item.word === 'string' && item.word.trim().length > 0);
            if (validItems.length === 0) {
              showToast('Dosyada geçerli kelime bulunamadı.');
              return;
            }
            const currentFavs = getFavorites();
            let addedCount = 0;
            validItems.forEach(item => {
              const cleanWord = item.word.trim();
              const exists = currentFavs.some(f => f.word.toLowerCase() === cleanWord.toLowerCase());
              if (!exists) {
                currentFavs.unshift({
                  word: cleanWord,
                  article: item.article || '',
                  cefr: item.cefr || 'A1',
                  translation: item.translation || '',
                  source: item.source || 'nl'
                });
                addedCount++;
              }
            });
            if (currentFavs.length > 200) currentFavs.length = 200;
            localStorage.setItem('lexi_favorites', JSON.stringify(currentFavs));
            renderFavorites();
            showToast(`${addedCount} yeni kelime başarıyla eklendi!`, 'ph-bold ph-check text-emerald-500');
          } catch (err) {
            showToast('JSON dosyası okunurken hata oluştu.');
          } finally {
            importFavoritesFile.value = '';
          }
        };
        reader.readAsText(file);
      });
    }

    // Check query params if any
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
      searchInput.value = q;
      handleSearch();
    }
  }

  // ── UI Updates ──────────────────────────────────────────────────────────
  function updateHeaderBadge() {
    const offlineBanner = document.getElementById('offlineBanner');
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    if (offlineBanner) offlineBanner.classList.toggle('hidden', !isOffline);
    if (isOffline) {
      headerProviderIcon.textContent = '✈️';
      headerProviderName.textContent = 'Çevrimdışı';
      return;
    }
    const p = AIEngine.PROVIDERS[activeProvider] || AIEngine.PROVIDERS.google;
    headerProviderIcon.textContent = p.icon;
    headerProviderName.textContent = p.name;
  }

  async function loadLocalModels(baseUrl, silent = false) {
    if (activeProvider !== 'local') return;
    if (refreshModelsBtn) refreshModelsBtn.classList.remove('hidden');
    if (modelDetectionStatus) {
      modelDetectionStatus.classList.remove('hidden', 'text-red-500', 'text-amber-600', 'text-emerald-600');
      modelDetectionStatus.classList.add('text-slate-400');
      modelDetectionStatus.textContent = 'Ollama modelleri taranıyor...';
    }
    if (refreshModelsBtnText) refreshModelsBtnText.textContent = 'Taranıyor...';

    try {
      const installedModels = await AIEngine.fetchInstalledLocalModels(baseUrl || localUrlInput.value);
      if (installedModels && installedModels.length > 0) {
        modelSelect.innerHTML = '';
        installedModels.forEach((m) => {
          const opt = document.createElement('option');
          opt.value = m.id;
          opt.textContent = `${m.name} [${m.badge}]`;
          if (m.id === activeModel) opt.selected = true;
          modelSelect.appendChild(opt);
        });

        if (!installedModels.some((m) => m.id === activeModel)) {
          activeModel = installedModels[0].id;
          modelSelect.value = activeModel;
        }

        if (modelDetectionStatus) {
          modelDetectionStatus.className = 'text-xs mt-1.5 font-medium text-emerald-600';
          modelDetectionStatus.textContent = `✓ Ollama'dan ${installedModels.length} adet yüklü model algılandı.`;
        }
      } else {
        if (!silent && modelDetectionStatus) {
          modelDetectionStatus.className = 'text-xs mt-1.5 font-medium text-amber-600';
          modelDetectionStatus.textContent = 'ℹ️ Ollama bağlantısı bulunamadı (Hazır mobil modeller gösteriliyor).';
        } else if (modelDetectionStatus) {
          modelDetectionStatus.classList.add('hidden');
        }
      }
    } catch (e) {
      if (!silent && modelDetectionStatus) {
        modelDetectionStatus.className = 'text-xs mt-1.5 font-medium text-red-500';
        modelDetectionStatus.textContent = 'Ollama taranamadı: ' + e.message;
      }
    } finally {
      if (refreshModelsBtnText) refreshModelsBtnText.textContent = 'Modelleri Algıla';
    }
  }

  function updateProviderModalUI() {
    providerTabs.forEach((tab) => {
      // Single source of truth: CSS owns the visual state via [data-active]
      tab.dataset.active = tab.dataset.provider === activeProvider ? 'true' : 'false';
    });

    const currentSavedSettings = AIEngine.getSettings();
    if (googleKeyInput && !googleKeyInput.value && currentSavedSettings.googleKey) {
      googleKeyInput.value = currentSavedSettings.googleKey;
    }
    if (nvidiaKeyInput && !nvidiaKeyInput.value && currentSavedSettings.nvidiaKey) {
      nvidiaKeyInput.value = currentSavedSettings.nvidiaKey;
    }
    if (localUrlInput && !localUrlInput.value && currentSavedSettings.localUrl) {
      localUrlInput.value = currentSavedSettings.localUrl;
    }

    // Populate default preset models
    const prov = AIEngine.PROVIDERS[activeProvider] || AIEngine.PROVIDERS.google;
    modelSelect.innerHTML = '';
    (prov.models || []).forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.name} [${m.badge}]`;
      if (m.id === activeModel) opt.selected = true;
      modelSelect.appendChild(opt);
    });

    // Show/hide relevant key sections
    googleKeySection.classList.toggle('hidden', activeProvider !== 'google');
    nvidiaKeySection.classList.toggle('hidden', activeProvider !== 'nvidia');
    localConfigSection.classList.toggle('hidden', activeProvider !== 'local');

    if (refreshModelsBtn) {
      refreshModelsBtn.classList.toggle('hidden', activeProvider !== 'local');
    }
    if (modelDetectionStatus) {
      modelDetectionStatus.classList.add('hidden');
    }

    // Auto-detect installed models in background when local provider is active
    if (activeProvider === 'local') {
      loadLocalModels(localUrlInput.value, true);
    }
  }

  function toggleLanguage() {
    sourceLang = sourceLang === 'nl' ? 'tr' : 'nl';
    if (sourceLang === 'nl') {
      sourceLangText.textContent = 'Nederlands';
      targetLangText.textContent = 'Türkçe';
      sourceLangBtn.querySelector('span:first-child').textContent = '🇳🇱';
      targetLangBtn.querySelector('span:first-child').textContent = '🇹🇷';
      searchInput.placeholder = 'Hollandaca bir kelime, deyim veya cümle yazın...';
    } else {
      sourceLangText.textContent = 'Türkçe';
      targetLangText.textContent = 'Nederlands';
      sourceLangBtn.querySelector('span:first-child').textContent = '🇹🇷';
      targetLangBtn.querySelector('span:first-child').textContent = '🇳🇱';
      searchInput.placeholder = 'Türkçe bir kelime, deyim veya cümle yazın...';
    }
    renderSeedChips();
    renderDiacriticsBar();
  }

  function toggleQuickMode() {
    isQuickMode = !isQuickMode;
    if (isQuickMode) {
      modeToggleIcon.className = 'ph-bold ph-lightning text-emerald-500 text-xl';
      modeToggleText.textContent = 'Hızlı REST';
      modeToggleBtn.title = 'Aktif Mod: Hızlı REST (Derin AI için dokunun)';
      modeToggleBtn.classList.remove('border-amber-200/80', 'bg-amber-50/40', 'text-amber-500', 'hover:bg-amber-50');
      modeToggleBtn.classList.add('border-emerald-300', 'bg-emerald-50', 'text-emerald-600', 'hover:bg-emerald-100');
    } else {
      modeToggleIcon.className = 'ph-bold ph-sparkle text-amber-500 text-xl';
      modeToggleText.textContent = 'Derin AI';
      modeToggleBtn.title = 'Aktif Mod: Derin AI (Hızlı REST için dokunun)';
      modeToggleBtn.classList.remove('border-emerald-300', 'bg-emerald-50', 'text-emerald-600', 'hover:bg-emerald-100');
      modeToggleBtn.classList.add('border-amber-200/80', 'bg-amber-50/40', 'text-amber-500', 'hover:bg-amber-50');
    }
  }

  function setLoading(state) {
    isLoading = state;
    searchInput.disabled = state;
    searchBtn.disabled = state || !searchInput.value.trim();

    // Screen readers: mark the results region as busy while analysing
    if (resultsContainer) {
      resultsContainer.setAttribute('aria-busy', state ? 'true' : 'false');
    }

    if (state) {
      searchBtnText.textContent = 'Analiz Ediliyor...';
      searchBtnIcon.classList.add('hidden');
      loadingSpinner.classList.remove('hidden');
      clearBtn.classList.add('hidden');

      emptyState.classList.add('hidden');
      errorBox.classList.add('hidden');
      resultsContainer.classList.add('hidden');
      skeletonLoader.classList.remove('hidden');
      if (announce) announce('Kelime analiz ediliyor, lütfen bekleyin.');
    } else {
      searchBtnText.textContent = 'Sözlükte Ara';
      searchBtnIcon.classList.remove('hidden');
      loadingSpinner.classList.add('hidden');
      if (searchInput.value.trim()) clearBtn.classList.remove('hidden');
      skeletonLoader.classList.add('hidden');
    }
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorBox.classList.remove('hidden');
    skeletonLoader.classList.add('hidden');
    if (announce) announce('Hata: ' + msg);
  }

  // ── Pronunciation Audio (Google TTS Native Audio + SpeechSynthesis Fallback) ──
  function speak(text, lang, rate = 1.0, btnElement = null) {
    if (!text) return;
    const cleanLang = (lang === 'nl' || lang === 'nl-NL') ? 'nl' : 'tr';
    const playbackRate = typeof rate === 'number' && rate > 0 ? rate : 1.0;

    if (btnElement) {
      btnElement.classList.add('is-speaking');
      if (!btnElement.querySelector('.soundwave-bars')) {
        const sw = document.createElement('span');
        sw.className = 'soundwave-bars';
        sw.innerHTML = '<span class="soundwave-bar"></span><span class="soundwave-bar"></span><span class="soundwave-bar"></span>';
        btnElement.appendChild(sw);
      }
    }

    const removeSpeaking = () => {
      if (btnElement) {
        btnElement.classList.remove('is-speaking');
        const sw = btnElement.querySelector('.soundwave-bars');
        if (sw) sw.remove();
      }
    };

    // 1. Try Google High-Quality Native TTS first
    try {
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=${cleanLang}&q=${encodeURIComponent(text.slice(0, 100))}`;
      const audio = new Audio(ttsUrl);
      audio.playbackRate = playbackRate;
      audio.onended = removeSpeaking;
      audio.onerror = () => {
        fallbackSpeech(text, cleanLang, playbackRate, removeSpeaking);
      };
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Playing started
        }).catch(() => {
          fallbackSpeech(text, cleanLang, playbackRate, removeSpeaking);
        });
      }
    } catch {
      fallbackSpeech(text, cleanLang, playbackRate, removeSpeaking);
    }
  }

  function fallbackSpeech(text, cleanLang, playbackRate = 1.0, onEndCallback = null) {
    if (!('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = cleanLang === 'nl' ? 'nl-NL' : 'tr-TR';
    utterance.rate = playbackRate === 0.75 ? 0.75 : 0.9;
    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = () => {
      if (onEndCallback) onEndCallback();
    };
    window.speechSynthesis.speak(utterance);
  }

  // ── History Management ──────────────────────────────────────────────────
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem('lexi_history') || '[]');
    } catch {
      return [];
    }
  }

  function saveToHistory(query, source, translation) {
    let hist = getHistory();
    hist = hist.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
    hist.unshift({ query, source, translation, time: Date.now() });
    if (hist.length > 30) hist.pop();
    localStorage.setItem('lexi_history', JSON.stringify(hist));
    renderHistory();
  }

  function renderHistory() {
    const hist = getHistory();
    if (hist.length === 0) {
      historyList.innerHTML = `<div class="p-6 text-center text-sm text-slate-400 dark:text-slate-500">Henüz arama geçmişi yok.</div>`;
      return;
    }
    historyList.innerHTML = hist
      .map(
        (h) => `
      <div class="history-item flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors" data-query="${escapeHtml(h.query)}" data-source="${h.source}">
        <div>
          <div class="font-semibold text-sm text-slate-800 dark:text-slate-100">${escapeHtml(h.query)}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(h.translation || '')}</div>
        </div>
        <span class="text-xs text-slate-400 font-mono">${h.source === 'nl' ? '🇳🇱➔🇹🇷' : '🇹🇷➔🇳🇱'}</span>
      </div>
    `
      )
      .join('');

    historyList.querySelectorAll('.history-item').forEach((el) => {
      el.addEventListener('click', () => {
        const q = el.dataset.query;
        const s = el.dataset.source;
        if (s !== sourceLang) toggleLanguage();
        searchInput.value = q;
        historyModal.classList.add('hidden');
        handleSearch();
      });
    });
  }

  // ── Favorites Management ────────────────────────────────────────────────
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem('lexi_favorites') || '[]');
    } catch {
      return [];
    }
  }

  function toggleFavorite(word, translation, article, cefr) {
    if (!word) return false;
    let favs = getFavorites();
    const existingIndex = favs.findIndex((f) => f.word.toLowerCase() === word.toLowerCase());
    let isAdded = false;
    if (existingIndex >= 0) {
      favs.splice(existingIndex, 1);
      showToast('Favorilerden Kaldırıldı', 'ph-bold ph-star text-slate-400');
      isAdded = false;
    } else {
      favs.unshift({
        word,
        translation: translation || '',
        article: article || '',
        cefr: cefr || '',
        source: sourceLang,
        time: Date.now()
      });
      if (favs.length > 100) favs.pop();
      showToast('Favorilere Eklendi', 'ph-bold ph-star text-amber-500');
      isAdded = true;
    }
    localStorage.setItem('lexi_favorites', JSON.stringify(favs));
    renderFavorites();
    return isAdded;
  }

  function isFavorite(word) {
    if (!word) return false;
    const favs = getFavorites();
    return favs.some((f) => f.word.toLowerCase() === word.toLowerCase());
  }

  function renderFavorites(filterQuery = null) {
    const favoritesList = document.getElementById('favoritesList');
    if (!favoritesList) return;
    const allFavs = getFavorites();
    const filterInput = document.getElementById('favSearchFilterInput');
    const q = (filterQuery !== null ? filterQuery : (filterInput ? filterInput.value : '')).trim().toLowerCase();

    let favs = allFavs;
    if (q) {
      favs = allFavs.filter((f) =>
        (f.word && f.word.toLowerCase().includes(q)) ||
        (f.translation && f.translation.toLowerCase().includes(q))
      );
    }

    if (allFavs.length === 0) {
      favoritesList.innerHTML = `<div class="p-6 text-center text-sm text-slate-400">Henüz favorilere eklenmiş kelime yok. Kelime kartındaki yıldız ikonuna dokunarak kaydedebilirsiniz.</div>`;
      return;
    }

    if (favs.length === 0) {
      favoritesList.innerHTML = `<div class="p-6 text-center text-sm text-slate-400">"${escapeHtml(q)}" ile eşleşen favori kelime bulunamadı.</div>`;
      return;
    }
    favoritesList.innerHTML = favs
      .map(
        (f) => `
      <div class="fav-item flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors group" data-word="${escapeHtml(f.word)}" data-source="${f.source || 'nl'}">
        <div class="flex-1 cursor-pointer fav-search-trigger">
          <div class="flex items-center gap-1.5">
            ${f.article ? `<span class="text-xs font-bold ${f.article === 'de' ? 'text-sky-600' : 'text-emerald-600'} uppercase">${escapeHtml(f.article)}</span>` : ''}
            <span class="font-semibold text-sm text-slate-800 dark:text-slate-100">${escapeHtml(f.word)}</span>
            ${f.cefr ? `<span class="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold border border-slate-200/50 dark:border-slate-700/50">${escapeHtml(f.cefr)}</span>` : ''}
          </div>
          <div class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">${escapeHtml(f.translation || '')}</div>
        </div>
        <div class="flex items-center gap-1">
          <button class="fav-remove-btn w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" data-word="${escapeHtml(f.word)}" title="Favorilerden Çıkar">
            <i class="ph-bold ph-trash text-base"></i>
          </button>
        </div>
      </div>
    `
      )
      .join('');

    favoritesList.querySelectorAll('.fav-search-trigger').forEach((el) => {
      el.addEventListener('click', () => {
        const parent = el.closest('.fav-item');
        const w = parent.dataset.word;
        const s = parent.dataset.source;
        if (s && s !== sourceLang) toggleLanguage();
        searchInput.value = w;
        if (typeof window.switchMainTab === 'function') {
          window.switchMainTab('dictionary');
        } else {
          const favView = document.getElementById('viewFavorites');
          if (favView) favView.classList.add('hidden');
        }
        handleSearch();
      });
    });

    favoritesList.querySelectorAll('.fav-remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const w = btn.dataset.word;
        toggleFavorite(w);
      });
    });
  }
  window.renderFavorites = renderFavorites;

  // ── Diacritics Toolbar (NL / TR) ─────────────────────────────────────────
  const NL_DIACRITICS = ['ë', 'é', 'è', 'ij', 'ï'];
  const TR_DIACRITICS = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü'];

  function renderDiacriticsBar() {
    const container = document.getElementById('diacriticsBar');
    if (!container) return;
    const chars = sourceLang === 'nl' ? NL_DIACRITICS : TR_DIACRITICS;
    container.innerHTML = chars
      .map(
        (c) => `
      <button type="button" class="diacritic-chip px-1.5 py-1 min-h-[36px] min-w-[28px] text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg active:scale-95 transition-all shrink-0" data-char="${c}" title="'${c}' ekle">
        ${c}
      </button>
    `
      )
      .join('');

    container.querySelectorAll('.diacritic-chip').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const char = btn.dataset.char;
        insertCharIntoSearch(char);
      });
    });
  }

  function insertCharIntoSearch(char) {
    const input = searchInput;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const val = input.value;
    input.value = val.substring(0, start) + char + val.substring(end);
    input.selectionStart = input.selectionEnd = start + char.length;
    input.focus();
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ── Word of the Day (Günün Kelimesi) ────────────────────────────────────
  const WORDS_OF_THE_DAY = [
    {
      nl: 'gezellig',
      article: '',
      pos: 'Sıfat',
      cefr: 'A2',
      tr: 'Sıcak, samimi, keyifli ve içten atmosfer',
      tip: 'Hollanda kültürünün ruhudur. Arkadaş ortamı, loş ışıklar, kahve sohbeti ya da ev sıcaklığı "gezellig"dir.'
    },
    {
      nl: 'uitwaaien',
      article: '',
      pos: 'Fiil',
      cefr: 'B1',
      tr: 'Rüzgarlı havada dışarı çıkıp kafayı boşaltmak',
      tip: 'Kıyıya, sahile ya da fırtınalı bir günde parka çıkıp rüzgarın zihninizi temizlemesine izin verme geleneği.'
    },
    {
      nl: 'borrelen',
      article: '',
      pos: 'Fiil',
      cefr: 'A2',
      tr: 'Dostlarla atıştırmalık ve içecek eşliğinde keyif yapmak',
      tip: 'Hollandalıların iş çıkışı veya Cuma öğleden sonraları sosyalleşme ritüelidir ("vrijmibo").'
    },
    {
      nl: 'overmorgen',
      article: '',
      pos: 'Zarf',
      cefr: 'A1',
      tr: 'Yarından sonraki gün',
      tip: 'Felemenkçede gün planlamasında en sık kullanılan zaman zarflarından biridir.'
    },
    {
      nl: 'bespreekbaar',
      article: '',
      pos: 'Sıfat',
      cefr: 'B2',
      tr: 'Konuşulabilir, müzakere edilebilir, açıkça tartışılabilir',
      tip: 'Hollanda konsensüs (poldermodel) kültürünün kilit kelimesidir: Her konu açıkça masaya yatırılabilir.'
    },
    {
      nl: 'lentekriebels',
      article: 'de',
      pos: 'İsim',
      cefr: 'B1',
      tr: 'Bahar sevinci, bahar kıpırtısı ve canlanma',
      tip: 'Kışın ardından açan ilk güneşle birlikte hissedilen neşe, kıpırtı ve hafiflik hali.'
    },
    {
      nl: 'pindakaas',
      article: 'de',
      pos: 'İsim',
      cefr: 'A1',
      tr: 'Fıstık ezmesi',
      tip: 'Hollandalıların milli lezzeti. Meşhur deyim: "Helaas pindakaas!" (Ne yazık ki / Elden ne gelir!).'
    }
  ];

  function renderWordOfTheDay() {
    const container = document.getElementById('wordOfTheDayCard');
    if (!container) return;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const item = WORDS_OF_THE_DAY[dayOfYear % WORDS_OF_THE_DAY.length];

    container.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
          <i class="ph-bold ph-calendar-check text-sm"></i>
          <span>Günün Felemenkçe Kelimesi</span>
        </div>
        <span class="text-xs px-2 py-0.5 rounded-md font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">${item.cefr}</span>
      </div>
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            ${item.article ? `<span class="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase">${item.article}</span>` : ''}
            <h4 class="text-xl font-bold text-slate-800 dark:text-slate-100">${escapeHtml(item.nl)}</h4>
            <button class="speak-btn w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-full transition-all" aria-label="Dinle" data-text="${escapeHtml(item.nl)}" data-lang="nl" title="Dinle">
              <i class="ph-bold ph-speaker-high text-base"></i>
            </button>
          </div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">${escapeHtml(item.tr)}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed"><span class="font-bold text-slate-700 dark:text-slate-300">Kültürel İpucu:</span> ${escapeHtml(item.tip)}</p>
        </div>
        <button class="wotd-explore-btn shrink-0 px-3 py-2 min-h-[44px] flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-2xs" data-word="${escapeHtml(item.nl)}">
          <span>İncele</span>
          <i class="ph-bold ph-arrow-right text-xs"></i>
        </button>
      </div>
    `;

    const exploreBtn = container.querySelector('.wotd-explore-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        if (sourceLang !== 'nl') toggleLanguage();
        searchInput.value = item.nl;
        handleSearch();
      });
    }

    const speakBtn = container.querySelector('.speak-btn');
    if (speakBtn) {
      speakBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speak(item.nl, 'nl', 1.0, speakBtn);
      });
    }
  }

  // ── Search Execution ────────────────────────────────────────────────────
  async function handleSearch(forceRefresh = false) {
    const query = searchInput.value.trim();
    if (!query) return;

    const targetLang = sourceLang === 'nl' ? 'tr' : 'nl';

    // 1. Check Offline Smart Cache first (unless user explicitly requested live refresh)
    if (!forceRefresh && typeof LexiCache !== 'undefined') {
      try {
        const cached = await LexiCache.get(sourceLang, targetLang, query);
        if (cached && cached.data) {
          const cachedData = { ...cached.data };
          cachedData._isCached = true;
          cachedData._cacheTimestamp = cached.timestamp;
          cachedData._latency = 0;
          renderResult(cachedData);
          const firstTrans = cachedData.translations?.[0]?.text || '';
          saveToHistory(query, sourceLang, firstTrans);
          return;
        }
      } catch (cacheErr) {
        console.warn('LexiCache lookup failed:', cacheErr);
      }
    }

    // 2. If user is offline, check pre-bundled offline seeds first
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (typeof window.LEXI_DICTIONARY_SEEDS !== 'undefined') {
        const qLow = query.toLowerCase().trim();
        const seedMatch = window.LEXI_DICTIONARY_SEEDS.find(
          (s) => s.nl.toLowerCase() === qLow || s.tr.toLowerCase().includes(qLow)
        );
        if (seedMatch) {
          const offlineResult = {
            input: seedMatch.nl,
            sourceLanguage: 'nl',
            targetLanguage: 'tr',
            cefr: seedMatch.cefr || 'A1',
            partOfSpeech: seedMatch.pos || 'İsim',
            grammar: {
              article: seedMatch.article || '',
              plural: seedMatch.plural || '',
              diminutive: seedMatch.diminutive || '',
              fixedPreposition: seedMatch.fixedPreposition || '',
              infinitive: seedMatch.pos === 'Fiil' ? seedMatch.nl : ''
            },
            conjugation: seedMatch.conjugation || null,
            translations: [{ text: seedMatch.tr, frequency: 'very_common' }],
            meanings: [{ meaning: seedMatch.tr }],
            examples: seedMatch.example ? [seedMatch.example] : [],
            relatedWords: [],
            _provider: 'LingoMate Çevrimdışı Sözlük (0ms)',
            _latency: 0,
            _isCached: true
          };
          renderResult(offlineResult);
          saveToHistory(query, sourceLang, seedMatch.tr);
          return;
        }
      }
      showError('Çevrimdışı Mod: Bu kelime henüz cihazınıza kaydedilmemiş. Lütfen internete bağlanın veya daha önce aradığınız kelimeleri Geçmiş sekmesinden inceleyin.');
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      let data;
      if (isQuickMode) {
        data = await AIEngine.quickTranslateRest(query, sourceLang, targetLang);
        data._latency = Date.now() - startTime;
        data._provider = 'Google REST (Hızlı Çeviri)';
      } else {
        data = await AIEngine.analyze(query, sourceLang);
        data._latency = Date.now() - startTime;
      }

      // Save to offline smart cache
      if (typeof LexiCache !== 'undefined') {
        try {
          await LexiCache.set(sourceLang, targetLang, query, data, isQuickMode);
        } catch (saveCacheErr) {
          console.warn('LexiCache save failed:', saveCacheErr);
        }
      }

      renderResult(data);

      const firstTrans = data.translations?.[0]?.text || '';
      saveToHistory(query, sourceLang, firstTrans);
    } catch (err) {
      showError(err.message || 'Analiz sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  // ── Render Result Card ──────────────────────────────────────────────────
  function renderResult(data) {
    resultsContainer.innerHTML = '';
    const isSourceNl = data.sourceLanguage === 'nl';
    const mainTrans = data.translations?.[0]?.text || '';
    const article = (data.grammar?.article || '').toLowerCase().trim();
    const isDe = isSourceNl && (article === 'de');
    const isHet = isSourceNl && (article === 'het');
    const cardAccentClass = isDe ? 'article-de-card' : isHet ? 'article-het-card' : '';

    // 0. Did You Mean Banner (Spell Check)
    let html = '';
    if (data.didYouMean) {
      html += `
        <div class="p-3 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-2xl flex items-center justify-between gap-3 text-xs md:text-sm text-amber-900 dark:text-amber-200 shadow-sm animate-slide-up mb-3">
          <div class="flex items-center gap-2">
            <i class="ph-bold ph-lightbulb text-amber-600 text-base"></i>
            <span>Bunu mu demek istediniz: <button class="font-bold underline text-amber-950 dark:text-amber-100 did-you-mean-btn hover:text-primary-600" data-word="${escapeHtml(data.didYouMean)}">${escapeHtml(data.didYouMean)}</button>?</span>
          </div>
          <button class="did-you-mean-btn px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-xs" data-word="${escapeHtml(data.didYouMean)}">
            Ara
          </button>
        </div>
      `;
    }

    // 1. Primary Word / Header Card
    const wordId = 'lexi-word-' + Math.random().toString(36).slice(2, 9);
    html += `
      <article class="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up ${cardAccentClass} overflow-hidden max-w-full" aria-labelledby="${wordId}">
        <div class="flex items-start justify-between gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <div class="min-w-0 flex-1">
            <div class="flex items-center flex-wrap gap-1.5 sm:gap-2">
              ${isDe ? `
                <span class="text-xs sm:text-sm px-2.5 py-0.5 rounded-xl font-black uppercase tracking-wider bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 shadow-2xs inline-flex items-center gap-1 shrink-0" title="De Belirteci">
                  <span class="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span>de</span>
                </span>
              ` : isHet ? `
                <span class="text-xs sm:text-sm px-2.5 py-0.5 rounded-xl font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs inline-flex items-center gap-1 shrink-0" title="Het Belirteci">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>het</span>
                </span>
              ` : ''}
              <h2 id="${wordId}" class="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight break-words">${escapeHtml(data.input)}</h2>
              <div class="flex items-center gap-1 shrink-0">
                <button class="speak-btn w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] sm:min-w-[40px] min-h-[44px] flex items-center justify-center text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 dark:hover:bg-primary-900 active:scale-95 rounded-full transition-all" aria-label="Kelimeyi sesli telaffuz et" data-text="${escapeHtml(data.input)}" data-lang="${data.sourceLanguage}" data-rate="1.0" title="Sesli Telaffuz (1.0x)">
                  <i class="ph-bold ph-speaker-high text-lg sm:text-xl"></i>
                </button>
                <button class="speak-btn hidden md:flex px-2.5 py-1 min-h-[36px] items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-all" aria-label="0.75x Yavaş Dinle" data-text="${escapeHtml(data.input)}" data-lang="${data.sourceLanguage}" data-rate="0.75" title="0.75x Yavaş Dinle">
                  0.75x
                </button>
              </div>
            </div>

            <div class="metadata-ribbon flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 max-w-full">
              ${!isDe && !isHet && data.grammar?.article ? renderArticleBadge(data.grammar.article) : ''}
              ${data.cefr ? `
                <span class="text-xs px-2.5 py-1 rounded-lg font-bold uppercase shrink-0 ${
                  (data.cefr === 'A1' || data.cefr === 'A2')
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : (data.cefr === 'B1' || data.cefr === 'B2')
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                } border" title="Avrupa Dil Seviyesi (CEFR)">${escapeHtml(data.cefr)}</span>
              ` : ''}
              ${data.partOfSpeech ? `
                <span class="text-xs px-2.5 py-1 rounded-lg shrink-0 ${/idiom|expression|deyim/i.test(data.partOfSpeech) ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold inline-flex items-center gap-1 shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'} border">
                  ${/idiom|expression|deyim/i.test(data.partOfSpeech) ? '<i class="ph-bold ph-lightbulb text-amber-600"></i>' : ''}
                  <span>${escapeHtml(localizePos(data.partOfSpeech))}</span>
                </span>
              ` : ''}
              ${data.pronunciation?.ipa ? `
                <span class="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                  /${escapeHtml(data.pronunciation.ipa)}/
                </span>
              ` : ''}
              ${data.grammar?.plural ? `
                <span class="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                  <span class="font-semibold text-slate-400 dark:text-slate-500">çoğul:</span> ${escapeHtml(data.grammar.plural)}
                </span>
              ` : ''}
              ${data.grammar?.diminutive ? `
                <span class="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                  <span class="font-semibold text-slate-400 dark:text-slate-500">küçültme:</span> ${escapeHtml(data.grammar.diminutive)}
                </span>
              ` : ''}
              ${data.grammar?.infinitive ? `
                <span class="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                  <span class="font-semibold text-slate-400 dark:text-slate-500">mastar:</span> ${escapeHtml(data.grammar.infinitive)}
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Quick Actions: Favorite, Share & Compact/Detailed Mode -->
          <div class="flex items-center gap-1 shrink-0 self-start mt-0.5">
            <button class="fav-toggle-btn w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] sm:min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full ${isFavorite(data.input) ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'} active:scale-95 transition-all" data-word="${escapeHtml(data.input)}" title="Favorilere Ekle / Çıkar" aria-label="Favorilere Ekle / Çıkar">
              <i class="ph-bold ph-star text-lg sm:text-xl ${isFavorite(data.input) ? 'text-amber-500' : 'text-slate-400'}"></i>
            </button>
            <button id="shareResultBtn" class="w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] sm:min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="Kelime Kartını Paylaş" aria-label="Kelime Kartını Paylaş">
              <i class="ph-bold ph-share-network text-base sm:text-lg"></i>
            </button>
          </div>
        </div>

        <!-- Primary Target Translation -->
        <div class="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-start gap-2.5">
          <span class="text-xl">${data.targetLanguage === 'tr' ? '🇹🇷' : '🇳🇱'}</span>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-baseline gap-2">
              <span class="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">${escapeHtml(mainTrans)}</span>
              ${data.translations?.[0]?.frequency && data.translations[0].frequency !== 'rare' ? `
                <span class="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100/80 dark:border-emerald-800">
                  ${escapeHtml(localizeFrequency(data.translations[0].frequency))}
                </span>
              ` : ''}
              <button class="copy-btn text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto shrink-0" data-copy="${escapeHtml(mainTrans)}" title="Çeviriyi Kopyala" aria-label="Çeviriyi Kopyala">
                <i class="ph-bold ph-copy text-base"></i>
              </button>
            </div>
          </div>
        </div>

        ${data.grammar?.fixedPreposition ? `
          <div class="mt-3.5 p-3 bg-gradient-to-r from-indigo-50/90 to-sky-50/90 dark:from-indigo-950/40 dark:to-slate-800/60 border border-indigo-200/80 dark:border-indigo-800/80 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 shadow-2xs">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <i class="ph-bold ph-link text-base"></i>
              </div>
              <div class="min-w-0">
                <div class="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">Sabit Edat (Vast Voorzetsel)</div>
                <div class="font-bold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(data.grammar.fixedPreposition)}</div>
              </div>
            </div>
            <button class="speak-btn px-2.5 py-1 min-h-[36px] bg-indigo-100/80 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1" data-text="${escapeHtml(data.grammar.fixedPreposition)}" data-lang="nl" title="Sabit edatı sesli oku">
              <i class="ph-bold ph-speaker-high text-xs"></i>
              <span>Dinle</span>
            </button>
          </div>
        ` : ''}
      </article>
    `;

    // 1.2 First Example (inline, always visible - "show me in context")
    const firstExample = data.examples && data.examples.length > 0 ? data.examples[0] : null;
    if (firstExample) {
      html += `
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-3.5 md:p-4 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up mb-3">
          <div class="flex items-start justify-between gap-3">
            <div class="font-medium text-sm md:text-base text-slate-900 dark:text-slate-100 leading-relaxed flex-1 min-w-0">
              ${renderInteractiveSentence(firstExample.source, data.sourceLanguage, data.input)}
            </div>
            <div class="flex items-center shrink-0 bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-xl p-0.5 shadow-2xs">
              <button class="speak-btn text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors" aria-label="Örnek cümleyi sesli oku" data-text="${escapeHtml(firstExample.source)}" data-lang="${data.sourceLanguage}" data-rate="1.0" title="Sesli Oku (1.0x)">
                <i class="ph ph-speaker-simple-high text-base"></i>
              </button>
              <button class="speak-btn text-slate-400 hover:text-amber-600 px-1.5 h-9 min-h-[36px] flex items-center justify-center rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold transition-colors border-l border-slate-200 dark:border-slate-700" aria-label="Yavaş sesli oku" data-text="${escapeHtml(firstExample.source)}" data-lang="${data.sourceLanguage}" data-rate="0.75" title="0.75x Yavaş Dinle">
                0.75x
              </button>
              <button class="copy-btn text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-l border-slate-200 dark:border-slate-700" data-copy="${escapeHtml(firstExample.source + (firstExample.translation ? ' — ' + firstExample.translation : ''))}" title="Örneği Kopyala" aria-label="Örneği Kopyala">
                <i class="ph-bold ph-copy text-sm"></i>
              </button>
            </div>
          </div>
          ${firstExample.translation ? `<div class="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 pl-2.5 border-l-2 border-primary-200 dark:border-primary-800 leading-relaxed">${escapeHtml(firstExample.translation)}</div>` : ''}
        </div>
      `;
    }

    // 1.3 Details Toggle (Progressive Disclosure - single expand/collapse)
    const hasDetails = !!(
      (data.translations && data.translations.length > 1) ||
      data.grammar?.fixedPreposition ||
      data.conjugation?.isVerb ||
      (data.examples && data.examples.length > 1) ||
      (data.meanings && data.meanings.length > 0) ||
      (data.grammar && Object.keys(data.grammar).length > 0) ||
      data.etymology?.summary ||
      (data.relatedWords && data.relatedWords.length > 0) ||
      getCompoundInfo(data.input, data)
    );

    if (hasDetails) {
      html += `
        <button type="button" id="toggleDetailsBtn" class="w-full flex items-center justify-center gap-2 min-h-[48px] mt-3 px-4 py-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 active:scale-[0.99] transition-all" aria-expanded="false" aria-controls="detailSections">
          <i class="ph-bold ph-book-open text-base"></i>
          <span>Detaylar</span>
          <i class="ph-bold ph-caret-down text-sm accordion-chevron transition-transform"></i>
        </button>
      `;
    }

    // 1.4 Details Container (all secondary content lives here)
    html += `<div id="detailSections" class="hidden space-y-4 mt-3" data-section="details">`;

    // 1.5 Compound Word Breakdown Card (Samenstelling)
    const compoundInfo = getCompoundInfo(data.input, data);
    if (compoundInfo) {
      html += `
        <div class="result-section-card bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up mb-4" data-section="compound">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <i class="ph-bold ph-puzzle-piece text-base"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">Bileşik Kelime Analizi (Samenstelling)</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Bu Felemenkçe kelime, bağımsız köklerin birleşimiyle oluşmuştur:</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
            ${compoundInfo.parts.map((p, i) => `
              <div class="flex items-center gap-2">
                <button type="button" class="compound-part-btn px-3 py-1.5 min-h-[44px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-left cursor-pointer hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-2xs group active:scale-95" data-word="${escapeHtml(p.word)}" title="'${escapeHtml(p.word)}' kök kelimesini ara">
                  <div class="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">${escapeHtml(p.word)}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 font-normal">${escapeHtml(p.meaning)}</div>
                </button>
                ${i < compoundInfo.parts.length - 1 ? `<span class="text-slate-400 dark:text-slate-500 font-bold text-base select-none">+</span>` : `<span class="text-slate-400 dark:text-slate-500 font-bold text-base select-none">=</span>`}
              </div>
            `).join('')}
            <div class="px-3 py-1.5 min-h-[44px] flex flex-col justify-center bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-left shadow-2xs">
              <div class="font-extrabold text-xs md:text-sm text-indigo-700 dark:text-indigo-300">${escapeHtml(data.input)}</div>
              <div class="text-xs text-indigo-600/80 dark:text-indigo-400 font-medium">${escapeHtml(compoundInfo.resultMeaning || '')}</div>
            </div>
          </div>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">Kök kelimelerin detaylarını incelemek için kutularına dokunabilirsiniz.</p>
        </div>
      `;
    }

    // 1.6 Verb Conjugation Matrix Card (if verb)
    if (data.conjugation && data.conjugation.isVerb) {
      const conj = data.conjugation;
      html += `
        <div class="result-section-card bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up mb-4" data-section="conjugation">
          <div class="flex items-center justify-between mb-3 cursor-pointer accordion-trigger select-none" title="Fiil çekim tablosunu aç / kapat">
            <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <i class="ph-bold ph-arrows-clockwise text-indigo-500 text-lg"></i>
              <h3 class="font-bold text-base text-slate-800 dark:text-slate-100">Fiil Çekim Tablosu (Vervoeging)</h3>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">Gramer</span>
              <i class="ph-bold ph-caret-down text-slate-400 accordion-chevron rotated text-sm"></i>
            </div>
          </div>
          <div class="accordion-content expanded">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <div class="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">Şimdiki Zaman (O.T.T.)</div>
                <div class="space-y-1 text-slate-700 dark:text-slate-300">
                  <div><span class="text-slate-400 font-mono">ik:</span> <span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(conj.present?.ik || '-')}</span></div>
                  <div><span class="text-slate-400 font-mono">jij/hij:</span> <span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(conj.present?.jij || '-')}</span></div>
                  <div><span class="text-slate-400 font-mono">wij/zij:</span> <span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(conj.present?.wij || '-')}</span></div>
                </div>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <div class="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">Geçmiş Zaman (O.V.T.)</div>
                <div class="space-y-1 text-slate-700 dark:text-slate-300">
                  <div><span class="text-slate-400 font-mono">tekil:</span> <span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(conj.past?.singular || '-')}</span></div>
                  <div><span class="text-slate-400 font-mono">çoğul:</span> <span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(conj.past?.plural || '-')}</span></div>
                </div>
              </div>
              <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <div class="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">Tamamlanmış (V.D.)</div>
                <div class="space-y-1 text-slate-700 dark:text-slate-300">
                  <div><span class="text-slate-400 font-mono">deelwoord:</span> <span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(conj.perfect || '-')}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 1.7 Remaining Examples (inside details)
    const restExamples = data.examples && data.examples.length > 1 ? data.examples.slice(1) : [];
    if (restExamples.length > 0) {
      html += `
        <div class="result-section-card bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up mb-4" data-section="examples">
          <div class="flex items-center justify-between mb-3 text-slate-700 dark:text-slate-300">
            <div class="flex items-center gap-2">
              <i class="ph-bold ph-chat-circle-text text-blue-500 text-lg"></i>
              <h3 class="dark:text-slate-100 font-bold text-base text-slate-800">Doğal Örnek Cümleler</h3>
            </div>
            <span class="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 shrink-0"><i class="ph-bold ph-hand-tap"></i> <span class="hidden sm:inline">Kelimelere dokunup dinleyin</span><span class="sm:hidden">Dokun & dinle</span></span>
          </div>
          <div class="space-y-2.5">
            ${restExamples.map(ex => `
              <div class="p-3.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-100/90 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                <div class="flex items-start justify-between gap-3">
                  <div class="font-medium text-sm md:text-base text-slate-900 dark:text-slate-100 leading-relaxed flex-1 min-w-0">
                    ${renderInteractiveSentence(ex.source, data.sourceLanguage, data.input)}
                  </div>
                  <!-- Compact Micro-Actions Capsule -->
                  <div class="flex items-center shrink-0 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-xl p-0.5 shadow-2xs">
                    <button class="speak-btn text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" aria-label="Örnek cümleyi sesli oku" data-text="${escapeHtml(ex.source)}" data-lang="${data.sourceLanguage}" data-rate="1.0" title="Sesli Oku (1.0x)">
                      <i class="ph ph-speaker-simple-high text-base"></i>
                    </button>
                    <button class="speak-btn text-slate-400 hover:text-amber-600 px-1.5 h-9 min-h-[36px] flex items-center justify-center rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold transition-colors border-l border-slate-100 dark:border-slate-700" aria-label="Yavaş sesli oku" data-text="${escapeHtml(ex.source)}" data-lang="${data.sourceLanguage}" data-rate="0.75" title="0.75x Yavaş Dinle">
                      0.75x
                    </button>
                    <button class="copy-btn text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-l border-slate-100 dark:border-slate-700" data-copy="${escapeHtml(ex.source + ' — ' + ex.translation)}" title="Örneği Kopyala" aria-label="Örneği Kopyala">
                      <i class="ph-bold ph-copy text-sm"></i>
                    </button>
                  </div>
                </div>
                <div class="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 pl-2.5 border-l-2 border-primary-200 dark:border-primary-800 leading-relaxed">${escapeHtml(ex.translation)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 1.8 Meanings Card
    if (data.meanings && data.meanings.length > 0) {
      html += `
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up" style="animation-delay: 0.1s">
          <div class="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300">
            <i class="ph-bold ph-book-open text-primary-600 text-lg"></i>
            <h3 class="dark:text-slate-100 font-bold text-base text-slate-800">Detaylı Anlamlar & Bağlam</h3>
          </div>
          <div class="space-y-3">
            ${data.meanings.map((m, idx) => `
              <div class="flex items-start gap-3 leading-relaxed">
                <span class="font-mono text-slate-400 text-xs md:text-sm font-bold mt-0.5">${String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <div class="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-100">${escapeHtml(m.meaning)}</div>
                  ${m.explanation ? `<div class="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">${escapeHtml(m.explanation)}</div>` : ''}
                  ${m.context ? `<span class="inline-block mt-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">${escapeHtml(m.context)}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 1.9 Grammar & Etymology Grid
    const hasGrammar = data.grammar && Object.keys(data.grammar).length > 0;
    const hasEtymology = data.etymology?.summary;

    if (hasGrammar || hasEtymology) {
      html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up" style="animation-delay: 0.12s">`;

      if (hasGrammar) {
        const g = data.grammar;
        html += `
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm text-xs md:text-sm">
            <div class="flex items-center gap-1.5 mb-2.5 font-bold text-sm md:text-base text-slate-700 dark:text-slate-300">
              <i class="ph-bold ph-sparkle text-amber-500 text-base"></i>
              <span>Gramer & Çekim</span>
            </div>
            <div class="space-y-1.5">
              ${g.article ? `<div class="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-slate-800"><span class="text-slate-500 font-medium">Belirteç (Artikel)</span><div>${renderArticleBadge(g.article)}</div></div>` : ''}
              ${g.plural ? `<div class="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800"><span class="text-slate-500 font-medium">Çoğul (de)</span><span class="font-semibold text-slate-800 dark:text-slate-100">de ${escapeHtml(g.plural)}</span></div>` : ''}
              ${g.diminutive ? `<div class="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800"><span class="text-slate-500 font-medium">Küçültme (het)</span><span class="font-semibold text-slate-800 dark:text-slate-100">het ${escapeHtml(g.diminutive)}</span></div>` : ''}
              ${g.fixedPreposition ? `<div class="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800"><span class="text-slate-500 font-medium">Sabit Edat</span><span class="font-semibold text-indigo-600 dark:text-indigo-400">${escapeHtml(g.fixedPreposition)}</span></div>` : ''}
              ${g.infinitive ? `<div class="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800"><span class="text-slate-500 font-medium">Mastar</span><span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(g.infinitive)}</span></div>` : ''}
              ${g.register ? `<div class="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800"><span class="text-slate-500 font-medium">Kullanım Düzeyi</span><span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(localizeRegister(g.register))}</span></div>` : ''}
            </div>
          </div>
        `;
      }

      if (hasEtymology) {
        html += `
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm text-xs md:text-sm">
            <div class="flex items-center justify-between mb-2.5">
              <div class="flex items-center gap-1.5 font-bold text-sm md:text-base text-slate-700 dark:text-slate-300">
                <i class="ph-bold ph-info text-indigo-500 text-base"></i>
                <span>Etimoloji</span>
              </div>
              ${data.etymology?.certainty && data.etymology.certainty !== 'unknown' ? `
                <span class="text-xs uppercase font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100/80 dark:border-indigo-800">
                  ${data.etymology.certainty === 'high' ? 'Doğrulanmış Kaynak' : 'Muhtemel Köken'}
                </span>
              ` : ''}
            </div>
            <p class="text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed">${escapeHtml(data.etymology.summary)}</p>
          </div>
        `;
      }

      html += `</div>`;
    }

    // 1.10 Related Words Chips
    if (data.relatedWords && data.relatedWords.length > 0) {
      html += `
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up" style="animation-delay: 0.15s">
          <div class="flex items-center gap-1.5 mb-2.5 font-bold text-sm md:text-base text-slate-700 dark:text-slate-300">
            <i class="ph-bold ph-git-fork text-rose-500 text-base"></i>
            <span>İlişkili Kelimeler & Eş Anlamlılar</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${data.relatedWords.map(rw => `
              <button class="related-chip flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 hover:border-primary-400 hover:text-primary-700 text-xs md:text-sm text-slate-700 dark:text-slate-200 transition-colors" data-word="${escapeHtml(rw.word)}">
                <span class="font-medium">${escapeHtml(rw.word)}</span>
                <span class="text-xs text-slate-400 uppercase font-semibold">${rw.relation === 'synonym' ? 'eş' : rw.relation === 'antonym' ? 'zıt' : 'ilişkili'}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 1.11 Alternative Translations
    if (data.translations && data.translations.length > 1) {
      html += `
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up">
          <div class="flex items-center gap-1.5 mb-2.5 font-bold text-sm md:text-base text-slate-700 dark:text-slate-300">
            <i class="ph-bold ph-translate text-primary-600 text-base"></i>
            <span>Alternatif Çeviriler</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${data.translations.slice(1).map(t => `
              <span class="text-xs md:text-sm px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                ${escapeHtml(t.text)} ${t.context ? `<span class="text-slate-400 text-xs">(${escapeHtml(t.context)})</span>` : ''}
              </span>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Close detailSections wrapper
    html += `</div>`;

    // 6. Footer Provider Badge & In-App Flag Button (Google Play Compliance - STR-01)
    html += `
      <div class="flex items-center justify-between text-xs text-slate-400 pt-2 px-1">
        <div class="flex items-center gap-1.5">
          ${data._isCached ? `
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
              <i class="ph-bold ph-lightning text-xs"></i> Çevrimdışı Önbellek
            </span>
            <button id="refreshCachedBtn" class="text-primary-600 hover:text-primary-700 font-semibold underline ml-1 cursor-pointer" title="Canlı yapay zeka ile yeniden sorgula">
              Yenile
            </button>
          ` : `
            <span>⚡ ${escapeHtml(data._provider || 'LingoMate Dil Motoru')}</span>
            ${data._latency ? ` · <span>${data._latency}ms</span>` : ''}
          `}
        </div>
        <button class="flag-response-btn flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-rose-50" title="Hatalı veya uygunsuz AI yanıtını bildir" aria-label="Hatalı veya uygunsuz yanıtı bildir" data-query="${escapeHtml(data.input)}" data-provider="${escapeHtml(data._provider || '')}">
          <i class="ph-bold ph-flag text-xs text-rose-500"></i>
          <span>Yanıtı Bildir</span>
        </button>
      </div>
    `;

    if (data._fallbackFrom === 'local') {
      const errDetail = data._localError || 'Bağlantı kurulamadı';
      html += `
        <div class="text-left text-xs text-amber-900 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-3.5 max-w-md mx-auto mt-2.5 animate-slide-up shadow-2xs">
          <div class="font-bold flex items-center gap-1.5 text-amber-950 dark:text-amber-100 mb-1">
            <i class="ph-bold ph-info text-amber-600 dark:text-amber-400 text-sm"></i>
            <span>Akıllı Hibrit Yedek Devrede: ${escapeHtml(data._provider)}</span>
          </div>
          <p class="text-amber-800 dark:text-amber-300 text-xs md:text-sm leading-relaxed mb-2">
            Yerel Ollama servisi o sırada yanıt vermediği için sorgunuz otomatik olarak bulut / hızlı yedek motorla çözümlendi.
          </p>
          <details class="text-xs text-slate-600 dark:text-slate-400 mt-1 cursor-pointer">
            <summary class="font-semibold text-amber-900 dark:text-amber-300 hover:underline">Geliştirici / Termux Ayarları (İsteğe Bağlı)</summary>
            <div class="font-mono bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-amber-200 dark:border-amber-800/60 p-2 rounded-lg my-1.5 text-xs select-all break-all leading-normal">
              killall ollama 2>/dev/null; export OLLAMA_ORIGINS="*"; export OLLAMA_HOST="0.0.0.0:11434"; ollama serve &
            </div>
          </details>
        </div>
      `;
    }

    resultsContainer.innerHTML = html;
    resultsContainer.classList.remove('hidden');

    // Announce the outcome for screen reader users
    if (announce) {
      const art = data.grammar?.article ? data.grammar.article.toLowerCase() + ' ' : '';
      announce(`${art}${data.input}: ${mainTrans || 'çeviri bulunamadı'}`);
    }

    // Attach speech events (supports 1.0x and 0.75x slow audio + pulse feedback)
    resultsContainer.querySelectorAll('.speak-btn').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const rate = parseFloat(b.dataset.rate || '1.0');
        speak(b.dataset.text, b.dataset.lang, rate, b);
      });
    });

    // Attach Details toggle (Progressive Disclosure expand/collapse)
    const toggleDetailsBtn = resultsContainer.querySelector('#toggleDetailsBtn');
    const detailSections = resultsContainer.querySelector('#detailSections');
    if (toggleDetailsBtn && detailSections) {
      toggleDetailsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = toggleDetailsBtn.getAttribute('aria-expanded') === 'true';
        const next = !isExpanded;
        toggleDetailsBtn.setAttribute('aria-expanded', String(next));
        detailSections.classList.toggle('hidden', !next);

        // Rotate chevron
        const chevron = toggleDetailsBtn.querySelector('.accordion-chevron');
        if (chevron) chevron.classList.toggle('rotated', next);

        // Swap label for clarity
        const label = toggleDetailsBtn.querySelector('span');
        if (label) label.textContent = next ? 'Detayları Gizle' : 'Detaylar';

        // Scroll into view when expanding (mobile)
        if (next) {
          setTimeout(() => {
            detailSections.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 60);
        }
      });
    }

    // Update sticky search bar preview text
    if (stickySearchText) {
      const art = data.grammar?.article ? (data.grammar.article.toLowerCase() + ' ') : '';
      stickySearchText.textContent = `${art}${data.input} — ${mainTrans}`;
    }

    // Attach tap-to-lookup on sentence words (Dokun-Öğren Cümle Motoru)
    resultsContainer.querySelectorAll('.lookup-word').forEach((w) => {
      w.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = (w.dataset.word || w.textContent || '').trim().replace(/[.,!?;:"'()]/g, '');
        if (word && word.length > 1) {
          // If shift key or special modifier is held, execute instant full search directly
          if (e.shiftKey) {
            searchInput.value = word;
            showToast(`'${word}' aranıyor...`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            handleSearch();
          } else {
            // Default flagship behavior: Non-intrusive Quick-Peek bottom sheet
            openQuickPeek(word, data.sourceLanguage || 'nl');
          }
        }
      });
    });

    // Attach compound word part buttons
    resultsContainer.querySelectorAll('.compound-part-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = btn.dataset.word;
        if (word) {
          searchInput.value = word;
          if (searchBtn) searchBtn.disabled = false;
          if (clearBtn) clearBtn.classList.remove('hidden');
          showToast(`'${word}' aranıyor...`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          handleSearch();
        }
      });
    });

    // Attach copy button events
    resultsContainer.querySelectorAll('.copy-btn').forEach((b) => {
      b.addEventListener('click', async (e) => {
        e.stopPropagation();
        const textToCopy = b.dataset.copy || '';
        if (!textToCopy) return;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy);
          } else {
            const ta = document.createElement('textarea');
            ta.value = textToCopy;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          showToast('Panoya kopyalandı!');
        } catch (err) {
          console.warn('Copy failed:', err);
        }
      });
    });

    // Attach quick share card button
    const shareResultBtn = resultsContainer.querySelector('#shareResultBtn');
    if (shareResultBtn) {
      shareResultBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const articlePrefix = data.grammar?.article ? (data.grammar.article.toLowerCase() + ' ') : '';
        const title = `${articlePrefix}${data.input} — ${mainTrans}`;
        const exText = (data.examples && data.examples.length > 0) 
          ? `\nÖrnek: ${data.examples[0].source} (${data.examples[0].translation})` 
          : '';
        const shareText = `LingoMate: ${title}${exText}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              text: shareText
            });
            return;
          } catch (err) {
            if (err.name !== 'AbortError') {
              console.warn('Share error:', err);
            }
          }
        }
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareText);
          } else {
            const ta = document.createElement('textarea');
            ta.value = shareText;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          showToast('Paylaşım metni panoya kopyalandı!');
        } catch (err) {
          console.warn('Fallback copy failed:', err);
        }
      });
    }

    // Attach favorite toggle button
    resultsContainer.querySelectorAll('.fav-toggle-btn').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = b.dataset.word;
        const isAdded = toggleFavorite(word, mainTrans, data.grammar?.article, data.cefr);
        const icon = b.querySelector('i');
        if (icon) {
          icon.className = `ph-bold ph-star text-xl ${isAdded ? 'text-amber-500' : 'text-slate-400'}`;
        }
        b.classList.toggle('text-amber-500', isAdded);
        b.classList.toggle('bg-amber-50', isAdded);
        b.classList.toggle('dark:bg-amber-950/40', isAdded);
        b.classList.toggle('text-slate-400', !isAdded);
      });
    });

    // Attach accordion triggers (Progressive Disclosure)
    resultsContainer.querySelectorAll('.accordion-trigger').forEach((trig) => {
      trig.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = trig.closest('.result-section-card');
        if (!card) return;
        const content = card.querySelector('.accordion-content');
        const chevron = card.querySelector('.accordion-chevron');
        if (content) content.classList.toggle('expanded');
        if (chevron) chevron.classList.toggle('rotated');
      });
    });

    // Attach related word click to search
    resultsContainer.querySelectorAll('.related-chip').forEach((b) => {
      b.addEventListener('click', () => {
        searchInput.value = b.dataset.word;
        handleSearch();
      });
    });

    // Attach did-you-mean click to search
    resultsContainer.querySelectorAll('.did-you-mean-btn').forEach((b) => {
      b.addEventListener('click', () => {
        searchInput.value = b.dataset.word;
        handleSearch();
      });
    });

    // Attach flag response button (Google Play GenAI in-app reporting)
    resultsContainer.querySelectorAll('.flag-response-btn').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const q = b.dataset.query || searchInput.value.trim();
        window.activeFlagQuery = q;
        window.activeFlagProvider = b.dataset.provider || '';
        if (typeof window.openFlagModal === 'function') {
          window.openFlagModal(q);
        }
        if (flagTrap) flagTrap.activate();
      });
    });

    // Attach refresh cached result button
    const refreshCachedBtn = resultsContainer.querySelector('#refreshCachedBtn');
    if (refreshCachedBtn) {
      refreshCachedBtn.addEventListener('click', () => {
        handleSearch(true);
      });
    }
  }

  // Helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Event Listeners ─────────────────────────────────────────────────────
  window.openSettingsModal = function() {
    updateProviderModalUI();
    if (typeof window.switchMainTab === 'function') {
      window.switchMainTab('settings');
    } else {
      viewSettings.classList.remove('hidden');
    }
  };
  window.syncSettingsModalUI = updateProviderModalUI;
  window.syncHistoryUI = renderHistory;

  headerProviderBadge.addEventListener('click', window.openSettingsModal);
  settingsBtn.addEventListener('click', window.openSettingsModal);

  // closeSettingsBtn removed in new tab-view architecture (handled by bottom nav)

  historyBtn.addEventListener('click', () => {
    renderHistory();
    historyModal.classList.remove('hidden');
    if (historyTrap) historyTrap.activate();
  });

  closeHistoryBtn.addEventListener('click', () => {
    historyModal.classList.add('hidden');
    if (historyTrap) historyTrap.release();
  });

  // Escape closes the history dialog and restores focus
  historyModal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      historyModal.classList.add('hidden');
      if (historyTrap) historyTrap.release();
      if (searchInput) searchInput.focus();
    }
  });

  clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('lexi_history');
    renderHistory();
  });

  swapLangBtn.addEventListener('click', toggleLanguage);
  modeToggleBtn.addEventListener('click', toggleQuickMode);

  // Provider selection tabs
  providerTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      activeProvider = tab.dataset.provider;
      const prov = AIEngine.PROVIDERS[activeProvider];
      activeModel = activeProvider === 'local' 
        ? (AIEngine.getSettings().localModel || prov?.default_model) 
        : prov?.default_model;
      updateProviderModalUI();
    });
  });

  // Refresh installed Ollama models manually
  if (refreshModelsBtn) {
    refreshModelsBtn.addEventListener('click', () => {
      loadLocalModels(localUrlInput.value, false);
    });
  }

  // Detect models if user changes Ollama URL
  localUrlInput.addEventListener('change', () => {
    if (activeProvider === 'local') {
      loadLocalModels(localUrlInput.value, false);
    }
  });

  // Save Settings
  saveSettingsBtn.addEventListener('click', () => {
    activeModel = modelSelect.value;
    AIEngine.saveSettings({
      provider: activeProvider,
      model: activeModel,
      googleKey: googleKeyInput.value,
      nvidiaKey: nvidiaKeyInput.value,
      localUrl: localUrlInput.value,
      localModel: activeProvider === 'local' ? activeModel : undefined
    });

    updateHeaderBadge();
    showToast('Ayarlar başarıyla kaydedildi.');
    saveStatusText.classList.remove('opacity-0');
    setTimeout(() => {
      saveStatusText.classList.add('opacity-0');
      if (typeof window.switchMainTab === 'function') {
        window.switchMainTab('dictionary');
      } else {
        viewSettings.classList.add('hidden');
      }
    }, 600);
  });

  // Flag Modal Action Handler (Google Play GenAI in-app reporting)
  const submitFlagBtn = document.getElementById('submitFlagBtn');
  const flagCommentInput = document.getElementById('flagCommentInput');
  const flagStatusMsg = document.getElementById('flagStatusMsg');

  if (submitFlagBtn) {
    submitFlagBtn.addEventListener('click', () => {
      const selectedReason = document.querySelector('input[name="flagReason"]:checked')?.value || 'unspecified';
      const comment = flagCommentInput ? flagCommentInput.value.trim() : '';
      const query = window.activeFlagQuery || searchInput.value.trim();
      const provider = window.activeFlagProvider || '';

      const report = {
        query: query,
        provider: provider,
        reason: selectedReason,
        comment: comment,
        timestamp: new Date().toISOString()
      };

      try {
        const stored = JSON.parse(localStorage.getItem('lexi_flagged_reports') || '[]');
        stored.push(report);
        localStorage.setItem('lexi_flagged_reports', JSON.stringify(stored));
      } catch (err) {
        console.error('Failed to save flagged report:', err);
      }

      if (flagStatusMsg) flagStatusMsg.classList.remove('hidden');
      setTimeout(() => {
        if (typeof window.closeFlagModal === 'function') window.closeFlagModal();
        if (flagCommentInput) flagCommentInput.value = '';
      }, 900);
    });
  }

  // Quick fallback on error
  quickFallbackBtn.addEventListener('click', async () => {
    const q = searchInput.value.trim();
    if (!q) return;
    errorBox.classList.add('hidden');
    setLoading(true);
    try {
      const data = await AIEngine.quickTranslateRest(q, sourceLang, sourceLang === 'nl' ? 'tr' : 'nl');
      data._provider = 'Google REST (Yedek Çeviri)';
      renderResult(data);
    } catch (e) {
      showError(e.message);
    } finally {
      setLoading(false);
    }
  });

  // Input & search controls
  searchInput.addEventListener('input', () => {
    const hasText = searchInput.value.trim().length > 0;
    searchBtn.disabled = !hasText || isLoading;
    clearBtn.classList.toggle('hidden', !hasText);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!searchBtn.disabled) handleSearch();
    }
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchBtn.disabled = true;
    clearBtn.classList.add('hidden');
    searchInput.focus();
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        searchInput.value = text.trim();
        searchBtn.disabled = false;
        clearBtn.classList.remove('hidden');
        searchInput.focus();
      }
    } catch {
      // Fallback
    }
  });

  searchBtn.addEventListener('click', handleSearch);

  // Global Escape key listener for accessible modal closing
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    const historyOpen = (() => {
      const el = document.getElementById('historyModal');
      return el && !el.classList.contains('hidden');
    })();
    const flagOpen = (() => {
      const el = document.getElementById('flagModal');
      return el && !el.classList.contains('hidden');
    })();

    if (historyOpen) {
      if (typeof window.closeHistoryModal === 'function') window.closeHistoryModal();
      if (historyTrap) historyTrap.release();
      e.preventDefault();
      return;
    }
    if (flagOpen) {
      if (typeof window.closeFlagModal === 'function') window.closeFlagModal();
      if (flagTrap) flagTrap.release();
      e.preventDefault();
      return;
    }
    if (window.__activeTab && window.__activeTab !== 'dictionary') {
      window.switchMainTab('dictionary');
    }
  });

  // Sticky Mini Search Bar Scroll & Click Handlers (Fitts's Law Mobile Ergonomics)
  if (stickySearchBar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 240 && window.__activeTab === 'dictionary' && resultsContainer && !resultsContainer.classList.contains('hidden')) {
        stickySearchBar.classList.add('visible');
      } else {
        stickySearchBar.classList.remove('visible');
      }
    });

    const scrollToSearch = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 300);
    };

    if (stickySearchTrigger) stickySearchTrigger.addEventListener('click', scrollToSearch);
    if (stickyScrollTopBtn) stickyScrollTopBtn.addEventListener('click', scrollToSearch);
  }

  // Network online/offline status monitors
  window.addEventListener('online', updateHeaderBadge);
  window.addEventListener('offline', updateHeaderBadge);

  // ── Onboarding Modal Logic ────────────────────────────────────────────────
  function setupOnboarding() {
    const onboardingModal = document.getElementById('onboardingModal');
    const onboardingSteps = document.getElementById('onboardingSteps');
    const onboardingProgressBar = document.getElementById('onboardingProgressBar');
    const onboardingProgressText = document.getElementById('onboardingProgressText');
    const onboardingProgressPercent = document.getElementById('onboardingProgressPercent');
    const onboardingBackBtn = document.getElementById('onboardingBackBtn');
    const onboardingNextBtn = document.getElementById('onboardingNextBtn');
    const onboardingFinishBtn = document.getElementById('onboardingFinishBtn');
    const onboardingProgressBarEl = document.getElementById('onboardingProgressBar');

    const steps = ['step1', 'step2', 'step3'];
    let currentStep = 0;

    // Check if onboarding already completed
    const onboardingDone = localStorage.getItem('lexi_onboarding_done');
    if (onboardingDone) {
      return; // Already completed, don't show
    }

    const stepElements = {
      step1: document.getElementById('onboardingStep1'),
      step2: document.getElementById('onboardingStep2'),
      step3: document.getElementById('onboardingStep3')
    };

    const progressData = {
      step1: { text: 'Adım 1 / 3', percent: 33, width: '33%' },
      step2: { text: 'Adım 2 / 3', percent: 66, width: '66%' },
      step3: { text: 'Adım 3 / 3', percent: 100, width: '100%' }
    };

    function showStep(stepIndex) {
      const stepKeys = Object.keys(stepElements);
      const prevStep = steps[currentStep];
      const nextStep = steps[stepIndex];

      // Hide current step
      if (stepElements[prevStep]) {
        stepElements[prevStep].classList.add('exiting');
        setTimeout(() => {
          stepElements[prevStep].classList.add('hidden');
          stepElements[prevStep].classList.remove('exiting');
        }, 200);
      }

      // Show next step
      setTimeout(() => {
        if (stepElements[nextStep]) {
          stepElements[nextStep].classList.remove('hidden');
        }
      }, 200);

      currentStep = stepIndex;
      updateProgress();
      updateButtons();
    }

    function updateProgress() {
      const progress = progressData[steps[currentStep]];
      if (onboardingProgressBarEl) {
        onboardingProgressBarEl.style.width = progress.width;
      }
      if (onboardingProgressText) {
        onboardingProgressText.textContent = progress.text;
      }
      if (onboardingProgressPercent) {
        onboardingProgressPercent.textContent = '%' + progress.percent;
      }
    }

    function updateButtons() {
      if (onboardingBackBtn) {
        onboardingBackBtn.classList.toggle('hidden', currentStep === 0);
        onboardingBackBtn.disabled = currentStep === 0;
      }
      if (onboardingNextBtn) {
        onboardingNextBtn.classList.toggle('hidden', currentStep === steps.length - 1);
      }
      if (onboardingFinishBtn) {
        onboardingFinishBtn.classList.toggle('hidden', currentStep !== steps.length - 1);
      }
    }

    function nextStep() {
      if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
      }
    }

    function prevStep() {
      if (currentStep > 0) {
        showStep(currentStep - 1);
      }
    }

    function finishOnboarding() {
      const userProfile = {
        purpose: document.querySelector('[data-purpose][data-selected="true"]')?.dataset.purpose || 'daily',
        level: document.querySelector('[data-level][data-selected="true"]')?.dataset.level || 'A1',
        time: document.querySelector('[data-time][data-selected="true"]')?.dataset.time || '15',
        completedAt: new Date().toISOString()
      };
      localStorage.setItem('lexi_user_profile', JSON.stringify(userProfile));
      localStorage.setItem('lexi_onboarding_done', 'true');
      closeOnboarding();
      applyUserProfile();
    }

    function closeOnboarding() {
      const modal = document.getElementById('onboardingModal');
      if (modal) {
        modal.classList.add('hidden');
      }
    }

    // Option selection
    document.querySelectorAll('.onboarding-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const parent = opt.closest('.onboarding-step');
        if (!parent) return;
        parent.querySelectorAll('.onboarding-option').forEach(o => {
          o.removeAttribute('data-selected');
          o.classList.remove('data-selected-true');
        });
        opt.setAttribute('data-selected', 'true');
        opt.classList.add('data-selected-true');
      });
    });

    // Navigation buttons
    if (onboardingNextBtn) {
      onboardingNextBtn.addEventListener('click', () => {
        if (currentStep < 2) {
          showStep(currentStep + 1);
        }
      });
    }

    if (onboardingBackBtn) {
      onboardingBackBtn.addEventListener('click', () => {
        if (currentStep > 0) {
          showStep(currentStep - 1);
        }
      });
    }

    if (onboardingFinishBtn) {
      onboardingFinishBtn.addEventListener('click', finishOnboarding);
    }

    // Show modal if not completed
    const onboardingModalEl = document.getElementById('onboardingModal');
    if (onboardingModalEl) {
      onboardingModalEl.classList.remove('hidden');
      // Focus first option
      setTimeout(() => {
        const firstOption = document.querySelector('.onboarding-option');
        if (firstOption) firstOption.focus();
      }, 300);
    }
  }

  // ── Apply User Profile to Empty State ──────────────────────────────────────
  function applyUserProfile() {
    const profile = JSON.parse(localStorage.getItem('lexi_user_profile') || '{}');
    if (!profile.purpose) return;

    // Update empty state with personalized content
    const emptyState = document.getElementById('emptyState');
    if (!emptyState) return;

    // Could add personalized greeting, suggested categories, etc.
    console.log('Applying user profile:', profile);
  }

  // ── PWA Install Prompt ─────────────────────────────────────────────────────
  let deferredPrompt = null;
  let installPromptShown = false;

  function setupInstallPrompt() {
    const installBanner = document.getElementById('installPromptBanner');
    const installAcceptBtn = document.getElementById('installPromptAccept');
    const installDismissBtn = document.getElementById('installPromptDismiss');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show after 30 seconds if not dismissed
      setTimeout(() => {
        if (!installPromptShown && !localStorage.getItem('lexi_install_dismissed')) {
          const banner = document.getElementById('installPromptBanner');
          if (banner) {
            banner.classList.remove('hidden');
            installPromptShown = true;
          }
        }
      }, 30000);
    });

    const acceptBtn = document.getElementById('installPromptAccept');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            console.log('User accepted PWA install');
          }
          deferredPrompt = null;
        }
        const banner = document.getElementById('installPromptBanner');
        if (banner) banner.classList.add('hidden');
        localStorage.setItem('lexi_install_dismissed', 'true');
      });
    }

    const dismissBtn = document.getElementById('installPromptDismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        const banner = document.getElementById('installPromptBanner');
        if (banner) banner.classList.add('hidden');
        localStorage.setItem('lexi_install_dismissed', 'true');
      });
    }
  }

  // ── Enhanced Offline Support ───────────────────────────────────────────────
  function setupOfflineSupport() {
    const offlineBanner = document.getElementById('offlineBanner');
    const offlineBannerText = document.getElementById('offlineBannerText');
    const offlineDismissBtn = document.getElementById('offlineBannerDismiss');

    function updateOfflineBanner() {
      const isOffline = !navigator.onLine;
      if (offlineBanner) {
        offlineBanner.classList.toggle('hidden', !isOffline);
        if (offlineBannerText) {
          if (isOffline) {
            // Show cache info
            const cacheSize = getCacheSize();
            offlineBannerText.textContent = `Çevrimdışısınız. ${cacheSize} önbellekte. Kayıtlı kelimeler ve yerel sözlük kullanılabilir.`;
          }
        }
      }
    }

    async function getCacheSize() {
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          let totalSize = 0;
          for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            for (const request of keys) {
              const response = await cache.match(request);
              if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
              }
            }
          }
          return formatBytes(totalSize);
        }
      } catch (e) {
        return 'bilinmeyen boyut';
      }
      return 'bilinmeyen boyut';
    }

    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    window.addEventListener('online', updateHeaderBadge);
    window.addEventListener('offline', updateHeaderBanner);

    function updateHeaderBanner() {
      const offlineBanner = document.getElementById('offlineBanner');
      if (offlineBanner) {
        const isOffline = !navigator.onLine;
        offlineBanner.classList.toggle('hidden', !isOffline);
        if (isOffline) {
          offlineBanner.classList.add('enhanced');
        }
      }
    }

    const dismissBtn = document.getElementById('offlineBannerDismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        const banner = document.getElementById('offlineBanner');
        if (banner) banner.classList.add('hidden');
      });
    }

    // Initial check
    updateHeaderBanner();
  }

  // ── Enhanced Voice Search: "Konuşarak Öğren" Mode ───────────────────────────
  let speakLearnMode = false;
  let speakLearnInterval = null;

  function setupEnhancedVoiceSearch() {
    const voiceSearchBtn = document.getElementById('voiceSearchBtn');
    const voiceSearchLabel = document.getElementById('voiceSearchLabel');

    if (!voiceSearchBtn) return;

    // Add long press for "Konuşarak Öğren" mode
    let pressTimer = null;

    voiceSearchBtn.addEventListener('mousedown', (e) => {
      pressTimer = setTimeout(() => {
        activateSpeakLearnMode();
      }, 800); // 800ms long press
    });

    voiceSearchBtn.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
    });

    voiceSearchBtn.addEventListener('mouseleave', () => {
      clearTimeout(pressTimer);
    });

    voiceSearchBtn.addEventListener('touchstart', (e) => {
      pressTimer = setTimeout(() => {
        activateSpeakLearnMode();
      }, 800);
    });

    voiceSearchBtn.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });
  }

  function activateSpeakLearnMode() {
    if (speakLearnMode) return;

    speakLearnMode = true;
    const voiceSearchBtn = document.getElementById('voiceSearchBtn');
    const voiceSearchLabel = document.getElementById('voiceSearchLabel');

    if (voiceSearchBtn) {
      voiceSearchBtn.classList.add('voice-search-active');
      voiceSearchBtn.setAttribute('aria-pressed', 'true');
    }
    if (voiceSearchLabel) voiceSearchLabel.textContent = 'Konuşarak Öğren...';

    showToast('Konuşarak Öğren modu aktif. Kelimeler söylendiğinde otomatik çevrilir.', 'ph-bold ph-microphone text-primary-500');

    // Start continuous recognition
    startContinuousRecognition();
  }

  function deactivateSpeakLearnMode() {
    if (!speakLearnMode) return;

    speakLearnMode = false;
    const voiceSearchBtn = document.getElementById('voiceSearchBtn');
    const voiceSearchLabel = document.getElementById('voiceSearchLabel');

    if (voiceSearchBtn) {
      voiceSearchBtn.classList.remove('voice-search-active');
      voiceSearchBtn.setAttribute('aria-pressed', 'false');
    }
    if (voiceSearchLabel) voiceSearchLabel.textContent = 'Sesle Ara';

    stopContinuousRecognition();
    showToast('Normal arama moduna dönüldü.', 'ph-bold ph-microphone text-primary-500');
  }

  let continuousRecognition = null;

  function startContinuousRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    continuousRecognition = new SpeechRec();
    continuousRecognition.lang = sourceLang === 'nl' ? 'nl-NL' : 'tr-TR';
    continuousRecognition.continuous = true;
    continuousRecognition.interimResults = true;
    continuousRecognition.maxAlternatives = 1;

    continuousRecognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript && finalTranscript.trim()) {
        const word = finalTranscript.trim();
        searchInput.value = word;
        if (searchBtn) searchBtn.disabled = false;
        if (clearBtn) clearBtn.classList.remove('hidden');
        handleSearch();

        // Auto-speak the result
        setTimeout(() => {
          const speakBtn = document.querySelector('.speak-btn[data-rate="1.0"]');
          if (speakBtn) speakBtn.click();
        }, 500);
      }

      if (interimTranscript) {
        // Show interim results in search input
        searchInput.value = interimTranscript;
      }
    };

    continuousRecognition.onerror = (event) => {
      console.warn('Continuous recognition error:', event.error);
      if (event.error === 'not-allowed') {
        deactivateSpeakLearnMode();
        showToast('Mikrofon erişim izni verilmedi.', 'ph-bold ph-warning-circle text-amber-500');
      }
    };

    continuousRecognition.onend = () => {
      if (speakLearnMode) {
        // Restart automatically
        setTimeout(() => {
          if (speakLearnMode) startContinuousRecognition();
        }, 500);
      }
    };

    continuousRecognition.start();
  }

  function stopContinuousRecognition() {
    if (continuousRecognition) {
      continuousRecognition.stop();
      continuousRecognition = null;
    }
  }

  // ── Service Worker Registration with Update Prompt ─────────────────────────
  function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js?v=5.0').then(reg => {
        reg.update();

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateAvailable();
              }
            });
          }
        });

        // Check for updates every hour
        setInterval(() => reg.update(), 3600000);
      }).catch(err => {
        console.warn('SW registration failed:', err);
      });
    }

    function showUpdateAvailable() {
      showToast('Yeni sürüm mevcut! Sayfayı yenileyin.', 'ph-bold ph-arrow-clockwise text-primary-500');
    }
  }

  // Initialize all new features
  setupOnboarding();
  setupInstallPrompt();
  setupOfflineSupport();
  setupEnhancedVoiceSearch();
  setupServiceWorker();

  // Run initial setup safely
  try {
    init();
  } catch (err) {
    console.error("LingoMate init error:", err);
  }
});
