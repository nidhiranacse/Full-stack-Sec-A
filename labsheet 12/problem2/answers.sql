-- =====================================================================
-- Problem 2: SQL Analytics and Concurrency
-- Schema:
--   customers(id, name, city)
--   products(id, name, category, price, stock)
--   orders(id, customer_id, order_date)
--   order_items(order_id, product_id, qty)
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- (a) Top 3 products by revenue within each category
--     Revenue = price × total quantity sold
--     DENSE_RANK so that ties are included
-- ─────────────────────────────────────────────────────────────────────

SELECT category, product_name, revenue
FROM (
    SELECT
        p.category,
        p.name        AS product_name,
        SUM(p.price * oi.qty) AS revenue,
        DENSE_RANK() OVER (
            PARTITION BY p.category
            ORDER BY SUM(p.price * oi.qty) DESC
        ) AS rnk
    FROM products p
    JOIN order_items oi ON oi.product_id = p.id
    GROUP BY p.category, p.id, p.name
) ranked
WHERE rnk <= 3
ORDER BY category, rnk;


-- ─────────────────────────────────────────────────────────────────────
-- (b) Customers who placed at least one order in every month
--     from January to March 2025
-- ─────────────────────────────────────────────────────────────────────

SELECT c.id, c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.order_date >= '2025-01-01'
  AND o.order_date <  '2025-04-01'
GROUP BY c.id, c.name
HAVING COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) = 3;


-- ─────────────────────────────────────────────────────────────────────
-- (c) Transaction: place an order of :qty units of :product_id
--     without overselling under concurrent requests
-- ─────────────────────────────────────────────────────────────────────

BEGIN TRANSACTION;

-- Attempt to decrement stock atomically.
-- The WHERE clause ensures we only succeed if enough stock exists.
UPDATE products
SET    stock = stock - :qty
WHERE  id    = :product_id
  AND  stock >= :qty;

-- Check whether the UPDATE affected exactly one row.
-- If zero rows were affected, stock was insufficient → rollback.
-- (Pseudocode — actual syntax depends on the RDBMS)

-- PostgreSQL example using GET DIAGNOSTICS or checking ROW_COUNT:
-- If ROW_COUNT = 0 then ROLLBACK and RAISE 'Insufficient stock';

-- If the row was updated, proceed to create the order:
INSERT INTO orders (customer_id, order_date)
VALUES (:customer_id, CURRENT_DATE);

-- Retrieve the new order id (e.g. LASTVAL() in PostgreSQL, LAST_INSERT_ID() in MySQL)
INSERT INTO order_items (order_id, product_id, qty)
VALUES (LASTVAL(), :product_id, :qty);

COMMIT;

-- ── Explanation ─────────────────────────────────────────────────────
-- A plain SELECT followed by a separate UPDATE is unsafe because two
-- concurrent transactions can both SELECT the same stock value and
-- each conclude there is enough stock. They then both run the UPDATE,
-- and the total deducted exceeds the real available stock (a classic
-- race condition / lost-update problem). The single UPDATE … WHERE
-- stock >= :qty approach is atomic, so the database guarantees only
-- one transaction can reduce stock below the threshold.
