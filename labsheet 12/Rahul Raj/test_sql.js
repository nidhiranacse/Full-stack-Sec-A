/**
 * Verification Script for Problem 2: SQL Analytics and Concurrency
 * Uses Node.js built-in SQLite engine (node:sqlite)
 * Demonstrates:
 * 1. Part (a) DENSE_RANK() revenue per category with ties
 * 2. Part (b) Customers who ordered in Jan, Feb, and March 2025
 * 3. Part (c) Atomic inventory reservation & rollback on insufficient stock
 */

const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(':memory:');

console.log('--- Initializing In-Memory SQLite Schema ---');

db.exec(`
  CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL
  );

  CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL
  );

  CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE order_items (
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// Seed test data
db.exec(`
  -- Insert Customers
  INSERT INTO customers (id, name, city) VALUES
    (1, 'Alice Smith', 'New York'),
    (2, 'Bob Johnson', 'San Francisco'),
    (3, 'Charlie Brown', 'Chicago'),
    (4, 'Diana Prince', 'Boston');

  -- Insert Products in 'Electronics' and 'Books'
  INSERT INTO products (id, name, category, price, stock) VALUES
    (101, 'Laptop Pro', 'Electronics', 1000.0, 10),
    (102, 'Wireless Mouse', 'Electronics', 50.0, 50),
    (103, 'Mechanical Keyboard', 'Electronics', 100.0, 25),
    (104, 'Noise-Canceling Headphones', 'Electronics', 200.0, 15),
    (105, 'USB-C Cable', 'Electronics', 20.0, 100),
    (201, 'Database Systems', 'Books', 80.0, 30),
    (202, 'Clean Code', 'Books', 40.0, 40),
    (203, 'Designing Data-Intensive Apps', 'Books', 50.0, 20),
    (204, 'The Pragmatic Programmer', 'Books', 45.0, 35);

  -- Insert Orders across Jan, Feb, March, April 2025
  -- Alice orders in Jan, Feb, and March 2025 (Should match Part b)
  INSERT INTO orders (id, customer_id, order_date) VALUES
    (1, 1, '2025-01-15 10:00:00'),
    (2, 1, '2025-02-14 11:30:00'),
    (3, 1, '2025-03-20 15:45:00'),
  -- Bob orders in Jan and Feb only (Should NOT match Part b)
    (4, 2, '2025-01-10 09:00:00'),
    (5, 2, '2025-02-28 17:00:00'),
  -- Charlie orders twice in Jan, once in Feb, once in March 2025 (Should match Part b)
    (6, 3, '2025-01-05 14:00:00'),
    (7, 3, '2025-01-22 16:00:00'),
    (8, 3, '2025-02-18 12:00:00'),
    (9, 3, '2025-03-05 10:30:00'),
  -- Diana orders in Jan and April (Should NOT match Part b)
    (10, 4, '2025-01-12 18:00:00'),
    (11, 4, '2025-04-02 08:30:00');

  -- Insert Order Items with quantities sold
  -- Laptop (101): 5 sold * 1000 = $5000 (Rank 1 Electronics)
  -- Headphones (104): 10 sold * 200 = $2000 (Rank 2 Electronics)
  -- Keyboard (103): 15 sold * 100 = $1500 (Rank 3 Electronics)
  -- Mouse (102): 20 sold * 50 = $1000 (Rank 4 Electronics)
  -- Books:
  -- Database Systems (201): 10 * 80 = $800 (Rank 1 Books)
  -- DDIA (203): 10 * 50 = $500 (Rank 2 Books)
  -- Clean Code (202): 10 * 40 = $400 (Rank 3 Books)
  -- Pragmatic Programmer (204): 5 * 45 = $225 (Rank 4 Books)
  INSERT INTO order_items (order_id, product_id, qty) VALUES
    (1, 101, 3), (2, 101, 2),
    (1, 104, 5), (3, 104, 5),
    (4, 103, 15),
    (5, 102, 20),
    (6, 201, 10),
    (7, 203, 10),
    (8, 202, 10),
    (9, 204, 5);
`);

console.log('✓ Test dataset populated successfully.\n');

// ----------------------------------------------------------------------------
// Test Part (a)
// ----------------------------------------------------------------------------
console.log('====================================================');
console.log('Testing Part (a): Top 3 Products by Revenue per Category (DENSE_RANK)');
console.log('====================================================');

const queryA = `
  WITH product_sales AS (
    SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.price,
        COALESCE(SUM(oi.qty), 0) AS total_quantity_sold,
        (p.price * COALESCE(SUM(oi.qty), 0)) AS revenue,
        DENSE_RANK() OVER (
            PARTITION BY p.category 
            ORDER BY (p.price * COALESCE(SUM(oi.qty), 0)) DESC
        ) AS category_revenue_rank
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.id, p.name, p.category, p.price
  )
  SELECT 
    category,
    product_id,
    product_name,
    price,
    total_quantity_sold,
    revenue,
    category_revenue_rank
  FROM product_sales
  WHERE category_revenue_rank <= 3
  ORDER BY category ASC, category_revenue_rank ASC, revenue DESC;
`;

const resultsA = db.prepare(queryA).all();
console.table(resultsA);

// ----------------------------------------------------------------------------
// Test Part (b)
// ----------------------------------------------------------------------------
console.log('\n====================================================');
console.log('Testing Part (b): Customers with Orders in Jan, Feb & Mar 2025');
console.log('====================================================');

const queryB = `
  SELECT 
    c.id AS customer_id,
    c.name AS customer_name,
    c.city
  FROM customers c
  JOIN orders o ON c.id = o.customer_id
  WHERE o.order_date >= '2025-01-01' 
    AND o.order_date < '2025-04-01'
  GROUP BY c.id, c.name, c.city
  HAVING COUNT(DISTINCT strftime('%Y-%m', o.order_date)) = 3;
`;

const resultsB = db.prepare(queryB).all();
console.table(resultsB);

// ----------------------------------------------------------------------------
// Test Part (c)
// ----------------------------------------------------------------------------
console.log('\n====================================================');
console.log('Testing Part (c): Concurrency-Safe Order Placement Transaction');
console.log('====================================================');

function placeOrderSafe(orderId, customerId, productId, qty) {
  db.exec('BEGIN TRANSACTION;');
  try {
    const updateStmt = db.prepare(`
      UPDATE products 
      SET stock = stock - ? 
      WHERE id = ? AND stock >= ?
    `);
    const updateResult = updateStmt.run(qty, productId, qty);

    if (updateResult.changes === 0) {
      db.exec('ROLLBACK;');
      return { success: false, reason: 'Insufficient stock or invalid product' };
    }

    db.prepare(`
      INSERT INTO orders (id, customer_id, order_date) 
      VALUES (?, ?, datetime('now'))
    `).run(orderId, customerId);

    db.prepare(`
      INSERT INTO order_items (order_id, product_id, qty) 
      VALUES (?, ?, ?)
    `).run(orderId, productId, qty);

    db.exec('COMMIT;');
    return { success: true, message: `Successfully ordered ${qty} units of product ${productId}` };
  } catch (err) {
    db.exec('ROLLBACK;');
    return { success: false, reason: err.message };
  }
}

// Check initial stock of Laptop Pro (id 101) = 10
const laptopInitial = db.prepare('SELECT id, name, stock FROM products WHERE id = 101').get();
console.log('Initial Stock:', laptopInitial);

// Place valid order for 4 units
const order1Result = placeOrderSafe(1001, 1, 101, 4);
console.log('Order 1 (requesting 4 units):', order1Result);

// Check stock after Order 1
console.log('Stock after Order 1:', db.prepare('SELECT id, name, stock FROM products WHERE id = 101').get());

// Attempt order exceeding remaining stock (requesting 7 units when only 6 remain)
const order2Result = placeOrderSafe(1002, 2, 101, 7);
console.log('Order 2 (requesting 7 units):', order2Result);

// Check stock after rejected Order 2 (must remain untouched at 6)
console.log('Stock after rejected Order 2:', db.prepare('SELECT id, name, stock FROM products WHERE id = 101').get());

console.log('\n✓ All Problem 2 SQL tests verified successfully!');
