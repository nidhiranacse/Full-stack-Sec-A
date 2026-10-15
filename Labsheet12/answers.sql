-- =====================================================
-- Problem 2(a)
-- Top 3 products by revenue within each category
-- =====================================================

WITH product_revenue AS (
    SELECT
        p.id,
        p.name,
        p.category,
        p.price,
        SUM(oi.qty) AS total_quantity,
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
        ) AS revenue_rank
    FROM product_revenue
)
SELECT
    id,
    name,
    category,
    total_quantity,
    revenue,
    revenue_rank
FROM ranked_products
WHERE revenue_rank <= 3
ORDER BY category, revenue_rank;


-- =====================================================
-- Problem 2(b)
-- Customers who placed at least one order
-- in every month from January to March 2025
-- =====================================================

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
HAVING COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) = 3;


-- =====================================================
-- Problem 2(c)
-- Transaction to place an order without overselling
-- =====================================================

BEGIN;

UPDATE products
SET stock = stock - :qty
WHERE id = :product_id
  AND stock >= :qty;

-- Check affected rows.
-- If 0 rows are affected:
-- ROLLBACK and report "Insufficient stock".

INSERT INTO orders (
    id,
    customer_id,
    order_date
)
VALUES (
    :order_id,
    :customer_id,
    CURRENT_DATE
);

INSERT INTO order_items (
    order_id,
    product_id,
    qty
)
VALUES (
    :order_id,
    :product_id,
    :qty
);

COMMIT;


-- Explanation:
-- A plain SELECT followed by UPDATE is unsafe because
-- two concurrent requests can read the same stock before
-- either request updates it, causing overselling.
-- The conditional UPDATE checks and decreases stock atomically.
