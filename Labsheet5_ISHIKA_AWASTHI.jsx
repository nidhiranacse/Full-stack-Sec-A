import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const css = `
*{box-sizing:border-box}body{margin:0;font-family:Arial;background:#f3f6fb;color:#172033}
.app{max-width:850px;margin:35px auto;padding:20px}.box{background:#fff;padding:30px;border-radius:16px;box-shadow:0 8px 25px #0001}
h1{color:#2563eb}.field{margin:18px 0}.field label{display:block;font-weight:bold;margin-bottom:7px}
input{width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:8px;font-size:15px}
.error{color:#dc2626;font-size:13px;margin-top:5px}.success{color:#15803d;background:#dcfce7;padding:12px;border-radius:8px}
button{padding:11px 17px;border:0;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;margin:4px}
.steps{display:flex;gap:8px;margin-bottom:25px}.step{flex:1;text-align:center;padding:9px;background:#e2e8f0;border-radius:7px}.active{background:#2563eb;color:#fff}
.bar{height:12px;background:#e5e7eb;border-radius:10px;overflow:hidden;margin-top:8px}.fill{height:100%;transition:.3s}
`;
function PasswordStrength({password}) {
  const score = useMemo(() => {
    let n=0;
    if(password.length>=8)n++;
    if(/[A-Z]/.test(password))n++;
    if(/[0-9]/.test(password))n++;
    if(/[^A-Za-z0-9]/.test(password))n++;
    return n;
  },[password]);
  const labels=["","Weak","Fair","Good","Strong"];
  return <div>
    <div>Password strength: <b>{labels[score]}</b></div>
    <div className="bar"><div className="fill" style={{width:`${score*25}%`,background:score<2?"#ef4444":score<4?"#f59e0b":"#22c55e"}}/></div>
  </div>;
}
function Login({onLogin}) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const emailOK=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordOK=/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
  return <div className="box">
    <h1>Secure Login</h1>
    <div className="field"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@example.com"/>
      {email && !emailOK && <div className="error">Invalid email format.</div>}</div>
    <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 8 characters"/>
      {password && !passwordOK && <div className="error">Use 8+ characters with letters and a number.</div>}
      <PasswordStrength password={password}/>
    </div>
    <button disabled={!emailOK||!passwordOK} onClick={()=>onLogin(email)}>Login</button>
  </div>;
}
function Onboarding({onFinish}) {
  const [step,setStep]=useState(1);
  const [data,setData]=useState({name:"",course:"",phone:""});
  const set=(k,v)=>setData(d=>({...d,[k]:v}));
  return <div className="box">
    <h1>Multi-Step Onboarding</h1>
    <div className="steps">{[1,2,3].map(n=><div className={`step ${step===n?"active":""}`} key={n}>Step {n}</div>)}</div>
    {step===1&&<><div className="field"><label>Name</label><input value={data.name} onChange={e=>set("name",e.target.value)}/></div><button disabled={!data.name} onClick={()=>setStep(2)}>Next</button></>}
    {step===2&&<><div className="field"><label>Course</label><input value={data.course} onChange={e=>set("course",e.target.value)} placeholder="B.Tech CSE"/></div><button onClick={()=>setStep(1)}>Back</button><button disabled={!data.course} onClick={()=>setStep(3)}>Next</button></>}
    {step===3&&<><div className="field"><label>Phone</label><input value={data.phone} onChange={e=>set("phone",e.target.value)} placeholder="10 digit number"/></div><button onClick={()=>setStep(2)}>Back</button><button disabled={!/^\d{10}$/.test(data.phone)} onClick={()=>onFinish(data)}>Submit</button></>}
  </div>;
}
function App(){
 const [logged,setLogged]=useState(false); const [done,setDone]=useState(false);
 return <><style>{css}</style><div className="app">{!logged?<Login onLogin={()=>setLogged(true)}/>:done?<div className="box"><h1>Onboarding Complete</h1><div className="success">Your information has been submitted successfully.</div></div>:<Onboarding onFinish={()=>setDone(true)}/>}</div></>;
}
createRoot(document.getElementById("root")).render(<App/>);
