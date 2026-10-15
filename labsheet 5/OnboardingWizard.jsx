import { useState } from "react";

function OnboardingWizard() {
  const [step, setStep] = useState(1);

  const [data, setData] = useState({
    name: "",
    email: "",
    age: "", 
    city: ""
  }); 

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert(
      `Registration Successful!\nName: ${data.name}\nEmail: ${data.email}\nCity: ${data.city}`
    );
  };

  return (
    <div className="form-container">
      <h2>User Onboarding</h2>

      <div className="steps">
        Step {step} of 3
      </div>

      <form onSubmit={handleSubmit}>

        {step === 1 && (
          <div>
            <h3>Personal Information</h3>

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={data.name}
              onChange={handleChange}
            />

            <input
              type="number"
              name="age"
              placeholder="Age"
              value={data.age}
              onChange={handleChange}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h3>Contact Information</h3>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={data.email}
              onChange={handleChange}
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h3>Location</h3>

            <input
              type="text"
              name="city"
              placeholder="City"
              value={data.city}
              onChange={handleChange}
            />

            <p>
              <b>Name:</b> {data.name}
            </p>

            <p>
              <b>Email:</b> {data.email}
            </p>

            <p>
              <b>City:</b> {data.city}
            </p>
          </div>
        )}

        <div className="buttons">
          {step > 1 && (
            <button
              type="button"
              onClick={previousStep}
            >
              Previous
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
            >
              Next
            </button>
          ) : (
            <button type="submit">
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default OnboardingWizard;