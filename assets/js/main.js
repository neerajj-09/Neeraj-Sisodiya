/* ============================================================
   Neeraj Sisodiya — Portfolio behaviors
   Vanilla JS, no dependencies. Reads settings from site.config.js
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.SITE || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     1. Apply config: email, links, availability, year, avatar
     --------------------------------------------------------- */
  function applyConfig() {
    // Email — reveals the link + fills the visible address
    if (cfg.email) {
      document.querySelectorAll('[data-link="email"]').forEach(function (el) {
        el.href = "mailto:" + cfg.email;
        el.hidden = false;
      });
      document.querySelectorAll("[data-email]").forEach(function (el) {
        el.textContent = cfg.email;
      });
    }

    // Phone — tap-to-call link + visible formatted number
    if (cfg.phone) {
      var telHref = "tel:" + cfg.phone.replace(/[^+\d]/g, "");
      document.querySelectorAll('[data-link="phone"]').forEach(function (el) {
        el.href = telHref;
        el.hidden = false;
      });
      document.querySelectorAll("[data-phone]").forEach(function (el) {
        el.textContent = cfg.phone;
      });
    }

    // Instagram — hidden until configured
    if (cfg.instagram) {
      document.querySelectorAll('[data-link="instagram"]').forEach(function (el) {
        el.href = cfg.instagram;
        el.hidden = false;
      });
    }

    // LinkedIn
    document.querySelectorAll('[data-link="linkedin"]').forEach(function (el) {
      if (cfg.linkedin) { el.href = cfg.linkedin; } else { el.hidden = true; }
    });

    // GitHub — hidden until configured
    if (cfg.github) {
      document.querySelectorAll('[data-link="github"]').forEach(function (el) {
        el.href = cfg.github;
        el.hidden = false;
      });
    }

    // Resume — hidden until configured
    if (cfg.resumeUrl) {
      document.querySelectorAll('[data-link="resume"]').forEach(function (el) {
        el.href = cfg.resumeUrl;
        el.hidden = false;
      });
    }

    // Availability badge
    document.querySelectorAll("[data-availability]").forEach(function (el) {
      el.textContent = cfg.availability || "Open to work";
    });

    // Portrait (replaces the NS monogram when configured)
    if (cfg.avatar) {
      var fallback = document.querySelector("[data-avatar-fallback]");
      if (fallback) {
        var img = document.createElement("img");
        img.className = "avatar-img";
        img.src = cfg.avatar;
        img.alt = "";
        fallback.closest(".avatar-card__inner").prepend(img);
        fallback.hidden = true;
      }
    }

    // Footer year
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------------------------------------------------
     2. Header state + back-to-top (one scroll listener)
     --------------------------------------------------------- */
  var header = document.querySelector("[data-header]");
  var backToTop = document.querySelector("[data-back-to-top]");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (backToTop) backToTop.classList.toggle("is-shown", y > 640);
  }

  if (backToTop) {
    backToTop.hidden = false;
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
  document.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------------------------------------------------
     3. Scroll spy — highlight the section in view
     --------------------------------------------------------- */
  (function scrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
    var sections = links
      .map(function (l) { return document.querySelector(l.getAttribute("href")); })
      .filter(Boolean);
    if (!("IntersectionObserver" in window) || !sections.length) return;

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        // In the hero, nothing is highlighted
        var clear = entry.target.id === "home";
        links.forEach(function (l) {
          l.classList.toggle("is-active", !clear && l.getAttribute("href") === id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    var hero = document.getElementById("home");
    if (hero) sections.unshift(hero);
    sections.forEach(function (s) { spy.observe(s); });
  })();

  /* ---------------------------------------------------------
     4. Mobile menu (accessible toggle)
     --------------------------------------------------------- */
  (function mobileMenu() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-nav-links]");
    if (!toggle || !panel || !header) return;

    function setMenu(open) {
      header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    toggle.addEventListener("click", function () {
      setMenu(!header.classList.contains("menu-open"));
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("menu-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (header.classList.contains("menu-open") && !header.contains(e.target)) setMenu(false);
    });
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (e) {
      if (e.matches) setMenu(false);
    });
  })();

  /* ---------------------------------------------------------
     5. Reveal-on-scroll animations
     --------------------------------------------------------- */
  (function reveals() {
    var els = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------------------------------------------------------
     6. Case-study dialog
     --------------------------------------------------------- */
  (function caseStudies() {
    var dlg = document.getElementById("caseDialog");
    if (!dlg) return;
    var body = dlg.querySelector("[data-case-body]");
    var title = dlg.querySelector("[data-case-title]");
    var kicker = dlg.querySelector("[data-case-kicker]");
    var closeBtn = dlg.querySelector("[data-case-close]");

    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".js-case");
      if (!btn) return;
      var tpl = document.getElementById(btn.getAttribute("data-case"));
      var card = btn.closest(".project-card");
      if (!tpl || !card) return;

      var h3 = card.querySelector("h3");
      var chip = card.querySelector(".project-card__chips .chip--soft");
      title.textContent = h3 ? h3.textContent : "Project";
      kicker.textContent = chip ? chip.textContent : "Case study";
      body.innerHTML = "";
      body.appendChild(tpl.content.cloneNode(true));

      document.documentElement.classList.add("dialog-open");
      dlg.showModal();
    });

    dlg.addEventListener("close", function () {
      document.documentElement.classList.remove("dialog-open");
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close(); // clicked the backdrop
    });
    closeBtn.addEventListener("click", function () { dlg.close(); });
  })();

  /* ---------------------------------------------------------
     7. Contact form — validation + submission
        - endpoint configured → POST JSON (Formspree-compatible)
        - no endpoint        → open the visitor's email app
        The site never fakes a "sent" message.
     --------------------------------------------------------- */
  (function contactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;

    var status = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector("[data-form-submit]");
    var label = form.querySelector("[data-form-label]");
    var fields = {
      name: document.getElementById("cf-name"),
      email: document.getElementById("cf-email"),
      message: document.getElementById("cf-message")
    };
    var honeypot = document.getElementById("cf-website");
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function setError(input, msg) {
      var field = input.closest(".field");
      var errorEl = field.querySelector(".field__error");
      field.classList.toggle("is-invalid", Boolean(msg));
      errorEl.textContent = msg || "";
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      input.setAttribute("aria-describedby", errorEl.id);
    }

    function validateField(input) {
      var v = input.value.trim();
      if (input === fields.name && v.length < 2) return "Please enter your name (at least 2 characters).";
      if (input === fields.email) {
        if (!v) return "Please enter your email address.";
        if (!EMAIL_RE.test(v)) return "That email address doesn't look right — please check it.";
      }
      if (input === fields.message && v.length < 10) {
        return "Please write a message (at least 10 characters).";
      }
      return "";
    }

    function showStatus(kind, html) {
      var icon = kind === "success" ? "#i-check" : "#i-alert";
      status.className = "form-status is-visible is-" + kind;
      status.innerHTML =
        '<svg class="icon" aria-hidden="true"><use href="' + icon + '"/></svg><span>' + html + "</span>";
    }
    function clearStatus() {
      status.className = "form-status";
      status.innerHTML = "";
    }

    function setLoading(on) {
      submitBtn.disabled = on;
      form.classList.toggle("is-sending", on);
      label.textContent = on ? "Sending…" : "Send message";
      submitBtn.querySelector("use").setAttribute("href", on ? "#i-loader" : "#i-send");
    }

    Object.keys(fields).forEach(function (key) {
      var input = fields[key];
      input.addEventListener("blur", function () {
        if (input.value.trim()) setError(input, validateField(input));
      });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("is-invalid")) {
          setError(input, validateField(input));
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearStatus();

      // Spam honeypot: bots fill every input — humans never see this one.
      if (honeypot && honeypot.value) { form.reset(); return; }

      var firstInvalid = null;
      Object.keys(fields).forEach(function (key) {
        var msg = validateField(fields[key]);
        setError(fields[key], msg);
        if (msg && !firstInvalid) firstInvalid = fields[key];
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      var name = fields.name.value.trim();
      var email = fields.email.value.trim();
      var message = fields.message.value.trim();
      var mailLink = cfg.email
        ? '<a href="mailto:' + cfg.email + '">' + escapeHtml(cfg.email) + "</a>"
        : "";

      if (cfg.formEndpoint) {
        setLoading(true);
        var done = function () { setLoading(false); };
        fetch(cfg.formEndpoint, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ name: name, email: email, message: message, _replyto: email })
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Request failed: " + res.status);
            return res.json().catch(function () { return {}; });
          })
          .then(function () {
            showStatus("success",
              "Thanks, " + escapeHtml(name) + "! Your message is on its way — I'll get back to you soon.");
            form.reset();
          })
          .catch(function () {
            showStatus("error",
              "Something went wrong sending your message. Please try again" +
              (mailLink ? " — or email me directly at " + mailLink + "." : "."));
          })
          .then(done, done);
      } else if (cfg.email) {
        // No backend yet — hand off to the visitor's email app.
        var subject = encodeURIComponent("Portfolio inquiry from " + name);
        var bodyText = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
        window.location.href = "mailto:" + cfg.email + "?subject=" + subject + "&body=" + bodyText;
        showStatus("info",
          "Your email app should open with the message pre-filled — just hit send. " +
          "If nothing happened, email me directly at " + mailLink + ".");
        form.reset();
      } else {
        showStatus("error",
          "Contact isn't set up yet — please reach out via LinkedIn instead.");
      }
    });
  })();

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  applyConfig();
  onScroll();
})();
