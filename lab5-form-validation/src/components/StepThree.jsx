function StepThree({ formData }) {
    return (
        <div>
            <h3>Step 3: Confirmation</h3>
            <p> <strong>Name:</strong> {formData.name} </p>
            <p> <strong>Age:</strong> {formData.age} </p>
            <p> <strong>Email:</strong> {formData.email}</p>
            <p>Please check your information before submitting. </p>
        </div>
    );
}
export default StepThree;