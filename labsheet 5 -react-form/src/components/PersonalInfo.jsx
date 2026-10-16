function PersonalInfo({
  data,
  setData,
  nextStep
}) {

  const handleChange = (e) => {

    setData({
      ...data,
      [e.target.name]: e.target.value
    });

  };


  const handleNext = () => {

    if (
      !data.name ||
      !data.email ||
      !data.phone
    ) {

      alert(
        "Please fill all personal information"
      );

      return;
    }


    nextStep();

  };


  return (

    <div className="form-card">

      <div className="step-title">

        <span>
          Step 1
        </span>

        <h2>
          Personal Information
        </h2>

      </div>


      <div className="input-group">

        <label>
          Full Name
        </label>

        <input
          type="text"
          name="name"
          placeholder="Enter your full name"
          value={data.name}
          onChange={handleChange}
        />

      </div>


      <div className="input-group">

        <label>
          Email
        </label>

        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={data.email}
          onChange={handleChange}
        />

      </div>


      <div className="input-group">

        <label>
          Phone
        </label>

        <input
          type="tel"
          name="phone"
          placeholder="Enter your phone number"
          value={data.phone}
          onChange={handleChange}
        />

      </div>


      <button
        className="primary-btn"
        onClick={handleNext}
      >

        Next →

      </button>

    </div>

  );
}

export default PersonalInfo;