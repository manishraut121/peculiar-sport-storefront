/* OneCurve — reCAPTCHA v3 helper (bot protection).
 *
 * Loads the reCAPTCHA script ONLY if a site key is configured via
 * <meta name="recaptcha-key" content="...">. getToken(action) resolves to a
 * token string, or '' when reCAPTCHA isn't configured — so the storefront and
 * rep console keep working without it (e.g. local/demo).
 *
 * The matching SECRET is verified server-side:
 *   - Netlify function create-order.js  (RECAPTCHA_SECRET env var)
 *   - Apps Script  doPost               (RECAPTCHA_SECRET config var)
 */
(function () {
  function key() {
    var m = document.querySelector('meta[name="recaptcha-key"]');
    return m && m.content ? m.content.trim() : '';
  }
  var requested = false;
  function load() {
    var k = key();
    if (!k || requested) return;
    requested = true;
    var s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(k);
    s.async = true;
    document.head.appendChild(s);
  }
  function getToken(action) {
    var k = key();
    if (!k) return Promise.resolve('');
    return new Promise(function (resolve) {
      var tries = 0;
      (function wait() {
        if (typeof grecaptcha !== 'undefined' && grecaptcha.execute) {
          grecaptcha.ready(function () {
            grecaptcha.execute(k, { action: action })
              .then(function (t) { resolve(t || ''); })
              .catch(function () { resolve(''); });
          });
        } else if (tries++ < 40) {
          setTimeout(wait, 100); // script still loading (≤4s)
        } else {
          resolve(''); // give up gracefully
        }
      })();
    });
  }
  if (document.readyState !== 'loading') load();
  else document.addEventListener('DOMContentLoaded', load);
  window.OneCurveRecaptcha = { getToken: getToken, siteKey: key };
})();
