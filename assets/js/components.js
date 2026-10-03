/*!
 * NimbusDesk — components.js
 * Small, self-contained interactive widgets reused across many pages:
 * todo list, kanban drag/drop, quantity steppers, star ratings,
 * pricing monthly/yearly toggle, checkout stepper, gallery swap, OTP inputs.
 */
(function () {
  "use strict";

  /* ---------------- 1. TODO LIST ---------------- */
  document.addEventListener("click", function (e) {
    var check = e.target.closest(".todo-check");
    if (check) {
      var item = check.closest(".todo-item");
      item.classList.toggle("done", check.checked);
      updateTodoCount();
    }
    var del = e.target.closest(".todo-delete");
    if (del) {
      del.closest(".todo-item").remove();
      updateTodoCount();
    }
  });

  function updateTodoCount() {
    var list = document.getElementById("todoList");
    if (!list) return;
    var total = list.querySelectorAll(".todo-item").length;
    var done = list.querySelectorAll(".todo-item.done").length;
    var counter = document.getElementById("todoCounter");
    if (counter) counter.textContent = done + " / " + total + " completed";
  }
  updateTodoCount();

  var todoForm = document.getElementById("todoAddForm");
  if (todoForm) {
    todoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("todoInput");
      if (!input.value.trim()) return;
      var list = document.getElementById("todoList");
      var li = document.createElement("div");
      li.className = "todo-item";
      li.innerHTML = '<input class="form-check-input todo-check" type="checkbox">' +
        '<span class="todo-text flex-grow-1">' + input.value.trim() + '</span>' +
        '<span class="badge badge-soft-secondary">New</span>' +
        '<button class="btn btn-icon btn-sm btn-light todo-delete"><i class="bi bi-trash3"></i></button>';
      list.prepend(li);
      input.value = "";
      updateTodoCount();
    });
  }

  /* ---------------- 2. KANBAN DRAG & DROP (Projects board) ---------------- */
  document.querySelectorAll(".kanban-card[draggable]").forEach(function (card) {
    card.addEventListener("dragstart", function () {
      card.classList.add("dragging");
      setTimeout(function () { card.style.opacity = "0.4"; }, 0);
    });
    card.addEventListener("dragend", function () {
      card.classList.remove("dragging");
      card.style.opacity = "1";
      updateKanbanCounts();
    });
  });
  document.querySelectorAll(".kanban-drop-zone").forEach(function (zone) {
    zone.addEventListener("dragover", function (e) {
      e.preventDefault();
      var dragging = document.querySelector(".kanban-card.dragging");
      if (dragging) zone.appendChild(dragging);
    });
  });
  function updateKanbanCounts() {
    document.querySelectorAll(".kanban-col").forEach(function (col) {
      var countEl = col.querySelector(".kanban-count");
      var zone = col.querySelector(".kanban-drop-zone");
      if (countEl && zone) countEl.textContent = zone.querySelectorAll(".kanban-card").length;
    });
  }

  /* ---------------- 3. QUANTITY STEPPER (Cart / Product) ---------------- */
  document.addEventListener("click", function (e) {
    var incr = e.target.closest("[data-qty-incr]");
    var decr = e.target.closest("[data-qty-decr]");
    var btn = incr || decr;
    if (!btn) return;
    var wrap = btn.closest(".qty-stepper");
    var input = wrap.querySelector("input");
    var val = parseInt(input.value || "1", 10);
    val = incr ? val + 1 : Math.max(1, val - 1);
    input.value = val;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  /* ---------------- 4. STAR RATING PICKER (reviews / add product) ---------------- */
  document.querySelectorAll(".rating-picker").forEach(function (picker) {
    var stars = picker.querySelectorAll("i");
    stars.forEach(function (star, idx) {
      star.addEventListener("click", function () {
        stars.forEach(function (s, i) { s.className = i <= idx ? "bi bi-star-fill" : "bi bi-star"; });
        picker.setAttribute("data-value", idx + 1);
      });
    });
  });

  /* ---------------- 5. PRICING MONTHLY / YEARLY TOGGLE ---------------- */
  var pricingToggle = document.getElementById("pricingPeriodToggle");
  if (pricingToggle) {
    pricingToggle.addEventListener("change", function () {
      document.querySelectorAll("[data-price-month]").forEach(function (el) {
        var yearly = pricingToggle.checked;
        el.textContent = yearly ? el.getAttribute("data-price-year") : el.getAttribute("data-price-month");
      });
      document.querySelectorAll(".pricing-period-label").forEach(function (el) {
        el.textContent = pricingToggle.checked ? "/year" : "/month";
      });
    });
  }

  /* ---------------- 6. CHECKOUT / MULTI-STEP FORM ---------------- */
  document.querySelectorAll("[data-step-next]").forEach(function (btn) {
    btn.addEventListener("click", function () { goToStep(parseInt(btn.getAttribute("data-step-next"), 10)); });
  });
  document.querySelectorAll("[data-step-prev]").forEach(function (btn) {
    btn.addEventListener("click", function () { goToStep(parseInt(btn.getAttribute("data-step-prev"), 10)); });
  });
  function goToStep(stepNum) {
    document.querySelectorAll(".step-pane").forEach(function (p) { p.classList.add("d-none"); });
    var target = document.querySelector('.step-pane[data-step="' + stepNum + '"]');
    if (target) target.classList.remove("d-none");
    document.querySelectorAll(".step-indicator .step").forEach(function (s) {
      var n = parseInt(s.getAttribute("data-step"), 10);
      s.classList.toggle("done", n < stepNum);
      s.classList.toggle("active", n === stepNum);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------------- 7. PRODUCT GALLERY THUMBNAIL SWAP ---------------- */
  document.addEventListener("click", function (e) {
    var thumb = e.target.closest(".gallery-thumb");
    if (!thumb) return;
    var main = document.getElementById(thumb.getAttribute("data-gallery-target"));
    if (main) main.src = thumb.src;
    thumb.closest(".gallery-thumbs").querySelectorAll(".gallery-thumb").forEach(function (t) { t.classList.remove("active"); });
    thumb.classList.add("active");
  });

  /* ---------------- 8. FAQ ACCORDION CHEVRON ---------------- */
  document.addEventListener("click", function (e) {
    var q = e.target.closest(".faq-q");
    if (!q) return;
    var item = q.closest(".faq-item");
    var answer = item.querySelector(".faq-a");
    var icon = q.querySelector(".faq-chevron");
    var isOpen = answer.style.display === "block";
    item.closest(".faq-list").querySelectorAll(".faq-a").forEach(function (a) { a.style.display = "none"; });
    item.closest(".faq-list").querySelectorAll(".faq-chevron").forEach(function (i) { i.style.transform = "rotate(0deg)"; });
    if (!isOpen) {
      answer.style.display = "block";
      if (icon) icon.style.transform = "rotate(180deg)";
    }
  });

  /* ---------------- 9. FILE UPLOAD NAME PREVIEW ---------------- */
  document.querySelectorAll(".upload-drop input[type=file]").forEach(function (input) {
    input.addEventListener("change", function () {
      var label = input.closest(".upload-drop").querySelector(".upload-filename");
      if (label && input.files.length) label.textContent = input.files.length + " file(s) selected: " + Array.from(input.files).map(function (f) { return f.name; }).join(", ");
    });
  });

  /* ---------------- 10. SIMPLE CLIENT-SIDE TABLE SEARCH ---------------- */
  document.querySelectorAll("[data-table-search]").forEach(function (input) {
    input.addEventListener("input", function () {
      var table = document.getElementById(input.getAttribute("data-table-search"));
      if (!table) return;
      var q = input.value.toLowerCase();
      table.querySelectorAll("tbody tr").forEach(function (row) {
        row.style.display = row.textContent.toLowerCase().indexOf(q) !== -1 ? "" : "none";
      });
    });
  });

  /* ---------------- 11. SELECT-ALL CHECKBOX IN TABLES ---------------- */
  document.querySelectorAll("[data-select-all]").forEach(function (master) {
    master.addEventListener("change", function () {
      var table = document.getElementById(master.getAttribute("data-select-all"));
      if (!table) return;
      table.querySelectorAll('tbody input[type="checkbox"]').forEach(function (cb) { cb.checked = master.checked; });
    });
  });

  /* ---------------- 12. RANGE SLIDER VALUE DISPLAY (price filter etc.) ---------------- */
  document.querySelectorAll('input[type="range"][data-range-output]').forEach(function (range) {
    var out = document.getElementById(range.getAttribute("data-range-output"));
    var render = function () { if (out) out.textContent = range.value; };
    range.addEventListener("input", render);
    render();
  });

})();

/* =====================================================================
   13. ADMIN TABLE ROW ACTIONS — view / edit / delete
   Used on the Ecommerce dashboard's "Newly Added Products" table and
   the Products admin list view. Rows carry data-row-name/-category/
   -price/-status attributes that these handlers read from and write to,
   so the shared Edit/Quick-View modals work against whichever row was
   clicked without page-specific wiring.
   ===================================================================== */
(function () {
  "use strict";

  function rowData(row) {
    return {
      name: row.getAttribute("data-row-name") || "",
      category: row.getAttribute("data-row-category") || "",
      price: row.getAttribute("data-row-price") || "",
      status: row.getAttribute("data-row-status") || "",
    };
  }

  // ---- Delete row (SweetAlert2 confirmation, with a plain-confirm fallback) ----
  document.addEventListener("click", function (e) {
    var delBtn = e.target.closest("[data-delete-row]");
    if (!delBtn) return;
    var row = delBtn.closest("tr");
    if (!row) return;
    var name = rowData(row).name || "this item";

    function doDelete() {
      row.style.transition = "opacity .25s ease";
      row.style.opacity = "0";
      setTimeout(function () {
        row.remove();
        window.NimbusToast && window.NimbusToast.show(name + " deleted.", "danger");
      }, 200);
    }

    if (window.Swal) {
      Swal.fire({
        title: "Delete " + name + "?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f0506e",
        reverseButtons: true,
      }).then(function (res) {
        if (res.isConfirmed) doDelete();
      });
    } else if (window.confirm("Delete " + name + "? This action cannot be undone.")) {
      doDelete();
    }
  });

  // ---- Edit row: open shared #editProductModal, pre-filled ----
  document.addEventListener("click", function (e) {
    var editBtn = e.target.closest("[data-edit-row]");
    if (!editBtn) return;
    var row = editBtn.closest("tr");
    var modal = document.getElementById("editProductModal");
    if (!modal || !row || !window.bootstrap) return;
    var data = rowData(row);
    var form = modal.querySelector("#editProductForm");
    if (form.elements.productName) form.elements.productName.value = data.name;
    if (form.elements.category) form.elements.category.value = data.category;
    if (form.elements.price) form.elements.price.value = data.price;
    if (form.elements.status) form.elements.status.value = data.status;
    modal._editingRow = row;
    bootstrap.Modal.getOrCreateInstance(modal).show();
  });

  document.addEventListener("submit", function (e) {
    if (e.target.id !== "editProductForm") return;
    e.preventDefault();
    var modalEl = document.getElementById("editProductModal");
    var row = modalEl && modalEl._editingRow;
    var f = e.target;
    if (row) {
      var nameCell = row.querySelector("[data-row-name]");
      var catCell = row.querySelector("[data-row-category]");
      var priceCell = row.querySelector("[data-row-price]");
      if (nameCell) nameCell.textContent = f.elements.productName.value;
      if (catCell) catCell.textContent = f.elements.category.value;
      if (priceCell) priceCell.textContent = f.elements.price.value;
      row.setAttribute("data-row-name", f.elements.productName.value);
      row.setAttribute("data-row-category", f.elements.category.value);
      row.setAttribute("data-row-price", f.elements.price.value);
      row.setAttribute("data-row-status", f.elements.status.value);
    }
    if (window.bootstrap) {
      var inst = bootstrap.Modal.getInstance(modalEl);
      inst && inst.hide();
    }
    window.NimbusToast && window.NimbusToast.show("Product updated.", "success");
  });

  // ---- View row: open shared #quickViewModal, read-only ----
  document.addEventListener("click", function (e) {
    var viewBtn = e.target.closest("[data-view-row]");
    if (!viewBtn) return;
    var row = viewBtn.closest("tr");
    var modal = document.getElementById("quickViewModal");
    if (!modal || !row || !window.bootstrap) return;
    var data = rowData(row);
    var setText = function (sel, val) { var el = modal.querySelector(sel); if (el) el.textContent = val; };
    setText("[data-qv-name]", data.name);
    setText("[data-qv-category]", data.category);
    setText("[data-qv-price]", data.price);
    setText("[data-qv-status]", data.status);
    bootstrap.Modal.getOrCreateInstance(modal).show();
  });

  /* =====================================================================
     14. ORDER STATUS — inline status change from a dropdown badge
     ===================================================================== */
  document.addEventListener("click", function (e) {
    var opt = e.target.closest("[data-set-order-status]");
    if (!opt) return;
    e.preventDefault();
    var newStatus = opt.getAttribute("data-set-order-status");
    var variant = opt.getAttribute("data-status-variant") || "secondary";
    var row = opt.closest("tr");
    if (!row) return;
    var badgeEl = row.querySelector(".order-status-badge");
    if (badgeEl) {
      badgeEl.className = "badge badge-soft-" + variant + " rounded-pill order-status-badge dropdown-toggle cursor-pointer";
      badgeEl.textContent = newStatus;
    }
    window.NimbusToast && window.NimbusToast.show("Order status updated to " + newStatus + ".", "success");
  });

  /* =====================================================================
     15. GRID / LIST VIEW TOGGLE — Products catalog page
     ===================================================================== */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-view-toggle]");
    if (!btn) return;
    var mode = btn.getAttribute("data-view-toggle");
    var group = btn.closest(".btn-group");
    if (group) group.querySelectorAll("button").forEach(function (b) { b.className = "btn btn-light"; });
    btn.className = "btn btn-primary";
    var gridEl = document.getElementById("productsGridView");
    var listEl = document.getElementById("productsListView");
    if (gridEl && listEl) {
      gridEl.classList.toggle("d-none", mode !== "grid");
      listEl.classList.toggle("d-none", mode !== "list");
    }
  });
})();
