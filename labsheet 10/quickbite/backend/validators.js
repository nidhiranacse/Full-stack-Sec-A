'use strict';
/** Pure validation helpers - they return { errors: [...], value: {...} } */

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

function toNumber(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') return Number(v);
  return NaN;
}

function toInteger(v) {
  let n = NaN;
  if (typeof v === 'number') n = v;
  else if (typeof v === 'string' && /^\s*\d+\s*$/.test(v)) n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Validate a menu item. For updates pass the existing item so that
 * fields missing from the body keep their old value.
 */
function validateItem(body, existing) {
  if (!isPlainObject(body)) {
    return { errors: ['Request body must be a JSON object'], value: null };
  }
  const errors = [];

  const name = has(body, 'name') ? body.name : existing && existing.name;
  const priceRaw = has(body, 'price') ? body.price : existing && existing.price;
  const category = has(body, 'category')
    ? body.category
    : existing ? existing.category : 'Main Course';
  const isAvailable = has(body, 'isAvailable')
    ? body.isAvailable
    : existing ? existing.isAvailable : true;

  if (typeof name !== 'string' || name.trim() === '') {
    errors.push('name is required');
  } else if (name.trim().length > 100) {
    errors.push('name must be 100 characters or fewer');
  }

  const price = round2(toNumber(priceRaw));
  if (priceRaw === undefined || priceRaw === null || priceRaw === '') {
    errors.push('price is required');
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.push('price must be a number greater than 0');
  }

  if (typeof category !== 'string' || category.trim() === '') {
    errors.push('category must be a non-empty string');
  }

  if (typeof isAvailable !== 'boolean') {
    errors.push('isAvailable must be true or false');
  }

  return {
    errors,
    value: errors.length
      ? null
      : { name: name.trim(), price, category: category.trim(), isAvailable }
  };
}

/** Validate the body of POST /api/orders. */
function validateOrder(body) {
  if (!isPlainObject(body)) {
    return { errors: ['Request body must be a JSON object'], value: null };
  }
  const errors = [];

  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  if (!customerName) errors.push('customerName is required');

  const phoneRaw = typeof body.phone === 'number' ? String(body.phone) : body.phone;
  const phone = typeof phoneRaw === 'string' ? phoneRaw.trim() : '';
  if (!phone) errors.push('phone is required');
  else if (!/^\d{10}$/.test(phone)) errors.push('phone must be exactly 10 digits');

  const address = typeof body.address === 'string' ? body.address.trim() : '';
  if (!address) errors.push('address is required');

  const lines = [];
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    const merged = new Map(); // itemId -> qty (duplicates are combined)
    body.items.forEach((entry, i) => {
      const label = `items[${i}]`;
      if (!isPlainObject(entry)) {
        errors.push(`${label} must be an object with itemId and qty`);
        return;
      }
      const itemId = toInteger(entry.itemId);
      const qty = toInteger(entry.qty);
      let ok = true;
      if (!(itemId >= 1)) { errors.push(`${label}.itemId must be a valid item id`); ok = false; }
      if (!(qty >= 1)) { errors.push(`${label}.qty must be a whole number of 1 or more`); ok = false; }
      if (ok) merged.set(itemId, (merged.get(itemId) || 0) + qty);
    });
    merged.forEach((qty, itemId) => lines.push({ itemId, qty }));
  }

  return {
    errors,
    value: errors.length ? null : { customerName, phone, address, lines }
  };
}

/** "12" -> 12, anything else -> null */
function parseId(param) {
  return /^\d+$/.test(String(param)) ? Number(param) : null;
}

module.exports = { validateItem, validateOrder, parseId, round2 };
