import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("booknest_token") || ""
  );

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("booknest_user") || "null")
  );

  const [email, setEmail] = useState("admin@lib.example");
  const [password, setPassword] = useState("Pass@123");

  const [books, setBooks] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function login(e) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(`${API}/auth/login`, {
        email,
        password
      });

      setToken(res.data.token);
      setUser(res.data.user);

      localStorage.setItem("booknest_token", res.data.token);
      localStorage.setItem(
        "booknest_user",
        JSON.stringify(res.data.user)
      );
    } catch (err) {
      setMessage(
        err.response?.data?.error?.message || "Login failed"
      );
    }
  }

  function logout() {
    localStorage.removeItem("booknest_token");
    localStorage.removeItem("booknest_user");
    setToken("");
    setUser(null);
    setBooks([]);
    setMyIssues([]);
  }

  async function loadBooks() {
    try {
      const res = await axios.get(`${API}/books`, {
        params: {
          search,
          page,
          limit: 5
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBooks(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setMessage(
        err.response?.data?.error?.message || "Could not load books"
      );
    }
  }

  async function loadMyIssues() {
    try {
      const res = await axios.get(`${API}/issues/mine`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMyIssues(res.data);
    } catch (err) {
      setMessage(
        err.response?.data?.error?.message || "Could not load issues"
      );
    }
  }

  useEffect(() => {
    if (token) {
      loadBooks();

      if (user?.role === "member") {
        loadMyIssues();
      }
    }
  }, [token, page]);

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>📚 BookNest</h1>
          <p>College Library Tracker</p>

          <form onSubmit={login}>
            <input
              style={styles.input}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button style={styles.button}>Login</button>
          </form>

          {message && <p style={styles.error}>{message}</p>}

          <small>
            Librarian: admin@lib.example
            <br />
            Members: aarav@lib.example / meera@lib.example
            <br />
            Password: Pass@123
          </small>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1>📚 BookNest</h1>
          <p>
            Welcome, <b>{user.name}</b> ({user.role})
          </p>
        </div>

        <button style={styles.button} onClick={logout}>
          Logout
        </button>
      </div>

      {message && <p style={styles.error}>{message}</p>}

      <div style={styles.card}>
        <h2>Book Catalogue</h2>

        <input
          style={styles.input}
          placeholder="Search title or author..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <button style={styles.button} onClick={loadBooks}>
          Search
        </button>

        {books.length === 0 ? (
          <p>No books found.</p>
        ) : (
          books.map((book) => (
            <div key={book.id} style={styles.book}>
              <b>{book.title}</b>
              <p>Author: {book.author}</p>
              <p>Code: {book.code}</p>
              <p>
                Available: {book.available_copies} /{" "}
                {book.total_copies}
              </p>
            </div>
          ))
        )}

        <div>
          <button
            style={styles.button}
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <span style={{ margin: "0 15px" }}>
            Page {page} of {totalPages}
          </span>

          <button
            style={styles.button}
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {user.role === "member" && (
        <div style={styles.card}>
          <h2>My Issues</h2>

          {myIssues.length === 0 ? (
            <p>No issues found.</p>
          ) : (
            myIssues.map((issue) => (
              <div key={issue.id} style={styles.book}>
                <b>{issue.title}</b>
                <p>Due: {new Date(issue.due_on).toLocaleDateString()}</p>
                <p>
                  Status:{" "}
                  {issue.returned_on ? "Returned" : "Active"}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "auto",
    padding: "20px",
    fontFamily: "Arial"
  },
  card: {
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  input: {
    display: "block",
    width: "100%",
    maxWidth: "400px",
    padding: "10px",
    margin: "10px 0",
    boxSizing: "border-box"
  },
  button: {
    padding: "10px 15px",
    margin: "5px",
    cursor: "pointer"
  },
  book: {
    padding: "12px",
    margin: "10px 0",
    background: "#f5f5f5",
    borderRadius: "8px"
  },
  error: {
    color: "red"
  }
};

export default App;