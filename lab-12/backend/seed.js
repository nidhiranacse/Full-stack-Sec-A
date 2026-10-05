require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quickbite';

const seedItems = [
  // Starters
  { name: 'Crispy Paneer Tikka', price: 180, category: 'Starters', isAvailable: true },
  { name: 'BBQ Chicken Wings', price: 240, category: 'Starters', isAvailable: true },
  { name: 'Golden Veg Spring Rolls', price: 150, category: 'Starters', isAvailable: true },
  { name: 'Loaded Truffle Fries', price: 160, category: 'Starters', isAvailable: false },

  // Main Course
  { name: 'Butter Chicken Rice Bowl', price: 320, category: 'Main Course', isAvailable: true },
  { name: 'Paneer Butter Masala Naan Combo', price: 280, category: 'Main Course', isAvailable: true },
  { name: 'Wood-Fired Margherita Pizza', price: 350, category: 'Main Course', isAvailable: true },
  { name: 'Crispy Chicken Burger & Fries', price: 220, category: 'Main Course', isAvailable: true },

  // Desserts
  { name: 'Warm Chocolate Fudge Brownie', price: 140, category: 'Desserts', isAvailable: true },
  { name: 'Royal Gulab Jamun (2 pcs)', price: 90, category: 'Desserts', isAvailable: true },
  { name: 'New York Blueberry Cheesecake', price: 190, category: 'Desserts', isAvailable: false },

  // Drinks
  { name: 'Fresh Alfonso Mango Shake', price: 120, category: 'Drinks', isAvailable: true },
  { name: 'Iced Peach Lemon Tea', price: 85, category: 'Drinks', isAvailable: true },
  { name: 'Cold Brew Vanilla Latte', price: 130, category: 'Drinks', isAvailable: true }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding.');

    // Clear existing items and orders for clean start
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing menu items and orders.');

    // Insert menu items
    const insertedItems = await MenuItem.insertMany(seedItems);
    console.log(`Successfully seeded ${insertedItems.length} menu items.`);

    // Create an initial sample order to showcase order history
    const burger = insertedItems.find(i => i.name.includes('Burger'));
    const shake = insertedItems.find(i => i.name.includes('Mango'));

    if (burger && shake) {
      const sampleOrder = new Order({
        customerName: 'Rahul Sharma',
        phone: '9876543210',
        address: 'Flat 402, Sunshine Apartments, MG Road, Bengaluru',
        items: [
          { itemId: burger._id, name: burger.name, price: burger.price, qty: 2 },
          { itemId: shake._id, name: shake.name, price: shake.price, qty: 1 }
        ],
        totalAmount: (burger.price * 2) + (shake.price * 1),
        status: 'Placed',
        createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
      });
      await sampleOrder.save();
      console.log('Sample order created successfully.');
    }

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
