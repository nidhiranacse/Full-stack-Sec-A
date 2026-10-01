-- Problem 2(a)
-- Top 3 products by revenue within each category.
-- Ties are included using DENSE_RANK().

WITH product_revenue AS (
    SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        SUM(p.price * oi.qty) AS revenue
    FROM products p
    JOIN order_items oi
        ON p.id = oi.product_id
    JOIN orders o
        ON oi.order_id = o.id
    GROUP BY
        p.id,
        p.name,
        p.category
),
ranked_products AS (
    SELECT
        product_id,
        product_name,
        category,
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
    revenue,
    revenue_rank
FROM ranked_products
WHERE revenue_rank <= 3
ORDER BY category, revenue_rank, product_id;


-- Problem 2(b)
-- Customers who placed at least one order in every month
-- from January through March 2025.

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

-- Problem 2(c)
-- Safely place an order while preventing stock from going negative.

BEGIN;

-- Atomically check and decrease stock.
UPDATE products
SET stock = stock - :qty
WHERE id = :product_id
  AND stock >= :qty;

-- Application must check the number of affected rows:
-- 1 row -> enough stock, continue.
-- 0 rows -> insufficient stock/product not found -> ROLLBACK.

-- After confirming that the UPDATE affected exactly 1 row:

INSERT INTO orders (customer_id, order_date)
VALUES (:customer_id, CURRENT_DATE)
RETURNING id;

-- Use the ID returned by the previous INSERT as :order_id.

INSERT INTO order_items (order_id, product_id, qty)
VALUES (:order_id, :product_id, :qty);

COMMIT;

-- If the stock UPDATE affected 0 rows:
-- ROLLBACK;
-- Report: "Insufficient stock or product not found".