(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const state = {
    cart: [],
    lastOrder: null,
  };

  function loadCart() {
    try {
      const raw = localStorage.getItem("lumen_cart");
      if (raw) state.cart = JSON.parse(raw);
    } catch {
      state.cart = [];
    }
  }

  function saveCart() {
    localStorage.setItem("lumen_cart", JSON.stringify(state.cart));
  }

  function uniqueBrands() {
    return [...new Set(PRODUCTS.map((p) => p.brand))].sort();
  }

  function uniqueSizes() {
    const set = new Set();
    PRODUCTS.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    const order = ["XS", "S", "M", "L", "XL", "XXL", "One size"];
    const rest = [...set].filter((s) => !order.includes(s)).sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
    return [...order.filter((s) => set.has(s)), ...rest];
  }

  function initFilterUI() {
    const brandEl = $("#brand-filters");
    const sizeEl = $("#size-filters");
    brandEl.innerHTML = uniqueBrands()
      .map(
        (b) => `<label class="check"><input type="checkbox" name="brand" value="${escapeAttr(b)}" /> ${escapeHtml(b)}</label>`
      )
      .join("");
    sizeEl.innerHTML = uniqueSizes()
      .map(
        (s) => `<label class="check"><input type="checkbox" name="size" value="${escapeAttr(s)}" /> ${escapeHtml(s)}</label>`
      )
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function getFilterState() {
    const q = ($("#search").value || "").trim().toLowerCase();
    const min = $("#price-min").value === "" ? null : Number($("#price-min").value);
    const max = $("#price-max").value === "" ? null : Number($("#price-max").value);
    const brands = $$('#brand-filters input[name="brand"]:checked').map((i) => i.value);
    const sizes = $$('#size-filters input[name="size"]:checked').map((i) => i.value);
    const sort = $("#sort").value;
    return { q, min, max, brands, sizes, sort };
  }

  function productMatches(p, f) {
    if (f.q && !(`${p.name} ${p.brand}`.toLowerCase().includes(f.q))) return false;
    if (f.min != null && !Number.isNaN(f.min) && p.price < f.min) return false;
    if (f.max != null && !Number.isNaN(f.max) && p.price > f.max) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.sizes.length && !p.sizes.some((s) => f.sizes.includes(s))) return false;
    return true;
  }

  function sortProducts(list, sort) {
    const out = [...list];
    switch (sort) {
      case "price-asc":
        return out.sort((a, b) => a.price - b.price);
      case "price-desc":
        return out.sort((a, b) => b.price - a.price);
      case "name-asc":
        return out.sort((a, b) => a.name.localeCompare(b.name));
      case "brand-asc":
        return out.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
      default:
        return out;
    }
  }

  function renderProducts() {
    const f = getFilterState();
    let list = PRODUCTS.filter((p) => productMatches(p, f));
    list = sortProducts(list, f.sort);
    const grid = $("#product-grid");
    const empty = $("#empty-state");
    $("#result-count").textContent =
      list.length === 1 ? "1 product" : `${list.length} products`;

    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    grid.innerHTML = list
      .map((p) => {
        const sizesOpts = p.sizes.map((s) => `<option value="${escapeAttr(s)}">${escapeHtml(s)}</option>`).join("");
        return `
        <article class="card" data-id="${escapeAttr(p.id)}">
          <div class="card-img-wrap">
            <img src="${escapeAttr(p.image)}" alt="" loading="lazy" width="400" height="500" />
          </div>
          <div class="card-body">
            <p class="card-brand">${escapeHtml(p.brand)}</p>
            <h3 class="card-title">${escapeHtml(p.name)}</h3>
            <p class="card-price">$${p.price.toFixed(2)}</p>
            <div class="card-row">
              <label class="sr-only" for="size-${p.id}">Size</label>
              <select id="size-${p.id}" class="select select-inline" data-size-select="${escapeAttr(p.id)}">
                ${sizesOpts}
              </select>
              <button type="button" class="btn primary btn-sm" data-add="${escapeAttr(p.id)}">Add to cart</button>
            </div>
          </div>
        </article>`;
      })
      .join("");

    grid.onclick = (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      const id = btn.getAttribute("data-add");
      const sel = $(`[data-size-select="${CSS.escape(id)}"]`);
      const size = sel ? sel.value : PRODUCTS.find((x) => x.id === id)?.sizes[0];
      addToCart(id, size);
    };
  }

  function findProduct(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  function addToCart(productId, size) {
    const p = findProduct(productId);
    if (!p) return;
    const line = state.cart.find((l) => l.productId === productId && l.size === size);
    if (line) line.qty += 1;
    else state.cart.push({ productId, size, qty: 1 });
    saveCart();
    updateCartUI();
  }

  function setQty(productId, size, qty) {
    const n = Math.max(0, Math.min(99, Number(qty) || 0));
    const idx = state.cart.findIndex((l) => l.productId === productId && l.size === size);
    if (idx === -1) return;
    if (n === 0) state.cart.splice(idx, 1);
    else state.cart[idx].qty = n;
    saveCart();
    updateCartUI();
  }

  function cartSubtotal() {
    return state.cart.reduce((sum, l) => {
      const p = findProduct(l.productId);
      return sum + (p ? p.price * l.qty : 0);
    }, 0);
  }

  function updateCartUI() {
    const count = state.cart.reduce((s, l) => s + l.qty, 0);
    $("#cart-count").textContent = String(count);
    $("#cart-subtotal").textContent = `$${cartSubtotal().toFixed(2)}`;
    const lines = $("#cart-lines");
    if (!state.cart.length) {
      lines.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      $("#checkout-btn").disabled = true;
      return;
    }
    $("#checkout-btn").disabled = false;
    lines.innerHTML = state.cart
      .map((l) => {
        const p = findProduct(l.productId);
        if (!p) return "";
        const lineTotal = p.price * l.qty;
        return `
          <div class="cart-line" data-pid="${escapeAttr(l.productId)}" data-size="${escapeAttr(l.size)}">
            <div class="cart-line-main">
              <strong>${escapeHtml(p.name)}</strong>
              <span class="muted">${escapeHtml(p.brand)} · ${escapeHtml(l.size)}</span>
            </div>
            <div class="cart-line-controls">
              <input type="number" min="1" max="99" class="input qty-input" value="${l.qty}" aria-label="Quantity" />
              <span class="line-price">$${lineTotal.toFixed(2)}</span>
              <button type="button" class="link-btn remove-line" aria-label="Remove">Remove</button>
            </div>
          </div>`;
      })
      .join("");

    lines.querySelectorAll(".cart-line").forEach((row) => {
      const pid = row.getAttribute("data-pid");
      const size = row.getAttribute("data-size");
      const input = row.querySelector(".qty-input");
      input.addEventListener("change", () => setQty(pid, size, input.value));
      row.querySelector(".remove-line").addEventListener("click", () => setQty(pid, size, 0));
    });
  }

  function openCart(open) {
    const drawer = $("#cart-drawer");
    const overlay = $("#cart-overlay");
    drawer.classList.toggle("open", open);
    overlay.hidden = !open;
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function generateOrderId() {
    const t = Date.now().toString(36).toUpperCase();
    const r = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `LG-${t}-${r}`;
  }

  function buildOrderPayload(formData) {
    const orderId = generateOrderId();
    const placedAt = new Date();
    const lines = state.cart.map((l) => {
      const p = findProduct(l.productId);
      return {
        name: p.name,
        brand: p.brand,
        size: l.size,
        unitPrice: p.price,
        qty: l.qty,
        lineTotal: p.price * l.qty,
      };
    });
    const subtotal = lines.reduce((s, x) => s + x.lineTotal, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return {
      orderId,
      placedAt,
      customer: {
        name: formData.get("name").trim(),
        email: formData.get("email").trim(),
        address: formData.get("address").trim(),
      },
      lines,
      subtotal,
      tax,
      total,
    };
  }

  function receiptHtml(order, forDownload) {
    const dateStr = order.placedAt.toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    });
    const rows = order.lines
      .map(
        (l) => `
      <tr>
        <td>${escapeHtml(l.name)}<br/><span class="receipt-muted">${escapeHtml(l.brand)} · ${escapeHtml(l.size)}</span></td>
        <td class="num">${l.qty}</td>
        <td class="num">$${l.unitPrice.toFixed(2)}</td>
        <td class="num">$${l.lineTotal.toFixed(2)}</td>
      </tr>`
      )
      .join("");
    const title = forDownload ? `Receipt ${order.orderId}` : "Receipt";
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; color: #111; }
    h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
    .meta { color: #555; font-size: 0.9rem; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th, td { text-align: left; padding: 0.5rem 0; border-bottom: 1px solid #ddd; vertical-align: top; }
    th.num, td.num { text-align: right; }
    .receipt-muted { color: #666; font-size: 0.8rem; }
    .totals { margin-top: 1rem; text-align: right; }
    .totals div { margin: 0.25rem 0; }
    .ship { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>LumenGoods — Order receipt</h1>
  <p class="meta">Order <strong>${escapeHtml(order.orderId)}</strong><br/>${escapeHtml(dateStr)}</p>
  <table>
    <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Each</th><th class="num">Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div>Subtotal: $${order.subtotal.toFixed(2)}</div>
    <div>Estimated tax (8%): $${order.tax.toFixed(2)}</div>
    <div><strong>Total: $${order.total.toFixed(2)}</strong></div>
  </div>
  <div class="ship">
    <strong>Ship to</strong><br/>
    ${escapeHtml(order.customer.name)}<br/>
    ${escapeHtml(order.customer.email)}<br/>
    ${escapeHtml(order.customer.address).replace(/\n/g, "<br/>")}
  </div>
  <p class="meta" style="margin-top:2rem;">Thank you for your order. This is a demo receipt.</p>
</body>
</html>`;
  }

  function renderReceiptInModal(order) {
    const dateStr = order.placedAt.toLocaleString(undefined, {
      dateStyle: "long",
      timeStyle: "short",
    });
    const rows = order.lines
      .map(
        (l) => `
      <tr>
        <td>${escapeHtml(l.name)}<div class="receipt-muted">${escapeHtml(l.brand)} · ${escapeHtml(l.size)}</div></td>
        <td class="num">${l.qty}</td>
        <td class="num">$${l.unitPrice.toFixed(2)}</td>
        <td class="num">$${l.lineTotal.toFixed(2)}</td>
      </tr>`
      )
      .join("");
    $("#receipt-body").innerHTML = `
      <div class="receipt-header">
        <div>
          <h3>LumenGoods</h3>
          <p class="receipt-muted">Order receipt</p>
        </div>
        <div class="receipt-order-meta">
          <div><strong>${escapeHtml(order.orderId)}</strong></div>
          <div class="receipt-muted">${escapeHtml(dateStr)}</div>
        </div>
      </div>
      <table class="receipt-table">
        <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Each</th><th class="num">Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="receipt-totals">
        <div class="receipt-total-row"><span>Subtotal</span><span>$${order.subtotal.toFixed(2)}</span></div>
        <div class="receipt-total-row"><span>Est. tax (8%)</span><span>$${order.tax.toFixed(2)}</span></div>
        <div class="receipt-total-row strong"><span>Total</span><span>$${order.total.toFixed(2)}</span></div>
      </div>
      <div class="receipt-ship">
        <strong>Ship to</strong>
        <p>${escapeHtml(order.customer.name)}<br/>${escapeHtml(order.customer.email)}<br/>${escapeHtml(order.customer.address).replace(/\n/g, "<br/>")}</p>
        <p class="receipt-muted">Demo store — no payment processed.</p>
      </div>
    `;
  }

  function showReceipt(order) {
    state.lastOrder = order;
    renderReceiptInModal(order);
    $("#receipt-modal").hidden = false;
    $("#receipt-backdrop").hidden = false;
    document.body.classList.add("receipt-open");
  }

  function hideReceipt() {
    $("#receipt-modal").hidden = true;
    $("#receipt-backdrop").hidden = true;
    document.body.classList.remove("receipt-open");
  }

  function downloadReceipt() {
    if (!state.lastOrder) return;
    const html = receiptHtml(state.lastOrder, true);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${state.lastOrder.orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    ["#search", "#sort", "#price-min", "#price-max"].forEach((sel) => {
      $(sel).addEventListener("input", renderProducts);
      $(sel).addEventListener("change", renderProducts);
    });
    $("#brand-filters").addEventListener("change", renderProducts);
    $("#size-filters").addEventListener("change", renderProducts);
    $("#reset-filters").addEventListener("click", () => {
      $("#search").value = "";
      $("#sort").value = "featured";
      $("#price-min").value = "";
      $("#price-max").value = "";
      $$('#brand-filters input[type="checkbox"]').forEach((c) => (c.checked = false));
      $$('#size-filters input[type="checkbox"]').forEach((c) => (c.checked = false));
      renderProducts();
    });

    $("#open-cart").addEventListener("click", () => openCart(true));
    $("#close-cart").addEventListener("click", () => openCart(false));
    $("#cart-overlay").addEventListener("click", () => openCart(false));

    $("#checkout-btn").addEventListener("click", () => {
      if (!state.cart.length) return;
      $("#checkout-modal").showModal();
    });

    $("#cancel-checkout").addEventListener("click", () => $("#checkout-modal").close());

    $("#checkout-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const order = buildOrderPayload(fd);
      state.cart = [];
      saveCart();
      updateCartUI();
      $("#checkout-modal").close();
      openCart(false);
      showReceipt(order);
    });

    $("#close-receipt").addEventListener("click", hideReceipt);
    $("#receipt-backdrop").addEventListener("click", hideReceipt);
    $("#print-receipt").addEventListener("click", () => window.print());
    $("#download-receipt").addEventListener("click", downloadReceipt);
  }

  loadCart();
  initFilterUI();
  bindEvents();
  renderProducts();
  updateCartUI();
})();
