import { useState } from "react";

import PasswordStrength from "./PasswordStrength.jsx";

function LoginForm() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});

  const [success, setSuccess] = useState(false);


  const validateForm = () => {

    const newErrors = {};


    // Email Regex

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    // Password Regex

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;


    if (!emailRegex.test(email)) {

      newErrors.email =
        "Please enter a valid email address";

    }


    if (!passwordRegex.test(password)) {

      newErrors.password =
        "Password must contain 8 characters, uppercase, lowercase, number and special character";

    }


    setErrors(newErrors);


    if (Object.keys(newErrors).length === 0) {

      setSuccess(true);

    } else {

      setSuccess(false);

    }

  };


  return (

    <div className="form-card">

      <h2>
        Login Form
      </h2>


      {/* EMAIL */}

      <div className="input-group">

        <label>
          Email
        </label>


        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {

            setEmail(e.target.value);

            setErrors({});
            setSuccess(false);

          }}
        />


        {errors.email && (

          <div className="error-badge">

            ❌ {errors.email}

          </div>

        )}


        {email &&
          !errors.email &&
          email.includes("@") && (

            <div className="success-badge">

              ✓ Valid Email

            </div>

          )}

      </div>


      {/* PASSWORD */}

      <div className="input-group">

        <label>
          Password
        </label>


        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {

            setPassword(e.target.value);

            setErrors({});
            setSuccess(false);

          }}
        />


        {password && (

          <PasswordStrength
            password={password}
          />

        )}


        {errors.password && (

          <div className="error-badge">

            ❌ {errors.password}

          </div>

        )}

      </div>


      <button
        className="primary-btn"
        onClick={validateForm}
      >

        Login

      </button>


      {success && (

        <div className="login-success">

          ✓ Login validation successful!

        </div>

      )}

    </div>

  );
}

export default LoginForm;