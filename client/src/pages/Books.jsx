import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Books() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, page]);

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/books", {
        params: {
          search: search.trim(),
          page,
          limit: 5,
        },
      });

      const data = response.data;
      setBooks(Array.isArray(data) ? data : data.books || []);
      setPagination({
        total: data.total ?? 0,
        totalPages: data.totalPages ?? 1,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load books. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("booknest_token");
    localStorage.removeItem("booknest_user");
    navigate("/login");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.brand}>📚 BookNest</h1>
          <p style={styles.tagline}>Discover your next great read</p>
        </div>
        <button style={styles.logout} onClick={logout}>
          Sign Out
        </button>
      </header>

      <main style={styles.main}>
        <section style={styles.welcome}>
          <h2>Explore the Library</h2>
          <p>Search your favourite books and check their availability.</p>
        </section>

        <input
          style={styles.search}
          type="search"
          placeholder="🔍 Search by title, author, or ISBN..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />

        <div style={styles.count}>
          {pagination.total} books found
        </div>

        {loading && <p style={styles.message}>Loading books...</p>}

        {error && (
          <div style={styles.error}>
            {error}
            <button style={styles.retry} onClick={loadBooks}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <p style={styles.message}>No books found. Try another search.</p>
        )}

        <div style={styles.grid}>
          {books.map((book) => {
            const available =
              book.available_copies ?? book.availableCopies ?? 0;

            return (
              <article key={book.id} style={styles.card}>
                <div style={styles.bookIcon}>📖</div>
                <div style={styles.bookInfo}>
                  <h3 style={styles.bookTitle}>{book.title}</h3>
                  <p style={styles.author}>
                    by {book.author || "Unknown author"}
                  </p>

                  {book.isbn && (
                    <p style={styles.isbn}>ISBN: {book.isbn}</p>
                  )}

                  <span
                    style={{
                      ...styles.badge,
                      background: available > 0 ? "#dcfce7" : "#fee2e2",
                      color: available > 0 ? "#166534" : "#991b1b",
                    }}
                  >
                    {available > 0
                      ? `${available} available`
                      : "Currently unavailable"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <div style={styles.pagination}>
          <button
            style={styles.pageButton}
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
          >
            ← Previous
          </button>

          <span>
            Page {page} of {pagination.totalPages}
          </span>

          <button
            style={styles.pageButton}
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next →
          </button>
        </div>
      </main>

      <footer style={styles.footer}>
        BookNest Library Tracker · Read, Learn, Discover
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#1e293b",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    background: "#4338ca",
    color: "white",
    padding: "22px 6%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  brand: { margin: 0, fontSize: "28px" },
  tagline: { margin: "6px 0 0", color: "#e0e7ff" },
  logout: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #c7d2fe",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
  main: { maxWidth: "1100px", margin: "auto", padding: "30px 20px" },
  welcome: { marginBottom: "24px" },
  search: {
    width: "100%",
    padding: "15px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "16px",
    boxSizing: "border-box",
    background: "white",
  },
  count: { margin: "18px 0", color: "#64748b" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },
  card: {
    display: "flex",
    gap: "15px",
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 3px 10px rgba(15,23,42,0.04)",
  },
  bookIcon: {
    fontSize: "38px",
    background: "#eef2ff",
    borderRadius: "10px",
    padding: "12px",
    alignSelf: "flex-start",
  },
  bookInfo: { minWidth: 0 },
  bookTitle: { margin: "0 0 8px", overflowWrap: "anywhere" },
  author: { color: "#64748b", margin: "0 0 8px" },
  isbn: { fontSize: "12px", color: "#64748b" },
  badge: {
    display: "inline-block",
    marginTop: "8px",
    padding: "6px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  message: { padding: "30px", textAlign: "center", color: "#64748b" },
  error: {
    padding: "15px",
    margin: "15px 0",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
  },
  retry: { marginLeft: "12px", padding: "6px 12px", cursor: "pointer" },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    margin: "35px 0",
  },
  pageButton: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "8px",
    background: "#4338ca",
    color: "white",
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    padding: "25px",
    color: "#64748b",
    borderTop: "1px solid #e2e8f0",
  },
};