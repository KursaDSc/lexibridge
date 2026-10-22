/**
 * LexiBridge - Accessibility Layer
 *
 * Keyboard navigation and screen-reader semantics that cannot be expressed
 * with markup alone:
 *   - Roving tabindex for tab bars (WAI-ARIA "tabs with roving tabindex")
 *   - Focus trap + focus restoration for modal dialogs
 *   - Combobox keyboard navigation for the search autocomplete
 *   - Polite live-region announcements for async state changes
 *
 * Design rules:
 *   - Never steal focus unless the user explicitly moved it
 *   - Always restore focus to the trigger when a dialog closes
 *   - Announce only meaningful state changes (not every keystroke)
 */

(function (root) {
  'use strict';

  const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  /** Visible, focusable descendants of a container (skips hidden ones). */
  function getFocusable(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE)).filter(el => {
      if (el.hasAttribute('inert')) return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      // offsetParent is null for display:none; fixed elements report null too,
      // so also check the box for a usable size.
      const rect = el.getBoundingClientRect();
      return rect.width > 0 || rect.height > 0 || el.offsetParent !== null;
    });
  }

  /**
   * Roving tabindex over a set of sibling controls.
   * Only the active item is in the page tab order; arrow keys move focus
   * (and optionally activation) to the next/previous item.
   *
   * @param {HTMLElement} container
   * @param {string} itemSelector  selector matching the items inside container
   * @param {object} [opts]
   * @param {boolean} [opts.autoActivate=true]  activate on arrow navigation
   * @param {string}  [opts.orientation='horizontal'] 'horizontal' | 'vertical' | 'both'
   * @param {function} [opts.onActivate]
   */
  function initRovingTabIndex(container, itemSelector, opts) {
    if (!container) return null;
    const options = Object.assign(
      { autoActivate: true, orientation: 'horizontal', onActivate: null },
      opts || {}
    );

    const items = () => Array.from(container.querySelectorAll(itemSelector));

    function setActive(nextEl, focusIt) {
      // Only the tab order is managed here. Visual state (`.active` class) and
      // `aria-selected` stay owned by the app's own view switcher so the two
      // never fight over the same attribute.
      items().forEach(el => {
        el.setAttribute('tabindex', el === nextEl ? '0' : '-1');
      });
      if (focusIt && nextEl) {
        nextEl.focus();
      }
    }

    function currentIndex() {
      const list = items();
      return list.findIndex(el => el.getAttribute('tabindex') === '0');
    }

    function onKeyDown(e) {
      const list = items();
      if (list.length === 0) return;

      const horiz = options.orientation !== 'vertical';
      const vert = options.orientation !== 'horizontal';

      const prevKey = horiz ? 'ArrowLeft' : null;
      const nextKey = horiz ? 'ArrowRight' : null;
      const prevKeyV = vert ? 'ArrowUp' : null;
      const nextKeyV = vert ? 'ArrowDown' : null;

      const isPrev = e.key === prevKey || e.key === prevKeyV;
      const isNext = e.key === nextKey || e.key === nextKeyV;

      if (!isPrev && !isNext && e.key !== 'Home' && e.key !== 'End') return;

      e.preventDefault();

      let idx = currentIndex();
      if (idx === -1) idx = 0;

      if (e.key === 'Home') idx = 0;
      else if (e.key === 'End') idx = list.length - 1;
      else if (isNext) idx = (idx + 1) % list.length;
      else if (isPrev) idx = (idx - 1 + list.length) % list.length;

      const target = list[idx];
      setActive(target, true);
      if (options.autoActivate && options.onActivate) {
        options.onActivate(target);
      }
    }

    container.addEventListener('keydown', onKeyDown);

    // Normalise initial state: exactly one item tabbable.
    const initial = items().find(el => el.getAttribute('aria-selected') === 'true') || items()[0];
    setActive(initial, false);

    return {
      setActive: (el, focusIt) => setActive(el, focusIt),
      destroy: () => container.removeEventListener('keydown', onKeyDown)
    };
  }

  /**
   * Trap keyboard focus inside a dialog and restore it to the previously
   * focused element when the dialog is dismissed.
   *
   * @param {HTMLElement} dialog
   * @param {object} [opts]
   * @param {boolean} [opts.autoFocus=true]
   * @returns {{destroy: function, focusFirst: function}}
   */
  function createFocusTrap(dialog, opts) {
    if (!dialog) return null;
    const options = Object.assign({ autoFocus: true }, opts || {});
    let previousFocus = null;

    function onKeyDown(e) {
      if (e.key !== 'Tab') return;
      const focusables = getFocusable(dialog);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    function activate() {
      previousFocus = document.activeElement;
      dialog.addEventListener('keydown', onKeyDown);
      if (options.autoFocus) {
        const focusables = getFocusable(dialog);
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          dialog.setAttribute('tabindex', '-1');
          dialog.focus();
        }
      }
    }

    function release() {
      dialog.removeEventListener('keydown', onKeyDown);
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
      previousFocus = null;
    }

    return { activate, release, focusFirst: () => {
      const f = getFocusable(dialog);
      if (f.length) f[0].focus();
    } };
  }

  /**
   * Combobox keyboard support for the search autocomplete.
   *
   * @param {HTMLInputElement} input
   * @param {HTMLElement} listbox
   * @param {function} onSelect  called with the selected element
   */
  function initCombobox(input, listbox, onSelect) {
    if (!input || !listbox) return null;

    let activeIndex = -1;

    function options() {
      return Array.from(listbox.querySelectorAll('.autocomplete-item'));
    }

    function setActive(nextIndex) {
      const list = options();
      if (list.length === 0) {
        activeIndex = -1;
        input.removeAttribute('aria-activedescendant');
        return;
      }
      activeIndex = (nextIndex + list.length) % list.length;
      list.forEach((el, i) => {
        const isActive = i === activeIndex;
        el.setAttribute('aria-selected', isActive ? 'true' : 'false');
        el.classList.toggle('bg-slate-50', isActive);
        el.classList.toggle('dark:bg-slate-800/80', isActive);
        if (isActive) {
          input.setAttribute('aria-activedescendant', el.id);
          if (typeof el.scrollIntoView === 'function') {
            el.scrollIntoView({ block: 'nearest' });
          }
        }
      });
    }

    function close() {
      listbox.classList.add('hidden');
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      activeIndex = -1;
    }

    function open() {
      listbox.classList.remove('hidden');
      input.setAttribute('aria-expanded', 'true');
    }

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', listbox.id);
    input.setAttribute('aria-expanded', 'false');
    listbox.setAttribute('role', 'listbox');
    listbox.setAttribute('aria-label', 'Arama önerileri');

    input.addEventListener('keydown', (e) => {
      const list = options();
      const isOpen = !listbox.classList.contains('hidden');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) { open(); setActive(0); return; }
        setActive(activeIndex + 1);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) { open(); setActive(list.length - 1); return; }
        setActive(activeIndex - 1);
        return;
      }
      if (e.key === 'Enter') {
        if (isOpen && activeIndex >= 0 && list[activeIndex]) {
          e.preventDefault();
          const el = list[activeIndex];
          close();
          if (onSelect) onSelect(el);
        }
        return;
      }
      if (e.key === 'Escape') {
        if (isOpen) {
          e.preventDefault();
          close();
        }
        return;
      }
      if (e.key === 'Tab') {
        close();
      }
    });

    return { open, close, setActive };
  }

  /**
   * Announce a message to screen readers via a polite live region.
   * Creates the region on first use and reuses it afterwards.
   */
  function createAnnouncer() {
    let region = null;

    function ensure() {
      if (region && document.body.contains(region)) return region;
      region = document.createElement('div');
      region.id = 'lexiLiveRegion';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.style.cssText =
        'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;';
      document.body.appendChild(region);
      return region;
    }

    return function announce(message) {
      if (!message) return;
      const el = ensure();
      // Clear first so repeated identical messages are re-announced.
      el.textContent = '';
      window.setTimeout(() => { el.textContent = message; }, 30);
    };
  }

  root.LexiA11y = {
    getFocusable,
    initRovingTabIndex,
    createFocusTrap,
    initCombobox,
    createAnnouncer
  };
})(typeof self !== 'undefined' ? self : this);
