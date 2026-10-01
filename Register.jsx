import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError, resetStatus } from '../store/authSlice';

export default function Register() {
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { error, status } = useSelector((s) => s.auth);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); dispatch(clearError());
    const r = await dispatch(register(f));
    if (register.fulfilled.match(r)) { dispatch(resetStatus()); nav('/login'); }
  };
  return (
    <div className="card auth">
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <label htmlFor="name">Name</label><input id="name" value={f.name} onChange={set('name')} required />
        <label htmlFor="remail">Email</label><input id="remail" type="email" value={f.email} onChange={set('email')} required />
        <label htmlFor="rpass">Password (min 8 chars)</label><input id="rpass" type="password" value={f.password} onChange={set('password')} required />
        <label htmlFor="role">Role</label>
        <select id="role" value={f.role} onChange={set('role')}><option>STUDENT</option><option>ADMIN</option></select>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={status === 'loading'}>Register</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Sign in</Link></p>
    </div>
  );
}
