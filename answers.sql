-- (a) Top 3 products by revenue within each category (ties included)
WITH product_revenue AS (
    SELECT p.id, p.name, p.category,
           SUM(p.price * oi.qty) AS revenue
    FROM products p
    JOIN order_items oi ON oi.product_id = p.id
    GROUP BY p.id, p.name, p.category
),
ranked AS (
    SELECT *, DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk
    FROM product_revenue
)
SELECT category, name, revenue, rnk
FROM ranked
WHERE rnk <= 3
ORDER BY category, rnk, name;

-- (b) Customers with at least one order in EVERY month of Jan-Mar 2025
SELECT c.id, c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.order_date >= DATE '2025-01-01'
  AND o.order_date <  DATE '2025-04-01'
GROUP BY c.id, c.name
HAVING COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) = 3;

-- (c) Oversell-safe order placement (PostgreSQL; :qty, :product_id, :customer_id are bind params)
BEGIN;

-- Atomic check-and-decrement: takes a row lock, so concurrent requests queue up here.
UPDATE products
SET    stock = stock - :qty
WHERE  id = :product_id
  AND  stock >= :qty;
-- Application checks rows affected. If 0 (insufficient stock or no such product):
--     ROLLBACK;  and report failure to the caller.
-- If 1, continue:

INSERT INTO orders (customer_id, order_date)
VALUES (:customer_id, CURRENT_DATE)
RETURNING id;                                   -- use as :order_id

INSERT INTO order_items (order_id, product_id, qty)
VALUES (:order_id, :product_id, :qty);

COMMIT;

/* Why SELECT-then-UPDATE is unsafe:
   Two requests can both SELECT stock = 5 before either one writes. Each sees "enough" stock
   for qty = 5, both run UPDATE, and 10 units are sold from 5 (a race / lost update).
   The check and the write must be one atomic statement (UPDATE ... WHERE stock >= :qty),
   or the row must be locked with SELECT ... FOR UPDATE inside the transaction. */
