function AccountInfo({ formData, updateFormData }) {
  return (
    <div className="step-content">
      <h2>Account Information</h2>

      <label>Email</label>
      <input
        type="email"
        value={formData.email}
        onChange={(e) =>
          updateFormData("email", e.target.value)
        }
        placeholder="Enter your email"
      />

      <label>Password</label>
      <input
        type="password"
        value={formData.password}
        onChange={(e) =>
          updateFormData("password", e.target.value)
        }
        placeholder="Create a password"
      />

      <label>Phone Number</label>
      <input
        type="tel"
        value={formData.phone}
        onChange={(e) =>
          updateFormData("phone", e.target.value)
        }
        placeholder="Enter your phone number"
      />
    </div>
  );
}

export default AccountInfo;