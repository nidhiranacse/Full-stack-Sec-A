function PasswordStrength({ password }) {

  let strength = 0;


  if (password.length >= 8) {
    strength++;
  }


  if (/[A-Z]/.test(password)) {
    strength++;
  }


  if (/[a-z]/.test(password)) {
    strength++;
  }


  if (/[0-9]/.test(password)) {
    strength++;
  }


  if (/[@$!%*?&]/.test(password)) {
    strength++;
  }


  const labels = [
    "Very Weak",
    "Weak",
    "Medium",
    "Strong",
    "Very Strong"
  ];


  return (

    <div className="strength-container">

      <div className="strength-title">
        Password Strength
      </div>


      <div className="strength-bar">

        {[1, 2, 3, 4, 5].map(
          (level) => (

            <div
              key={level}
              className={
                level <= strength
                  ? "strength-filled"
                  : "strength-empty"
              }
            ></div>

          )
        )}

      </div>


      <div className="strength-label">

        {labels[strength - 1] ||
          "Very Weak"}

      </div>

    </div>

  );
}

export default PasswordStrength;