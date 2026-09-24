// task 1
// import { useState } from "react";
// import "./App.css";

// function App() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");

//   const handleEmailChange = (e) => {
//     const value = e.target.value;
//     setEmail(value);

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (value === "") {
//       setEmailError("Email is required");
//     } else if (!emailRegex.test(value)) {
//       setEmailError("Invalid email format");
//     } else {
//       setEmailError("");
//     }
//   };

//   const handlePasswordChange = (e) => {
//     const value = e.target.value;
//     setPassword(value);

//     const passwordRegex =
//       /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/;

//     if (value === "") {
//       setPasswordError("Password is required");
//     } else if (!passwordRegex.test(value)) {
//       setPasswordError(
//         "Password must have 8 characters, uppercase, lowercase, number and special character"
//       );
//     } else {
//       setPasswordError("");
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!emailError && !passwordError && email && password) {
//       alert("Login successful!");
//     } else {
//       alert("Please correct the errors.");
//     }
//   };

//   return (
//     <div className="container">
//       <div className="login-box">
//         <h1>Login Form</h1>

//         <form onSubmit={handleSubmit}>
//           <label>Email</label>

//           <input
//             type="text"
//             placeholder="Enter your email"
//             value={email}
//             onChange={handleEmailChange}
//           />

//           {emailError && (
//             <div className="error">
//               ⚠ {emailError}
//             </div>
//           )}

//           <label>Password</label>

//           <input
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={handlePasswordChange}
//           />

//           {passwordError && (
//             <div className="error">
//               ⚠ {passwordError}
//             </div>
//           )}

//           <button type="submit">Login</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default App;
// task 2
// import { useState } from "react";
// import "./App.css";

// function PasswordStrength({ password }) {
//   let score = 0;

//   if (password.length >= 8) {
//     score++;
//   }

//   if (/[A-Z]/.test(password)) {
//     score++;
//   }

//   if (/[0-9]/.test(password)) {
//     score++;
//   }

//   if (/[^A-Za-z0-9]/.test(password)) {
//     score++;
//   }

//   let strength = "Very Weak";

//   if (score === 1) {
//     strength = "Weak";
//   } else if (score === 2) {
//     strength = "Medium";
//   } else if (score === 3) {
//     strength = "Strong";
//   } else if (score === 4) {
//     strength = "Very Strong";
//   }

//   return (
//     <div className="strength-box">
//       <div className="strength-text">
//         <span>Password Strength</span>
//         <span>{strength}</span>
//       </div>

//       <div className="progress-bar">
//         <div
//           className="progress"
//           style={{ width: `${score * 25}%` }}
//         ></div>
//       </div>

//       <ul>
//         <li className={password.length >= 8 ? "valid" : ""}>
//           At least 8 characters
//         </li>

//         <li className={/[A-Z]/.test(password) ? "valid" : ""}>
//           One uppercase letter
//         </li>

//         <li className={/[0-9]/.test(password) ? "valid" : ""}>
//           One number
//         </li>

//         <li className={/[^A-Za-z0-9]/.test(password) ? "valid" : ""}>
//           One special character
//         </li>
//       </ul>
//     </div>
//   );
// }

// function App() {
//   const [password, setPassword] = useState("");

//   return (
//     <div className="container">
//       <div className="password-box">

//         <h1>Password Strength</h1>

//         <label>Enter Password</label>

//         <input
//           type="password"
//           placeholder="Enter your password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <PasswordStrength password={password} />

//       </div>
//     </div>
//   );
// }

// export default App;
// task 3
import { useState } from "react";
import "./App.css";

function App() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const previousStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    alert("Registration completed successfully!");
    console.log(formData);
  };

  return (
    <div className="container">
      <div className="form-box">

        <h1>User Onboarding</h1>

        <div className="steps">
          <span className={step >= 1 ? "active" : ""}>1</span>
          <span className={step >= 2 ? "active" : ""}>2</span>
          <span className={step >= 3 ? "active" : ""}>3</span>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2>Personal Information</h2>

            <label>Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
            />

            <label>Age</label>

            <input
              type="number"
              name="age"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleChange}
            />

            <button onClick={nextStep}>
              Next
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2>Account Information</h2>

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />

            <div className="buttons">
              <button onClick={previousStep}>
                Back
              </button>

              <button onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h2>Confirm Information</h2>

            <div className="summary">
              <p>
                <strong>Name:</strong> {formData.name}
              </p>

              <p>
                <strong>Age:</strong> {formData.age}
              </p>

              <p>
                <strong>Email:</strong> {formData.email}
              </p>
            </div>

            <div className="buttons">
              <button onClick={previousStep}>
                Back
              </button>

              <button onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;