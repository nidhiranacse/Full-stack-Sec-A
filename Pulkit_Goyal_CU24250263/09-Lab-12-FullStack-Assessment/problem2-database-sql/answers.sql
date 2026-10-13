-- ====================================================================
-- Lab Sheet 12 Problem 2: SQL Solutions & Query Optimization
-- Student: Pulkit Goyal (CUID: CU24250263 | Roll Number: 40 | Section: A)
-- Course: Full Stack Web Development (B.Tech CSE)
-- ====================================================================

-- --------------------------------------------------------------------
-- QUERY 1: Multi-Table Join & Aggregate Revenue per Customer
-- Finds each customer's total lifetime spending and order count.
-- --------------------------------------------------------------------
SELECT 
    c.customer_id,
    c.name AS customer_name,
    c.email,
    COUNT(o.order_id) AS total_orders_placed,
    COALESCE(SUM(o.total_amount), 0.00) AS total_expenditure
FROM 
    customers c
LEFT JOIN 
    orders o ON c.customer_id = o.customer_id
GROUP BY 
    c.customer_id, c.name, c.email
ORDER BY 
    total_expenditure DESC;


-- --------------------------------------------------------------------
-- QUERY 2: Department-wise Salary Analytics with HAVING Filter
-- Identifies departments with average employee compensation > 60,000.
-- --------------------------------------------------------------------
SELECT 
    d.department_name,
    COUNT(e.employee_id) AS total_employees,
    ROUND(AVG(e.salary), 2) AS average_salary,
    MAX(e.salary) AS highest_salary,
    MIN(e.salary) AS lowest_salary
FROM 
    departments d
INNER JOIN 
    employees e ON d.department_id = e.department_id
GROUP BY 
    d.department_id, d.department_name
HAVING 
    AVG(e.salary) > 60000
ORDER BY 
    average_salary DESC;


-- --------------------------------------------------------------------
-- QUERY 3: Window Function - Top 2 Earners in Each Department
-- Uses DENSE_RANK() over department partition to rank employees.
-- --------------------------------------------------------------------
WITH RankedEmployees AS (
    SELECT 
        e.employee_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        d.department_name,
        e.salary,
        DENSE_RANK() OVER (
            PARTITION BY e.department_id 
            ORDER BY e.salary DESC
        ) AS salary_rank
    FROM 
        employees e
    INNER JOIN 
        departments d ON e.department_id = d.department_id
)
SELECT 
    employee_id,
    employee_name,
    department_name,
    salary,
    salary_rank
FROM 
    RankedEmployees
WHERE 
    salary_rank <= 2;


-- --------------------------------------------------------------------
-- QUERY 4: Subquery - Identify Unsold Products (Zero Orders)
-- Uses NOT EXISTS to select catalog items with no purchase history.
-- --------------------------------------------------------------------
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.price,
    p.stock_quantity
FROM 
    products p
WHERE NOT EXISTS (
    SELECT 1 
    FROM order_items oi 
    WHERE oi.product_id = p.product_id
);


-- --------------------------------------------------------------------
-- QUERY 5: Performance Optimization - B-Tree Indexes
-- Creates composite & targeted indexes to speed up filtered joins.
-- --------------------------------------------------------------------
-- Index for quick customer lookup during order join
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id);

-- Index for date-range reports and status queries
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders (order_date, status);

-- Composite index on employee department and salary for ranking speed
CREATE INDEX IF NOT EXISTS idx_emp_dept_salary ON employees (department_id, salary DESC);
