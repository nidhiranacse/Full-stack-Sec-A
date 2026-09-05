function PasswordStrength({ password }) {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strength = [
        "Very Weak",
        "Weak",
        "Fair",
        "Good",
        "Strong"
    ];

    return (
        <div className="strength-container">
            <div className="strength-bar">
                <div
                    className="strength-progress"
                    style={{ width: `${score * 20}%` }}
                ></div>
            </div>

            <p>
                Password Strength:{" "}
                <strong>
                    {password ? strength[Math.max(0, score - 1)] : "None"}
                </strong>
            </p>
        </div>
    );
}

export default PasswordStrength;