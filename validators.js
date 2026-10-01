// Central regex rules used by the login form, strength meter and wizard.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[6-9]\d{9}$/; // 10-digit Indian mobile number
export const USERNAME_RE = /^[A-Za-z][A-Za-z0-9_]{3,15}$/;

export const PASSWORD_RULES = [
  { id: "len", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "digit", label: "One number", test: (p) => /\d/.test(p) },
  { id: "special", label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const validateEmail = (v) =>
  !v ? "Email is required" : EMAIL_RE.test(v) ? "" : "Enter a valid email address";

export const validatePassword = (v) => {
  if (!v) return "Password is required";
  const failed = PASSWORD_RULES.filter((r) => !r.test(v));
  return failed.length ? `Missing: ${failed.map((r) => r.label.toLowerCase()).join(", ")}` : "";
};
