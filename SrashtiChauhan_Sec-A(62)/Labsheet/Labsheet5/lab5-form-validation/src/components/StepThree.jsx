function StepThree({ data, setData }) {
  return (
    <div>
      <h3>Preferences</h3>

      <div className="form-group">
        <label>City</label>

        <input
          type="text"
          value={data.city}
          placeholder="Enter your city"
          onChange={(e) =>
            setData({
              ...data,
              city: e.target.value,
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Role</label>

        <select
          value={data.role}
          onChange={(e) =>
            setData({
              ...data,
              role: e.target.value,
            })
          }
        >
          <option value="">Select Role</option>
          <option value="Student">Student</option>
          <option value="Developer">Developer</option>
          <option value="Designer">Designer</option>
        </select>
      </div>
    </div>
  );
}

export default StepThree;