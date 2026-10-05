// QuickBite Frontend Application Logic
const API_BASE = window.location.origin.includes(':5000') 
  ? '/api' 
  : 'http://localhost:5000/api';

// --- State Management ---
let menuItems = [];
let orders = [];
let cart = [];
let currentCategory = 'All';
let currentSearch = '';
let searchDebounceTimer = null;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', async () => {
  loadCartFromStorage();
  await loadMenuItems();
  await loadOrders();

  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  if (tab && ['menu', 'orders', 'admin'].includes(tab)) {
    navigateTo(tab);
  }

  const subtab = urlParams.get('subtab');
  if (tab === 'admin' && subtab === 'orders') {
    switchAdminTab('orders');
  }

  if (urlParams.get('cart') === 'open') {
    if (cart.length === 0 && menuItems.length > 0) {
      const sampleItem = menuItems.find(i => i.isAvailable) || menuItems[0];
      if (sampleItem) {
        cart.push({
          id: sampleItem._id,
          name: sampleItem.name,
          price: Number(sampleItem.price),
          category: sampleItem.category,
          qty: 2
        });
        saveCartToStorage();
      }
    }
    toggleCartDrawer(true);
  }
});

// --- Toast Notifications ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-msg">${escapeHtml(message)}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, 3500);
}

// --- Navigation ---
function navigateTo(viewId) {
  const views = ['menu', 'orders', 'admin'];
  views.forEach(v => {
    const section = document.getElementById(`view-${v}`);
    const navBtn = document.getElementById(`nav-${v}`);
    if (v === viewId) {
      section.classList.add('active');
      navBtn.classList.add('active');
    } else {
      section.classList.remove('active');
      navBtn.classList.remove('active');
    }
  });

  if (viewId === 'orders') {
    loadOrders();
  } else if (viewId === 'admin') {
    loadMenuItems();
    loadOrders();
  }
}

// --- Category & Search Filtering ---
function selectCategory(category) {
  currentCategory = category;
  document.querySelectorAll('#category-pills .filter-pill').forEach(pill => {
    if (pill.innerText.trim().toLowerCase() === category.toLowerCase()) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
  loadMenuItems();
}

function handleSearchInput() {
  clearTimeout(searchDebounceTimer);
  const input = document.getElementById('menu-search');
  const clearBtn = document.getElementById('search-clear-btn');
  
  clearBtn.style.display = input.value.trim().length > 0 ? 'block' : 'none';
  
  searchDebounceTimer = setTimeout(() => {
    currentSearch = input.value.trim();
    loadMenuItems();
  }, 250);
}

function clearSearch() {
  const input = document.getElementById('menu-search');
  input.value = '';
  document.getElementById('search-clear-btn').style.display = 'none';
  currentSearch = '';
  loadMenuItems();
}

// --- Category Food Icons ---
function getCategoryIcon(category, name) {
  const lowerName = (name || '').toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  if (lowerName.includes('pizza')) return '🍕';
  if (lowerName.includes('burger')) return '🍔';
  if (lowerName.includes('truffle') || lowerName.includes('fries')) return '🍟';
  if (lowerName.includes('wing') || lowerName.includes('chicken')) return '🍗';
  if (lowerName.includes('tikka') || lowerName.includes('paneer')) return '🧀';
  if (lowerName.includes('roll')) return '🌯';
  if (lowerName.includes('brownie') || lowerName.includes('cake')) return '🍰';
  if (lowerName.includes('gulab') || lowerName.includes('jamun')) return '🍯';
  if (lowerName.includes('shake') || lowerName.includes('smoothie')) return '🥤';
  if (lowerName.includes('tea')) return '🧋';
  if (lowerName.includes('coffee') || lowerName.includes('brew')) return '☕';

  if (lowerCat.includes('starter')) return '🥟';
  if (lowerCat.includes('main')) return '🍛';
  if (lowerCat.includes('dessert')) return '🍨';
  if (lowerCat.includes('drink')) return '🍹';

  return '🍽️';
}

// --- Menu APIs & Rendering ---
async function loadMenuItems() {
  const loadingEl = document.getElementById('menu-loading');
  const emptyEl = document.getElementById('menu-empty');
  const gridEl = document.getElementById('menu-grid');

  loadingEl.style.display = 'block';
  emptyEl.style.display = 'none';

  try {
    const params = new URLSearchParams();
    if (currentSearch) params.append('search', currentSearch);
    if (currentCategory && currentCategory !== 'All') params.append('category', currentCategory);

    const res = await fetch(`${API_BASE}/items?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load menu items');

    menuItems = await res.json();
    loadingEl.style.display = 'none';

    renderMenuGrid(menuItems);
    renderAdminItemsTable(menuItems);
  } catch (error) {
    loadingEl.style.display = 'none';
    showToast('Error connecting to backend: ' + error.message, 'error');
  }
}

function renderMenuGrid(items) {
  const gridEl = document.getElementById('menu-grid');
  const emptyEl = document.getElementById('menu-empty');

  if (!items || items.length === 0) {
    gridEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';
  gridEl.innerHTML = items.map(item => {
    const catClass = (item.category || 'Main-Course').replace(/\s+/g, '-');
    const icon = getCategoryIcon(item.category, item.name);
    const isAvailable = Boolean(item.isAvailable);

    return `
      <div class="menu-card" data-id="${item._id}">
        <div class="card-top ${catClass}">
          <span class="card-badge-pos tag-badge tag-category">${escapeHtml(item.category)}</span>
          <span class="stock-badge-pos tag-badge ${isAvailable ? 'tag-available' : 'tag-unavailable'}">
            ${isAvailable ? '● Available' : '○ Out of Stock'}
          </span>
          <span class="food-icon-large">${icon}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(item.name)}</h3>
          <div class="card-footer">
            <span class="item-price">₹${Number(item.price).toFixed(2)}</span>
            <button 
              class="add-cart-btn" 
              onclick="addToCart('${item._id}')" 
              ${!isAvailable ? 'disabled title="This item is currently unavailable"' : ''}
            >
              ${isAvailable ? '🛒 Add to Cart' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- Cart Operations ---
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('quickbite_cart');
    cart = saved ? JSON.parse(saved) : [];
  } catch (e) {
    cart = [];
  }
  updateCartUI();
}

function saveCartToStorage() {
  localStorage.setItem('quickbite_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(itemId) {
  const item = menuItems.find(i => i._id === itemId);
  if (!item) return;

  if (!item.isAvailable) {
    showToast(`Sorry, "${item.name}" is currently unavailable!`, 'error');
    return;
  }

  const existing = cart.find(c => c.id === item._id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: item._id,
      name: item.name,
      price: Number(item.price),
      category: item.category,
      qty: 1
    });
  }

  saveCartToStorage();
  showToast(`Added "${item.name}" to your cart!`, 'success');
}

function updateCartQty(itemId, delta) {
  const existing = cart.find(c => c.id === itemId);
  if (!existing) return;

  existing.qty += delta;
  if (existing.qty <= 0) {
    cart = cart.filter(c => c.id !== itemId);
  }
  saveCartToStorage();
}

function removeFromCart(itemId) {
  const removed = cart.find(c => c.id === itemId);
  cart = cart.filter(c => c.id !== itemId);
  saveCartToStorage();
  if (removed) {
    showToast(`Removed "${removed.name}" from cart.`, 'info');
  }
}

function clearCart() {
  if (cart.length === 0) return;
  cart = [];
  saveCartToStorage();
  showToast('Cart cleared', 'info');
}

function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  
  const shouldOpen = open !== undefined ? open : !drawer.classList.contains('open');

  if (shouldOpen) {
    drawer.classList.add('open');
    backdrop.classList.add('active');
  } else {
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
  }
}

function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Update Navbar Badge
  const countBadge = document.getElementById('cart-count');
  countBadge.innerText = totalCount;
  countBadge.style.display = totalCount > 0 ? 'inline-flex' : 'none';

  // Update Drawer Body
  const emptyEl = document.getElementById('cart-empty');
  const listEl = document.getElementById('cart-items-list');
  const footerEl = document.getElementById('cart-footer');

  if (cart.length === 0) {
    emptyEl.style.display = 'block';
    listEl.innerHTML = '';
    footerEl.style.display = 'none';
  } else {
    emptyEl.style.display = 'none';
    footerEl.style.display = 'block';

    listEl.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.name)}</div>
          <div class="cart-item-rate">₹${item.price.toFixed(2)} each</div>
        </div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
        </div>
        <div class="cart-item-total">₹${(item.price * item.qty).toFixed(2)}</div>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')" title="Remove item">🗑️</button>
      </div>
    `).join('');

    document.getElementById('cart-subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').innerText = `₹${subtotal.toFixed(2)}`;
  }
}

// --- Checkout Modal & Validation ---
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('Your cart is empty! Add items first.', 'error');
    return;
  }

  toggleCartDrawer(false);

  const previewEl = document.getElementById('checkout-items-preview');
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  previewEl.innerHTML = cart.map(item => `
    <div class="checkout-preview-item">
      <span>${escapeHtml(item.name)} × ${item.qty}</span>
      <span>₹${(item.price * item.qty).toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('checkout-total-preview').innerText = `₹${subtotal.toFixed(2)}`;

  // Clear errors
  document.getElementById('name-error').innerText = '';
  document.getElementById('phone-error').innerText = '';
  document.getElementById('address-error').innerText = '';

  document.getElementById('checkout-modal').style.display = 'flex';
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').style.display = 'none';
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('cust-name');
  const phoneInput = document.getElementById('cust-phone');
  const addressInput = document.getElementById('cust-address');

  const customerName = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();

  let hasError = false;

  // Validation: Name
  if (!customerName) {
    document.getElementById('name-error').innerText = 'Please enter customer name.';
    hasError = true;
  } else {
    document.getElementById('name-error').innerText = '';
  }

  // Validation: Phone (10 digits)
  if (!phone || !/^\d{10}$/.test(phone)) {
    document.getElementById('phone-error').innerText = 'Phone number must be exactly 10 digits (0-9).';
    hasError = true;
  } else {
    document.getElementById('phone-error').innerText = '';
  }

  // Validation: Address
  if (!address) {
    document.getElementById('address-error').innerText = 'Delivery address cannot be empty.';
    hasError = true;
  } else {
    document.getElementById('address-error').innerText = '';
  }

  if (hasError) return;

  const orderPayload = {
    customerName,
    phone,
    address,
    items: cart.map(item => ({
      itemId: item.id,
      qty: item.qty
    }))
  };

  const placeBtn = document.getElementById('place-order-btn');
  placeBtn.disabled = true;
  placeBtn.innerText = 'Placing Order...';

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to place order.');
    }

    // Success!
    showToast(`Order #${data._id.slice(-6).toUpperCase()} placed successfully!`, 'success');
    cart = [];
    saveCartToStorage();
    closeCheckoutModal();
    document.getElementById('checkout-form').reset();

    // Navigate to orders page to view status
    navigateTo('orders');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    placeBtn.disabled = false;
    placeBtn.innerText = 'Confirm & Place Order';
  }
}

// --- Orders Management & Tracking ---
async function loadOrders() {
  const loadingEl = document.getElementById('orders-loading');
  const emptyEl = document.getElementById('orders-empty');
  const listEl = document.getElementById('orders-list');
  const badgeEl = document.getElementById('orders-badge');

  loadingEl.style.display = 'block';
  emptyEl.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');

    orders = await res.json();
    loadingEl.style.display = 'none';

    badgeEl.innerText = orders.length;

    renderOrdersList(orders);
    renderAdminOrdersTable(orders);
  } catch (error) {
    loadingEl.style.display = 'none';
    showToast('Error fetching orders: ' + error.message, 'error');
  }
}

function getStatusBadgeHtml(status) {
  const statusClass = status.replace(/\s+/g, '-');
  const iconMap = {
    'Placed': '🟡',
    'Preparing': '🟠',
    'Out for Delivery': '🔵',
    'Delivered': '🟢',
    'Cancelled': '🔴'
  };
  return `<span class="status-badge ${statusClass}">${iconMap[status] || '⚪'} ${escapeHtml(status)}</span>`;
}

function renderOrdersList(orderList) {
  const listEl = document.getElementById('orders-list');
  const emptyEl = document.getElementById('orders-empty');

  if (!orderList || orderList.length === 0) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';
  listEl.innerHTML = orderList.map(order => {
    const dateFormatted = new Date(order.createdAt).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const canCancel = order.status === 'Placed';

    return `
      <div class="order-card" id="order-${order._id}">
        <div class="order-card-header">
          <div class="order-meta">
            <span class="order-id-badge">#${order._id.slice(-8).toUpperCase()}</span>
            <span class="order-date">📅 ${dateFormatted}</span>
          </div>
          <div>${getStatusBadgeHtml(order.status)}</div>
        </div>

        <div class="order-card-body">
          <div class="order-info-col">
            <h4>Delivery Info</h4>
            <div class="order-customer-details">
              <strong>${escapeHtml(order.customerName)}</strong><br />
              📞 ${escapeHtml(order.phone)}<br />
              📍 ${escapeHtml(order.address)}
            </div>
          </div>

          <div class="order-items-col">
            <h4>Ordered Items</h4>
            <table class="order-items-table">
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${escapeHtml(item.name)}</td>
                    <td class="item-qty">× ${item.qty}</td>
                    <td class="item-amt">₹${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="order-card-footer">
          <div class="order-total-display">
            Total Amount: <strong>₹${Number(order.totalAmount).toFixed(2)}</strong>
          </div>
          ${canCancel ? `
            <button class="cancel-order-btn" onclick="cancelOrder('${order._id}')">
              ✕ Cancel Order
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function cancelOrder(orderId) {
  if (!confirm('Are you sure you want to cancel this order?')) return;

  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel order');

    showToast('Order was cancelled successfully.', 'info');
    loadOrders();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// --- Admin Section Management ---
function switchAdminTab(tabName) {
  const menuTab = document.getElementById('admin-tab-menu');
  const ordersTab = document.getElementById('admin-tab-orders');
  const menuView = document.getElementById('admin-menu-view');
  const ordersView = document.getElementById('admin-orders-view');

  if (tabName === 'menu') {
    menuTab.classList.add('active');
    ordersTab.classList.remove('active');
    menuView.style.display = 'block';
    ordersView.style.display = 'none';
  } else {
    ordersTab.classList.add('active');
    menuTab.classList.remove('active');
    ordersView.style.display = 'block';
    menuView.style.display = 'none';
  }
}

function renderAdminItemsTable(items) {
  const tbody = document.getElementById('admin-items-table-body');
  const countBadge = document.getElementById('admin-item-count');
  countBadge.innerText = `${items.length} items`;

  tbody.innerHTML = items.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td><span class="tag-badge tag-category">${escapeHtml(item.category)}</span></td>
      <td><strong>₹${Number(item.price).toFixed(2)}</strong></td>
      <td>
        <button 
          class="btn-sm" 
          onclick="toggleItemAvailability('${item._id}', ${!item.isAvailable})"
          style="background: ${item.isAvailable ? '#dcfce7' : '#fee2e2'}; color: ${item.isAvailable ? '#15803d' : '#b91c1c'}; border:none;"
        >
          ${item.isAvailable ? '✓ In Stock' : '✕ Out of Stock'}
        </button>
      </td>
      <td>
        <div class="action-btn-group">
          <button class="btn-sm edit-btn" onclick="editMenuItem('${item._id}')">✏️ Edit</button>
          <button class="btn-sm delete-btn" onclick="deleteMenuItem('${item._id}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function handleMenuItemSubmit(event) {
  event.preventDefault();

  const editId = document.getElementById('edit-item-id').value;
  const name = document.getElementById('item-name').value.trim();
  const price = parseFloat(document.getElementById('item-price').value);
  const category = document.getElementById('item-category').value;
  const isAvailable = document.getElementById('item-available').checked;

  if (!name || isNaN(price) || price <= 0) {
    showToast('Valid name and price greater than 0 are mandatory.', 'error');
    return;
  }

  const payload = { name, price, category, isAvailable };

  try {
    let res;
    if (editId) {
      // PUT /api/items/:id
      res = await fetch(`${API_BASE}/items/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // POST /api/items
      res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save menu item');

    showToast(`Menu item "${name}" ${editId ? 'updated' : 'added'} successfully!`, 'success');
    resetMenuItemForm();
    loadMenuItems();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function editMenuItem(id) {
  const item = menuItems.find(i => i._id === id);
  if (!item) return;

  document.getElementById('edit-item-id').value = item._id;
  document.getElementById('item-name').value = item.name;
  document.getElementById('item-price').value = item.price;
  document.getElementById('item-category').value = item.category;
  document.getElementById('item-available').checked = Boolean(item.isAvailable);

  document.getElementById('admin-form-title').innerText = 'Edit Menu Item';
  document.getElementById('save-item-btn').innerText = 'Update Item';
  document.getElementById('cancel-edit-btn').style.display = 'inline-block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetMenuItemForm() {
  document.getElementById('menu-item-form').reset();
  document.getElementById('edit-item-id').value = '';
  document.getElementById('admin-form-title').innerText = 'Add New Menu Item';
  document.getElementById('save-item-btn').innerText = 'Save Item';
  document.getElementById('cancel-edit-btn').style.display = 'none';
  document.getElementById('item-available').checked = true;
}

async function toggleItemAvailability(id, nextStatus) {
  try {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: nextStatus })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update availability');

    showToast(`Updated status to ${nextStatus ? 'Available' : 'Unavailable'}`, 'success');
    loadMenuItems();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deleteMenuItem(id) {
  const item = menuItems.find(i => i._id === id);
  if (!confirm(`Are you sure you want to permanently delete "${item ? item.name : 'this item'}"?`)) return;

  try {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete item');

    showToast('Menu item deleted successfully.', 'success');
    loadMenuItems();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Admin Order Status Flow
const STATUS_TRANSITIONS = {
  'Placed': 'Preparing',
  'Preparing': 'Out for Delivery',
  'Out for Delivery': 'Delivered'
};

function renderAdminOrdersTable(orderList) {
  const tbody = document.getElementById('admin-orders-table-body');

  tbody.innerHTML = orderList.map(order => {
    const nextStatus = STATUS_TRANSITIONS[order.status];

    let actionBtnHtml = '';
    if (nextStatus) {
      actionBtnHtml = `
        <button class="advance-btn" onclick="advanceOrderStatus('${order._id}', '${nextStatus}')">
          Advance to ${nextStatus} ➔
        </button>
      `;
    } else if (order.status === 'Delivered') {
      actionBtnHtml = `<span style="color:var(--success); font-weight:700;">✓ Completed</span>`;
    } else if (order.status === 'Cancelled') {
      actionBtnHtml = `<span style="color:var(--danger); font-weight:700;">✕ Order Cancelled</span>`;
    }

    const itemsSummary = order.items.map(i => `${escapeHtml(i.name)} (×${i.qty})`).join(', ');

    return `
      <tr>
        <td><span class="order-id-badge">#${order._id.slice(-6).toUpperCase()}</span></td>
        <td>
          <strong>${escapeHtml(order.customerName)}</strong><br />
          <small class="field-hint">📞 ${escapeHtml(order.phone)}</small>
        </td>
        <td style="max-width: 250px; font-size: 0.85rem;">${itemsSummary}</td>
        <td><strong>₹${Number(order.totalAmount).toFixed(2)}</strong></td>
        <td>${getStatusBadgeHtml(order.status)}</td>
        <td>${actionBtnHtml}</td>
      </tr>
    `;
  }).join('');
}

async function advanceOrderStatus(orderId, nextStatus) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');

    showToast(`Order status advanced to "${nextStatus}"!`, 'success');
    loadOrders();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
