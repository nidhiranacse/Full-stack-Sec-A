-- =========================================================
-- Problem 2(a)
-- Top 3 products by revenue within each category
-- =========================================================

WITH product_revenue AS (
    SELECT
        p.id,
        p.name,
        p.category,
        p.price * SUM(oi.qty) AS revenue
    FROM products p
    JOIN order_items oi
        ON p.id = oi.product_id
    GROUP BY
        p.id,
        p.name,
        p.category,
        p.price
),
ranked_products AS (
    SELECT
        *,
        DENSE_RANK() OVER (
            PARTITION BY category
            ORDER BY revenue DESC
        ) AS rnk
    FROM product_revenue
)
SELECT
    id,
    name,
    category,
    revenue,
    rnk
FROM ranked_products
WHERE rnk <= 3
ORDER BY category, rnk;


-- =========================================================
-- Problem 2(b)
-- Customers who ordered in January, February and March 2025
-- =========================================================

SELECT
    c.id,
    c.name,
    c.city
FROM customers c
JOIN orders o
    ON c.id = o.customer_id
WHERE o.order_date >= '2025-01-01'
  AND o.order_date < '2025-04-01'
GROUP BY
    c.id,
    c.name,
    c.city
HAVING COUNT(
    DISTINCT EXTRACT(MONTH FROM o.order_date)
) = 3;


-- =========================================================
-- Problem 2(c)
-- Safe transaction without overselling
-- =========================================================

START TRANSACTION;

UPDATE products
SET stock = stock - :qty
WHERE id = :product_id
  AND stock >= :qty;

-- Application must check that exactly 1 row was updated.
-- If affected rows = 0, rollback and report insufficient stock.

-- If update succeeded:
INSERT INTO orders (customer_id, order_date)
VALUES (:customer_id, CURRENT_TIMESTAMP);

-- Use the generated order ID for the following insert.
INSERT INTO order_items (order_id, product_id, qty)
VALUES (:order_id, :product_id, :qty);

COMMIT;


-- If stock update affected 0 rows:
-- ROLLBACK;


-- Explanation:
-- A plain SELECT followed by UPDATE is unsafe because two concurrent
-- requests can read the same stock before either one updates it.
-- Both may then reduce the stock, causing overselling.
-- The conditional UPDATE locks/checks the row atomically.