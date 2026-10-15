import React, { useState } from "react";

function OnboardingForm() {

  const [step, setStep] = useState(1);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    age: "",
    city: "",
    course: ""
  });


  /*
   * Controlled input
   */

  const handleChange = (event) => {

    const { name, value } = event.target;

    setUserData({
      ...userData,
      [name]: value
    });
  };


  /*
   * Next step
   */

  const nextStep = () => {

    if (step < 3) {
      setStep(step + 1);
    }
  };


  /*
   * Previous step
   */

  const previousStep = () => {

    if (step > 1) {
      setStep(step - 1);
    }
  };


  /*
   * Final submission
   */

  const handleSubmit = (event) => {

    event.preventDefault();

    console.log("Final User Data:", userData);

    alert(
      `Registration completed successfully!\nWelcome ${userData.name}`
    );
  };


  return (
    <section className="card">

      <h2>Task 5.3</h2>

      <h3>User Onboarding Wizard</h3>


      {/* Step indicator */}

      <div className="steps">

        <div className={step >= 1 ? "step active" : "step"}>
          1
        </div>

        <div className={step >= 2 ? "step active" : "step"}>
          2
        </div>

        <div className={step >= 3 ? "step active" : "step"}>
          3
        </div>

      </div>


      <form onSubmit={handleSubmit}>

        {/* STEP 1 */}

        {step === 1 && (

          <div>

            <h4>Step 1: Personal Information</h4>

            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />


            <label>Email</label>

            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

          </div>

        )}


        {/* STEP 2 */}

        {step === 2 && (

          <div>

            <h4>Step 2: Additional Information</h4>

            <label>Age</label>

            <input
              type="number"
              name="age"
              value={userData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              required
            />


            <label>City</label>

            <input
              type="text"
              name="city"
              value={userData.city}
              onChange={handleChange}
              placeholder="Enter your city"
              required
            />

          </div>

        )}


        {/* STEP 3 */}

        {step === 3 && (

          <div>

            <h4>Step 3: Course Selection</h4>

            <label>Select Course</label>

            <select
              name="course"
              value={userData.course}
              onChange={handleChange}
              required
            >

              <option value="">
                Select a course
              </option>

              <option value="B.Tech">
                B.Tech
              </option>

              <option value="BCA">
                BCA
              </option>

              <option value="MCA">
                MCA
              </option>

            </select>


            <div className="summary">

              <h4>Registration Summary</h4>

              <p>
                <strong>Name:</strong> {userData.name}
              </p>

              <p>
                <strong>Email:</strong> {userData.email}
              </p>

              <p>
                <strong>Age:</strong> {userData.age}
              </p>

              <p>
                <strong>City:</strong> {userData.city}
              </p>

              <p>
                <strong>Course:</strong> {userData.course}
              </p>

            </div>

          </div>

        )}


        {/* Navigation buttons */}

        <div className="form-buttons">

          {step > 1 && (

            <button
              type="button"
              onClick={previousStep}
            >
              Previous
            </button>

          )}


          {step < 3 && (

            <button
              type="button"
              onClick={nextStep}
            >
              Next
            </button>

          )}


          {step === 3 && (

            <button type="submit">
              Submit Registration
            </button>

          )}

        </div>

      </form>

    </section>
  );
}

export default OnboardingForm;