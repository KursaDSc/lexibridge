/**
 * LexiBridge Mobile Application Controller
 * Handles UI interactions, multi-provider configuration, search history, and speech synthesis.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Elements ────────────────────────────────────────────────────────────
  const headerProviderBadge = document.getElementById('headerProviderBadge');
  const headerProviderIcon = document.getElementById('headerProviderIcon');
  const headerProviderName = document.getElementById('headerProviderName');

  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
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
        <button class="seed-chip px-3 py-1.5 min-h-[38px] bg-white border border-slate-200/80 rounded-xl text-slate-700 hover:border-primary-400 hover:text-primary-700 font-medium whitespace-nowrap shadow-2xs transition-all active:scale-95" data-word="${escapeHtml(word)}">
          ${escapeHtml(word)}
        </button>
      `
      )
      .join('');

    seedChipsContainer.querySelectorAll('.seed-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
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
  let isCompactView = localStorage.getItem('lexi_view_mode') === 'compact';

  // ── UI Enhancements Elements ─────────────────────────────────────────────
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeToggleIcon = document.getElementById('themeToggleIcon');
  const autocompleteDropdown = document.getElementById('autocompleteDropdown');
  const toastEl = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimeout = null;

  // Sticky Mini Search Bar & Tabs State
  const stickySearchBar = document.getElementById('stickySearchBar');
  const stickySearchTrigger = document.getElementById('stickySearchTrigger');
  const stickySearchText = document.getElementById('stickySearchText');
  const stickyScrollTopBtn = document.getElementById('stickyScrollTopBtn');
  let activeResultTab = 'all'; // 'all' | 'examples' | 'conjugation' | 'details'

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

  window.toggleTheme = function() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('lexi_theme', isDark ? 'dark' : 'light');
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
        const keyClass = isKey ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-950/60 px-1 rounded' : '';
        return `<span class="lookup-word ${keyClass}" data-word="${escapeHtml(clean)}" title="'${escapeHtml(clean)}' kelimesini ara">${escapeHtml(token)}</span>`;
      }
      return escapeHtml(token);
    }).join('');
  }

  function renderAutocomplete(query) {
    if (!autocompleteDropdown) return;
    if (!query || query.length < 2 || typeof window.LEXI_DICTIONARY_SEEDS === 'undefined') {
      autocompleteDropdown.classList.add('hidden');
      return;
    }

    const q = query.toLowerCase();
    const matches = window.LEXI_DICTIONARY_SEEDS.filter(s =>
      s.nl.toLowerCase().startsWith(q) || s.tr.toLowerCase().includes(q)
    ).slice(0, 5);

    if (matches.length === 0) {
      autocompleteDropdown.classList.add('hidden');
      return;
    }

    autocompleteDropdown.innerHTML = matches.map(s => `
      <div class="autocomplete-item p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors" data-word="${escapeHtml(s.nl)}">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-800 dark:text-slate-100 text-sm">${escapeHtml(s.nl)}</span>
          ${s.article ? `<span class="px-2 py-0.5 rounded text-xs font-bold uppercase ${s.article === 'de' ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'}">${escapeHtml(s.article)}</span>` : ''}
          <span class="text-slate-400">➔</span>
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
  }

  // ── Init Settings ───────────────────────────────────────────────────────
  function init() {
    // Check URL hash or query for key auto-import (#key=... or ?key=...)
    try {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const urlParams = new URLSearchParams(window.location.search);
      const keyFromUrl = hashParams.get('key') || urlParams.get('key');
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
    renderSeedChips();
    updateThemeIcon();

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
      }
    });

    // Attach click events to situational practice topic chips in empty state
    document.querySelectorAll('.topic-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        if (sourceLang !== 'nl') toggleLanguage();
        const word = chip.dataset.word || chip.textContent.trim();
        searchInput.value = word;
        searchBtn.disabled = false;
        clearBtn.classList.remove('hidden');
        handleSearch();
      });
    });

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
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
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
      const pId = tab.dataset.provider;
      if (pId === activeProvider) {
        tab.classList.add('border-primary-500', 'bg-primary-50/70', 'text-primary-900');
        tab.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
      } else {
        tab.classList.remove('border-primary-500', 'bg-primary-50/70', 'text-primary-900');
        tab.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
      }
    });

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

    if (state) {
      searchBtnText.textContent = 'Analiz Ediliyor...';
      searchBtnIcon.classList.add('hidden');
      loadingSpinner.classList.remove('hidden');
      clearBtn.classList.add('hidden');

      emptyState.classList.add('hidden');
      errorBox.classList.add('hidden');
      resultsContainer.classList.add('hidden');
      skeletonLoader.classList.remove('hidden');
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
  }

  // ── Pronunciation Audio (Google TTS Native Audio + SpeechSynthesis Fallback) ──
  function speak(text, lang, rate = 1.0, btnElement = null) {
    if (!text) return;
    const cleanLang = (lang === 'nl' || lang === 'nl-NL') ? 'nl' : 'tr';
    const playbackRate = typeof rate === 'number' && rate > 0 ? rate : 1.0;

    if (btnElement) {
      btnElement.classList.add('is-speaking');
    }

    const removeSpeaking = () => {
      if (btnElement) {
        btnElement.classList.remove('is-speaking');
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
      historyList.innerHTML = `<div class="p-6 text-center text-sm text-slate-400">Henüz arama geçmişi yok.</div>`;
      return;
    }
    historyList.innerHTML = hist
      .map(
        (h) => `
      <div class="history-item flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors" data-query="${escapeHtml(h.query)}" data-source="${h.source}">
        <div>
          <div class="font-semibold text-sm text-slate-800">${escapeHtml(h.query)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(h.translation || '')}</div>
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
              plural: seedMatch.plural || ''
            },
            conjugation: seedMatch.conjugation || null,
            translations: [{ text: seedMatch.tr, frequency: 'very_common' }],
            meanings: [{ meaning: seedMatch.tr }],
            examples: seedMatch.example ? [seedMatch.example] : [],
            relatedWords: [],
            _provider: 'LexiBridge Çevrimdışı Sözlük (0ms)',
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
    html += `
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up ${cardAccentClass}">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center flex-wrap gap-2">
              <h2 class="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">${escapeHtml(data.input)}</h2>
              <button class="speak-btn w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 dark:hover:bg-primary-900 active:scale-95 rounded-full transition-all" aria-label="Kelimeyi sesli telaffuz et" data-text="${escapeHtml(data.input)}" data-lang="${data.sourceLanguage}" data-rate="1.0" title="Sesli Telaffuz (1.0x)">
                <i class="ph-bold ph-speaker-high text-xl"></i>
              </button>
              <button class="speak-btn px-2.5 py-1 min-h-[44px] flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-all" aria-label="0.75x Yavaş Dinle" data-text="${escapeHtml(data.input)}" data-lang="${data.sourceLanguage}" data-rate="0.75" title="0.75x Yavaş Dinle">
                0.75x
              </button>
            </div>

            <div class="metadata-ribbon flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 max-w-full">
              ${isDe ? `<span class="text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0" title="De Belirteci">de</span>` : isHet ? `<span class="text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0" title="Het Belirteci">het</span>` : (data.grammar?.article ? renderArticleBadge(data.grammar.article) : '')}
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
                <span class="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-100/70 dark:border-indigo-800 inline-flex items-center gap-1 shrink-0" title="Çoğul Hali">
                  <span class="text-xs text-indigo-500 font-bold uppercase">çoğul:</span>
                  <span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(data.grammar.plural)}</span>
                </span>
              ` : ''}
              ${data.grammar?.infinitive && data.grammar.infinitive !== data.input ? `
                <span class="text-xs px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-medium border border-purple-100/70 dark:border-purple-800 inline-flex items-center gap-1 shrink-0" title="Fiil Mastar Hali">
                  <span class="text-xs text-purple-500 font-bold uppercase">mastar:</span>
                  <span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(data.grammar.infinitive)}</span>
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Quick Actions: Share & Compact/Detailed Mode -->
          <div class="flex items-center gap-1 shrink-0">
            <button id="shareResultBtn" class="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="Kelime Kartını Paylaş" aria-label="Kelime Kartını Paylaş">
              <i class="ph-bold ph-share-network text-lg"></i>
            </button>
            <button id="toggleDenseBtn" class="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 px-2.5 py-1.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-semibold" title="Kompakt / Detaylı Modu Değiştir" aria-label="Kompakt / Detaylı Modu Değiştir">
              <i class="ph-bold ${isCompactView ? 'ph-caret-down' : 'ph-caret-up'} text-xs"></i>
              <span>${isCompactView ? 'Kompakt' : 'Detaylı'}</span>
            </button>
          </div>
        </div>

        <!-- Primary Target Translation -->
        <div class="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-start gap-2.5">
          <span class="text-xl">${data.targetLanguage === 'tr' ? '🇹🇷' : '🇳🇱'}</span>
          <div class="flex-1">
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
            ${data.translations?.length > 1 ? `
              <div class="flex flex-wrap gap-1.5 mt-2">
                ${data.translations.slice(1).map(t => `
                  <span class="text-xs md:text-sm px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                    ${escapeHtml(t.text)} ${t.context ? `<span class="text-slate-400 text-xs">(${escapeHtml(t.context)})</span>` : ''}
                  </span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // 1.2 Segmented Result Tabs Bar (NNGroup Cognitive Chunking Pattern)
    const hasConjugation = !!(data.conjugation && data.conjugation.isVerb);
    html += `
      <div class="result-tabs-bar flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 my-3 overflow-x-auto">
        <button class="result-tab-btn flex-1 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeResultTab === 'all' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}" data-tab="all">
          <i class="ph-bold ph-squares-four text-sm"></i>
          <span>Tümü</span>
        </button>
        <button class="result-tab-btn flex-1 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeResultTab === 'examples' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}" data-tab="examples">
          <i class="ph-bold ph-chat-circle-text text-sm"></i>
          <span>Örnekler</span>
        </button>
        ${hasConjugation ? `
          <button class="result-tab-btn flex-1 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeResultTab === 'conjugation' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}" data-tab="conjugation">
            <i class="ph-bold ph-arrows-clockwise text-sm"></i>
            <span>Fiil Çekimi</span>
          </button>
        ` : ''}
        <button class="result-tab-btn flex-1 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeResultTab === 'details' ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}" data-tab="details">
          <i class="ph-bold ph-book-open text-sm"></i>
          <span>Detaylar</span>
        </button>
      </div>
    `;

    // 1.5 Verb Conjugation Matrix Card (if verb)
    if (data.conjugation && data.conjugation.isVerb) {
      const conj = data.conjugation;
      const isConjugationVisible = activeResultTab === 'all' || activeResultTab === 'conjugation';
      html += `
        <div class="result-section-card ${isConjugationVisible ? '' : 'hidden'} bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up mb-4" data-section="conjugation" style="animation-delay: 0.05s">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <i class="ph-bold ph-arrows-clockwise text-indigo-500 text-lg"></i>
              <h3 class="font-bold text-base text-slate-800 dark:text-slate-100">Fiil Çekim Tablosu (Vervoeging)</h3>
            </div>
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">Gramer</span>
          </div>
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
      `;
    }

    // 2. Examples Card (with Tap-to-Lookup & Slow Audio)
    if (data.examples && data.examples.length > 0) {
      const isExamplesVisible = activeResultTab === 'all' || activeResultTab === 'examples';
      html += `
        <div class="result-section-card ${isExamplesVisible ? '' : 'hidden'} bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 shadow-sm animate-slide-up mb-4" data-section="examples" style="animation-delay: 0.08s">
          <div class="flex items-center justify-between mb-3 text-slate-700 dark:text-slate-300">
            <div class="flex items-center gap-2">
              <i class="ph-bold ph-chat-circle-text text-blue-500 text-lg"></i>
              <h3 class="dark:text-slate-100 font-bold text-base text-slate-800">Doğal Örnek Cümleler</h3>
            </div>
            <span class="text-xs text-slate-400 font-medium">Kelimelere dokunarak ara</span>
          </div>
          <div class="space-y-2.5">
            ${data.examples.map(ex => `
              <div class="p-3.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-100/90 dark:border-slate-700/60 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                <div class="flex items-start justify-between gap-3">
                  <div class="font-medium text-sm md:text-base text-slate-900 dark:text-slate-100 leading-relaxed flex-1">
                    ${renderInteractiveSentence(ex.source, data.sourceLanguage, data.input) /* highlightKeyword(ex.source, data.input) */}
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

    // Wrap detailed sections (Meanings, Grammar & Etymology, Related Words) in a collapsible container
    const isDetailsVisible = (activeResultTab === 'all' && !isCompactView) || (activeResultTab === 'details');
    html += `<div id="detailedSections" class="result-section-card ${isDetailsVisible ? '' : 'hidden'} space-y-4 mb-4" data-section="details">`;

    // 3. Meanings Card
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

    // 4. Grammar & Etymology Grid
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
              ${g.plural ? `<div class="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-800"><span class="text-slate-500 font-medium">Çoğul</span><span class="font-semibold text-slate-800 dark:text-slate-100">${escapeHtml(g.plural)}</span></div>` : ''}
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

    // 5. Related Words Chips
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

    // Close detailedSections wrapper
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
            <span>⚡ ${escapeHtml(data._provider || 'LexiBridge Dil Motoru')}</span>
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
        <div class="text-left text-xs text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 max-w-md mx-auto mt-2.5 animate-slide-up shadow-2xs">
          <div class="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
            <i class="ph-bold ph-info text-amber-600 text-sm"></i>
            <span>Akıllı Hibrit Yedek Devrede: ${escapeHtml(data._provider)}</span>
          </div>
          <p class="text-amber-800 text-xs md:text-sm leading-relaxed mb-2">
            Yerel Ollama servisi o sırada yanıt vermediği için sorgunuz otomatik olarak bulut / hızlı yedek motorla çözümlendi.
          </p>
          <details class="text-xs text-slate-600 mt-1 cursor-pointer">
            <summary class="font-semibold text-amber-900 hover:underline">Geliştirici / Termux Ayarları (İsteğe Bağlı)</summary>
            <div class="font-mono bg-white text-slate-800 border border-amber-200 p-2 rounded-lg my-1.5 text-xs select-all break-all leading-normal">
              killall ollama 2>/dev/null; export OLLAMA_ORIGINS="*"; export OLLAMA_HOST="0.0.0.0:11434"; ollama serve &
            </div>
          </details>
        </div>
      `;
    }

    resultsContainer.innerHTML = html;
    resultsContainer.classList.remove('hidden');

    // Attach speech events (supports 1.0x and 0.75x slow audio + pulse feedback)
    resultsContainer.querySelectorAll('.speak-btn').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const rate = parseFloat(b.dataset.rate || '1.0');
        speak(b.dataset.text, b.dataset.lang, rate, b);
      });
    });

    // Attach tab switching events (Cognitive Chunking)
    resultsContainer.querySelectorAll('.result-tab-btn').forEach((tabBtn) => {
      tabBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        activeResultTab = tabBtn.dataset.tab;
        
        // Update tab buttons styles
        resultsContainer.querySelectorAll('.result-tab-btn').forEach((b) => {
          const isActive = b.dataset.tab === activeResultTab;
          b.className = `result-tab-btn flex-1 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            isActive 
              ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-2xs' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`;
        });

        // Show/hide sections
        const sections = resultsContainer.querySelectorAll('.result-section-card');
        sections.forEach((sec) => {
          const secName = sec.dataset.section;
          if (activeResultTab === 'all') {
            if (secName === 'details') {
              sec.classList.toggle('hidden', isCompactView);
            } else {
              sec.classList.remove('hidden');
            }
          } else {
            sec.classList.toggle('hidden', secName !== activeResultTab);
          }
        });
      });
    });

    // Update sticky search bar preview text
    if (stickySearchText) {
      const art = data.grammar?.article ? (data.grammar.article.toLowerCase() + ' ') : '';
      stickySearchText.textContent = `${art}${data.input} — ${mainTrans}`;
    }

    // Attach tap-to-lookup on sentence words
    resultsContainer.querySelectorAll('.lookup-word').forEach((w) => {
      w.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = (w.dataset.word || w.textContent || '').trim().replace(/[.,!?;:"'()]/g, '');
        if (word && word.length > 1) {
          searchInput.value = word;
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
        const shareText = `LexiBridge: ${title}${exText}`;

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

    // Attach compact/detailed toggle
    const toggleDenseBtn = resultsContainer.querySelector('#toggleDenseBtn');
    if (toggleDenseBtn) {
      toggleDenseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isCompactView = !isCompactView;
        localStorage.setItem('lexi_view_mode', isCompactView ? 'compact' : 'detailed');
        renderResult(data);
      });
    }

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
    settingsModal.classList.remove('hidden');
  };
  window.syncSettingsModalUI = updateProviderModalUI;
  window.syncHistoryUI = renderHistory;

  headerProviderBadge.addEventListener('click', window.openSettingsModal);
  settingsBtn.addEventListener('click', window.openSettingsModal);

  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  historyBtn.addEventListener('click', () => {
    renderHistory();
    historyModal.classList.remove('hidden');
  });

  closeHistoryBtn.addEventListener('click', () => {
    historyModal.classList.add('hidden');
  });

  clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('lexi_history');
    renderHistory();
  });

  swapLangBtn.addEventListener('click', toggleLanguage);
  modeToggleBtn.addEventListener('click', toggleQuickMode);
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', window.toggleTheme);
  }

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
    saveStatusText.classList.remove('opacity-0');
    setTimeout(() => {
      saveStatusText.classList.add('opacity-0');
      settingsModal.classList.add('hidden');
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
    if (e.key === 'Escape') {
      if (typeof window.closeSettingsModal === 'function') window.closeSettingsModal();
      if (typeof window.closeHistoryModal === 'function') window.closeHistoryModal();
      if (typeof window.closeFlagModal === 'function') window.closeFlagModal();
    }
  });

  // Sticky Mini Search Bar Scroll & Click Handlers (Fitts's Law Mobile Ergonomics)
  if (stickySearchBar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 240 && resultsContainer && !resultsContainer.classList.contains('hidden')) {
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

  // Run initial setup safely
  try {
    init();
  } catch (err) {
    console.error("LexiBridge init error:", err);
  }
});
