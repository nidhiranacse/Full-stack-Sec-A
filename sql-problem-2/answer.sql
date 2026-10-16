-- ============================================================
-- Problem 2: SQL Analytics and Concurrency
-- ============================================================


-- ============================================================
-- (a) TOP 3 PRODUCTS BY REVENUE WITHIN EACH CATEGORY
-- ============================================================

WITH product_revenue AS (
    SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.price,
        SUM(oi.qty) AS total_quantity_sold,
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
        product_id,
        product_name,
        category,
        total_quantity_sold,
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
    total_quantity_sold,
    revenue,
    revenue_rank
FROM ranked_products
WHERE revenue_rank <= 3
ORDER BY category, revenue_rank;


-- ============================================================
-- (b) CUSTOMERS WHO ORDERED IN EVERY MONTH
--     FROM JANUARY TO MARCH 2025
-- ============================================================

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
HAVING COUNT(DISTINCT MONTH(o.order_date)) = 3
ORDER BY c.id;


-- ============================================================
-- (c) CONCURRENT-SAFE ORDER TRANSACTION
-- ============================================================

START TRANSACTION;

-- Lock the product row so another transaction
-- cannot modify the stock simultaneously.
SELECT stock
FROM products
WHERE id = :product_id
FOR UPDATE;

-- Reduce stock only when sufficient stock exists.
UPDATE products
SET stock = stock - :qty
WHERE id = :product_id
  AND stock >= :qty;

-- Application must check whether the UPDATE affected
-- one row. If 0 rows were affected, execute ROLLBACK
-- and report "Insufficient stock".

-- If the UPDATE succeeded:
INSERT INTO orders (customer_id, order_date)
VALUES (:customer_id, CURRENT_DATE);

SET @order_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, product_id, qty)
VALUES (@order_id, :product_id, :qty);

COMMIT;

