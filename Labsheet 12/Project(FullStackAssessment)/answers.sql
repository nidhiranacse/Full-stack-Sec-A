-- Problem 2(a): Top 3 products by revenue within each category
-- DENSE_RANK includes ties in the top 3 ranking.

WITH ProductRevenue AS (
    SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.price * SUM(oi.qty) AS revenue
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.id, p.name, p.category, p.price
),
RankedProducts AS (
    SELECT
        product_id,
        product_name,
        category,
        revenue,
        DENSE_RANK() OVER (
            PARTITION BY category
            ORDER BY revenue DESC
        ) AS revenue_rank
    FROM ProductRevenue
)
SELECT product_id, product_name, category, revenue, revenue_rank
FROM RankedProducts
WHERE revenue_rank <= 3
ORDER BY category, revenue_rank;


-- Problem 2(b): Customers with an order in every month
-- from January to March 2025.

SELECT c.id, c.name, c.city
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.order_date >= '2025-01-01'
  AND o.order_date < '2025-04-01'
GROUP BY c.id, c.name, c.city
HAVING COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) = 3;


-- Problem 2(c): Place an order without overselling.
-- PostgreSQL-style transaction example.

BEGIN;

UPDATE products
SET stock = stock - :qty
WHERE id = :product_id
  AND :qty > 0
  AND stock >= :qty;

-- Application must check the affected row count.
-- If it is not exactly one, ROLLBACK and report failure.
-- Otherwise, insert the order and order_items records here.
-- Commit only after the inserts succeed.

COMMIT;

-- Explanation:
-- A plain SELECT followed by UPDATE is unsafe because two requests
-- can read the same stock before either request updates it.
-- Both requests might then try to sell units using the old stock value.
-- A conditional UPDATE checks and decreases stock atomically.