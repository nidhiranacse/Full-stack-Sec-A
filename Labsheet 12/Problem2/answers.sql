-- ==========================================
-- LAB SHEET 12 - PROBLEM 2
-- ==========================================


-- P2(a)
-- Top 3 products by revenue in each category.
-- Ties are included using DENSE_RANK().

WITH product_revenue AS (
    SELECT
        p.id,
        p.name,
        p.category,
        p.price * SUM(oi.qty) AS revenue
    FROM products p
    JOIN order_items oi
        ON oi.product_id = p.id
    JOIN orders o
        ON o.id = oi.order_id
    GROUP BY
        p.id,
        p.name,
        p.category,
        p.price
),
ranked_products AS (
    SELECT
        id,
        name,
        category,
        revenue,
        DENSE_RANK() OVER (
            PARTITION BY category
            ORDER BY revenue DESC
        ) AS revenue_rank
    FROM product_revenue
)
SELECT
    id,
    name,
    category,
    revenue,
    revenue_rank
FROM ranked_products
WHERE revenue_rank <= 3
ORDER BY category, revenue_rank, name;


-- ==========================================
-- P2(b)
-- Customers who placed at least one order
-- in every month from January to March 2025.
-- ==========================================

SELECT
    c.id,
    c.name,
    c.city
FROM customers c
JOIN orders o
    ON o.customer_id = c.id
WHERE o.order_date >= '2025-01-01'
  AND o.order_date < '2025-04-01'
GROUP BY
    c.id,
    c.name,
    c.city
HAVING COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) = 3;


-- ==========================================
-- P2(c)
-- Transaction-safe stock update.
-- Prevents overselling when multiple requests
-- try to purchase the same product.
-- ==========================================

BEGIN;

UPDATE products
SET stock = stock - :qty
WHERE id = :product_id
  AND stock >= :qty;

-- The application must check that exactly
-- one row was updated.
--
-- If 0 rows were updated:
--     ROLLBACK;
--
-- If 1 row was updated, continue:

INSERT INTO orders (customer_id, order_date)
VALUES (:customer_id, CURRENT_TIMESTAMP)
RETURNING id;

-- Use the returned order id as :order_id.

INSERT INTO order_items (order_id, product_id, qty)
VALUES (:order_id, :product_id, :qty);

COMMIT;

-- If the stock UPDATE affected 0 rows,
-- the transaction must be rolled back.
--
-- Why SELECT then UPDATE is unsafe:
-- Two concurrent transactions can both SELECT the
-- same available stock before either one updates it.
-- Both may then subtract stock, causing overselling.
-- The conditional UPDATE performs the stock check
-- and subtraction atomically under the database lock.