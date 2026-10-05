const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

// GET /api/items - List menu items (support ?search=name and ?category=)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      filter.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ error: 'Server error fetching menu items: ' + error.message });
  }
});

// POST /api/items - Add a new menu item (admin)
router.post('/', async (req, res) => {
  try {
    const { name, price, category, isAvailable } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Menu item name is mandatory.' });
    }

    if (price === undefined || price === null || isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({ error: 'Price is mandatory and must be a positive number greater than 0.' });
    }

    const newItem = new MenuItem({
      name: name.trim(),
      price: Number(price),
      category: category && category.trim() !== '' ? category.trim() : 'Main Course',
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
    });

    const savedItem = await newItem.save();
    return res.status(201).json(savedItem);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create menu item: ' + error.message });
  }
});

// PUT /api/items/:id - Update a menu item (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid menu item ID.' });
    }

    const { name, price, category, isAvailable } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Menu item name cannot be empty.' });
      }
      updateData.name = name.trim();
    }

    if (price !== undefined) {
      if (isNaN(price) || Number(price) <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number greater than 0.' });
      }
      updateData.price = Number(price);
    }

    if (category !== undefined) {
      updateData.category = category.trim();
    }

    if (isAvailable !== undefined) {
      updateData.isAvailable = Boolean(isAvailable);
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    return res.status(200).json(updatedItem);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update menu item: ' + error.message });
  }
});

// DELETE /api/items/:id - Delete a menu item (admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid menu item ID.' });
    }

    const deletedItem = await MenuItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Menu item not found.' });
    }

    return res.status(200).json({ message: 'Menu item deleted successfully.', item: deletedItem });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete menu item: ' + error.message });
  }
});

module.exports = router;
