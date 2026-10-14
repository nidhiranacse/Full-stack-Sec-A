function PersonalInfo({ formData, updateFormData }) {
  return (
    <div className="step-content">
      <h2>Personal Information</h2>

      <label>Full Name</label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) =>
          updateFormData("name", e.target.value)
        }
        placeholder="Enter your full name"
      />

      <label>Age</label>
      <input
        type="number"
        value={formData.age}
        onChange={(e) =>
          updateFormData("age", e.target.value)
        }
        placeholder="Enter your age"
      />

      <label>City</label>
      <input
        type="text"
        value={formData.city}
        onChange={(e) =>
          updateFormData("city", e.target.value)
        }
        placeholder="Enter your city"
      />
    </div>
  );
}

export default PersonalInfo;