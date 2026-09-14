function PasswordStrength({ password }) {
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[@$!%*?&]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;

    let strength = "";
    let strengthClass = "";

    if (password.length === 0) {
        strength = "Enter a password";
        strengthClass = "empty";
    } else if (score <= 2) {
        strength = "Weak";
        strengthClass = "weak";
    } else if (score <= 4) {
        strength = "Medium";
        strengthClass = "medium";
    } else {
        strength = "Strong";
        strengthClass = "strong";
    }

    return (
        <div className="password-strength">
            <div className="strength-header">
                <span>Password strength</span>
                <strong className={strengthClass}>{strength}</strong>
            </div>

            <div className="strength-bar">
                <div
                    className={`strength-progress ${strengthClass}`}
                    style={{ width: `${score * 20}%` }}
                ></div>
            </div>

            <div className="password-rules">
                <span className={checks.length ? "rule-pass" : ""}>
                    {checks.length ? "✓" : "○"} 8+ characters
                </span>
                <span className={checks.lowercase ? "rule-pass" : ""}>
                    {checks.lowercase ? "✓" : "○"} Lowercase
                </span>
                <span className={checks.uppercase ? "rule-pass" : ""}>
                    {checks.uppercase ? "✓" : "○"} Uppercase
                </span>
                <span className={checks.number ? "rule-pass" : ""}>
                    {checks.number ? "✓" : "○"} Number
                </span>
                <span className={checks.special ? "rule-pass" : ""}>
                    {checks.special ? "✓" : "○"} Special character
                </span>
            </div>
        </div>
    );
}

export default PasswordStrength;