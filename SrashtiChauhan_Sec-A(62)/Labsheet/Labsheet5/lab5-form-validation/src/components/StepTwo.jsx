function StepTwo({ data, setData }) {
  return (
    <div>
      <h3>Account Information</h3>

      <div className="form-group">
        <label>Username</label>

        <input
          type="text"
          value={data.username}
          placeholder="Choose a username"
          onChange={(e) =>
            setData({
              ...data,
              username: e.target.value,
            })
          }
        />
      </div>

      <div className="form-group">
        <label>Password</label>

        <input
          type="password"
          value={data.password}
          placeholder="Create a password"
          onChange={(e) =>
            setData({
              ...data,
              password: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}

export default StepTwo;