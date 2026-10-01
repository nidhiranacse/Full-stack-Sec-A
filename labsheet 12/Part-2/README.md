# 🗄️ Labsheet 12 — Part 2: Advanced SQL Queries

---

## 📐 Schema

```sql
CREATE TABLE customers (
    id    INT PRIMARY KEY,
    name  VARCHAR(100),
    city  VARCHAR(100)
);

CREATE TABLE products (
    id        INT PRIMARY KEY,
    name      VARCHAR(100),
    category  VARCHAR(50),
    price     DECIMAL(10,2),
    stock     INT
);

CREATE TABLE orders (
    id            INT PRIMARY KEY,
    customer_id   INT REFERENCES customers(id),
    order_date    DATE
);

CREATE TABLE order_items (
    order_id    INT REFERENCES orders(id),
    product_id  INT REFERENCES products(id),
    qty         INT
);
```

---

## (a) Top 3 Products by Revenue Within Each Category

> Revenue = `price × total quantity sold`.  
> Uses `DENSE_RANK()` so that products with equal revenue share the same rank and none are excluded.

```sql
SELECT
    category,
    product_id,
    product_name,
    total_revenue,
    rnk
FROM (
    SELECT
        p.category,
        p.id                          AS product_id,
        p.name                        AS product_name,
        p.price * SUM(oi.qty)         AS total_revenue,
        DENSE_RANK() OVER (
            PARTITION BY p.category
            ORDER BY p.price * SUM(oi.qty) DESC
        ) AS rnk
    FROM products   p
    JOIN order_items oi ON oi.product_id = p.id
    GROUP BY p.category, p.id, p.name, p.price
) ranked
WHERE rnk <= 3
ORDER BY category, rnk;
```

**How it works:**

| Step | Explanation |
|------|-------------|
| `JOIN` + `GROUP BY` | Aggregates total quantity sold per product |
| `p.price * SUM(oi.qty)` | Computes revenue for each product |
| `DENSE_RANK() OVER (PARTITION BY category …)` | Ranks products within each category; ties get the same rank |
| `WHERE rnk <= 3` | Keeps only the top 3 ranks (including all ties) |

---

## (b) Customers Who Ordered in Every Month from Jan–Mar 2025

> A customer qualifies only if they placed **at least one order** in **each** of the three months.

```sql
SELECT o.customer_id, c.name
FROM orders    o
JOIN customers c ON c.id = o.customer_id
WHERE o.order_date >= '2025-01-01'
  AND o.order_date <  '2025-04-01'
GROUP BY o.customer_id, c.name
HAVING COUNT(DISTINCT EXTRACT(MONTH FROM o.order_date)) = 3;
```

**How it works:**

| Step | Explanation |
|------|-------------|
| `WHERE` clause | Filters orders to the Jan–Mar 2025 window |
| `EXTRACT(MONTH FROM order_date)` | Pulls the month number (1, 2, or 3) |
| `COUNT(DISTINCT …) = 3` | Ensures the customer has orders in all 3 distinct months |

---

## (c) Safe Transactional Order Placement (Preventing Overselling)

### The Transaction

```sql
BEGIN TRANSACTION;

-- 1. Lock the row and check stock in one atomic step
SELECT stock
  FROM products
 WHERE id = :product_id
   FOR UPDATE;                -- row-level exclusive lock

-- 2. If stock < :qty  → abort
-- (handled by the IF / application-level check below)

-- If insufficient stock:
--   ROLLBACK;
--   RAISE / SIGNAL 'Insufficient stock';

-- 3. Otherwise, deduct stock and place the order
UPDATE products
   SET stock = stock - :qty
 WHERE id = :product_id
   AND stock >= :qty;         -- safety net: double-check inside UPDATE

-- Check ROW_COUNT; if 0 rows affected → stock was insufficient
-- In that case: ROLLBACK; RAISE 'Insufficient stock';

INSERT INTO orders (customer_id, order_date)
VALUES (:customer_id, CURRENT_DATE);

-- Retrieve the newly generated order id (e.g., LAST_INSERT_ID() in MySQL)
INSERT INTO order_items (order_id, product_id, qty)
VALUES (LAST_INSERT_ID(), :product_id, :qty);

COMMIT;
```

### Full Example (MySQL / MariaDB stored procedure)

```sql
DELIMITER $$

CREATE PROCEDURE place_order (
    IN p_customer_id INT,
    IN p_product_id  INT,
    IN p_qty         INT
)
BEGIN
    DECLARE v_stock INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT 'FAILURE: transaction rolled back due to an error.' AS result;
    END;

    START TRANSACTION;

    -- Lock the product row exclusively
    SELECT stock INTO v_stock
      FROM products
     WHERE id = p_product_id
       FOR UPDATE;

    -- Check stock
    IF v_stock IS NULL THEN
        ROLLBACK;
        SELECT 'FAILURE: product not found.' AS result;
    ELSEIF v_stock < p_qty THEN
        ROLLBACK;
        SELECT 'FAILURE: insufficient stock. Requested '
               + CAST(p_qty AS CHAR)
               + ', available '
               + CAST(v_stock AS CHAR) AS result;
    ELSE
        -- Deduct stock
        UPDATE products
           SET stock = stock - p_qty
         WHERE id = p_product_id;

        -- Create the order
        INSERT INTO orders (customer_id, order_date)
        VALUES (p_customer_id, CURRENT_DATE);

        -- Add order item
        INSERT INTO order_items (order_id, product_id, qty)
        VALUES (LAST_INSERT_ID(), p_product_id, p_qty);

        COMMIT;
        SELECT 'SUCCESS: order placed.' AS result;
    END IF;
END$$

DELIMITER ;
```

### Why a Plain `SELECT` Followed by `UPDATE` Is Unsafe

> A plain `SELECT stock FROM products WHERE id = :product_id` followed by a separate `UPDATE` is **not safe under concurrency** because there is a **race condition** (also called a *TOCTOU — Time Of Check To Time Of Use* problem). Between the moment one transaction reads the stock value and the moment it writes the decremented value, another concurrent transaction can also read the **same original stock** and proceed with its own decrement. Both transactions "see" sufficient stock and both succeed, but the combined quantity sold can **exceed the actual available stock**, leading to **overselling**. The `SELECT … FOR UPDATE` (pessimistic locking) or an `UPDATE … WHERE stock >= :qty` check (optimistic guard) prevents this by ensuring the stock check and the deduction happen atomically, blocking other writers until the first transaction commits or rolls back.
