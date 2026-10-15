-- ============================================================================
-- FULL STACK DEVELOPMENT (BTCS303T) - CODING ASSESSMENT
-- Student Name: Rahul Raj
-- Roll / Student ID: cu24250116
-- Section: Sec-A
-- Problem 2: SQL Analytics and Concurrency
-- File: answers.sql
-- ============================================================================

-- Schema Reference:
-- customers(id, name, city)
-- products(id, name, category, price, stock)
-- orders(id, customer_id, order_date)
-- order_items(order_id, product_id, qty)


-- ============================================================================
-- (a) Top 3 products by revenue within each category.
-- Revenue is price × total quantity sold. 
-- Uses DENSE_RANK() window function so that ties are included.
-- ============================================================================

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


-- ============================================================================
-- (b) Customers who placed at least one order in every month from 
--     January to March 2025.
-- Filters orders between 2025-01-01 and 2025-03-31, groups by customer, 
-- and keeps those with COUNT(DISTINCT month) = 3.
-- ============================================================================

-- Standard ANSI SQL / PostgreSQL Syntax:
SELECT 
    c.id AS customer_id,
    c.name AS customer_name,
    c.city
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.order_date >= '2025-01-01' 
  AND o.order_date < '2025-04-01'
GROUP BY c.id, c.name, c.city
HAVING COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) = 3;

-- Note for SQLite / MySQL compatibility:
-- SQLite: HAVING COUNT(DISTINCT strftime('%Y-%m', o.order_date)) = 3
-- MySQL:  HAVING COUNT(DISTINCT DATE_FORMAT(o.order_date, '%Y-%m')) = 3


-- ============================================================================
-- (c) Concurrency-safe Order Transaction and TOCTOU Analysis
-- Places an order of :qty units of :product_id without overselling under 
-- concurrent requests. Rolls back and reports failure if stock is insufficient.
-- ============================================================================

-- Single Concurrency-Safe Transaction:
BEGIN TRANSACTION;

-- Step 1: Atomically decrement stock with an invariant guard
-- This takes an exclusive row lock and prevents the stock from dropping below zero
UPDATE products 
SET stock = stock - :qty
WHERE id = :product_id 
  AND stock >= :qty;

-- Step 2: Concurrency check (Check affected row count)
-- In procedural SQL / Application layer (e.g. Node.js / Python / PL-pgSQL):
-- IF ROW_COUNT() = 0 THEN
--     ROLLBACK;
--     RAISE EXCEPTION 'Order failed: Insufficient stock or invalid product ID';
-- END IF;

-- Step 3: Insert the order and order item records only upon confirmed decrement
INSERT INTO orders (id, customer_id, order_date)
VALUES (:order_id, :customer_id, CURRENT_TIMESTAMP);

INSERT INTO order_items (order_id, product_id, qty)
VALUES (:order_id, :product_id, :qty);

-- Step 4: Commit transaction to release row lock and persist changes
COMMIT;

/*
============================================================================
Explanation: Why a plain SELECT followed by an UPDATE is unsafe:
============================================================================
A plain SELECT followed by an UPDATE is unsafe because it introduces a 
Time-of-Check to Time-of-Use (TOCTOU) race condition between transactions. 
Two concurrent requests can both read the identical sufficient stock level before 
either issues their UPDATE, causing both updates to proceed and overselling inventory.
============================================================================
*/
