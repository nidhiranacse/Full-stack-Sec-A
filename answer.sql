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
        id,
        name,
        category,
        price,
        total_quantity,
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
    price,
    total_quantity,
    revenue,
    revenue_rank
FROM ranked_products
WHERE revenue_rank <= 3
ORDER BY category, revenue_rank;


-- =====================================================
-- Problem 2(b)
-- Customers who placed at least one order
-- in January, February and March 2025
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
-- Safe order placement transaction
-- =====================================================

BEGIN;

UPDATE products
SET stock = stock - :qty
WHERE id = :product_id
  AND stock >= :qty;

-- If 0 rows are affected, perform ROLLBACK.

INSERT INTO orders (customer_id, order_date)
VALUES (:customer_id, CURRENT_TIMESTAMP)
RETURNING id;

-- Use the returned id as :order_id.

INSERT INTO order_items (order_id, product_id, qty)
VALUES (:order_id, :product_id, :qty);

COMMIT;


-- Explanation:
-- A plain SELECT followed by UPDATE is unsafe because two concurrent
-- requests can both read the same available stock before either UPDATE.
-- Both requests may then succeed and reduce stock below the available amount.