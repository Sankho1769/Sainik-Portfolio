/* ==========================================================================
   SAINIK BHAUMICK — PORTFOLIO
   script.js
   Sections: Navigation | Cursor | Scroll animations | Counters |
             Project modal | Project gallery (swipe) | Mobile interactions |
             Form validation
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ------------------------------------------------------------------
     THEME TOGGLE — blueprint (dark) / paper (light) mode
  ------------------------------------------------------------------ */
  (function themeToggle() {
    var btn = document.getElementById("themeToggle");
    var label = document.getElementById("themeToggleLabel");
    if (!btn) return;

    function apply(theme) {
      if (theme === "paper") {
        document.documentElement.setAttribute("data-theme", "paper");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      btn.setAttribute("aria-pressed", theme === "paper" ? "true" : "false");
      if (label) label.textContent = theme === "paper" ? "PAPER" : "BLUEPRINT";
    }

    var current = document.documentElement.getAttribute("data-theme") === "paper" ? "paper" : "blueprint";
    apply(current);

    btn.addEventListener("click", function () {
      current = current === "paper" ? "blueprint" : "paper";
      apply(current);
      try { localStorage.setItem("theme", current); } catch (e) {}
    });
  })();

  /* ------------------------------------------------------------------
     NAVIGATION — active-link highlighting via IntersectionObserver
  ------------------------------------------------------------------ */
  (function navigation() {
    var sections = document.querySelectorAll("main section[id], .hero[id]");
    var topLinks = document.querySelectorAll(".topnav-links a[data-nav]");
    var bottomLinks = document.querySelectorAll(".bottom-nav a[data-nav]");

    if (!sections.length) return;

    var byId = {};
    topLinks.forEach(function (a) { byId[a.dataset.nav] = byId[a.dataset.nav] || []; byId[a.dataset.nav].push(a); });
    bottomLinks.forEach(function (a) { byId[a.dataset.nav] = byId[a.dataset.nav] || []; byId[a.dataset.nav].push(a); });

    function setActive(id) {
      Object.keys(byId).forEach(function (key) {
        byId[key].forEach(function (a) { a.classList.toggle("is-active", key === id); });
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (s) { observer.observe(s); });
  })();

  /* ------------------------------------------------------------------
     CURSOR — technical crosshair (desktop only)
  ------------------------------------------------------------------ */
  (function cursor() {
    if (isCoarsePointer) return;
    var cur = document.getElementById("cursor");
    if (!cur) return;

    var x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      cur.classList.add("is-visible");
    }, { once: false });

    function loop() {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      cur.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(loop);
    }
    loop();

    var interactive = document.querySelectorAll("a, button, .scanner-item, input, textarea");
    interactive.forEach(function (el) {
      el.addEventListener("mouseenter", function () { cur.classList.add("is-active"); });
      el.addEventListener("mouseleave", function () { cur.classList.remove("is-active"); });
    });
  })();

  /* ------------------------------------------------------------------
     MAGNETIC BUTTONS (desktop only, subtle cursor-follow)
  ------------------------------------------------------------------ */
  (function magnetic() {
    if (isCoarsePointer || reduceMotion) return;
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform = "translate(" + mx * 0.18 + "px," + my * 0.3 + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  })();

  /* ------------------------------------------------------------------
     SCROLL PROGRESS RAIL
  ------------------------------------------------------------------ */
  (function scrollRail() {
    var fill = document.getElementById("scrollRailFill");
    if (!fill) return;
    function update() {
      var h = document.documentElement;
      var scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      fill.style.height = Math.min(1, Math.max(0, scrolled)) * 100 + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  })();

  /* ------------------------------------------------------------------
     SCROLL ANIMATIONS — generic reveal + timeline + skills matrix
  ------------------------------------------------------------------ */
  (function scrollAnimations() {
    var timelineEntries = document.querySelectorAll(".timeline-entry");
    var timelineFill = document.getElementById("timelineFill");
    var matrixItems = document.querySelectorAll(".matrix li");

    if (timelineEntries.length) {
      var timelineObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              var lastVisible = document.querySelectorAll(".timeline-entry.is-visible");
              if (timelineFill && lastVisible.length) {
                var pct = (lastVisible.length / timelineEntries.length) * 100;
                timelineFill.style.width = pct + "%";
              }
            }
          });
        },
        { threshold: 0.4 }
      );
      timelineEntries.forEach(function (el) { timelineObserver.observe(el); });
    }

    if (matrixItems.length) {
      var matrixObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) entry.target.classList.add("is-visible");
          });
        },
        { threshold: 0.5 }
      );
      matrixItems.forEach(function (el) { matrixObserver.observe(el); });
    }
  })();

  /* ------------------------------------------------------------------
     COUNTERS — animate hero statistics when visible
  ------------------------------------------------------------------ */
  (function counters() {
    var stats = document.querySelectorAll(".stat-num");
    if (!stats.length) return;

    function animate(el) {
      var target = parseInt(el.dataset.count, 10);
      var prefix = el.dataset.prefix || "";
      var suffix = el.dataset.suffix || "";
      if (reduceMotion) {
        el.textContent = prefix + target + suffix;
        return;
      }
      var start = 0;
      var duration = 1200;
      var startTime = null;

      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min(1, (ts - startTime) / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(start + (target - start) * eased);
        el.textContent = prefix + value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    stats.forEach(function (el) { observer.observe(el); });
  })();

  /* ------------------------------------------------------------------
     ENGINEERING SCANNER — hover/tap to expand + update system panel
  ------------------------------------------------------------------ */
  (function scanner() {
    var items = document.querySelectorAll(".scanner-item");
    var panelRows = document.querySelectorAll("#panelRows li");
    var diagramContent = document.getElementById("diagramContent");
    if (!items.length) return;

    var diagrams = {
      bim: '<rect x="30" y="30" width="60" height="110" class="d-shape"/><rect x="110" y="60" width="60" height="80" class="d-shape"/><rect x="190" y="40" width="60" height="100" class="d-shape"/>',
      autocad: '<line x1="30" y1="140" x2="30" y2="30" class="d-line"/><line x1="30" y1="30" x2="140" y2="30" class="d-line"/><line x1="140" y1="30" x2="140" y2="140" class="d-line"/><line x1="140" y1="140" x2="30" y2="140" class="d-line"/><line x1="160" y1="30" x2="250" y2="140" class="d-line"/>',
      rcc: '<circle cx="60" cy="90" r="24" class="d-shape"/><circle cx="140" cy="90" r="24" class="d-shape"/><circle cx="220" cy="90" r="24" class="d-shape"/><line x1="84" y1="90" x2="116" y2="90" class="d-line"/><line x1="164" y1="90" x2="196" y2="90" class="d-line"/>',
      bbs: '<path d="M30 130 L30 60 L90 60 L90 40" class="d-line"/><path d="M120 130 L120 50 L190 50 L190 90" class="d-line"/>',
      quantity: '<rect x="30" y="100" width="30" height="40" class="d-shape"/><rect x="75" y="70" width="30" height="70" class="d-shape"/><rect x="120" y="50" width="30" height="90" class="d-shape"/><rect x="165" y="85" width="30" height="55" class="d-shape"/>',
      site: '<line x1="30" y1="140" x2="250" y2="140" class="d-line"/><line x1="60" y1="140" x2="60" y2="60" class="d-line"/><line x1="140" y1="140" x2="140" y2="40" class="d-line"/><line x1="220" y1="140" x2="220" y2="80" class="d-line"/>'
    };

    function setDiagram(key) {
      if (diagramContent) diagramContent.innerHTML = diagrams[key] || "";
    }

    function activate(item) {
      items.forEach(function (i) { i.classList.remove("is-active"); });
      item.classList.add("is-active");

      var key = item.dataset.key;
      panelRows.forEach(function (row) {
        var label = row.querySelector("span").textContent.trim().toLowerCase();
        var matches = label.indexOf(key.slice(0, 3)) === 0 || label.replace(/[^a-z]/g, "") === key.replace(/[^a-z]/g, "");
        row.classList.toggle("is-live", matches);
      });
      setDiagram(key);
    }

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function () { if (!isCoarsePointer) activate(item); });
      item.addEventListener("click", function () { activate(item); });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(item); }
      });
    });

    activate(items[0]);
  })();

  /* ------------------------------------------------------------------
     BIM PIPELINE — activate stages on scroll (desktop)
  ------------------------------------------------------------------ */
  (function bimPipeline() {
    var stages = document.querySelectorAll(".pipeline-stage");
    var fillLine = document.getElementById("pipelineFill");
    if (!stages.length) return;

    var lineLength = 1000;
    if (fillLine) fillLine.style.strokeDasharray = lineLength;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("is-active");
        });
        var activeCount = document.querySelectorAll(".pipeline-stage.is-active").length;
        if (fillLine) {
          var pct = activeCount / stages.length;
          fillLine.style.strokeDashoffset = lineLength - lineLength * pct;
        }
      },
      { threshold: 0.5 }
    );
    stages.forEach(function (s) { observer.observe(s); });
  })();

  /* ------------------------------------------------------------------
     MOBILE INTERACTIONS — BIM accordion modules
  ------------------------------------------------------------------ */
  (function bimModules() {
    var modules = document.querySelectorAll(".bim-module");
    modules.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var isOpen = btn.classList.contains("is-open");
        modules.forEach(function (b) { b.classList.remove("is-open"); });
        if (!isOpen) btn.classList.add("is-open");
      });
    });
  })();

  /* ------------------------------------------------------------------
     PROJECT GALLERY — mobile swipe cue fade-out after first interaction
  ------------------------------------------------------------------ */
  (function projectGallery() {
    var track = document.getElementById("swipeTrack");
    var cue = document.querySelector(".swipe-cue");
    if (!track || !cue) return;
    track.addEventListener(
      "scroll",
      function () { cue.style.opacity = "0"; },
      { once: true, passive: true }
    );
  })();

  /* ------------------------------------------------------------------
     PROJECT MODAL — open/close case studies
  ------------------------------------------------------------------ */
  (function projectModal() {
    var openButtons = document.querySelectorAll("[data-modal]");
    var modals = document.querySelectorAll(".modal");
    var lastFocused = null;

    function openModal(id) {
      var modal = document.getElementById(id);
      if (!modal) return;
      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      var closeBtn = modal.querySelector(".modal-close");
      if (closeBtn) closeBtn.focus();
    }

    function closeModal(modal) {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    }

    openButtons.forEach(function (btn) {
      btn.addEventListener("click", function () { openModal(btn.dataset.modal); });
    });

    modals.forEach(function (modal) {
      modal.querySelectorAll("[data-close]").forEach(function (el) {
        el.addEventListener("click", function () { closeModal(modal); });
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var openModalEl = document.querySelector(".modal.is-open");
      if (openModalEl) closeModal(openModalEl);
    });
  })();

  /* ------------------------------------------------------------------
     FORM VALIDATION — contact form, redirects to WhatsApp on success
  ------------------------------------------------------------------ */
  (function formValidation() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    var note = document.getElementById("formNote");

    var WHATSAPP_NUMBER = "918697712736"; // +91 86977 12736, international format, digits only

    function validateField(field) {
      var row = field.closest(".form-row");
      var valid = field.checkValidity();
      if (row) row.classList.toggle("has-error", !valid);
      return valid;
    }

    function buildWhatsAppUrl(name, email, message) {
      var text =
        "Hi Sainik, I'm " + name + " (" + email + ").\n\n" + message;
      return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
    }

    form.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("blur", function () { validateField(field); });
      field.addEventListener("input", function () {
        var row = field.closest(".form-row");
        if (row && row.classList.contains("has-error")) validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll("input, textarea");
      var allValid = true;
      fields.forEach(function (field) { if (!validateField(field)) allValid = false; });

      if (!allValid) {
        note.textContent = "Please fix the highlighted fields.";
        return;
      }

      var name = form.querySelector("#cf-name").value.trim();
      var email = form.querySelector("#cf-email").value.trim();
      var message = form.querySelector("#cf-message").value.trim();
      var url = buildWhatsAppUrl(name, email, message);

      note.textContent = "Opening WhatsApp…";
      form.reset();
      window.location.href = url;
    });
  })();

  /* ------------------------------------------------------------------
     BACK TO TOP
  ------------------------------------------------------------------ */
  (function backToTop() {
    var btn = document.getElementById("backToTop");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  })();

  /* ------------------------------------------------------------------
     FOOTER YEAR
  ------------------------------------------------------------------ */
  (function footerYear() {
    var el = document.getElementById("footerYear");
    if (el) el.textContent = new Date().getFullYear();
  })();

})();
