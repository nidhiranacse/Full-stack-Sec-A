function Review({
  data,
  previousStep,
  submitForm
}) {

  return (

    <div className="form-card">

      <div className="step-title">

        <span>
          Step 3
        </span>

        <h2>
          Review & Confirm
        </h2>

      </div>


      <div className="review-box">

        <div className="review-item">

          <strong>
            Full Name:
          </strong>

          <span>
            {data.name}
          </span>

        </div>


        <div className="review-item">

          <strong>
            Email:
          </strong>

          <span>
            {data.email}
          </span>

        </div>


        <div className="review-item">

          <strong>
            Phone:
          </strong>

          <span>
            {data.phone}
          </span>

        </div>


        <div className="review-item">

          <strong>
            Username:
          </strong>

          <span>
            {data.username}
          </span>

        </div>


        <div className="review-item">

          <strong>
            Password:
          </strong>

          <span>
            ********
          </span>

        </div>

      </div>


      <div className="button-row">

        <button
          className="secondary-btn"
          onClick={previousStep}
        >

          ← Back

        </button>


        <button
          className="submit-btn"
          onClick={submitForm}
        >

          ✓ Submit

        </button>

      </div>

    </div>

  );
}

export default Review;