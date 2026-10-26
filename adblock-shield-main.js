/*
 * This file is part of TuBlock (a derivative work based on AdBlock).
 *
 * Copyright (C) 2026 Nguyễn Hoàng Tuấn Tú <its.nhtt@gmail.com>
 *
 * TuBlock is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * TuBlock is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * TuBlock Shield - Anti-Circumvention, Anti-Popunder, Click-Shield & First-Party Ad Defuser
 * Injected in MAIN world at document_start to run before all web page scripts.
 */
(() => {
  'use strict';

  // 0. Safety Guard for React / Next.js / Vue Virtual DOM reconciliation
  // Prevents "NotFoundError: The node to be removed is not a child of this node" crashes
  try {
    const origRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function(child) {
      if (child && child.parentNode !== this) {
        return child;
      }
      return origRemoveChild.apply(this, arguments);
    };

    const origInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function(newNode, referenceNode) {
      if (referenceNode && referenceNode.parentNode !== this) {
        return this.appendChild(newNode);
      }
      return origInsertBefore.apply(this, arguments);
    };
  } catch(e) {}

  // 0.5 Popunder Event Listener Guardian
  // Blocks scripts from hijacking click/mousedown/pointerdown with popunder timers or tab-under mechanics
  try {
    const origAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if ((type === 'click' || type === 'mousedown' || type === 'pointerdown') && typeof listener === 'function') {
        try {
          const fnStr = Function.prototype.toString.call(listener);
          // 1. Signature check for known popunder engines & variables
          const hasPopunderSignature = /lastPopunderTime|openUntil|acquirecardedsullen|badlandlispyippee|POPUNDER_INTERVAL|__PPU_SESSION_|popunder-last-shown|popunderAd|popads|propeller|adsterra|exoclick|clickadu|juicyads|hilltop|popcash|xnPopSeen/i.test(fnStr);
          // 2. Generic Tab-Under mechanical signature: function combines window.open with location navigation
          const hasTabUnderMechanic = (fnStr.includes('window.open') || fnStr.includes('.open(')) && 
                                     (fnStr.includes('location.assign') || fnStr.includes('location.replace') || fnStr.includes('location.href'));

          if (hasPopunderSignature || hasTabUnderMechanic) {
            console.warn('[AdBlockShield] Neutralized popunder/tabunder event listener:', type);
            return;
          }
        } catch(err) {}
      }
      return origAddEventListener.apply(this, arguments);
    };
  } catch(e) {}

  // Safe DOM hiding utility — NEVER call node.remove() on React-managed nodes!
  function hideSafely(node) {
    if (!node || !node.style) return;
    // CRITICAL SAFEGUARD: Never hide real media players or their container wrappers
    if (node.id === 'player' || (node.classList && (node.classList.contains('player-wrapper') || node.classList.contains('plyr') || node.classList.contains('plyr--video')))) {
      return;
    }
    try {
      node.style.setProperty('display', 'none', 'important');
      node.style.setProperty('visibility', 'hidden', 'important');
      node.style.setProperty('pointer-events', 'none', 'important');
      node.style.setProperty('opacity', '0', 'important');
      node.style.setProperty('z-index', '-99999', 'important');
      node.style.setProperty('position', 'absolute', 'important');
      node.style.setProperty('width', '0px', 'important');
      node.style.setProperty('height', '0px', 'important');
      node.style.setProperty('overflow', 'hidden', 'important');
      node.setAttribute('aria-hidden', 'true');
    } catch(e) {}
  }

  // 1. Site-Specific & Generic VIP / Ad-Free LocalStorage Flags
  // Defuses site-native ad hooks like chophim.app useShouldShowBanners, popunder-last-shown, and xnhau lastPopunderTime
  try {
    const forever = String(Date.now() + 315360000000); // 10 years in future
    const maxPopInfo = JSON.stringify({ hit: 999999, updatetime: Date.now() + 315360000000, currentDate: Date.now() + 315360000000 });

    window.localStorage.setItem('chophim:popunder-last-shown', forever);
    window.localStorage.setItem('popunder-last-shown', forever);
    window.localStorage.setItem('chophim:banner-blocked-until', forever);
    window.localStorage.setItem('chophim:popup-ad-dismissed-until', forever);
    window.localStorage.setItem('banner-blocked-until', forever);
    window.localStorage.setItem('popup-ad-dismissed-until', forever);
    window.localStorage.setItem('lastPopunderTime', forever);
    window.localStorage.setItem('xnPopSeen', '999999');
    window.localStorage.setItem('__PPU_ppucnt', '999999');
    window.localStorage.setItem('__ppu_seen', '999999');
    window.localStorage.setItem('pop_seen', forever);
    window.localStorage.setItem('popunder', maxPopInfo);
    window.localStorage.setItem('popwatch', maxPopInfo);

    // Host-specific pre-seeding (e.g. ghienphimz.life, coiphim.show, etc.)
    const currentHost = window.location.host;
    if (currentHost) {
      ['popupfullv2', 'popupfullv2_2', 'popupfullv2_3', 'popupfull', 'popunder', 'popwatch'].forEach(k => {
        try {
          if (k.includes('popunder') || k.includes('popwatch')) {
            window.localStorage.setItem(currentHost + '_' + k, maxPopInfo);
          } else {
            window.localStorage.setItem(currentHost + '_' + k, forever);
          }
        } catch(err) {}
      });
    }

    // Dynamic Storage proxy to falsify any popup/ad interval or frequency check automatically
    const origGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key) {
      if (typeof key === 'string') {
        if (/(_popupfull|popunder|popwatch|popup_seen|ad_seen|lastPopunder|banner-blocked|popup-ad-dismissed)/i.test(key)) {
          if (/popunder|popwatch/i.test(key)) {
            return JSON.stringify({ hit: 999999, updatetime: Date.now() + 315360000000, currentDate: Date.now() + 315360000000 });
          }
          return String(Date.now() + 315360000000);
        }
      }
      return origGetItem.apply(this, arguments);
    };

    window.dispatchEvent(new Event('chophim:banner-blocked'));
    window.dispatchEvent(new Event('chophim:popup-ads-dismissed'));
  } catch(e) {}

  // 1.5 Neuter streaming site ad/popup caller functions globally
  try {
    window.popupWatchButton = function() {};
  } catch(e) {}

  // 2. Comprehensive Spam / Gambling / Ad Patterns
  const SPAM_PATTERNS = [
    /\b\d{1,3}bet\w*/i, // 11bet, 789bet, 88bet, 188bet...
    /\b789b\w*/i,       // 789b668.me...
    /\b(cm88|hb88|ok88|mb66|sumvip|sumpro|sumclub|78win|fc88|qq88|hi88|s8|i9|i9bet|i9\.top|iwin|b52|sunwin|go88|go8|rikvip|kubet|thabet|shbet|new88|jun88|fb88|w88|bk8|dafabet|m88|fun88|v9bet|fabet|u888|ad88|ok9|ok999|ok9vip|tin888|tinv888|bom88|188lux|vsbet|6789x|mv66|vuabet|vuabet88|ai88|ai88bet|3bet|treeb|hitclub|soc88|may88|sin88|red88|debett|zbet|oxbet|five88|lucky88|sky88|dabet|sv88|ta88|nbet|uk88|f8bet|ee88|tk88|onbet|vn88|vg99|mu9|qh88|qqlive|chola|79king|k9win|mig8|antlive)\w*/i,
    /\b(keonhacai|nhacai|soikeo|tylekeo|bongda|cacuoc|casino|nohu|taixiu|xocdia|banca|slot|cuoc|cược|lixi|quayhu|linknhacai)\b/i,
    /\b(linkroyal|workers\.dev\/chophim|workers\.dev\/book|tinyurl\.com|bit\.ly|hpasoj|154\.82\.|adready\.vip|thlink\.cc)/i,
    /(linkvertise|ouo\.io|ouo\.press|megaurl|shorturl|1short|traffic|adbull|shrinke|exe\.io)/i,
    /(adsterra|popads|propellerads|clickadu|yllix|exoclick|trafficstars|juicyads|hilltopads|popcash|acquirecardedsullen|badlandlispyippee|astonishlandmass)/i,
    /(delivery|syndication|revenue|onclick|popunder|clickserve)/i,
    /\/ads\/(cat-|pop-|.*banner|.*gif|.*mp4|78win|78-new)/i,
    /(newbanner|newbanner2025|newbanner2026|i9new|treeb|bonew|vuanew|ainew|gogonew|hinew|svnew|Lu728x90|GO8-|okok\d+|m66\d+x\d+)/i,
    /quang[\s_-]*cao/i,
    /track(er|ing)?\./i
  ];

  function isSpamUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed === '' || trimmed === 'about:blank' || trimmed.startsWith('javascript:')) {
      return false;
    }
    for (const pat of SPAM_PATTERNS) {
      if (pat.test(trimmed)) return true;
    }
    return false;
  }

  // 3. Early CSS Injection for Instant Hiding of First-Party & Floating Ads
  function injectAntiAdStyles() {
    try {
      const style = document.createElement('style');
      style.textContent = `
        /* First-party ad media & links on streaming sites */
        img[src*="/ads/"],
        video[src*="/ads/"],
        source[src*="/ads/"],
        img[src*="cm88"],
        video[src*="cm88"],
        source[src*="cm88"],
        img[src*="newbanner"],
        img[src*="i9new"],
        img[src*="treeb"],
        img[src*="bonew"],
        img[src*="vuanew"],
        img[src*="ainew"],
        img[src*="gogonew"],
        img[src*="hinew"],
        img[src*="svnew"],
        img[src*="Lu728x90"],
        img[src*="GO8-"],
        img[src*="okok"],
        img[src*="m66"],
        img[src*="ok9viplogo"],
        /* Background image ad banners by attribute */
        [style*="newbanner"],
        [style*="i9new"],
        [style*="bonew"],
        [style*="m66"],
        [style*="okok"],
        [style*="treeb"],
        /* Modal popups, dialogs & promotion backdrops */
        .promotion-popup,
        .promotion-popup-content,
        .btn-promotion-close,
        .first-pop,
        .second-pop,
        .third-pop,
        .mimic-wrapper:has(.btn-goto-lixi),
        .popup:has(img[alt*="No Ads" i]),
        .no-ads,
        /* Floating banners & catfishes (all tiers) */
        .ad-floater,
        .adbot,
        .tier-2, .tier-3, .tier-4, .tier-5, .tier-6, .tier-7, .tier-8, .tier-9, .tier-10,
        /* In-page component ads & sponsor blocks */
        .component.ads,
        .ads.pc,
        .ads.normal,
        .ads.landscape,
        .ads.group,
        .partner-me,
        .guideline.partner,
        /* Popunder links & invisible traps */
        .popunder-link,
        a[aria-label*="popunder" i],
        a[class*="popunder"],
        /* Video TVC & ad player overlays */
        .video-ad-layer,
        .video-ad,
        .btn-video-ad,
        .btn-skip-video,
        /* Betting & affiliate links by href */
        a[href*="/ads/"],
        a[href*="cm88"],
        a[href*="789b"],
        a[href*="11bet"],
        a[href*="fc88"],
        a[href*="qq88"],
        a[href*="hi88"],
        a[href*="78win"],
        a[href*="linkroyal"],
        a[href*="tinyurl.com/"],
        a[href*="bit.ly/"],
        a[href*="hpasoj"],
        a[href*="154.82."],
        a[href*="bet88"],
        a[href*="kubet"],
        a[href*="shbet"],
        a[href*="fb88"],
        a[href*="w88"],
        a[href*="new88"],
        a[href*="jun88"],
        a[href*="ok9"],
        a[href*="tin888"],
        a[href*="bom88"],
        a[href*="188lux"],
        a[href*="vsbet"],
        a[href*="6789x"],
        a[href*="mv66"],
        a[href*="vuabet"],
        a[href*="ai88"],
        a[href*="3bet"],
        a[href*="go8"],
        a[href*="i9bet"],
        a[href*="i9.top"],
        /* Modal popups & banners by ID / attributes */
        [id*="-fixed-bottom-slot"],
        [id*="-bottom-banner"],
        [id*="demo-"][id*="-banner-"],
        [id*="demo-"][id*="-popup-"],
        [id*="banner_floating"],
        [aria-label*="quang cao" i],
        [aria-label*="quảng cáo" i],
        [aria-label*="Mo quang cao" i],
        section[aria-label="Demo popup quang cao"],
        div.fixed.inset-0.z-\\[90\\],
        div[id*="ad-bottom-fixed"],
        div[class*="ad_fixed_bottom"],
        div[class*="floating-banner"],
        div[id*="floating-banner"],
        .video-ad-wrap,
        .fxMidWrap:has(a[href*="cm88"]),
        .fxMidWrap:has(a[href*="qq88"]),
        .fxMidWrap:has(a[href*="hi88"]),
        .spot:has(a[href*="cm88"]),
        .spot:has(.video-ad-wrap),
        .spot:has(video.fxMid),
        /* Parent containers wrapping ad anchors (scoped strictly away from media players) */
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="cm88"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="789b"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="linkroyal"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="tinyurl.com"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="bit.ly"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="11bet"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="fc88"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="qq88"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="hi88"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="78win"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="hpasoj"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="154.82."]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="ok9"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="tin888"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="bom88"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="go8"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="vuabet"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="188lux"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="6789x"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="ai88"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="mv66"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="i9bet"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> a[href*="3bet"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> img[src*="/ads/"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> video[src*="/ads/"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> video:has(source[src*="/ads/"])),
        div:not(.player-wrapper):not(:has(video#player)):has(> video:has(source[src*="cm88"])),
        div:not(.player-wrapper):not(:has(video#player)):has(> img[src*="newbanner"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> img[src*="okok"]),
        div:not(.player-wrapper):not(:has(video#player)):has(> img[src*="treeb"]),
        /* Stream Guard AdBlock notice modal / overlay neutralization */
        .stream-guard:not([data-session-lock="true"]) {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
          width: 0 !important;
          min-width: 0 !important;
          max-width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          opacity: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
        }

        /* CRITICAL OVERRIDE: Guarantee real video player containers are ALWAYS visible */
        .player-wrapper,
        .player-wrapper #player,
        .player-wrapper .plyr,
        .player-wrapper .plyr--video,
        .player-wrapper .plyr__video-wrapper {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          position: relative !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    } catch(e) {}
  }
  if (document.documentElement) injectAntiAdStyles();
  else document.addEventListener('DOMContentLoaded', injectAntiAdStyles, { once: true });

  // 4. Monkey-patch window.open (Kill popunders & spam redirects)
  let lastSameOriginOpenTime = 0;
  const realOpen = window.open;
  window.open = function(url, target, features) {
    if (url && typeof url === 'string') {
      if (isSpamUrl(url)) {
        console.warn('[AdBlockShield] Blocked popunder window.open to:', url);
        return null;
      }
      try {
        if (url.startsWith('http')) {
          const u = new URL(url, location.href);
          if (u.hostname !== location.hostname) {
            const isStreamingSite = /xnhau|chophim|phim|tube|sex|porn|hentai|anime|manga|truyen|bongda/i.test(location.hostname);
            if (isStreamingSite || isSpamUrl(u.hostname) || isSpamUrl(u.href)) {
              console.warn('[AdBlockShield] Blocked external window.open from streaming site to:', url);
              return null;
            }
          } else if (u.href === location.href || u.pathname === location.pathname) {
            // Track potential Tab-Under inversion attempts
            lastSameOriginOpenTime = Date.now();
          }
        }
      } catch(e) {}
    }
    if (!url || url === 'about:blank') {
      const win = realOpen.call(window, 'about:blank', target, features);
      if (win) {
        try {
          Object.defineProperty(win, 'location', {
            get() { return window.location; },
            set(newUrl) {
              if (isSpamUrl(newUrl)) {
                console.warn('[AdBlockShield] Blocked deferred popup redirect to:', newUrl);
                try { win.close(); } catch(e) {}
              } else {
                try {
                  const u = new URL(newUrl, location.href);
                  if (u.hostname !== location.hostname && (/xnhau|chophim|phim|tube|sex|porn|hentai|anime|manga|truyen|bongda/i.test(location.hostname) || isSpamUrl(u.hostname))) {
                    console.warn('[AdBlockShield] Blocked deferred external popup to:', newUrl);
                    try { win.close(); } catch(e) {}
                    return;
                  }
                } catch(e) {}
                win.location.href = newUrl;
              }
            }
          });
        } catch(e) {}
      }
      return win;
    }
    return realOpen.apply(this, arguments);
  };

  // 4.5 Monkey-patch window.location.assign & replace (Kill Tab-Under redirects)
  try {
    const origAssign = window.location.assign;
    window.location.assign = function(url) {
      if (isSpamUrl(url)) {
        console.warn('[AdBlockShield] Blocked location.assign to spam/ad:', url);
        return;
      }
      try {
        if (url && typeof url === 'string' && url.startsWith('http')) {
          const u = new URL(url, location.href);
          if (u.hostname !== location.hostname) {
            const isMediaSite = /xnhau|chophim|phim|tube|sex|porn|hentai|anime|manga|truyen|bongda/i.test(location.hostname);
            if (isMediaSite || isSpamUrl(u.hostname) || isSpamUrl(u.href) || Date.now() - lastSameOriginOpenTime < 1000) {
              console.warn('[AdBlockShield] Blocked external location.assign from media site / tab-under:', url);
              return;
            }
          }
        }
      } catch(e) {}
      return origAssign.apply(window.location, arguments);
    };

    const origReplace = window.location.replace;
    window.location.replace = function(url) {
      if (isSpamUrl(url)) {
        console.warn('[AdBlockShield] Blocked location.replace to spam/ad:', url);
        return;
      }
      try {
        if (url && typeof url === 'string' && url.startsWith('http')) {
          const u = new URL(url, location.href);
          if (u.hostname !== location.hostname) {
            const isMediaSite = /xnhau|chophim|phim|tube|sex|porn|hentai|anime|manga|truyen|bongda/i.test(location.hostname);
            if (isMediaSite || isSpamUrl(u.hostname) || isSpamUrl(u.href) || Date.now() - lastSameOriginOpenTime < 1000) {
              console.warn('[AdBlockShield] Blocked external location.replace from media site / tab-under:', url);
              return;
            }
          }
        }
      } catch(e) {}
      return origReplace.apply(window.location, arguments);
    };
  } catch(e) {}

  // 5. Monkey-patch HTMLAnchorElement.prototype.click & HTMLFormElement.prototype.submit (Kill synthetic clicks & submits)
  const realAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function() {
    const href = this.href || '';
    if (isSpamUrl(href)) {
      console.warn('[AdBlockShield] Blocked programmatic click on spam anchor:', href);
      return;
    }
    if (this.target === '_blank' && href.startsWith('http')) {
      try {
        const u = new URL(href);
        if (u.hostname !== location.hostname && isSpamUrl(u.hostname)) {
          console.warn('[AdBlockShield] Blocked synthetic click to external ad:', href);
          return;
        }
      } catch(e) {}
    }
    return realAnchorClick.apply(this, arguments);
  };

  try {
    const realFormSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function() {
      const action = this.action || '';
      if (isSpamUrl(action)) {
        console.warn('[AdBlockShield] Blocked programmatic submit on spam form:', action);
        return;
      }
      return realFormSubmit.apply(this, arguments);
    };
  } catch(e) {}

  // 6. Capture Phase Click Guardian: Prevent Click-Hijacking on Window/Document
  document.addEventListener('click', (e) => {
    let el = e.target;
    while (el && el !== document.documentElement) {
      if (el.tagName === 'A' && el.href) {
        if (isSpamUrl(el.href)) {
          console.warn('[AdBlockShield] Neutralized click on spam link:', el.href);
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
        }
      }
      el = el.parentElement;
    }
  }, true);

  // 7. Anti-Adblock & Stream Guard Defuser (Multi-Layer Protection)
  try {
    // 7.1 Legacy detector honeypots (Sitexw FuckAdBlock / BlockAdBlock / canRunAds)
    Object.defineProperties(window, {
      canRunAds: { value: true, writable: false, configurable: true },
      isAdBlocked: { value: false, writable: false, configurable: true },
      adblock: { value: false, writable: false, configurable: true },
      adblockEnabled: { value: false, writable: false, configurable: true },
      adsBlocked: { value: false, writable: false, configurable: true },
      showAds: { value: true, writable: false, configurable: true }
    });

    const noopFn = () => {};
    const fakeDetector = {
      check: noopFn,
      clearEvent: noopFn,
      on: (isDetected, cb) => {
        if (!isDetected && typeof cb === 'function') {
          try { cb(); } catch(e) {}
        }
      },
      onDetected: noopFn,
      onNotDetected: (cb) => {
        if (typeof cb === 'function') {
          try { cb(); } catch(e) {}
        }
      }
    };
    window.fuckAdBlock = fakeDetector;
    window.blockAdBlock = fakeDetector;
    window.FuckAdBlock = function() { return fakeDetector; };
    window.BlockAdBlock = function() { return fakeDetector; };

    // 7.2 Stream Guard Bootstrap Defuser (Neutralize anti_adblock at source)
    function sanitizeBootstrapConfig(val) {
      if (!val || typeof val !== 'string') return val;
      if (val.includes('"browserGuard"') || val.includes('anti_adblock') || val.includes('detect_devtools')) {
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === 'object') {
            if (parsed.browserGuard && typeof parsed.browserGuard === 'object') {
              parsed.browserGuard.anti_adblock = false;
              parsed.browserGuard.detect_devtools = false;
              return JSON.stringify(parsed);
            }
          }
        } catch(e) {}
      }
      return val;
    }

    // Intercept JSON.parse so any parsed bootstrap object has anti_adblock: false
    const origJsonParse = JSON.parse;
    JSON.parse = function(text, reviver) {
      const res = origJsonParse.apply(this, arguments);
      if (res && typeof res === 'object' && res.browserGuard && typeof res.browserGuard === 'object') {
        res.browserGuard.anti_adblock = false;
        res.browserGuard.detect_devtools = false;
      }
      return res;
    };

    // Intercept #stream-bootstrap script textContent getter and setter
    const scriptProto = HTMLScriptElement.prototype;
    const nodeProto = Node.prototype;
    const origTextDesc = Object.getOwnPropertyDescriptor(scriptProto, 'textContent') ||
                         Object.getOwnPropertyDescriptor(nodeProto, 'textContent');

    if (origTextDesc && origTextDesc.set && origTextDesc.get) {
      Object.defineProperty(scriptProto, 'textContent', {
        get() {
          const val = origTextDesc.get.call(this);
          if (this.id === 'stream-bootstrap') {
            return sanitizeBootstrapConfig(val);
          }
          return val;
        },
        set(val) {
          if (this.id === 'stream-bootstrap') {
            val = sanitizeBootstrapConfig(val);
          }
          return origTextDesc.set.call(this, val);
        },
        configurable: true,
        enumerable: true
      });
    }

    // Sanitize immediately if #stream-bootstrap already present in DOM
    const existingBootstrap = document.getElementById('stream-bootstrap');
    if (existingBootstrap && existingBootstrap.textContent) {
      existingBootstrap.textContent = sanitizeBootstrapConfig(existingBootstrap.textContent);
    }

    // 7.3 Stream Guard CSS Probe Defuser (Proxy getComputedStyle & getBoundingClientRect)
    const AD_PROBE_REGEX = /adsbox|adsbygoogle|pub_300x250|ad_container|ad-banner|ad-placement|ad_leaderboard/i;

    const origGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = function(el, pseudo) {
      const style = origGetComputedStyle.apply(this, arguments);
      if (el && el.className && typeof el.className === 'string' && AD_PROBE_REGEX.test(el.className)) {
        return new Proxy(style, {
          get(target, prop) {
            if (prop === 'display' && target.display === 'none') return 'block';
            if (prop === 'visibility' && (target.visibility === 'hidden' || target.visibility === 'collapse')) return 'visible';
            if (prop === 'opacity' && target.opacity === '0') return '1';
            return Reflect.get(target, prop);
          }
        });
      }
      return style;
    };

    const origGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
      const rect = origGetBoundingClientRect.apply(this, arguments);
      if (this.className && typeof this.className === 'string' && AD_PROBE_REGEX.test(this.className)) {
        if (rect.width < 1 || rect.height < 1) {
          return {
            x: -10000,
            y: 0,
            width: 2,
            height: 2,
            top: 0,
            right: -9998,
            bottom: 2,
            left: -10000,
            toJSON() { return this; }
          };
        }
      }
      return rect;
    };

    // 7.4 Stream Guard & Malicious Ad Script Neutralizer (Simulate ad_header.js & drop ad scripts)
    const origScriptSrcDesc = Object.getOwnPropertyDescriptor(scriptProto, 'src');
    if (origScriptSrcDesc && origScriptSrcDesc.set && origScriptSrcDesc.get) {
      Object.defineProperty(scriptProto, 'src', {
        get() {
          return origScriptSrcDesc.get.call(this);
        },
        set(url) {
          if (typeof url === 'string') {
            if (/minijumb\.js|adsview\.js/i.test(url)) {
              console.warn('[AdBlockShield] Neutralized malicious ad script execution:', url);
              return;
            }
            if (/ad_header\.js/i.test(url)) {
              const verMatch = url.match(/ver=([a-zA-Z0-9_-]+)/);
              const ver = verMatch ? verMatch[1] : 'guard-7';
              this.setAttribute('data-stream-check', ver);
              setTimeout(() => {
                if (typeof this.onload === 'function') {
                  try { this.onload(new Event('load')); } catch(e) {}
                }
                this.dispatchEvent(new Event('load'));
              }, 0);
            }
          }
          return origScriptSrcDesc.set.call(this, url);
        },
        configurable: true,
        enumerable: true
      });
    }

    if (typeof window.fetch === 'function') {
      const origFetch = window.fetch;
      window.fetch = function(input, init) {
        const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
        if (typeof url === 'string' && /ad_header\.js/i.test(url)) {
          const verMatch = url.match(/ver=([a-zA-Z0-9_-]+)/);
          const ver = verMatch ? verMatch[1] : 'guard-7';
          return Promise.resolve(new Response(
            `/* stream-guard-probe:7 */ document.currentScript.setAttribute("data-stream-check", "${ver}");`,
            {
              status: 200,
              statusText: 'OK',
              headers: { 'Content-Type': 'application/javascript' }
            }
          ));
        }
        return origFetch.apply(this, arguments);
      };
    }

    // 7.5 DevTools Session Lock Neutralizer (Protect against persistent session lock)
    if (window.sessionStorage) {
      const origSessionGet = Storage.prototype.getItem;
      const origSessionSet = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) {
        if (key === 'stream-guard:devtools-session-lock:v1') {
          return null;
        }
        return origSessionGet.apply(this, arguments);
      };
      Storage.prototype.setItem = function(key, val) {
        if (key === 'stream-guard:devtools-session-lock:v1') {
          return;
        }
        return origSessionSet.apply(this, arguments);
      };
    }

    // 7.6 Cross-frame Message Guard (Parent <-> Iframe handshake protection)
    window.addEventListener('message', (e) => {
      try {
        if (e && e.data && typeof e.data === 'object' && e.data.type === 'stream-parent-state') {
          if (e.data.parentAdblock === 'blocked') {
            e.data.parentAdblock = 'clear';
          }
        }
      } catch(err) {}
    }, true);

  } catch(e) {
    console.warn('[AdBlockShield] Anti-adblock defuser setup warning:', e);
  }

  // 8. Continuous DOM Cleaner: Target First-Party Ad Components & Overlays Safely
  function cleanAdsAndOverlays() {
    // A. Clean ad images, videos, and their containers
    document.querySelectorAll('img[src*="/ads/"], video[src*="/ads/"], img[src*="cm88"], video[src*="cm88"], source[src*="cm88"], source[src*="/ads/"], img[src*="newbanner"], img[src*="i9new"], img[src*="treeb"], img[src*="bonew"], img[src*="vuanew"], img[src*="ainew"], img[src*="gogonew"], img[src*="hinew"], img[src*="svnew"], img[src*="Lu728x90"], img[src*="GO8-"], img[src*="okok"], img[src*="m66"], img[src*="ok9viplogo"]').forEach(media => {
      const target = media.tagName === 'SOURCE' ? (media.parentElement || media) : media;
      hideSafely(target);
      let p = target.parentElement;
      if (p && (p.tagName === 'A' || p.tagName === 'DIV' || p.tagName === 'SECTION')) {
        hideSafely(p);
        if (p.parentElement && p.parentElement.children.length === 1) {
          hideSafely(p.parentElement);
        }
      }
      const wrap = target.closest && target.closest('.video-ad-wrap, .fxMidWrap, .ad-floater, .adbot, .component.ads, .promotion-popup');
      if (wrap) hideSafely(wrap);
    });

    // B. Clean ad links by href and their modal/wrapper ancestors
    document.querySelectorAll('a').forEach(a => {
      const href = a.href || '';
      if (isSpamUrl(href)) {
        hideSafely(a);
        const modalWrap = a.closest && a.closest('.promotion-popup, .promotion-popup-content, .ad-floater, .adbot, .component.ads, .video-ad-wrap, .fxMidWrap');
        if (modalWrap) {
          hideSafely(modalWrap);
        }
        if (a.parentElement && a.parentElement.children.length <= 2) {
          hideSafely(a.parentElement);
          if (a.parentElement.parentElement && (a.parentElement.parentElement.classList.contains('promotion-popup') || a.parentElement.parentElement.classList.contains('ad-floater'))) {
            hideSafely(a.parentElement.parentElement);
          }
        }
      }
    });

    // C. Clean ad slots by ID, class & aria-label & Stream Guard ad notice
    document.querySelectorAll('.promotion-popup, .promotion-popup-content, .ad-floater, .adbot, .popunder-link, .component.ads, .ads.pc, .ads.normal, .ads.landscape, .no-ads, [id*="bottom-slot"], [id*="bottom-banner"], [id*="banner-728x90"], .video-ad-wrap, .stream-guard:not([data-session-lock="true"]), [aria-label*="quang cao" i], [aria-label*="quảng cáo" i]').forEach(el => {
      hideSafely(el);
    });

    // D. Clean elements with inline background-image pointing to ad media
    document.querySelectorAll('[style*="background-image"], [style*="background:"]').forEach(el => {
      const style = el.getAttribute('style') || '';
      if (/newbanner|i9new|bonew|m66|treeb|okok/i.test(style)) {
        hideSafely(el);
        const parentPop = el.closest && el.closest('.promotion-popup, .ad-floater');
        if (parentPop) hideSafely(parentPop);
      }
    });

    // E. Clean transparent click shields
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    document.querySelectorAll('div, a, span, section').forEach(node => {
      if (node === document.body || node === document.documentElement) return;
      if (node.hasAttribute('data-ab-shield-checked')) return;
      node.setAttribute('data-ab-shield-checked', '1');

      try {
        const style = window.getComputedStyle(node);
        const pos = style.position;
        if (pos !== 'fixed' && pos !== 'absolute') return;

        const z = parseInt(style.zIndex, 10);
        if (isNaN(z) || z < 100) return;

        if (node.querySelector('video') || node.tagName === 'VIDEO') return;

        const rect = node.getBoundingClientRect();
        const isBig = rect.width >= vw * 0.5 && rect.height >= vh * 0.4;
        const opacity = parseFloat(style.opacity);
        const text = (node.innerText || '').trim();

        if (text.length > 20 && !SPAM_PATTERNS.some(p => p.test(text))) return;
        if (node.querySelector('input, form, button[type="submit"]')) return;

        const isTrulyTransparent = opacity === 0 || (opacity <= 0.05 && text.length === 0 && node.children.length === 0);
        const isSpamLink = node.tagName === 'A' && isSpamUrl(node.href);

        if (isSpamLink || (isTrulyTransparent && z >= 1000)) {
          hideSafely(node);
        }
      } catch(e) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanAdsAndOverlays, { once: true });
  } else {
    cleanAdsAndOverlays();
  }

  const observer = new MutationObserver(() => {
    cleanAdsAndOverlays();
  });

  const startObserver = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
          observer.observe(document.body, { childList: true, subtree: true });
        }
      }, { once: true });
    }
  };
  startObserver();

  console.log('[AdBlockShield] Active: First-Party Ads, Overlays & Popunders Neutralized.');
})();