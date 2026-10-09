import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest, getBookList } from "./api";
import "./index.css";

const emptyBook = {
  code: "",
  title: "",
  author: "",
  total_copies: 1,
};

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("booknest_user") || "null");
    } catch {
      return null;
    }
  });

  const [email, setEmail] = useState("admin@lib.example");
  const [password, setPassword] = useState("Pass@123");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [page, setPage] = useState("books");
  const [books, setBooks] = useState([]);
  const [bookMeta, setBookMeta] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bookPage, setBookPage] = useState(1);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksError, setBooksError] = useState("");
  const [notice, setNotice] = useState(null);

  const [myIssues, setMyIssues] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);

  const [newBook, setNewBook] = useState(emptyBook);
  const [addBookLoading, setAddBookLoading] = useState(false);

  const [issueMember, setIssueMember] = useState("2");
  const [issueBookId, setIssueBookId] = useState("");
  const [issueLoading, setIssueLoading] = useState(false);

  const [returnLoadingId, setReturnLoadingId] = useState(null);
  const searchTimer = useRef(null);

  const isLibrarian = user?.role === "librarian";

  const showNotice = useCallback((message, type = "success") => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 4000);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("booknest_token");
    localStorage.removeItem("booknest_user");
    setUser(null);
    setBooks([]);
    setMyIssues([]);
    setOverdue([]);
    setPage("books");
    setLoginError("");
  }, []);

  const loadBooks = useCallback(async () => {
    setBooksLoading(true);
    setBooksError("");

    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        page: String(bookPage),
        limit: "8",
      });

      const result = await apiRequest(`/books?${params.toString()}`);
      const list = getBookList(result);

      setBooks(list);

      const pagination = result?.pagination || result?.meta || {};
      setBookMeta({
        total:
          pagination.total ??
          pagination.totalItems ??
          result?.total ??
          list.length,
        totalPages:
          pagination.totalPages ??
          result?.totalPages ??
          Math.max(1, Math.ceil((pagination.total ?? list.length) / 8)),
        page: pagination.page ?? result?.page ?? bookPage,
      });
    } catch (error) {
      setBooksError(error.message);
      setBooks([]);
    } finally {
      setBooksLoading(false);
    }
  }, [debouncedSearch, bookPage]);

  const loadMyIssues = useCallback(async () => {
    setIssuesLoading(true);

    try {
      const result = await apiRequest("/issues/mine");
      setMyIssues(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      showNotice(error.message, "error");
    } finally {
      setIssuesLoading(false);
    }
  }, [showNotice]);

  const loadOverdue = useCallback(async () => {
    setIssuesLoading(true);

    try {
      const result = await apiRequest("/issues/overdue");
      setOverdue(Array.isArray(result) ? result : result?.data || []);
    } catch (error) {
      showNotice(error.message, "error");
    } finally {
      setIssuesLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    if (!user) return;
    loadBooks();
  }, [user, loadBooks]);

  useEffect(() => {
    if (!user) return;

    if (page === "my-issues") loadMyIssues();
    if (page === "overdue" && isLibrarian) loadOverdue();
  }, [user, page, isLibrarian, loadMyIssues, loadOverdue]);

  useEffect(() => {
    searchTimer.current = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setBookPage(1);
    }, 300);

    return () => window.clearTimeout(searchTimer.current);
  }, [search]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!result.token || !result.user) {
        throw new Error("The server returned an unexpected login response.");
      }

      localStorage.setItem("booknest_token", result.token);
      localStorage.setItem("booknest_user", JSON.stringify(result.user));
      setUser(result.user);
      setPage("books");
      setBookPage(1);
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleAddBook(event) {
    event.preventDefault();
    setAddBookLoading(true);

    try {
      await apiRequest("/books", {
        method: "POST",
        body: JSON.stringify({
          ...newBook,
          code: newBook.code.trim(),
          title: newBook.title.trim(),
          author: newBook.author.trim(),
          total_copies: Number(newBook.total_copies),
        }),
      });

      setNewBook(emptyBook);
      showNotice("Book added successfully.");
      await loadBooks();
    } catch (error) {
      showNotice(error.message, "error");
    } finally {
      setAddBookLoading(false);
    }
  }

  async function handleIssueBook(event) {
    event.preventDefault();

    if (!issueBookId) {
      showNotice("Choose a book to issue.", "error");
      return;
    }

    setIssueLoading(true);

    try {
      await apiRequest("/issues", {
        method: "POST",
        body: JSON.stringify({
          member_id: Number(issueMember),
          book_id: Number(issueBookId),
        }),
      });

      showNotice("Book issued successfully. The loan period is 14 days.");
      setIssueBookId("");
      await loadBooks();
      if (page === "overdue") await loadOverdue();
    } catch (error) {
      showNotice(error.message, "error");
    } finally {
      setIssueLoading(false);
    }
  }

  async function handleReturn(issueId) {
    setReturnLoadingId(issueId);

    try {
      const result = await apiRequest(`/issues/${issueId}/return`, {
        method: "POST",
      });

      showNotice(`Book returned successfully. Fine: ₹${result.fine ?? 0}.`);
      await loadBooks();

      if (page === "my-issues") await loadMyIssues();
      if (page === "overdue") await loadOverdue();
    } catch (error) {
      showNotice(error.message, "error");
    } finally {
      setReturnLoadingId(null);
    }
  }

  const activeIssues = myIssues.filter((issue) => !issue.returned_on).length;
  const availableBooks = books.filter(
    (book) => Number(book.available_copies) > 0,
  ).length;
  const overdueCount = overdue.length;

  if (!user) {
    return (
      <main className="login-screen">
        <section className="login-brand">
          <div className="brand-mark large-mark">B</div>
          <p className="eyebrow">YOUR CAMPUS LIBRARY</p>
          <h1>Discover your next great read.</h1>
          <p className="brand-copy">
            One simple space to explore books, manage borrowing, and keep your
            reading journey organized.
          </p>
          <div className="login-feature">
            <span className="feature-icon">✦</span>
            <div>
              <strong>A smarter way to read</strong>
              <p>Search, borrow, and track your books with ease.</p>
            </div>
          </div>
          <div className="login-footer">BOOKNEST · LIBRARY TRACKER</div>
        </section>

        <section className="login-panel">
          <form className="login-card" onSubmit={handleLogin}>
            <div className="brand-mark small-mark">B</div>
            <p className="eyebrow">WELCOME BACK</p>
            <h2>Sign in to BookNest</h2>
            <p className="muted">
              Enter your library account details to continue.
            </p>

            {loginError && (
              <div className="alert error-alert" role="alert">
                {loginError}
              </div>
            )}

            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <button className="primary-button full-button" disabled={loginLoading}>
              {loginLoading ? "Signing in..." : "Sign in →"}
            </button>

            <div className="demo-account">
              <strong>Demo account</strong>
              <span>Admin: admin@lib.example</span>
              <span>Password: Pass@123</span>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setEmail("admin@lib.example");
                  setPassword("Pass@123");
                  setLoginError("");
                }}
              >
                Fill demo credentials
              </button>
            </div>

            <p className="login-legal">
              Secure access for library members and librarians.
            </p>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => setPage("books")}>
          <span className="brand-mark">B</span>
          <span>
            <strong>BookNest</strong>
            <small>LIBRARY TRACKER</small>
          </span>
        </a>

        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button
            className={page === "books" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("books")}
          >
            <span>▦</span> Book catalogue
          </button>
          <button
            className={page === "my-issues" ? "nav-item active" : "nav-item"}
            onClick={() => setPage("my-issues")}
          >
            <span>▤</span> {isLibrarian ? "My borrowing" : "My borrowed books"}
          </button>

          {isLibrarian && (
            <button
              className={page === "overdue" ? "nav-item active" : "nav-item"}
              onClick={() => setPage("overdue")}
            >
              <span>◷</span> Overdue books
              {overdueCount > 0 && (
                <span className="nav-count">{overdueCount}</span>
              )}
            </button>
          )}
        </nav>

        {isLibrarian && (
          <>
            <div className="side-label side-label-spaced">LIBRARIAN TOOLS</div>
            <div className="side-note">
              <span className="note-icon">✦</span>
              <strong>Library management</strong>
              <p>Add new titles, issue copies, and process returns.</p>
            </div>
          </>
        )}

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-symbol">?</span>
            <strong>Need a hand?</strong>
            <p>Contact your library administrator for assistance.</p>
          </div>
          <div className="user-profile">
            <div className="avatar">
              {(user.name || user.email || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-text">
              <strong>{user.name || user.email}</strong>
              <span>{isLibrarian ? "Librarian" : "Member"}</span>
            </div>
            <button
              className="icon-button"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>BookNest</span>
            <span className="breadcrumb-separator">/</span>
            <strong>
              {page === "books"
                ? "Book catalogue"
                : page === "my-issues"
                  ? "My borrowing"
                  : "Overdue books"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="today-label">{todayLabel()}</span>
            <span className="top-avatar">
              {(user.name || "U").slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>

        <div className="content">
          {notice && (
            <div
              className={`toast ${notice.type === "error" ? "toast-error" : ""}`}
              role="status"
            >
              <span>{notice.type === "error" ? "!" : "✓"}</span>
              {notice.message}
              <button
                aria-label="Dismiss message"
                onClick={() => setNotice(null)}
              >
                ×
              </button>
            </div>
          )}

          {page === "books" && (
            <>
              <section className="welcome-row">
                <div>
                  <p className="eyebrow">YOUR LIBRARY, AT A GLANCE</p>
                  <h1>{isLibrarian ? "Library overview" : "Explore the library"}</h1>
                  <p className="muted">
                    {isLibrarian
                      ? "Manage your catalogue and keep every book moving."
                      : "Find your next read and keep track of your borrowed books."}
                  </p>
                </div>
                <div className="welcome-date">
                  <span className="date-icon">▦</span>
                  <span>
                    <small>TODAY</small>
                    <strong>{todayLabel()}</strong>
                  </span>
                </div>
              </section>

              <section className="stats-grid">
                <StatCard
                  icon="▤"
                  label="Titles on this page"
                  value={books.length}
                  foot="Catalogue results"
                  tone="blue"
                />
                <StatCard
                  icon="✓"
                  label="Titles available"
                  value={availableBooks}
                  foot="With copies in stock"
                  tone="green"
                />
                <StatCard
                  icon="↗"
                  label="My active loans"
                  value={activeIssues}
                  foot="Your current borrowing"
                  tone="purple"
                />
                {isLibrarian ? (
                  <StatCard
                    icon="◷"
                    label="Overdue records"
                    value={overdueCount}
                    foot="Open overdue list to refresh"
                    tone="orange"
                  />
                ) : (
                  <StatCard
                    icon="⌕"
                    label="Search the catalogue"
                    value="Easy"
                    foot="Search by title or author"
                    tone="orange"
                  />
                )}
              </section>

              <section className="panel catalogue-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Book catalogue</h2>
                    <p>Search available titles across the library.</p>
                  </div>
                  <span className="result-count">
                    {bookMeta.total ?? books.length} records
                  </span>
                </div>

                <div className="toolbar">
                  <div className="search-box">
                    <span aria-hidden="true">⌕</span>
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by title or author..."
                      aria-label="Search books"
                    />
                    {search && (
                      <button
                        className="clear-search"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <button
                    className="secondary-button"
                    onClick={loadBooks}
                    disabled={booksLoading}
                  >
                    ↻ Refresh
                  </button>
                </div>

                {booksError && (
                  <div className="alert error-alert" role="alert">
                    {booksError}
                    <button className="text-button" onClick={loadBooks}>
                      Retry
                    </button>
                  </div>
                )}

                {booksLoading ? (
                  <div className="loading-state">
                    <span className="spinner" />
                    <p>Loading the catalogue...</p>
                  </div>
                ) : books.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">▤</span>
                    <h3>No books found</h3>
                    <p>Try a different search, or check back later.</p>
                    {search && (
                      <button
                        className="secondary-button"
                        onClick={() => setSearch("")}
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>BOOK DETAILS</th>
                          <th>BOOK CODE</th>
                          <th>AVAILABILITY</th>
                          <th>STOCK</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book) => {
                          const available = Number(book.available_copies) || 0;
                          const total = Number(book.total_copies) || 0;
                          return (
                            <tr key={book.id}>
                              <td>
                                <div className="book-cell">
                                  <div className="book-cover">
                                    {(book.title || "B")
                                      .slice(0, 1)
                                      .toUpperCase()}
                                  </div>
                                  <div>
                                    <strong>{book.title}</strong>
                                    <span>{book.author}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="code-chip">{book.code}</span>
                              </td>
                              <td>
                                <span
                                  className={`status-pill ${available > 0 ? "status-available" : "status-unavailable"
                                    }`}
                                >
                                  <span className="status-dot" />
                                  {available > 0 ? "Available" : "Checked out"}
                                </span>
                              </td>
                              <td>
                                <strong>{available}</strong>
                                <span className="stock-total"> / {total}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="pagination">
                  <span>
                    Page {bookPage} of {Math.max(1, Number(bookMeta.totalPages) || 1)}
                  </span>
                  <div>
                    <button
                      className="page-button"
                      disabled={bookPage <= 1 || booksLoading}
                      onClick={() => setBookPage((current) => Math.max(1, current - 1))}
                    >
                      ← Previous
                    </button>
                    <button
                      className="page-button"
                      disabled={
                        booksLoading ||
                        bookPage >= (Number(bookMeta.totalPages) || 1)
                      }
                      onClick={() =>
                        setBookPage((current) =>
                          Math.min(Number(bookMeta.totalPages) || current + 1, current + 1),
                        )
                      }
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </section>

              {isLibrarian && (
                <div className="management-grid">
                  <section className="panel form-panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Add a new book</h2>
                        <p>Add a title to your library catalogue.</p>
                      </div>
                      <span className="panel-icon">＋</span>
                    </div>

                    <form className="stack-form" onSubmit={handleAddBook}>
                      <div className="form-row">
                        <div>
                          <label htmlFor="book-code">Book code</label>
                          <input
                            id="book-code"
                            value={newBook.code}
                            onChange={(event) =>
                              setNewBook({ ...newBook, code: event.target.value })
                            }
                            placeholder="LIB-1006"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="book-copies">Total copies</label>
                          <input
                            id="book-copies"
                            type="number"
                            min="1"
                            max="1000"
                            value={newBook.total_copies}
                            onChange={(event) =>
                              setNewBook({
                                ...newBook,
                                total_copies: event.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="book-title">Book title</label>
                        <input
                          id="book-title"
                          value={newBook.title}
                          onChange={(event) =>
                            setNewBook({ ...newBook, title: event.target.value })
                          }
                          placeholder="Enter the book title"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="book-author">Author</label>
                        <input
                          id="book-author"
                          value={newBook.author}
                          onChange={(event) =>
                            setNewBook({ ...newBook, author: event.target.value })
                          }
                          placeholder="Enter author name"
                          required
                        />
                      </div>
                      <button
                        className="primary-button"
                        disabled={addBookLoading}
                      >
                        {addBookLoading ? "Adding book..." : "＋ Add book"}
                      </button>
                    </form>
                  </section>

                  <section className="panel form-panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Issue a book</h2>
                        <p>Assign an available book to a member.</p>
                      </div>
                      <span className="panel-icon">↗</span>
                    </div>

                    <form className="stack-form" onSubmit={handleIssueBook}>
                      <div>
                        <label htmlFor="member-id">Member</label>
                        <select
                          id="member-id"
                          value={issueMember}
                          onChange={(event) => setIssueMember(event.target.value)}
                          required
                        >
                          <option value="2">Aarav (ID 2)</option>
                          <option value="3">Meera (ID 3)</option>
                          <option value="4">Rohan (ID 4)</option>
                        </select>
                        <span className="field-help">
                          Select the member who will borrow this book.
                        </span>
                      </div>
                      <div>
                        <label htmlFor="issue-book">Book to issue</label>
                        <select
                          id="issue-book"
                          value={issueBookId}
                          onChange={(event) => setIssueBookId(event.target.value)}
                          required
                        >
                          <option value="">Choose a book...</option>
                          {books
                            .filter((book) => Number(book.available_copies) > 0)
                            .map((book) => (
                              <option key={book.id} value={book.id}>
                                {book.title} ({book.available_copies} available)
                              </option>
                            ))}
                        </select>
                        <span className="field-help">
                          Books with no available copies are excluded.
                        </span>
                      </div>
                      <div className="loan-info">
                        <span>◷</span>
                        <p>
                          <strong>14-day loan period</strong>
                          <br />
                          Late returns incur a fine of ₹2 per day.
                        </p>
                      </div>
                      <button
                        className="primary-button"
                        disabled={issueLoading}
                      >
                        {issueLoading ? "Issuing book..." : "Issue book →"}
                      </button>
                    </form>
                  </section>
                </div>
              )}
            </>
          )}

          {page === "my-issues" && (
            <section className="panel data-panel">
              <div className="page-title-row">
                <div>
                  <p className="eyebrow">BORROWING HISTORY</p>
                  <h1>My borrowing</h1>
                  <p className="muted">
                    Review your active, overdue, and returned books.
                  </p>
                </div>
                <button className="secondary-button" onClick={loadMyIssues}>
                  ↻ Refresh
                </button>
              </div>

              {issuesLoading ? (
                <div className="loading-state">
                  <span className="spinner" />
                  <p>Loading borrowing records...</p>
                </div>
              ) : myIssues.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">▤</span>
                  <h3>No borrowing records yet</h3>
                  <p>When you borrow a book, it will appear here.</p>
                  <button
                    className="primary-button"
                    onClick={() => setPage("books")}
                  >
                    Explore books
                  </button>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>BOOK</th>
                        <th>ISSUED ON</th>
                        <th>DUE DATE</th>
                        <th>STATUS</th>
                        <th>FINE</th>
                        {isLibrarian && <th>ACTION</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {myIssues.map((issue) => (
                        <tr key={issue.id}>
                          <td>
                            <div className="book-cell">
                              <div className="book-cover">
                                {(issue.book_title || "B").slice(0, 1)}
                              </div>
                              <div>
                                <strong>{issue.book_title}</strong>
                                <span>{issue.book_code}</span>
                              </div>
                            </div>
                          </td>
                          <td>{issue.issued_on}</td>
                          <td>{issue.due_date}</td>
                          <td>
                            <span
                              className={`status-pill ${issue.returned_on
                                  ? "status-available"
                                  : issue.status === "overdue"
                                    ? "status-unavailable"
                                    : "status-pending"
                                }`}
                            >
                              {issue.returned_on
                                ? "Returned"
                                : issue.status === "overdue"
                                  ? "Overdue"
                                  : "Active"}
                            </span>
                          </td>
                          <td>₹{issue.fine || 0}</td>
                          {isLibrarian && (
                            <td>
                              {!issue.returned_on && (
                                <button
                                  className="small-action"
                                  disabled={returnLoadingId === issue.id}
                                  onClick={() => handleReturn(issue.id)}
                                >
                                  {returnLoadingId === issue.id
                                    ? "Returning..."
                                    : "Return"}
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {page === "overdue" && isLibrarian && (
            <section className="panel data-panel">
              <div className="page-title-row">
                <div>
                  <p className="eyebrow">FOLLOW UP ON LATE RETURNS</p>
                  <h1>Overdue books</h1>
                  <p className="muted">
                    Review overdue loans and their currently accrued fines.
                  </p>
                </div>
                <button className="secondary-button" onClick={loadOverdue}>
                  ↻ Refresh
                </button>
              </div>

              <div className="overdue-summary">
                <span className="overdue-icon">◷</span>
                <div>
                  <strong>{overdue.length} overdue records</strong>
                  <p>Fines accrue at ₹2 per day until a book is returned.</p>
                </div>
              </div>

              {issuesLoading ? (
                <div className="loading-state">
                  <span className="spinner" />
                  <p>Loading overdue records...</p>
                </div>
              ) : overdue.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">✓</span>
                  <h3>All caught up!</h3>
                  <p>There are no overdue books in the current results.</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>MEMBER</th>
                        <th>BOOK</th>
                        <th>DUE DATE</th>
                        <th>DAYS LATE</th>
                        <th>FINE</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdue.map((issue) => (
                        <tr key={issue.issue_id}>
                          <td>
                            <div className="member-cell">
                              <strong>{issue.member_name}</strong>
                              <span>{issue.member_email}</span>
                            </div>
                          </td>
                          <td>
                            <div className="member-cell">
                              <strong>{issue.book_title}</strong>
                              <span>{issue.book_code}</span>
                            </div>
                          </td>
                          <td>{issue.due_date}</td>
                          <td>
                            <span className="late-days">
                              {issue.days_overdue} days
                            </span>
                          </td>
                          <td>
                            <strong>₹{issue.fine}</strong>
                          </td>
                          <td>
                            <button
                              className="small-action"
                              disabled={returnLoadingId === issue.issue_id}
                              onClick={() => handleReturn(issue.issue_id)}
                            >
                              {returnLoadingId === issue.issue_id
                                ? "Returning..."
                                : "Return book"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          <footer className="app-footer">
            <span>© {new Date().getFullYear()} BookNest Library Tracker</span>
            <span>
              <span className="footer-dot" /> Library services online
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, foot, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <p>{label}</p>
      <strong className="stat-value">{value}</strong>
      <span className="stat-foot">{foot}</span>
    </article>
  );
}

export default App;