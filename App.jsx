import React, { useState } from "react";
import "./index.css";

function PasswordStrength({password}){
    let score=0;
    if(password.length>=8)score++;
    if(/[A-Z]/.test(password))score++;
    if(/[a-z]/.test(password))score++;
    if(/[0-9]/.test(password))score++;
    if(/^[A-Za-z0-9]/.test(password))score++;

    let strength="Very Weak";
    if(score===2)strength="Weak";
    if(score===3)strength="Medium";
    if(score===4)strength="Strong";
    if(score===5)strength="Very Strong";
    return(
        <div className="strength-container">
            <div className="strength-bar">
                <div className="strength-progress" style={{width:`${score*20}%`}}>
                </div>
            </div>
            <p>
                Strength: <strong>{strength}</strong>
            </p>
        </div>
    );
}

// Login Form
function LoginForm(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("")
    const [message,setMessage]=useState("")
    // Email regex
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Password Security rules
    const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    };
    const validPassword=Object.values(rules).every(Boolean);

    function handleSubmit(event){
        event.preventDefault();
        if(!emailRegex.test(email)){
            setMessage("Please enter a valid email address.");
            return;
        }if(!validPassword){
            setMessage("Password does not meet security requirements.");
            return;
        }
        setMessage("Login Successfully!");
    }
    return (
        <div className="form-container">
            <h2>Login Form</h2>
            <form onSubmit={handleSubmit}>
                {/*Email*/}
                <label>Email</label>
                <input type="email" placeholder="Enter your email" value={email} onChange=
                {(event)=>setEmail(event.target.value)}/>
                {email && !emailRegex.test(email)&&(
                    <span className="error">
                        Invalid email format
                    </span>
                )}
                {/* Password */} 
                <label>Password</label>
                <input type="password" placeholder="Enter your password" 
                value={password} onChange={(event) => setPassword(event.target.value) } />
                <PasswordStrength password={password} />
                {/* Password Rules */} 
                <div className="rules">
                 <p className={rules.length ? "valid" : "invalid"}> 
                {rules.length ? "✓" : "✗"} At least 8 characters </p> 
                <p className={rules.uppercase ? "valid" : "invalid"}> 
                {rules.uppercase ? "✓" : "✗"} Uppercase letter </p>
                 <p className={rules.lowercase ? "valid" : "invalid"}> 
                {rules.lowercase ? "✓" : "✗"} Lowercase letter </p> 
                <p className={rules.number ? "valid" : "invalid"}> 
                {rules.number ? "✓" : "✗"} Number </p> 
                <p className={rules.special ? "valid" : "invalid"}> 
                {rules.special ? "✓" : "✗"} Special character </p> 
                </div>
                <button type="submit"> Login </button> 
                {message && (
                <p className="message"> {message} 
                </p> 
            )}
            </form>
        </div>
    );
}

function PersonalInfo({data,updateData,nextStep}){
    return(
        <div>
            <h3>Step1: Personal Information</h3>
            <input type="text" placeholder="Full Name" value={data.name} onChange={(event)=>
                updateData({
                    name:event.target.value,
                })
            }/>
            <input
                type="number" placeholder="Age" value={data.age}
                onChange={(event)=>
                    updateData({
                        age:event.target.value,
                    })
                }
            />
            <button onClick={nextStep}>
                Next
            </button>
        </div>
    );
}
//ACCOUNT INFORMATION
function AccountInfo({
    data,
    updateData,
    previousStep,
    nextStep,
}){
    return(
        <div>
            <h3>Step2: Account Information</h3>
            <input
                type="email" placeholder="Email" value={data.email} onChange={(event)=>
                    updateData({
                        email:event.target.value,
                    })
                }
            />
            <input
                type="password" placeholder="Enter Password" value={data.password} onChange={(event)=>
                    updateData({
                        password:event.target.value,
                    })
                }
            />
            <button onClick={previousStep}>
                Back
            </button>
            <button onClick={nextStep}>
                Next
            </button>
        </div>
    );
}
// CONFIRMATION
function Confirmation({
    data,
    previousStep,
    handleSubmit,
}){
    return(
        <div>
            <h3>Step3: Confirm Details</h3>
            <div className="confirmation">
                <p>
                    <strong>Name:</strong>{data.name}
                </p>
                <p>
                    <strong>Age:</strong>{data.age}
                </p>
                <p>
                    <strong>Email:</strong>{data.email}
                </p>
                <p>
                    <strong>Password:</strong>••••••••
                </p>
            </div>
            <button onClick={previousStep}>
                Back
            </button>
            <button onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
}
// MAIN APP
function App(){
    const [page,setPage]=useState("login");
    const [step,setStep]=useState(1);
    const [formData,setFormData]=useState({
        name:"",
        age:"",
        email:"",
        password:"",
    });
    function updateData(newData){
        setFormData((previousData)=>({
            ...previousData,
            ...newData,
        }));
    }
    function handleSubmit(){
        alert("Registration completed successfully!");
        console.log("Submitted Data:",formData);
    }
    return ( <div className="app"> 
    <h1>React Form Validation</h1> 
    {/* Navigation */} <nav> 
    <button onClick={() => setPage("login")}> Login Form </button>
    <button onClick={() => setPage("onboarding")}> Onboarding Wizard </button> 
    </nav> {/* ========================= TASK 5.1 + 5.2 ========================= */} 
    {page === "login" && <LoginForm />} {/* ========================= TASK 5.3 ========================= */} 
    {page === "onboarding" && ( <div className="form-container"> 
    <h2>User Onboarding</h2> 
    <div className="step-indicator"> Step {step} of 3 </div>
    {/* STEP 1 */} {step === 1 && ( <PersonalInfo data={formData} updateData={updateData} 
    nextStep={() => setStep(2)} /> )} {/* STEP 2 */} {step === 2 && ( <AccountInfo data={formData} 
    updateData={updateData} previousStep={() => setStep(1)} nextStep={() => setStep(3)} /> )}
    {/* STEP 3 */} {step === 3 && ( <Confirmation data={formData} 
    previousStep={() => setStep(2)} handleSubmit={handleSubmit} /> )} </div> )} </div> ); } 
    export default App;