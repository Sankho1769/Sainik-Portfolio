/* ==========================================================================
   SAINIK BHAUMICK — PORTFOLIO SCRIPT
   Organized sections: Navigation, Cursor, Scroll animations, Counters,
   Scanner, Timeline, Pipeline, Matrix, Project modal, Mobile nav, Form.
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     FOOTER YEAR
  ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     THEME TOGGLE — light / dark, persisted
  ------------------------------------------------------------------ */
  (function themeToggle() {
    var root = document.documentElement;
    var toggles = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')].filter(Boolean);
    if (!toggles.length) return;

    var STORAGE_KEY = 'sb-theme';
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }

    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    var current = stored || (prefersLight ? 'light' : 'dark');

    function apply(theme) {
      root.setAttribute('data-theme', theme);
      toggles.forEach(function (btn) {
        btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
        btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
        var label = btn.querySelector('.theme-toggle-label');
        if (label) label.textContent = theme === 'light' ? 'LIGHT' : 'DARK';
      });
    }

    apply(current);

    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        current = current === 'light' ? 'dark' : 'light';
        apply(current);
        try { localStorage.setItem(STORAGE_KEY, current); } catch (e) { /* storage unavailable */ }
      });
    });
  })();

  /* ------------------------------------------------------------------
     NAVIGATION — active link highlighting + smooth section tracking
  ------------------------------------------------------------------ */
  (function navigation() {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
    var mobileLinks = Array.prototype.slice.call(document.querySelectorAll('[data-mnav]'));
    var sections = navLinks
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if (!sections.length) return;

    var setActive = function (id) {
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
      mobileLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  })();

  /* ------------------------------------------------------------------
     CUSTOM CURSOR
  ------------------------------------------------------------------ */
  (function cursor() {
    var cursorEl = document.getElementById('cursor');
    if (!cursorEl || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
    });

    function loop() {
      cx += (mx - cx) * 0.35;
      cy += (my - cy) * 0.35;
      cursorEl.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    loop();

    var hoverables = document.querySelectorAll('a, button, .scanner-item, input, textarea');
    hoverables.forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursorEl.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursorEl.classList.remove('is-hover'); });
    });
  })();

  /* ------------------------------------------------------------------
     SCROLL PROGRESS BAR
  ------------------------------------------------------------------ */
  (function scrollProgress() {
    var fill = document.getElementById('scrollFill');
    if (!fill) return;
    function update() {
      var h = document.documentElement;
      var scrolled = h.scrollTop;
      var max = h.scrollHeight - h.clientHeight;
      var pct = max > 0 ? (scrolled / max) * 100 : 0;
      fill.style.height = pct + '%';
    }
    document.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ------------------------------------------------------------------
     MAGNETIC BUTTONS
  ------------------------------------------------------------------ */
  (function magnetic() {
    if (prefersReducedMotion) return;
    var els = document.querySelectorAll('.magnetic');
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    els.forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.35 + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0,0)';
      });
    });
  })();

  /* ------------------------------------------------------------------
     NUMBER COUNTERS (hero stats)
  ------------------------------------------------------------------ */
  (function counters() {
    var nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;

    function animateCount(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      if (prefersReducedMotion) {
        el.textContent = prefix + target + suffix;
        return;
      }
      var start = 0;
      var duration = 1200;
      var startTime = null;

      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(start + (target - start) * eased);
        el.textContent = prefix + value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var seen = new WeakSet();
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          animateCount(entry.target);
        }
      });
    }, { threshold: 0.6 });

    nums.forEach(function (n) { obs.observe(n); });
  })();

  /* ------------------------------------------------------------------
     ENGINEERING SCANNER — hover/click to expand + update system panel
  ------------------------------------------------------------------ */
  (function scanner() {
    var items = document.querySelectorAll('.scanner-item');
    var statusRows = document.querySelectorAll('#panelStatus li');
    var diagramContent = document.getElementById('diagramContent');
    if (!items.length) return;

    var diagrams = {
      bim: '<rect x="20" y="20" width="60" height="40" fill="none" stroke="var(--cyan)"/><rect x="100" y="20" width="60" height="40" fill="none" stroke="var(--cyan)"/><rect x="60" y="80" width="60" height="40" fill="none" stroke="var(--cyan)"/><line x1="50" y1="60" x2="90" y2="80" stroke="var(--cyan)"/><line x1="130" y1="60" x2="90" y2="80" stroke="var(--cyan)"/>',
      cad: '<line x1="20" y1="110" x2="20" y2="20" stroke="var(--cyan)"/><line x1="20" y1="20" x2="150" y2="20" stroke="var(--cyan)"/><line x1="150" y1="20" x2="150" y2="70" stroke="var(--cyan)"/><line x1="150" y1="70" x2="90" y2="70" stroke="var(--cyan)"/><line x1="90" y1="70" x2="90" y2="110" stroke="var(--cyan)"/><line x1="90" y1="110" x2="20" y2="110" stroke="var(--cyan)"/>',
      rcc: '<rect x="80" y="20" width="16" height="70" fill="none" stroke="var(--cyan)"/><polygon points="50,90 126,90 140,110 36,110" fill="none" stroke="var(--cyan)"/>',
      bbs: '<path d="M30 100 L30 40 L60 40 L60 70 L90 70 L90 30 L130 30" fill="none" stroke="var(--cyan)"/>',
      qty: '<rect x="30" y="30" width="18" height="60" fill="none" stroke="var(--cyan)"/><rect x="60" y="50" width="18" height="40" fill="none" stroke="var(--cyan)"/><rect x="90" y="20" width="18" height="70" fill="none" stroke="var(--cyan)"/><rect x="120" y="60" width="18" height="30" fill="none" stroke="var(--cyan)"/>',
      site: '<circle cx="60" cy="60" r="34" fill="none" stroke="var(--cyan)"/><line x1="60" y1="16" x2="60" y2="30" stroke="var(--cyan)"/><line x1="60" y1="90" x2="60" y2="104" stroke="var(--cyan)"/><line x1="16" y1="60" x2="30" y2="60" stroke="var(--cyan)"/><line x1="90" y1="60" x2="104" y2="60" stroke="var(--cyan)"/>'
    };

    var keyToLabel = { bim: 'BIM', cad: 'AUTOCAD', rcc: 'RCC', bbs: 'BBS', qty: 'QUANTITY', site: 'SITE EXEC' };

    function activate(item) {
      items.forEach(function (i) { i.classList.remove('is-active'); });
      item.classList.add('is-active');

      var key = item.getAttribute('data-key');
      var label = keyToLabel[key];

      statusRows.forEach(function (row) {
        var isMatch = row.querySelector('span').textContent.trim() === label;
        row.classList.toggle('is-live', isMatch);
        row.querySelector('b').textContent = isMatch ? 'ACTIVE' : 'STANDBY';
      });

      if (diagramContent && diagrams[key]) {
        diagramContent.innerHTML = diagrams[key];
      }
    }

    items.forEach(function (item) {
      item.addEventListener('mouseenter', function () { activate(item); });
      item.addEventListener('click', function () { activate(item); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(item); }
      });
    });

    activate(items[0]);
  })();

  /* ------------------------------------------------------------------
     EXPERIENCE TIMELINE — draws itself on scroll
  ------------------------------------------------------------------ */
  (function timeline() {
    var track = document.getElementById('timeline');
    var fill = document.getElementById('timelineFill');
    var entries = document.querySelectorAll('.timeline-entry');
    if (!track || !fill) return;

    function update() {
      var rect = track.getBoundingClientRect();
      var vh = window.innerHeight;
      var start = vh * 0.85;
      var total = rect.height + vh * 0.3;
      var progressed = start - rect.top;
      var pct = Math.max(0, Math.min(100, (progressed / total) * 100));
      fill.style.width = pct + '%';
    }

    var obs = new IntersectionObserver(function (entries2) {
      entries2.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.style.opacity = 1;
      });
    }, { threshold: 0.15 });

    entries.forEach(function (e) {
      e.style.opacity = prefersReducedMotion ? 1 : 0;
      e.style.transition = 'opacity .6s ease';
      obs.observe(e);
    });

    document.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ------------------------------------------------------------------
     BIM PIPELINE — stage activation + connecting line progress
  ------------------------------------------------------------------ */
  (function pipeline() {
    var stages = document.querySelectorAll('.pipeline-stage');
    var progressLine = document.getElementById('pipelineProgress');
    var pipelineEl = document.getElementById('pipeline');
    if (!stages.length) return;

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('is-active');
      });
    }, { threshold: 0.5 });

    stages.forEach(function (s) { obs.observe(s); });

    function updateLine() {
      if (!progressLine || !pipelineEl) return;
      var rect = pipelineEl.getBoundingClientRect();
      var vh = window.innerHeight;
      var start = vh * 0.9;
      var total = rect.height + vh * 0.2;
      var progressed = start - rect.top;
      var pct = Math.max(0, Math.min(100, (progressed / total) * 100));
      progressLine.setAttribute('x2', (pct / 100) * 1000);
    }
    document.addEventListener('scroll', updateLine, { passive: true });
    updateLine();
  })();

  /* ------------------------------------------------------------------
     SKILLS MATRIX — fill bars when visible
  ------------------------------------------------------------------ */
  (function matrix() {
    var bars = document.querySelectorAll('.matrix-bar i');
    if (!bars.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-filled');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { obs.observe(b); });
  })();

  /* ------------------------------------------------------------------
     TEXT / SECTION REVEAL
  ------------------------------------------------------------------ */
  (function reveal() {
    var targets = document.querySelectorAll('.section-head, .about-body, .about-statement, .credentials-col, .contact-left, .contact-form');
    if (!targets.length) return;
    targets.forEach(function (t) {
      t.style.opacity = prefersReducedMotion ? 1 : 0;
      t.style.transform = prefersReducedMotion ? 'none' : 'translateY(16px)';
      t.style.transition = 'opacity .6s ease, transform .6s ease';
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    targets.forEach(function (t) { obs.observe(t); });
  })();

  /* ------------------------------------------------------------------
     PROJECT MODAL
  ------------------------------------------------------------------ */
  (function projectModal() {
    var overlay = document.getElementById('modalOverlay');
    var openers = document.querySelectorAll('.view-case');
    var closers = document.querySelectorAll('[data-close-modal]');
    if (!overlay) return;

    var lastFocused = null;

    function openModal(id) {
      var modal = document.getElementById(id);
      if (!modal) return;
      document.querySelectorAll('.project-modal').forEach(function (m) { m.hidden = true; });
      modal.hidden = false;
      overlay.classList.add('is-open');
      document.body.classList.add('modal-locked');
      lastFocused = document.activeElement;
      modal.querySelector('.modal-close').focus();
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      document.body.classList.remove('modal-locked');
      document.querySelectorAll('.project-modal').forEach(function (m) { m.hidden = true; });
      if (lastFocused) lastFocused.focus();
    }

    openers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        openModal(btn.getAttribute('data-target'));
      });
    });

    closers.forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });
  })();

  /* ------------------------------------------------------------------
     BACK TO TOP
  ------------------------------------------------------------------ */
  (function backToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    document.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 800);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  })();

  /* ------------------------------------------------------------------
     CONTACT FORM VALIDATION
  ------------------------------------------------------------------ */
  (function contactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var note = document.getElementById('formNote');

    // WhatsApp number in international format, no leading zero or plus sign.
    var WHATSAPP_NUMBER = '918697712736';

    function setError(fieldId, message) {
      var el = document.getElementById('err-' + fieldId);
      if (el) el.textContent = message || '';
    }

    function validateEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#cf-name');
      var email = form.querySelector('#cf-email');
      var message = form.querySelector('#cf-message');
      var valid = true;

      setError('name', ''); setError('email', ''); setError('message', '');

      if (!name.value.trim()) { setError('name', 'Enter your name.'); valid = false; }
      if (!email.value.trim()) { setError('email', 'Enter your email.'); valid = false; }
      else if (!validateEmail(email.value.trim())) { setError('email', 'Enter a valid email address.'); valid = false; }
      if (!message.value.trim()) { setError('message', 'Enter a message.'); valid = false; }

      if (!valid) {
        note.textContent = '';
        return;
      }

      var text = 'Hi Sainik, my name is ' + name.value.trim() +
        ' (' + email.value.trim() + ').\n\n' + message.value.trim();
      var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);

      note.textContent = 'Opening WhatsApp…';
      window.open(waUrl, '_blank', 'noopener');
      form.reset();
    });
  })();

})();
