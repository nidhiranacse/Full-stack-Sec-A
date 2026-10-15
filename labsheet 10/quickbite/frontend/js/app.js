(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Constants & state                                                  */
  /* ------------------------------------------------------------------ */
  const STATUS_FLOW = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
  const DEFAULT_CATEGORIES = ['Starters', 'Main Course', 'Desserts', 'Drinks'];
  const CART_KEY = 'quickbite_cart';

  const state = {
    allItems: [],     // every menu item (for categories, cart sync, admin)
    items: [],        // items currently shown on the menu (after search/filter)
    orders: [],
    cart: loadCart(), // [{ id, name, price, qty, available }]
    editingId: null
  };
  let menuToken = 0;  // ignore out-of-date responses while typing in search

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const money = (n) => '₹' + Number(n).toFixed(2);
  const slug = (s) => String(s).toLowerCase().replace(/\s+/g, '-');
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = message;
    $('#toastContainer').appendChild(el);
    setTimeout(() => el.remove(), type === 'error' ? 6000 : 3500);
  }

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(raw)
        ? raw.filter((l) => l && Number.isInteger(l.id) && l.qty >= 1).map((l) => ({ available: true, ...l }))
        : [];
    } catch (e) {
      return [];
    }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch (e) { /* ignore */ }
  }

  function showFieldErrors(form, errors) {
    $$('.error', form).forEach((el) => (el.textContent = ''));
    $$('.invalid', form).forEach((el) => el.classList.remove('invalid'));
    Object.entries(errors).forEach(([field, msg]) => {
      const span = $(`[data-error-for="${field}"]`, form);
      const input = form.elements[field];
      if (span) span.textContent = msg;
      if (input) input.classList.add('invalid');
    });
  }

  /* ------------------------------------------------------------------ */
  /* Navigation                                                         */
  /* ------------------------------------------------------------------ */
  function showPage(name) {
    $$('.page').forEach((p) => p.classList.toggle('active', p.id === 'page-' + name));
    $$('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.page === name));
    if (name === 'menu') refreshMenu();
    if (name === 'orders') loadOrders();
    if (name === 'admin') loadAdmin();
  }

  /* ------------------------------------------------------------------ */
  /* MENU                                                               */
  /* ------------------------------------------------------------------ */
  async function loadAllItems() {
    state.allItems = await Api.getItems();
    renderCategoryFilter();
    syncCart();
  }

  async function loadMenu() {
    const token = ++menuToken;
    try {
      const items = await Api.getItems({
        search: $('#searchInput').value.trim(),
        category: $('#categoryFilter').value
      });
      if (token !== menuToken) return;
      state.items = items;
      renderMenu();
    } catch (e) {
      if (token === menuToken) toast(e.message, 'error');
    }
  }

  async function refreshMenu() {
    try { await loadAllItems(); } catch (e) { toast(e.message, 'error'); }
    await loadMenu();
  }

  function renderCategoryFilter() {
    const select = $('#categoryFilter');
    const current = select.value;
    const cats = [...new Set(state.allItems.map((i) => i.category))].sort();
    select.innerHTML =
      '<option value="">All categories</option>' +
      cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    select.value = cats.includes(current) ? current : '';
  }

  function renderMenu() {
    const grid = $('#menuGrid');
    if (!state.items.length) {
      grid.innerHTML = '<div class="empty" style="grid-column:1/-1">No dishes found. Try a different search or category.</div>';
      return;
    }
    grid.innerHTML = state.items
      .map(
        (i) => `
      <article class="card item-card ${i.isAvailable ? '' : 'unavailable'}">
        <div><span class="tag">${esc(i.category)}</span></div>
        <h3>${esc(i.name)}</h3>
        <div class="item-price">${money(i.price)}</div>
        ${i.isAvailable ? '' : '<span class="badge badge-out">Unavailable</span>'}
        <button class="btn btn-primary" data-action="add" data-id="${i.id}" ${i.isAvailable ? '' : 'disabled'}>
          ${i.isAvailable ? 'Add to Cart' : 'Unavailable'}
        </button>
      </article>`
      )
      .join('');
  }

  /* ------------------------------------------------------------------ */
  /* CART                                                               */
  /* ------------------------------------------------------------------ */
  function syncCart() {
    // keep cart prices/availability in step with the menu; drop deleted dishes
    state.cart = state.cart
      .map((line) => {
        const item = state.allItems.find((i) => i.id === line.id);
        return item ? { ...line, name: item.name, price: item.price, available: item.isAvailable } : null;
      })
      .filter(Boolean);
    saveCart();
    renderCart();
  }

  function addToCart(id) {
    const item = state.allItems.find((i) => i.id === id) || state.items.find((i) => i.id === id);
    if (!item || !item.isAvailable) return;
    const line = state.cart.find((l) => l.id === id);
    if (line) line.qty += 1;
    else state.cart.push({ id: item.id, name: item.name, price: item.price, qty: 1, available: true });
    saveCart();
    renderCart();
  }

  function changeQty(id, delta) {
    const line = state.cart.find((l) => l.id === id);
    if (!line) return;
    line.qty = Math.max(1, line.qty + delta);
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter((l) => l.id !== id);
    saveCart();
    renderCart();
  }

  const cartTotal = () => state.cart.reduce((sum, l) => sum + l.price * l.qty, 0);

  function renderCart() {
    const box = $('#cartItems');
    if (!state.cart.length) {
      box.innerHTML = '<div class="empty">Your cart is empty.</div>';
    } else {
      box.innerHTML = state.cart
        .map(
          (l) => `
        <div class="cart-row">
          <div class="name">${esc(l.name)} <span class="muted">· ${money(l.price)}</span></div>
          <div class="line-total">${money(l.price * l.qty)}</div>
          <div class="controls">
            <button class="qty-btn" data-action="dec" data-id="${l.id}" ${l.qty <= 1 ? 'disabled' : ''} aria-label="Decrease quantity">−</button>
            <strong>${l.qty}</strong>
            <button class="qty-btn" data-action="inc" data-id="${l.id}" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove" data-action="remove" data-id="${l.id}">Remove</button>
          ${l.available === false ? '<div class="cart-warn">⚠ Currently unavailable - remove it to place your order.</div>' : ''}
        </div>`
        )
        .join('');
    }
    $('#cartTotal').textContent = money(cartTotal());
    $('#cartCount').textContent = state.cart.reduce((n, l) => n + l.qty, 0);
    $('#placeOrderBtn').disabled = state.cart.length === 0;
  }

  /* ---------- checkout ---------- */
  function validateCheckout(form) {
    const errors = {};
    const name = form.customerName.value.trim();
    const phone = form.phone.value.trim();
    const address = form.address.value.trim();
    if (!name) errors.customerName = 'Name is required';
    if (!phone) errors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(phone)) errors.phone = 'Phone must be exactly 10 digits';
    if (!address) errors.address = 'Address is required';
    return { errors, values: { customerName: name, phone, address } };
  }

  async function submitCheckout(e) {
    e.preventDefault();
    const form = e.target;
    const { errors, values } = validateCheckout(form);
    showFieldErrors(form, errors);
    if (Object.keys(errors).length) return;

    if (!state.cart.length) return toast('Your cart is empty', 'error');
    if (state.cart.some((l) => l.available === false)) {
      return toast('Please remove unavailable items from your cart first', 'error');
    }

    const btn = $('#placeOrderBtn');
    btn.disabled = true;
    try {
      const order = await Api.placeOrder({
        ...values,
        items: state.cart.map((l) => ({ itemId: l.id, qty: l.qty }))
      });
      state.cart = [];
      saveCart();
      renderCart();
      form.reset();
      showFieldErrors(form, {});
      toast(`Order #${order.id} placed! Total ${money(order.totalAmount)}`);
      showPage('orders');
    } catch (err) {
      toast(err.message, 'error');
      refreshMenu();           // the menu may have changed (item became unavailable, etc.)
    } finally {
      btn.disabled = state.cart.length === 0;
    }
  }

  /* ------------------------------------------------------------------ */
  /* ORDERS (customer view)                                             */
  /* ------------------------------------------------------------------ */
  async function loadOrders() {
    try {
      state.orders = await Api.getOrders();
      renderOrders();
      renderAdminOrders();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  const statusBadge = (s) => `<span class="badge status-${slug(s)}">${esc(s)}</span>`;

  function renderOrders() {
    const box = $('#ordersList');
    if (!state.orders.length) {
      box.innerHTML = '<div class="card empty">No orders yet. Add something tasty from the menu!</div>';
      return;
    }
    box.innerHTML = state.orders
      .map(
        (o) => `
      <article class="card order-card">
        <div class="order-head">
          <div><strong>Order #${o.id}</strong> <span class="muted">· ${esc(new Date(o.createdAt).toLocaleString())}</span></div>
          ${statusBadge(o.status)}
        </div>
        <div class="muted">${esc(o.customerName)} · ${esc(o.phone)} · ${esc(o.address)}</div>
        <ul class="order-lines">
          ${o.items
            .map((l) => `<li><span>${l.qty} × ${esc(l.name)}</span><span>${money(l.price * l.qty)}</span></li>`)
            .join('')}
        </ul>
        <div class="order-foot">
          <strong>Total: ${money(o.totalAmount)}</strong>
          ${o.status === 'Placed'
            ? `<button class="btn btn-danger" data-action="cancel" data-id="${o.id}">Cancel Order</button>`
            : ''}
        </div>
      </article>`
      )
      .join('');
  }

  async function changeStatus(id, status) {
    try {
      const order = await Api.updateStatus(id, status);
      toast(`Order #${order.id} is now "${order.status}"`);
    } catch (e) {
      toast(e.message, 'error');
    }
    loadOrders();
  }

  async function cancelOrder(id) {
    if (!confirm(`Cancel order #${id}?`)) return;
    await changeStatus(id, 'Cancelled');
  }

  /* ------------------------------------------------------------------ */
  /* ADMIN                                                              */
  /* ------------------------------------------------------------------ */
  async function loadAdmin() {
    try {
      await loadAllItems();
      renderAdminItems();
      renderCategoryList();
    } catch (e) {
      toast(e.message, 'error');
    }
    loadOrders();
  }

  function renderCategoryList() {
    const cats = [...new Set([...DEFAULT_CATEGORIES, ...state.allItems.map((i) => i.category)])];
    $('#categoryList').innerHTML = cats.map((c) => `<option value="${esc(c)}">`).join('');
  }

  function renderAdminItems() {
    const box = $('#adminItems');
    if (!state.allItems.length) {
      box.innerHTML = '<div class="empty">No menu items yet. Add your first dish.</div>';
      return;
    }
    box.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${state.allItems
            .map(
              (i) => `
            <tr>
              <td>${esc(i.name)}</td>
              <td>${esc(i.category)}</td>
              <td>${money(i.price)}</td>
              <td>${i.isAvailable ? '<span class="badge badge-ok">Available</span>' : '<span class="badge badge-out">Unavailable</span>'}</td>
              <td class="actions">
                <button class="btn btn-sm" data-action="edit" data-id="${i.id}">Edit</button>
                <button class="btn btn-sm btn-danger" data-action="delete" data-id="${i.id}">Delete</button>
              </td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>`;
  }

  function renderAdminOrders() {
    const box = $('#adminOrders');
    if (!state.orders.length) {
      box.innerHTML = '<div class="empty">No orders yet.</div>';
      return;
    }
    box.innerHTML = `
      <table>
        <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
        <tbody>
          ${state.orders
            .map((o) => {
              const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status) + 1];
              const actions = [];
              if (next && o.status !== 'Cancelled') {
                actions.push(`<button class="btn btn-sm btn-primary" data-action="advance" data-id="${o.id}" data-status="${esc(next)}">Mark as ${esc(next)}</button>`);
              }
              if (o.status === 'Placed') {
                actions.push(`<button class="btn btn-sm btn-danger" data-action="admin-cancel" data-id="${o.id}">Cancel</button>`);
              }
              return `
              <tr>
                <td>#${o.id}</td>
                <td>${esc(o.customerName)}<br><span class="muted">${esc(o.phone)}</span></td>
                <td>${o.items.map((l) => `${l.qty}× ${esc(l.name)}`).join(', ')}</td>
                <td>${money(o.totalAmount)}</td>
                <td>${statusBadge(o.status)}</td>
                <td class="actions">${actions.join('') || '<span class="muted">—</span>'}</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>`;
  }

  /* ---------- item form (add / edit) ---------- */
  function resetItemForm() {
    const form = $('#itemForm');
    state.editingId = null;
    form.reset();
    form.isAvailable.checked = true;
    showFieldErrors(form, {});
    $('#itemFormTitle').textContent = 'Add Menu Item';
    $('#itemSubmitBtn').textContent = 'Add Item';
    $('#cancelEditBtn').hidden = true;
  }

  function startEdit(id) {
    const item = state.allItems.find((i) => i.id === id);
    if (!item) return;
    const form = $('#itemForm');
    state.editingId = id;
    form.name.value = item.name;
    form.price.value = item.price;
    form.category.value = item.category;
    form.isAvailable.checked = item.isAvailable;
    showFieldErrors(form, {});
    $('#itemFormTitle').textContent = `Edit Menu Item #${id}`;
    $('#itemSubmitBtn').textContent = 'Save Changes';
    $('#cancelEditBtn').hidden = false;
    form.name.focus();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function submitItem(e) {
    e.preventDefault();
    const form = e.target;
    const errors = {};
    const name = form.name.value.trim();
    const priceText = form.price.value.trim();
    const price = Number(priceText);
    if (!name) errors.name = 'Name is required';
    if (!priceText) errors.price = 'Price is required';
    else if (!Number.isFinite(price) || price <= 0) errors.price = 'Price must be greater than 0';
    showFieldErrors(form, errors);
    if (Object.keys(errors).length) return;

    const payload = { name, price, isAvailable: form.isAvailable.checked };
    const category = form.category.value.trim();
    if (category) payload.category = category;

    try {
      if (state.editingId) {
        await Api.updateItem(state.editingId, payload);
        toast('Menu item updated');
      } else {
        await Api.createItem(payload);
        toast('Menu item added');
      }
      resetItemForm();
      loadAdmin();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function deleteItem(id) {
    const item = state.allItems.find((i) => i.id === id);
    if (!confirm(`Delete "${item ? item.name : 'this item'}" from the menu?`)) return;
    try {
      await Api.deleteItem(id);
      toast('Menu item deleted');
      if (state.editingId === id) resetItemForm();
      loadAdmin();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  /* ------------------------------------------------------------------ */
  /* Event wiring                                                       */
  /* ------------------------------------------------------------------ */
  document.addEventListener('click', (e) => {
    const nav = e.target.closest('.nav-btn');
    if (nav) return showPage(nav.dataset.page);

    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);

    switch (btn.dataset.action) {
      case 'add': return addToCart(id);
      case 'inc': return changeQty(id, +1);
      case 'dec': return changeQty(id, -1);
      case 'remove': return removeFromCart(id);
      case 'cancel': return cancelOrder(id);
      case 'admin-cancel': return cancelOrder(id);
      case 'advance': return changeStatus(id, btn.dataset.status);
      case 'refresh-orders': return loadOrders();
      case 'edit': return startEdit(id);
      case 'delete': return deleteItem(id);
    }
  });

  $('#cartToggle').addEventListener('click', () => {
    if (!$('#page-menu').classList.contains('active')) showPage('menu');
    $('#cartPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  let searchTimer;
  $('#searchInput').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadMenu, 250);
  });
  $('#categoryFilter').addEventListener('change', loadMenu);

  $('#checkoutForm').addEventListener('submit', submitCheckout);
  $('#checkoutForm').addEventListener('input', (e) => {
    const span = $(`[data-error-for="${e.target.name}"]`, e.currentTarget);
    if (span) span.textContent = '';
    e.target.classList.remove('invalid');
  });

  $('#itemForm').addEventListener('submit', submitItem);
  $('#cancelEditBtn').addEventListener('click', resetItemForm);

  /* ------------------------------------------------------------------ */
  /* Boot                                                               */
  /* ------------------------------------------------------------------ */
  renderCart();
  refreshMenu();
})();
