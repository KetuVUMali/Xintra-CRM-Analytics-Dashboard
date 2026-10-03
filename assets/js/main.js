/*!
 * NimbusDesk — main.js
 * Global application-shell behaviour shared by every page:
 * sidebar toggle/offcanvas, theme switching, header widgets,
 * global search, back-to-top, counters, tooltips, AOS init.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;

  /* ---------------------------------------------------------
     0. SAFE STORAGE + AOS SAFETY NET — deliberately run FIRST,
     before anything else in this file. localStorage can throw
     (privacy modes, some file:// / sandboxed contexts, storage
     quota policies) and a single uncaught error at the top of
     this IIFE would otherwise silently cancel every feature
     defined below it — including the code that reveals
     [data-aos] content. Isolating this at the very top, wrapped
     in try/catch, means one storage failure can never cascade
     into a blank dashboard.
     --------------------------------------------------------- */
  var Store = {
    get: function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }
  };

  function revealRemaining() {
    document.querySelectorAll("[data-aos]:not(.aos-animate)").forEach(function (el) {
      el.classList.add("aos-animate");
    });
  }
  try {
    if (window.AOS) {
      AOS.init({ duration: 550, once: true, offset: 30, easing: "ease-out-cubic" });
      window.setTimeout(revealRemaining, 1200);
    } else {
      revealRemaining();
    }
  } catch (e) { revealRemaining(); }

  /* ---------------------------------------------------------
     1. THEME (light / dark) — persisted in localStorage
     --------------------------------------------------------- */
  var THEME_KEY = "nimbus-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    body.setAttribute("data-theme", theme);
    Store.set(THEME_KEY, theme);
    document.querySelectorAll(".theme-toggle-btn").forEach(function (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
    window.dispatchEvent(new CustomEvent("nimbus:theme-changed", { detail: { theme: theme } }));
  }

  (function initTheme() {
    var saved = Store.get(THEME_KEY);
    if (!saved) {
      saved = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    applyTheme(saved);
  })();

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".theme-toggle-btn");
    if (!btn) return;
    var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ---------------------------------------------------------
     1b. MULTI-THEME: color skin, sidebar style, layout width.
     Skin/sidebar/layout are already applied pre-paint by the tiny
     inline script in <head> (reads the same Store keys) — this
     section wires up the Customize panel controls and keeps them
     in sync with whatever was applied on load.
     --------------------------------------------------------- */
  var SKIN_KEY = "nimbus-skin";
  var SIDEBAR_STYLE_KEY = "nimbus-sidebar-style";
  var LAYOUT_KEY = "nimbus-layout-width";

  function syncCustomizerActiveStates() {
    var skin = root.getAttribute("data-skin") || "purple";
    var sidebarStyle = root.getAttribute("data-sidebar") || "dark";
    var layout = root.getAttribute("data-layout") || "fluid";
    document.querySelectorAll("[data-set-skin]").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-set-skin") === skin);
    });
    document.querySelectorAll("[data-set-sidebar-style]").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-set-sidebar-style") === sidebarStyle);
    });
    document.querySelectorAll("[data-set-layout]").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-set-layout") === layout);
    });
  }
  syncCustomizerActiveStates();

  document.addEventListener("click", function (e) {
    var skinBtn = e.target.closest("[data-set-skin]");
    if (skinBtn) {
      var skin = skinBtn.getAttribute("data-set-skin");
      Store.set(SKIN_KEY, skin);
      // Charts bake their palette in at creation time from canvas gradients,
      // so a clean reload is what actually makes every chart correctly
      // reflect the new accent color (not just buttons/badges). Sidebar
      // style and layout width below are pure CSS and apply instantly
      // with no reload, since no canvas is involved.
      root.setAttribute("data-skin", skin);
      window.location.reload();
      return;
    }
    var sbBtn = e.target.closest("[data-set-sidebar-style]");
    if (sbBtn) {
      var style = sbBtn.getAttribute("data-set-sidebar-style");
      root.setAttribute("data-sidebar", style);
      Store.set(SIDEBAR_STYLE_KEY, style);
      syncCustomizerActiveStates();
      return;
    }
    var lwBtn = e.target.closest("[data-set-layout]");
    if (lwBtn) {
      var layout = lwBtn.getAttribute("data-set-layout");
      root.setAttribute("data-layout", layout);
      Store.set(LAYOUT_KEY, layout);
      syncCustomizerActiveStates();
      return;
    }
  });

  /* ---------------------------------------------------------
     2. SIDEBAR — desktop collapse + mobile offcanvas
     --------------------------------------------------------- */
  var SIDEBAR_KEY = "nimbus-sidebar-collapsed";
  var overlay = document.querySelector(".content-overlay");

  (function initSidebarState() {
    if (Store.get(SIDEBAR_KEY) === "1" && window.innerWidth >= 992) {
      body.classList.add("sidebar-collapsed");
    }
  })();

  function toggleDesktopSidebar() {
    body.classList.toggle("sidebar-collapsed");
    Store.set(SIDEBAR_KEY, body.classList.contains("sidebar-collapsed") ? "1" : "0");
  }

  function openMobileSidebar() {
    body.classList.add("sidebar-mobile-open");
    overlay && overlay.classList.add("show");
  }
  function closeMobileSidebar() {
    body.classList.remove("sidebar-mobile-open");
    overlay && overlay.classList.remove("show");
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest(".sidebar-toggle-btn")) toggleDesktopSidebar();
    if (e.target.closest(".mobile-toggle-btn")) openMobileSidebar();
    if (e.target.closest(".sidebar-close-btn")) closeMobileSidebar();
    if (e.target === overlay) closeMobileSidebar();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 992) closeMobileSidebar();
  });

  /* Auto-expand the sidebar submenu that contains the active link */
  document.querySelectorAll(".sidebar-nav .nav-link.active").forEach(function (link) {
    var parentCollapse = link.closest(".sidebar-submenu.collapse");
    if (parentCollapse) {
      parentCollapse.classList.add("show");
      var trigger = document.querySelector('[data-bs-target="#' + parentCollapse.id + '"]');
      if (trigger) trigger.setAttribute("aria-expanded", "true");
    }
  });

  /* ---------------------------------------------------------
     2b. COLLAPSED-SIDEBAR FLYOUT
     When the sidebar is collapsed to icons-only, hovering (or
     clicking/focusing, for touch & keyboard users) a nav item shows its
     label — and, for group items like "Dashboards", its full list of
     children — in a small flyout positioned next to that icon.
     This is deliberately NOT pure-CSS :hover: .sidebar-scroll needs
     overflow-x:hidden for its own scrollbar to behave, which would clip
     any absolutely-positioned child trying to visually escape past the
     sidebar's right edge. So the flyout lives outside that scroll
     container and JS positions it with getBoundingClientRect() instead.
     --------------------------------------------------------- */
  var flyout = document.getElementById("sidebarFlyout");
  var flyoutHideTimer = null;
  var flyoutOpenItem = null;

  function isCollapsedDesktop() {
    return body.classList.contains("sidebar-collapsed") && window.innerWidth >= 992;
  }

  function showFlyoutFor(navItem) {
    if (!flyout || !navItem || !isCollapsedDesktop()) return;
    var link = navItem.querySelector(":scope > .nav-link");
    var submenu = navItem.querySelector(":scope > .sidebar-submenu");
    var labelEl = link && link.querySelector(".nav-link-text");
    var label = labelEl ? labelEl.textContent : "";

    if (submenu) {
      flyout.innerHTML = '<div class="flyout-title">' + label + "</div>" + submenu.outerHTML;
      flyout.classList.add("has-submenu");
    } else {
      flyout.innerHTML = '<div class="flyout-title">' + label + "</div>";
      flyout.classList.remove("has-submenu");
    }
    var innerList = flyout.querySelector("ul");
    if (innerList) { innerList.classList.remove("collapse", "show"); }

    var rect = navItem.getBoundingClientRect();
    flyout.style.top = Math.max(8, rect.top) + "px";
    flyout.style.left = (rect.right + 10) + "px";
    flyout.classList.add("show");
    flyoutOpenItem = navItem;
  }

  function hideFlyout() {
    if (!flyout) return;
    flyout.classList.remove("show");
    flyoutOpenItem = null;
  }

  function scheduleHideFlyout() {
    clearTimeout(flyoutHideTimer);
    flyoutHideTimer = setTimeout(hideFlyout, 220);
  }
  function cancelHideFlyout() {
    clearTimeout(flyoutHideTimer);
  }

  document.querySelectorAll(".sidebar-scroll > .sidebar-nav > .nav-item").forEach(function (item) {
    item.addEventListener("mouseenter", function () { cancelHideFlyout(); showFlyoutFor(item); });
    item.addEventListener("mouseleave", scheduleHideFlyout);
    item.addEventListener("focusin", function () { cancelHideFlyout(); showFlyoutFor(item); });
    item.addEventListener("focusout", scheduleHideFlyout);
  });
  if (flyout) {
    flyout.addEventListener("mouseenter", cancelHideFlyout);
    flyout.addEventListener("mouseleave", scheduleHideFlyout);
  }

  // Touch / keyboard: clicking a group toggle while collapsed opens the
  // flyout instead of firing Bootstrap's accordion (which is meaningless
  // when there's no visible label to expand under).
  document.addEventListener("click", function (e) {
    var groupLink = e.target.closest(".sidebar-scroll > .sidebar-nav > .nav-item > .nav-link[data-bs-toggle='collapse']");
    if (groupLink && isCollapsedDesktop()) {
      e.preventDefault();
      e.stopPropagation();
      var item = groupLink.closest(".nav-item");
      if (flyoutOpenItem === item) { hideFlyout(); } else { showFlyoutFor(item); }
      return;
    }
    if (flyoutOpenItem && !e.target.closest(".sidebar-flyout") && !e.target.closest(".sidebar-scroll > .sidebar-nav > .nav-item")) {
      hideFlyout();
    }
  });

  window.addEventListener("resize", function () { hideFlyout(); });
  document.addEventListener("click", function (e) {
    if (e.target.closest(".sidebar-toggle-btn")) hideFlyout();
  });

  /* ---------------------------------------------------------
     3. FULLSCREEN TOGGLE
     --------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".fullscreen-btn");
    if (!btn) return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen();
    }
  });

  /* ---------------------------------------------------------
     4. BACK TO TOP
     --------------------------------------------------------- */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("show", window.scrollY > 400);
    });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------
     5. BOOTSTRAP TOOLTIPS / POPOVERS
     --------------------------------------------------------- */
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) {
    new bootstrap.Tooltip(el);
  });
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) {
    new bootstrap.Popover(el);
  });

  /* ---------------------------------------------------------
     6. ANIMATED COUNTERS for KPI numbers
     data-counter="1876" data-counter-decimals="0" data-counter-prefix="$" data-counter-suffix="+"
     --------------------------------------------------------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-counter"));
    var decimals = parseInt(el.getAttribute("data-counter-decimals") || "0", 10);
    var prefix = el.getAttribute("data-counter-prefix") || "";
    var suffix = el.getAttribute("data-counter-suffix") || "";
    var duration = 1100;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = prefix + value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll("[data-counter]").forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ---------------------------------------------------------
     7. GLOBAL SEARCH (Ctrl/Cmd+K + click) — local dummy dataset
     --------------------------------------------------------- */
  var searchModalEl = document.getElementById("globalSearchModal");
  var searchInput = document.getElementById("globalSearchInput");
  var searchResults = document.getElementById("globalSearchResults");

  var SEARCH_DATA = (window.NIMBUS_SEARCH_INDEX || []);

  function renderSearchResults(query) {
    if (!searchResults) return;
    query = query.trim().toLowerCase();
    var groups = {};
    var items = !query ? SEARCH_DATA.slice(0, 8) : SEARCH_DATA.filter(function (item) {
      return item.title.toLowerCase().indexOf(query) !== -1 || item.group.toLowerCase().indexOf(query) !== -1;
    });

    if (items.length === 0) {
      searchResults.innerHTML = '<div class="text-center py-5 text-muted-c"><i class="bi bi-search fs-2 d-block mb-2"></i>No results for "' + query + '"</div>';
      return;
    }

    items.forEach(function (item) {
      groups[item.group] = groups[item.group] || [];
      groups[item.group].push(item);
    });

    var html = "";
    var base = window.NIMBUS_BASE || "";
    Object.keys(groups).forEach(function (g) {
      html += '<div class="px-2 pt-3 pb-1 fs-12 fw-700 text-muted-c text-uppercase">' + g + "</div>";
      groups[g].forEach(function (item) {
        html += '<a href="' + base + item.url + '" class="search-result-row text-decoration-none">' +
          '<span class="sr-icon"><i class="bi ' + item.icon + '"></i></span>' +
          '<span class="flex-grow-1"><span class="d-block text-heading fw-600 fs-13">' + item.title + '</span>' +
          '<span class="d-block fs-12 text-muted-c">' + item.subtitle + "</span></span>" +
          '<i class="bi bi-arrow-right-short text-muted-c"></i></a>';
      });
    });
    searchResults.innerHTML = html;
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () { renderSearchResults(searchInput.value); });
  }
  if (searchModalEl) {
    searchModalEl.addEventListener("shown.bs.modal", function () {
      renderSearchResults("");
      searchInput && searchInput.focus();
    });
  }

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (searchModalEl) bootstrap.Modal.getOrCreateInstance(searchModalEl).show();
    }
  });

  /* ---------------------------------------------------------
     8. TOASTS — helper used across pages: NimbusToast.show(...)
     --------------------------------------------------------- */
  window.NimbusToast = {
    show: function (message, type) {
      type = type || "primary";
      var stack = document.querySelector(".toast-stack");
      if (!stack) {
        stack = document.createElement("div");
        stack.className = "toast-stack";
        document.body.appendChild(stack);
      }
      var icons = { primary: "bi-info-circle", success: "bi-check-circle", danger: "bi-x-circle", warning: "bi-exclamation-triangle" };
      var el = document.createElement("div");
      el.className = "toast align-items-center border-0 text-bg-" + type;
      el.setAttribute("role", "alert");
      el.innerHTML = '<div class="d-flex"><div class="toast-body"><i class="bi ' + (icons[type] || icons.primary) + ' me-2"></i>' + message + '</div>' +
        '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>';
      stack.appendChild(el);
      var toast = new bootstrap.Toast(el, { delay: 3500 });
      toast.show();
      el.addEventListener("hidden.bs.toast", function () { el.remove(); });
    }
  };

  /* ---------------------------------------------------------
     9. GENERIC "mark all read" / notification badge clear
     --------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    if (e.target.closest(".mark-all-read-btn")) {
      document.querySelectorAll(".notif-item.unread").forEach(function (n) { n.classList.remove("unread"); });
      var badge = document.querySelector(".notif-bell-badge");
      if (badge) badge.remove();
    }
  });

  /* ---------------------------------------------------------
     10. PASSWORD VISIBILITY TOGGLE
     --------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".pwd-toggle-btn");
    if (!btn) return;
    var input = btn.parentElement.querySelector("input");
    if (!input) return;
    var showing = input.type === "text";
    input.type = showing ? "password" : "text";
    btn.querySelector("i").className = showing ? "bi bi-eye" : "bi bi-eye-slash";
  });

  /* ---------------------------------------------------------
     12. FOOTER YEAR
     --------------------------------------------------------- */
  document.querySelectorAll(".current-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------------------------------------------------------
     13. CLOSE MOBILE SIDEBAR WHEN A NAV LINK IS CLICKED
     --------------------------------------------------------- */
  document.querySelectorAll(".sidebar-nav a.nav-link:not([data-bs-toggle])").forEach(function (a) {
    a.addEventListener("click", function () { if (window.innerWidth < 992) closeMobileSidebar(); });
  });

  /* ---------------------------------------------------------
     14. SIMPLE FORM VALIDATION HELPER (Bootstrap pattern)
     --------------------------------------------------------- */
  document.querySelectorAll("form.needs-validation").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        e.preventDefault();
        window.NimbusToast.show("Saved successfully.", "success");
      }
      form.classList.add("was-validated");
    });
  });

  /* ---------------------------------------------------------
     15. COPY TO CLIPBOARD
     --------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var text = btn.getAttribute("data-copy");
    navigator.clipboard && navigator.clipboard.writeText(text).then(function () {
      window.NimbusToast.show("Copied to clipboard", "success");
    });
  });

})();
