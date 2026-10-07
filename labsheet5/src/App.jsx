import { useState } from "react";
import "./App.css";

function PasswordStrength({ password }) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = ["", "Weak", "Medium", "Strong", "Very Strong"];

  return (
    <div className="password-box">
      <p>Password Strength: {levels[strength]}</p>

      <div className="progress">
        <div
          className="progress-bar"
          style={{ width: `${strength * 25}%` }}
        ></div>
      </div>

      <small>
        Use 8+ characters, uppercase, number and special character.
      </small>
    </div>
  );
}

function App() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  // Controlled input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Task 5.1 - Regex validation
  const validateStep1 = () => {
    const newErrors = {};

    const nameRegex = /^[A-Za-z ]{3,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(formData.name)) {
      newErrors.name =
        "Name must contain at least 3 alphabetic characters.";
    }

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must contain exactly 10 digits.";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const previousStep = () => {
    setErrors({});
    setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Registration submitted successfully!");

    console.log("Submitted Data:", formData);
  };

  return (
    <div className="container">
      <div className="form-card">

        <h1>React Registration Form</h1>

        <div className="steps">
          <span className={step >= 1 ? "active" : ""}>1</span>
          <span className={step >= 2 ? "active" : ""}>2</span>
          <span className={step >= 3 ? "active" : ""}>3</span>
        </div>

        <form onSubmit={handleSubmit}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h2>Personal Information</h2>

              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />

              {errors.name && (
                <p className="error">{errors.name}</p>
              )}

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />

              {errors.email && (
                <p className="error">{errors.email}</p>
              )}

              <button type="button" onClick={nextStep}>
                Next
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2>Security Information</h2>

              <label>Password</label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />

              {errors.password && (
                <p className="error">{errors.password}</p>
              )}

              {/* Task 5.2 */}
              <PasswordStrength password={formData.password} />

              <label>Phone Number</label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10 digit phone number"
              />

              {errors.phone && (
                <p className="error">{errors.phone}</p>
              )}

              <div className="buttons">
                <button type="button" onClick={previousStep}>
                  Back
                </button>

                <button type="button" onClick={nextStep}>
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h2>Review Information</h2>

              <div className="review">
                <p>
                  <b>Name:</b> {formData.name}
                </p>

                <p>
                  <b>Email:</b> {formData.email}
                </p>

                <p>
                  <b>Phone:</b> {formData.phone}
                </p>

                <p>
                  <b>Password:</b> ********
                </p>
              </div>

              <div className="buttons">
                <button type="button" onClick={previousStep}>
                  Back
                </button>

                <button type="submit">
                  Submit
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

export default App;