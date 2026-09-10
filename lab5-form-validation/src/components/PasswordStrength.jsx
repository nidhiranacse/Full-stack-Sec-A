function PasswordStrength({ password = "" }) {
    const calculateStrength = () => {
        let score = 0;

        if (password.length >= 8) {
            score++;
        }

        if (/[A-Z]/.test(password)) {
            score++;
        }

        if (/[a-z]/.test(password)) {
            score++;
        }

        if (/[0-9]/.test(password)) {
            score++;
        }

        if (/[@$!%*?&]/.test(password)) {
            score++;
        }

        return score;
    };

    const strength = calculateStrength();

    const getStrengthText = () => {
        if (strength === 0) {
            return "";
        }

        if (strength <= 2) {
            return "Weak";
        }

        if (strength <= 4) {
            return "Medium";
        }

        return "Strong";
    };

    return (
        <div className="strength-container">

            <div className="strength-bar">
                <div
                    className="strength-progress"
                    style={{
                        width: `${strength * 20}%`,
                    }}
                ></div>
            </div>

            <p>
                Password Strength:{" "}
                <strong>{getStrengthText()}</strong>
            </p>

        </div>
    );
}

export default PasswordStrength;