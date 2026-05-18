/**
 * MAI-T1D Resource Hub — Privacy Disclosure
 *
 * Shows a cookie/analytics consent banner.
 * Microsoft Clarity and Google Analytics are only loaded after the user
 * explicitly opts in.  Preference is stored in localStorage so the banner
 * does not reappear on later visits.
 */
;(function () {
  'use strict';

  /* ── Config ──────────────────────────────────────────────────────── */
  var CLARITY_ID = 'wt2guz9ppg';
  var GA_ID      = 'G-SFHVYR3HSS';
  var STORAGE_KEY = 'disclosure_consent';

  /* ── Helpers ─────────────────────────────────────────────────────── */
  function injectScript(src, async, cb) {
    var el = document.createElement('script');
    el.src = src;
    if (async) el.async = true;
    if (cb) el.onload = cb;
    document.head.appendChild(el);
  }

  function loadAnalytics() {
    /* -- Microsoft Clarity -- */
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

    /* -- Google Analytics -- */
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
      /* Remove from DOM after transition to keep markup clean */
      setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 400);
    }
  }

  function accept() {
    setConsent('accepted');
    hideBanner();
    loadAnalytics();
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

  if (consent === 'accepted') {
    loadAnalytics();
    return;
  }

  if (consent === 'declined') {
    return;
  }

  /* No prior consent — banner is already in the DOM via inline HTML,
     we just need to make it visible and wire buttons */
  document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('disclosure-banner');
    if (!banner) return;

    banner.classList.add('visible');

    var btnAccept = banner.querySelector('.btn-accept');
    var btnDecline = banner.querySelector('.btn-decline');
    if (btnAccept) btnAccept.addEventListener('click', accept);
    if (btnDecline) btnDecline.addEventListener('click', decline);
  });
})();
