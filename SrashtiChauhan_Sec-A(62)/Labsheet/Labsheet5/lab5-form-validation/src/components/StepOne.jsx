function StepOne({ data, setData }) {
  return (
    <div>
      <h3>Personal Information</h3>

      <div className="form-group">
        <label>Full Name</label>

        <input
          type="text"
          value={data.name}
          placeholder="Enter your name"
          onChange={(e) =>
            setData({
              ...data,
              name: e.target.value,
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Email</label>

        <input
          type="email"
          value={data.email}
          placeholder="Enter your email"
          onChange={(e) =>
            setData({
              ...data,
              email: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}

export default StepOne;