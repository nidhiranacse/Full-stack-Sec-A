import { useState } from "react";

import PasswordStrength from "./PasswordStrength.jsx";

function AccountInfo({
  data,
  setData,
  nextStep,
  previousStep
}) {

  const [error, setError] =
    useState("");


  const handleChange = (e) => {

    setData({
      ...data,
      [e.target.name]: e.target.value
    });

    setError("");

  };


  const handleNext = () => {

    if (
      !data.username ||
      !data.password ||
      !data.confirmPassword
    ) {

      setError(
        "Please fill all fields"
      );

      return;
    }


    if (
      data.password !==
      data.confirmPassword
    ) {

      setError(
        "Passwords do not match"
      );

      return;
    }


    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;


    if (
      !passwordRegex.test(
        data.password
      )
    ) {

      setError(
        "Password must contain 8 characters, uppercase, lowercase, number and special character"
      );

      return;
    }


    nextStep();

  };


  return (

    <div className="form-card">

      <div className="step-title">

        <span>
          Step 2
        </span>

        <h2>
          Account Information
        </h2>

      </div>


      <div className="input-group">

        <label>
          Username
        </label>

        <input
          type="text"
          name="username"
          placeholder="Enter username"
          value={data.username}
          onChange={handleChange}
        />

      </div>


      <div className="input-group">

        <label>
          Password
        </label>

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={data.password}
          onChange={handleChange}
        />


        {data.password && (

          <PasswordStrength
            password={data.password}
          />

        )}

      </div>


      <div className="input-group">

        <label>
          Confirm Password
        </label>

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={data.confirmPassword}
          onChange={handleChange}
        />

      </div>


      {error && (

        <div className="error-message">

          ❌ {error}

        </div>

      )}


      <div className="button-row">

        <button
          className="secondary-btn"
          onClick={previousStep}
        >

          ← Back

        </button>


        <button
          className="primary-btn"
          onClick={handleNext}
        >

          Next →

        </button>

      </div>

    </div>

  );
}

export default AccountInfo;