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

  // ── State ───────────────────────────────────────────────────────────────
  let sourceLang = 'nl'; // 'nl' | 'tr'
  let isLoading = false;
  let activeProvider = 'google';
  let activeModel = 'gemini-flash-latest';
  let isQuickMode = false;

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
    activeProvider = settings.provider || (settings.isMobile ? 'local' : 'google');
    activeModel = settings.model || (activeProvider === 'local' ? settings.localModel : AIEngine.PROVIDERS[activeProvider]?.default_model);

    googleKeyInput.value = settings.googleKey || AIEngine.SM_STUDIO_KEYS.google;
    nvidiaKeyInput.value = settings.nvidiaKey || AIEngine.SM_STUDIO_KEYS.nvidia;
    localUrlInput.value = settings.localUrl || AIEngine.PROVIDERS.local.default_url;

    updateHeaderBadge();
    updateProviderModalUI();
    renderHistory();

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
          modelDetectionStatus.className = 'text-[11px] mt-1.5 font-medium text-emerald-600';
          modelDetectionStatus.textContent = `✓ Ollama'dan ${installedModels.length} adet yüklü model algılandı.`;
        }
      } else {
        if (!silent && modelDetectionStatus) {
          modelDetectionStatus.className = 'text-[11px] mt-1.5 font-medium text-amber-600';
          modelDetectionStatus.textContent = 'ℹ️ Ollama bağlantısı bulunamadı (Hazır mobil modeller gösteriliyor).';
        } else if (modelDetectionStatus) {
          modelDetectionStatus.classList.add('hidden');
        }
      }
    } catch (e) {
      if (!silent && modelDetectionStatus) {
        modelDetectionStatus.className = 'text-[11px] mt-1.5 font-medium text-red-500';
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
  }

  function toggleQuickMode() {
    isQuickMode = !isQuickMode;
    if (isQuickMode) {
      modeToggleIcon.className = 'ph-bold ph-lightning text-emerald-500';
      modeToggleText.textContent = 'Hızlı REST';
      modeToggleBtn.classList.add('border-emerald-300', 'bg-emerald-50', 'text-emerald-700');
    } else {
      modeToggleIcon.className = 'ph-bold ph-sparkle text-amber-500';
      modeToggleText.textContent = 'Derin AI';
      modeToggleBtn.classList.remove('border-emerald-300', 'bg-emerald-50', 'text-emerald-700');
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

  // ── Pronunciation Audio (SpeechSynthesis) ───────────────────────────────
  function speak(text, lang) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'nl' ? 'nl-NL' : 'tr-TR';
    utterance.rate = 0.9;
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
      historyList.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">Henüz arama geçmişi yok.</div>`;
      return;
    }
    historyList.innerHTML = hist
      .map(
        (h) => `
      <div class="history-item flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors" data-query="${escapeHtml(h.query)}" data-source="${h.source}">
        <div>
          <div class="font-semibold text-xs text-slate-800">${escapeHtml(h.query)}</div>
          <div class="text-[11px] text-slate-500">${escapeHtml(h.translation || '')}</div>
        </div>
        <span class="text-xs text-slate-300 font-mono">${h.source === 'nl' ? '🇳🇱➔🇹🇷' : '🇹🇷➔🇳🇱'}</span>
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
  async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      let data;
      if (isQuickMode) {
        data = await AIEngine.quickTranslateRest(query, sourceLang, sourceLang === 'nl' ? 'tr' : 'nl');
        data._latency = Date.now() - startTime;
        data._provider = 'Google REST (Hızlı Çeviri)';
      } else {
        data = await AIEngine.analyze(query, sourceLang);
        data._latency = Date.now() - startTime;
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

    // 1. Primary Word / Header Card
    let html = `
      <div class="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm animate-slide-up">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">${escapeHtml(data.input)}</h2>
              <button class="speak-btn w-8 h-8 flex items-center justify-center text-primary-600 bg-primary-50 hover:bg-primary-100 active:scale-95 rounded-full transition-all" data-text="${escapeHtml(data.input)}" data-lang="${data.sourceLanguage}">
                <i class="ph-fill ph-speaker-high text-lg"></i>
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2 mt-2">
              ${data.pronunciation?.ipa ? `
                <span class="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/50">
                  ${escapeHtml(data.pronunciation.ipa)}
                </span>
              ` : ''}
              ${data.partOfSpeech ? `
                <span class="text-xs px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-medium">
                  ${escapeHtml(data.partOfSpeech)}
                </span>
              ` : ''}
              ${data.grammar?.article ? `
                <span class="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                  ${escapeHtml(data.grammar.article)}
                </span>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Primary Target Translation -->
        <div class="mt-4 pt-4 border-t border-slate-50 flex items-start gap-2.5">
          <span class="text-xl">${data.targetLanguage === 'tr' ? '🇹🇷' : '🇳🇱'}</span>
          <div class="flex-1">
            <div class="flex flex-wrap items-baseline gap-2">
              <span class="text-xl md:text-2xl font-bold text-slate-900">${escapeHtml(mainTrans)}</span>
              ${data.translations?.[0]?.frequency && data.translations[0].frequency !== 'rare' ? `
                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                  ${data.translations[0].frequency.replace('_', ' ')}
                </span>
              ` : ''}
            </div>
            ${data.translations?.length > 1 ? `
              <div class="flex flex-wrap gap-1.5 mt-2">
                ${data.translations.slice(1).map(t => `
                  <span class="text-xs px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-slate-600">
                    ${escapeHtml(t.text)} ${t.context ? `<span class="text-slate-400 text-[10px]">(${escapeHtml(t.context)})</span>` : ''}
                  </span>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // 2. Meanings Card
    if (data.meanings && data.meanings.length > 0) {
      html += `
        <div class="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm animate-slide-up" style="animation-delay: 0.05s">
          <div class="flex items-center gap-2 mb-3 text-slate-700">
            <i class="ph-bold ph-book-open text-primary-600 text-lg"></i>
            <h3 class="font-bold text-sm text-slate-800">Detaylı Anlamlar & Bağlam</h3>
          </div>
          <div class="space-y-3">
            ${data.meanings.map((m, idx) => `
              <div class="flex items-start gap-3 text-xs leading-relaxed">
                <span class="font-mono text-slate-300 font-bold mt-0.5">${String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <div class="font-semibold text-slate-800">${escapeHtml(m.meaning)}</div>
                  ${m.explanation ? `<div class="text-slate-500 mt-0.5">${escapeHtml(m.explanation)}</div>` : ''}
                  ${m.context ? `<span class="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">${escapeHtml(m.context)}</span>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 3. Examples Card
    if (data.examples && data.examples.length > 0) {
      html += `
        <div class="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm animate-slide-up" style="animation-delay: 0.1s">
          <div class="flex items-center gap-2 mb-3 text-slate-700">
            <i class="ph-bold ph-chat-circle-text text-blue-500 text-lg"></i>
            <h3 class="font-bold text-sm text-slate-800">Doğal Örnek Cümleler</h3>
          </div>
          <div class="space-y-2.5">
            ${data.examples.map(ex => `
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100/80">
                <div class="flex items-center justify-between gap-2">
                  <div class="font-medium text-xs text-slate-800">${escapeHtml(ex.source)}</div>
                  <button class="speak-btn text-slate-400 hover:text-primary-600 p-1" data-text="${escapeHtml(ex.source)}" data-lang="${data.sourceLanguage}">
                    <i class="ph ph-speaker-simple-high text-base"></i>
                  </button>
                </div>
                <div class="text-[11px] text-slate-500 mt-1">${escapeHtml(ex.translation)}</div>
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
      html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up" style="animation-delay: 0.15s">`;

      if (hasGrammar) {
        const g = data.grammar;
        html += `
          <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-xs">
            <div class="flex items-center gap-1.5 mb-2.5 font-bold text-slate-700">
              <i class="ph-bold ph-sparkle text-amber-500 text-base"></i>
              <span>Gramer & Çekim</span>
            </div>
            <div class="space-y-1.5">
              ${g.article ? `<div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">Belirteç (Article)</span><span class="font-bold text-slate-800">${escapeHtml(g.article)}</span></div>` : ''}
              ${g.plural ? `<div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">Çoğul (Plural)</span><span class="font-semibold text-slate-700">${escapeHtml(g.plural)}</span></div>` : ''}
              ${g.infinitive ? `<div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">Mastar (Infinitive)</span><span class="font-semibold text-slate-700">${escapeHtml(g.infinitive)}</span></div>` : ''}
              ${g.register ? `<div class="flex justify-between py-1 border-b border-slate-50"><span class="text-slate-400">Kullanım Düzeyi</span><span class="font-semibold text-slate-700 capitalize">${escapeHtml(g.register)}</span></div>` : ''}
            </div>
          </div>
        `;
      }

      if (hasEtymology) {
        html += `
          <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-xs">
            <div class="flex items-center gap-1.5 mb-2.5 font-bold text-slate-700">
              <i class="ph-bold ph-info text-indigo-500 text-base"></i>
              <span>Etimoloji</span>
            </div>
            <p class="text-slate-600 leading-relaxed">${escapeHtml(data.etymology.summary)}</p>
          </div>
        `;
      }

      html += `</div>`;
    }

    // 5. Related Words Chips
    if (data.relatedWords && data.relatedWords.length > 0) {
      html += `
        <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm animate-slide-up" style="animation-delay: 0.2s">
          <div class="flex items-center gap-1.5 mb-2.5 font-bold text-slate-700 text-xs">
            <i class="ph-bold ph-git-fork text-rose-500 text-base"></i>
            <span>İlişkili Kelimeler & Eş Anlamlılar</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${data.relatedWords.map(rw => `
              <button class="related-chip flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 hover:border-primary-400 hover:text-primary-700 text-xs text-slate-700 transition-colors" data-word="${escapeHtml(rw.word)}">
                <span>${escapeHtml(rw.word)}</span>
                <span class="text-[9px] text-slate-400 uppercase">${rw.relation === 'synonym' ? 'eş' : rw.relation === 'antonym' ? 'zıt' : 'ilişkili'}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 6. Footer Provider Badge & Smart Hybrid Notice
    html += `
      <div class="text-center text-[11px] text-slate-400 pt-1">
        <span>⚡ ${escapeHtml(data._provider || 'SM Studio Engine')}</span>
        ${data._latency ? ` · <span>${data._latency}ms</span>` : ''}
      </div>
    `;

    if (data._fallbackFrom === 'local') {
      const errDetail = data._localError || 'Bağlantı kurulamadı';
      html += `
        <div class="text-left text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200/80 rounded-xl p-3 max-w-md mx-auto mt-2.5 animate-slide-up shadow-2xs">
          <div class="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
            <i class="ph-bold ph-info text-amber-600 text-sm"></i>
            <span>Akıllı Yedek Devrede: ${escapeHtml(data._provider)}</span>
          </div>
          <div class="text-[11px] text-amber-950 font-medium mb-1.5 bg-amber-100/60 p-2 rounded-lg border border-amber-200/50 leading-relaxed">
            🔍 <strong>Ollama Durumu:</strong> ${escapeHtml(errDetail)}
          </div>
          <p class="text-amber-700 leading-relaxed text-[11px]">
            Ollama'yı Termux'ta tarayıcı erişimine tam açmak için:
          </p>
          <div class="font-mono bg-white text-slate-800 border border-amber-200 px-2 py-1 rounded my-1 text-[10px] select-all break-all">
            killall ollama 2>/dev/null; export OLLAMA_ORIGINS="*"; export OLLAMA_HOST="0.0.0.0:11434"; ollama serve &
          </div>
        </div>
      `;
    }

    resultsContainer.innerHTML = html;
    resultsContainer.classList.remove('hidden');

    // Attach speech events
    resultsContainer.querySelectorAll('.speak-btn').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        speak(b.dataset.text, b.dataset.lang);
      });
    });

    // Attach related word click to search
    resultsContainer.querySelectorAll('.related-chip').forEach((b) => {
      b.addEventListener('click', () => {
        searchInput.value = b.dataset.word;
        handleSearch();
      });
    });
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
  headerProviderBadge.addEventListener('click', () => {
    updateProviderModalUI();
    settingsModal.classList.remove('hidden');
  });

  settingsBtn.addEventListener('click', () => {
    updateProviderModalUI();
    settingsModal.classList.remove('hidden');
  });

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

  // Quick seed buttons
  document.querySelectorAll('.seed-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (sourceLang !== 'nl') toggleLanguage();
      searchInput.value = chip.textContent.trim();
      searchBtn.disabled = false;
      clearBtn.classList.remove('hidden');
      handleSearch();
    });
  });

  // ── Local Server Heartbeat & Auto-Shutdown on Tab Close ──────────────────
  function setupLocalServerLifecycle() {
    const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
    if (!isLocal) return;

    // Send immediate heartbeat on load
    fetch('/api/heartbeat').catch(() => {});

    // Periodic heartbeat every 3 seconds
    setInterval(() => {
      fetch('/api/heartbeat').catch(() => {});
    }, 3000);

    // Send shutdown request when browser tab is closed or navigated away
    function sendShutdown() {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/shutdown');
      } else {
        fetch('/api/shutdown', { method: 'POST', keepalive: true }).catch(() => {});
      }
    }

    window.addEventListener('pagehide', sendShutdown);
    window.addEventListener('beforeunload', sendShutdown);
  }

  // Run initial setup
  setupLocalServerLifecycle();
  init();
});
