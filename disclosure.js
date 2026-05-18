/**
 * MAI-T1D Resource Hub — Privacy Disclosure
 *
 * Shows a 3-option analytics consent banner:
 *   "Yes to all" — loads both Clarity + GA
 *   "GA only"    — loads Google Analytics only
 *   "No"         — loads nothing
 *
 * Preference is stored in localStorage so the banner does not reappear
 * on later visits.  Old "accepted" values are treated as "all".
 */
;(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────────────── */
  var CLARITY_ID  = 'wt2guz9ppg';
  var GA_ID       = 'G-SFHVYR3HSS';
  var STORAGE_KEY = 'disclosure_consent';

  /* ── Helpers ─────────────────────────────────────────────────────── */
  function injectScript(src, async, cb) {
    var el = document.createElement('script');
    el.src = src;
    if (async) el.async = true;
    if (cb) el.onload = cb;
    document.head.appendChild(el);
  }

  function loadGA() {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    injectScript(
      'https://www.googletagmanager.com/gtag/js?id=' + GA_ID,
      true,
      function () {
        gtag('config', GA_ID);
      }
    );
  }

  function loadClarity() {
    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      /* private browsing — fine, just skip storage */
    }
  }

  function hideBanner() {
    var banner = document.getElementById('disclosure-banner');
    if (banner) {
      banner.classList.remove('visible');
      setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 400);
    }
  }

  /* ── Consent actions ─────────────────────────────────────────────── */
  function acceptAll() {
    setConsent('all');
    hideBanner();
    loadGA();
    loadClarity();
  }

  function acceptGA() {
    setConsent('ga_only');
    hideBanner();
    loadGA();
  }

  function decline() {
    setConsent('declined');
    hideBanner();
  }

  /* ── Bootstrap ───────────────────────────────────────────────────── */
  var consent = null;
  try {
    consent = localStorage.getItem(STORAGE_KEY);
  } catch (_) {}

  /* Backward-compat: old "accepted" → "all" */
  if (consent === 'accepted') {
    loadGA();
    loadClarity();
    return;
  }

  if (consent === 'all') {
    loadGA();
    loadClarity();
    return;
  }

  if (consent === 'ga_only') {
    loadGA();
    return;
  }

  if (consent === 'declined') {
    return;
  }

  /* No prior consent — show banner and wire buttons */
  document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('disclosure-banner');
    if (!banner) return;

    banner.classList.add('visible');

    var btnAll    = banner.querySelector('.btn-accept-all');
    var btnGA     = banner.querySelector('.btn-accept-ga');
    var btnNo     = banner.querySelector('.btn-decline');
    if (btnAll) btnAll.addEventListener('click', acceptAll);
    if (btnGA)  btnGA.addEventListener('click', acceptGA);
    if (btnNo)  btnNo.addEventListener('click', decline);
  });
})();
