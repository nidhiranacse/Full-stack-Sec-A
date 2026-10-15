const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

const VALID_FORWARD_SEQUENCE = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];

// POST /api/orders - Place a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, phone, address, items } = req.body;

    // Validate customer details
    if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
      return res.status(400).json({ error: 'Customer name is required.' });
    }

    if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({ error: 'Phone number is required and must be exactly 10 digits.' });
    }

    if (!address || typeof address !== 'string' || address.trim() === '') {
      return res.status(400).json({ error: 'Delivery address is required.' });
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'An order must contain at least one item.' });
    }

    // Process and validate each item against database
    const orderItems = [];
    let calculatedTotal = 0;

    for (let i = 0; i < items.length; i++) {
      const itemReq = items[i];
      const itemId = itemReq.itemId || itemReq._id;

      if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({ error: `Invalid item ID at item index ${i}.` });
      }

      const qty = Number(itemReq.qty);
      if (!qty || isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
        return res.status(400).json({ error: `Item quantity must be a positive integer of at least 1 for item: ${itemReq.name || itemId}.` });
      }

      // Fetch fresh from database
      const dbItem = await MenuItem.findById(itemId);
      if (!dbItem) {
        return res.status(400).json({
          error: `Item with ID '${itemId}' does not exist.`
        });
      }

      if (!dbItem.isAvailable) {
        return res.status(400).json({
          error: `Item '${dbItem.name}' is currently unavailable and cannot be ordered.`
        });
      }

      // Recalculate totalAmount strictly from current database prices
      const itemSubtotal = dbItem.price * qty;
      calculatedTotal += itemSubtotal;

      orderItems.push({
        itemId: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        qty: qty
      });
    }

    // Round total to 2 decimal places
    calculatedTotal = Math.round((calculatedTotal + Number.EPSILON) * 100) / 100;

    const newOrder = new Order({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items: orderItems,
      totalAmount: calculatedTotal,
      status: 'Placed',
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();
    return res.status(201).json(savedOrder);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to place order: ' + error.message });
  }
});

// GET /api/orders - List all orders (latest first)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).json({ error: 'Server error fetching orders: ' + error.message });
  }
});

// PATCH /api/orders/:id/status - Update order status, or cancel the order
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order ID format.' });
    }

    const { status: requestedStatus } = req.body;
    if (!requestedStatus || typeof requestedStatus !== 'string') {
      return res.status(400).json({ error: 'New status is required in request body.' });
    }

    const targetStatus = requestedStatus.trim();
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const currentStatus = order.status;

    // Rule: Cancellation check
    if (targetStatus === 'Cancelled') {
      if (currentStatus !== 'Placed') {
        return res.status(400).json({
          error: `Order cannot be cancelled because it is already '${currentStatus}'. An order can be cancelled only while its status is 'Placed'.`
        });
      }
      order.status = 'Cancelled';
      const updatedOrder = await order.save();
      return res.status(200).json(updatedOrder);
    }

    // Rule: Status can only move forward in this order: Placed, Preparing, Out for Delivery, Delivered.
    const currentIndex = VALID_FORWARD_SEQUENCE.indexOf(currentStatus);
    const targetIndex = VALID_FORWARD_SEQUENCE.indexOf(targetStatus);

    if (targetIndex === -1) {
      return res.status(400).json({
        error: `Invalid status '${targetStatus}'. Allowed statuses are: ${VALID_FORWARD_SEQUENCE.join(', ')}, Cancelled.`
      });
    }

    if (currentStatus === 'Cancelled') {
      return res.status(400).json({
        error: 'Order has already been cancelled and cannot be updated.'
      });
    }

    if (targetIndex <= currentIndex) {
      return res.status(400).json({
        error: `Invalid status transition: Order status cannot move backwards or stay the same. Current: '${currentStatus}', Requested: '${targetStatus}'. Status can only move forward in order: ${VALID_FORWARD_SEQUENCE.join(' -> ')}.`
      });
    }

    // Allow advancing to the next step
    if (targetIndex !== currentIndex + 1) {
      return res.status(400).json({
        error: `Status can only move forward sequentially one step at a time: current is '${currentStatus}', next must be '${VALID_FORWARD_SEQUENCE[currentIndex + 1]}'.`
      });
    }

    order.status = targetStatus;
    const updatedOrder = await order.save();
    return res.status(200).json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update order status: ' + error.message });
  }
});

module.exports = router;
