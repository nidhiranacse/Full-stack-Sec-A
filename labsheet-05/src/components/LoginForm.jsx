import { useState } from "react";
import PasswordStrength from "./PasswordStrength";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    const validate = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Invalid email format";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (!passwordRegex.test(password)) {
            newErrors.password =
                "Password must contain 8 characters, uppercase, lowercase, number and special character";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            alert("Login Successful!");
        }
    };

    return (
        <div className="form-card">
            <h2>Login Form</h2>

            <form onSubmit={handleSubmit}>
                <label>Email</label>

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                />

                {errors.email && (
                    <span className="error-badge">
                        ⚠ {errors.email}
                    </span>
                )}

                <label>Password</label>

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                />

                {errors.password && (
                    <span className="error-badge">
                        ⚠ {errors.password}
                    </span>
                )}

                <PasswordStrength password={password} />

                <button type="submit">
                    Login
                </button>
            </form>
        </div>
    );
}

export default LoginForm;