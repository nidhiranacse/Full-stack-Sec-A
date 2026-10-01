import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const nav = useNavigate();
  const { error, status } = useSelector((s) => s.auth);

  const submit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const r = await dispatch(login({ email, password }));
    if (login.fulfilled.match(r)) nav('/dashboard');
  };
  return (
    <div className="card auth">
      <h2>Sign in</h2>
      <form onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Signing in…' : 'Login'}</button>
      </form>
      <p className="muted">New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}
