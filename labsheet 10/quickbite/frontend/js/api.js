/**
 * All communication with the backend goes through this file (fetch API).
 * Every function returns parsed JSON or throws an Error with a readable message.
 */
const Api = (function () {
  const BASE = window.API_BASE || '/api';

  async function request(path, options = {}) {
    let res;
    try {
      res = await fetch(BASE + path, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
    } catch (e) {
      throw new Error('Cannot reach the server. Is the backend running?');
    }

    let data = null;
    try { data = await res.json(); } catch (e) { /* empty body */ }

    if (!res.ok) {
      const msg =
        (data && Array.isArray(data.details) && data.details.length && data.details.join('; ')) ||
        (data && data.error) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  const qs = (params) => {
    const q = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v) q.set(k, v); });
    const s = q.toString();
    return s ? '?' + s : '';
  };

  return {
    getItems: (params) => request('/items' + qs(params)),
    createItem: (item) => request('/items', { method: 'POST', body: JSON.stringify(item) }),
    updateItem: (id, item) => request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
    deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),

    placeOrder: (order) => request('/orders', { method: 'POST', body: JSON.stringify(order) }),
    getOrders: () => request('/orders'),
    updateStatus: (id, status) =>
      request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  };
})();
