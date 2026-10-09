-- Q1: Overdue issues with member, book, days overdue, and fine.
-- This query uses today's date and excludes returned issues.

SELECT
    m.name AS member_name,
    b.title AS book_title,
    CAST(
        julianday(date('now')) - julianday(i.due_date)
        AS INTEGER
    ) AS days_overdue,
    CAST(
        MAX(
            0,
            julianday(date('now')) - julianday(i.due_date)
        ) AS INTEGER
    ) * 2 AS fine
FROM issues i
JOIN members m ON m.id = i.member_id
JOIN books b ON b.id = i.book_id
WHERE i.returned_on IS NULL
  AND date(i.due_date) < date('now')
ORDER BY i.due_date;


-- Q2: Top 3 most-issued books, including returned issues.

SELECT
    b.id,
    b.code,
    b.title,
    COUNT(i.id) AS times_issued
FROM books b
LEFT JOIN issues i ON i.book_id = b.id
GROUP BY b.id, b.code, b.title
ORDER BY times_issued DESC, b.id ASC
LIMIT 3;