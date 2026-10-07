-- =====================================================
-- Problem 2: SQL Analytics and Concurrency
-- =====================================================


-- =====================================================
-- (a) Top 3 products by revenue within each category
--     Using DENSE_RANK so ties are included
-- =====================================================

WITH product_revenue AS (
    SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.price,
        COALESCE(SUM(oi.qty), 0) AS total_quantity,
        p.price * COALESCE(SUM(oi.qty), 0) AS revenue
    FROM products p
    LEFT JOIN order_items oi
        ON p.id = oi.product_id
    GROUP BY
        p.id,
        p.name,
        p.category,
        p.price
),

ranked_products AS (
    SELECT
        product_id,
        product_name,
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
    product_id,
    product_name,
    category,
    price,
    total_quantity,
    revenue,
    revenue_rank
FROM ranked_products
WHERE revenue_rank <= 3
ORDER BY
    category,
    revenue_rank,
    product_id;



-- =====================================================
-- (b) Customers who placed at least one order
--     in EVERY month from January to March 2025
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
HAVING COUNT(
    DISTINCT DATE_TRUNC('month', o.order_date)
) = 3
ORDER BY c.id;



-- =====================================================
-- (c) Transaction to place an order without overselling
--     PostgreSQL version
-- =====================================================

BEGIN;

-- Lock the product row so concurrent transactions
-- cannot modify its stock at the same time.
SELECT
    id,
    name,
    price,
    stock
FROM products
WHERE id = :product_id
FOR UPDATE;


-- If stock is less than :qty, the application must
-- ROLLBACK the transaction and report failure.

-- If sufficient stock is available:
UPDATE products
SET stock = stock - :qty
WHERE id = :product_id
  AND stock >= :qty;


-- Insert the order
INSERT INTO orders (
    customer_id,
    order_date
)
VALUES (
    :customer_id,
    CURRENT_TIMESTAMP
)
RETURNING id;


-- Insert the ordered product.
-- Use the order id returned by the previous statement.
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


-- =====================================================
-- Concurrency explanation:
--
-- A plain SELECT followed by UPDATE can be unsafe because
-- two transactions may read the same stock value before
-- either one updates it. Both requests can then believe
-- enough stock exists and oversell the product.
--
-- FOR UPDATE locks the selected product row until the
-- transaction finishes, so concurrent requests are
-- serialized for that product.
-- =====================================================