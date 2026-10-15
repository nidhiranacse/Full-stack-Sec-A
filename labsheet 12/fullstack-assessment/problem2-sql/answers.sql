-- Dialect: PostgreSQL (use :name placeholders as bind parameters)

-- =====================================================================
-- (a) Top 3 products by revenue within each category (ties included)
-- =====================================================================
WITH product_revenue AS (
    SELECT p.id,
           p.name,
           p.category,
           SUM(p.price * oi.qty) AS revenue
    FROM products p
    JOIN order_items oi ON oi.product_id = p.id
    GROUP BY p.id, p.name, p.category
),
ranked AS (
    SELECT pr.*,
           DENSE_RANK() OVER (PARTITION BY pr.category ORDER BY pr.revenue DESC) AS rnk
    FROM product_revenue pr
)
SELECT id, name, category, revenue, rnk
FROM ranked
WHERE rnk <= 3
ORDER BY category, rnk, name;


-- =====================================================================
-- (b) Customers with at least one order in EVERY month Jan-Mar 2025
-- =====================================================================
SELECT c.id, c.name, c.city
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.order_date >= DATE '2025-01-01'
  AND o.order_date <  DATE '2025-04-01'
GROUP BY c.id, c.name, c.city
HAVING COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) = 3;


-- =====================================================================
-- (c) Place an order of :qty units of :product_id without overselling
-- =====================================================================
BEGIN;

-- Atomic check-and-decrement. The row is locked by the UPDATE, so
-- concurrent requests queue up and re-check the condition.
UPDATE products
SET    stock = stock - :qty
WHERE  id = :product_id
  AND  stock >= :qty;

-- The application checks the affected-row count:
--   rowcount = 0  ->  stock insufficient  ->  run ROLLBACK; and report failure
--   rowcount = 1  ->  continue with the statements below

WITH new_order AS (
    INSERT INTO orders (customer_id, order_date)
    VALUES (:customer_id, CURRENT_DATE)
    RETURNING id
)
INSERT INTO order_items (order_id, product_id, qty)
SELECT id, :product_id, :qty FROM new_order;

COMMIT;
-- On insufficient stock (or any error):  ROLLBACK;

/*
Why SELECT followed by UPDATE is unsafe:
Two concurrent requests can both SELECT the same stock value (say 5) before
either one writes, so both decide "enough stock" and both subtract, driving
stock negative (a race condition / lost update). The check and the write are
not one atomic step. A single conditional UPDATE (or SELECT ... FOR UPDATE
inside a transaction) makes the database lock the row so the check and the
decrement happen together.
*/
