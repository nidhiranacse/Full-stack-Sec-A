function ErrorBadge({ message }) {
  if (!message) {
    return null;
  }

  return (
    <span className="error-badge">
      [!] {message}
    </span>
  );
}

export default ErrorBadge;