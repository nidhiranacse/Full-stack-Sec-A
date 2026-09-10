import { useState } from "react";
import PasswordStrength from "./PasswordStrength";

function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        validateField(name, value);
    };

    const validateField = (name, value) => {
        let message = "";

        if (name === "email") {
            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!value) {
                message = "Email is required";
            } else if (!emailRegex.test(value)) {
                message = "Enter a valid email address";
            }
        }

        if (name === "password") {
            const passwordRegex =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

            if (!value) {
                message = "Password is required";
            } else if (!passwordRegex.test(value)) {
                message =
                    "Password must contain 8 characters, uppercase, lowercase, number and special character";
            }
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: message,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        validateField("email", formData.email);
        validateField("password", formData.password);

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (
            emailRegex.test(formData.email) &&
            passwordRegex.test(formData.password)
        ) {
            alert("Login successful!");

            console.log("Login Data:", formData);
        }
    };

    return (
        <div className="form-container">
            <h2>Login Form</h2>

            <form onSubmit={handleSubmit}>

                {/* Email */}
                <div className="form-group">
                    <label>Email</label>

                    <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                    />

                    {errors.email && (
                        <span className="error-badge">
                            ⚠ {errors.email}
                        </span>
                    )}
                </div>

                {/* Password */}
                <div className="form-group">
                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                    />

                    {errors.password && (
                        <span className="error-badge">
                            ⚠ {errors.password}
                        </span>
                    )}

                    <PasswordStrength password={formData.password} />
                </div>

                <button type="submit">
                    Login
                </button>
            </form>
        </div>
    );
}

export default LoginForm;