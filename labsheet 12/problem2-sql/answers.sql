-- Schema: customers(id, name, city)
--         products(id, name, category, price, stock)
--         orders(id, customer_id, order_date)
--         order_items(order_id, product_id, qty)
-- Dialect: PostgreSQL (parts a and b also run on MySQL 8+).

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
           DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk
    FROM product_revenue pr
)
SELECT category, id, name, revenue, rnk
FROM ranked
WHERE rnk <= 3
ORDER BY category, rnk, name;

-- =====================================================================
-- (b) Customers who ordered in EVERY month from Jan to Mar 2025
-- =====================================================================
SELECT c.id, c.name
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.order_date >= DATE '2025-01-01'
  AND o.order_date <  DATE '2025-04-01'
GROUP BY c.id, c.name
HAVING COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) = 3;

-- =====================================================================
-- (c) Oversell-safe order placement (single transaction)
-- Parameters: :customer_id, :product_id, :qty
-- =====================================================================
BEGIN;

-- Atomic check-and-decrement: the row is locked by the UPDATE and the
-- stock >= :qty test runs on the locked, latest value.
UPDATE products
SET    stock = stock - :qty
WHERE  id = :product_id
  AND  stock >= :qty;

-- Application code: if the UPDATE reported 0 rows affected, stock was
-- insufficient  ->  run ROLLBACK; and return "failure" to the caller.
-- If it reported 1 row affected, continue:

INSERT INTO orders (customer_id, order_date)
VALUES (:customer_id, CURRENT_DATE)
RETURNING id;                      -- use this id as :order_id below

INSERT INTO order_items (order_id, product_id, qty)
VALUES (:order_id, :product_id, :qty);

COMMIT;

-- ---------------------------------------------------------------------
-- Same thing as a PostgreSQL function: the rollback and failure report
-- happen automatically because RAISE EXCEPTION aborts the transaction.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION place_order(p_customer_id INT, p_product_id INT, p_qty INT)
RETURNS INT AS $$
DECLARE
    v_order_id INT;
BEGIN
    UPDATE products
    SET    stock = stock - p_qty
    WHERE  id = p_product_id AND stock >= p_qty;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;  -- rolls back
    END IF;

    INSERT INTO orders (customer_id, order_date)
    VALUES (p_customer_id, CURRENT_DATE)
    RETURNING id INTO v_order_id;

    INSERT INTO order_items (order_id, product_id, qty)
    VALUES (v_order_id, p_product_id, p_qty);

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT place_order(1, 10, 2);

-- ---------------------------------------------------------------------
-- Why SELECT followed by UPDATE is unsafe (race condition):
-- Two concurrent requests can both SELECT stock = 1 before either one
-- writes, both decide "enough stock", and both UPDATE, driving stock to -1
-- (overselling). The check and the write are not one atomic step.
-- A conditional UPDATE (or SELECT ... FOR UPDATE) locks the row, so the
-- second request waits and then re-checks the already-reduced stock.
-- ---------------------------------------------------------------------
