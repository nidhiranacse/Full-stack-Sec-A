-- Q1: Current overdue issues with member, title, days overdue and fine.
SELECT m.name AS member_name, b.title AS book_title,
       CAST(julianday(date('now')) - julianday(i.due_on) AS INTEGER) AS days_overdue,
       CAST(julianday(date('now')) - julianday(i.due_on) AS INTEGER) * 2 AS fine
FROM issues i
JOIN members m ON m.id = i.member_id
JOIN books b ON b.id = i.book_id
WHERE i.returned_on IS NULL AND i.due_on < date('now')
ORDER BY i.due_on;

-- Q2: Top 3 books by total number of issue records.
SELECT b.id, b.title, COUNT(i.id) AS times_issued
FROM books b LEFT JOIN issues i ON i.book_id = b.id
GROUP BY b.id, b.title
ORDER BY times_issued DESC, b.id ASC
LIMIT 3;
