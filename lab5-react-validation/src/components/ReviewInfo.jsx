function ReviewInfo({ formData }) {
  return (
    <div className="step-content">
      <h2>Review Information</h2>

      <div className="review-box">
        <p>
          <strong>Name:</strong> {formData.name}
        </p>

        <p>
          <strong>Age:</strong> {formData.age}
        </p>

        <p>
          <strong>City:</strong> {formData.city}
        </p>

        <p>
          <strong>Email:</strong> {formData.email}
        </p>

        <p>
          <strong>Phone:</strong> {formData.phone}
        </p>
      </div>

      <p className="review-message">
        Please review your information before submitting.
      </p>
    </div>
  );
}

export default ReviewInfo;