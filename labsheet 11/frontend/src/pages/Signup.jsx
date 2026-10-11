// Author: Radha Pandey, CSE - CampusConnect
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError('Name must be at least 2 characters');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setBusy(true);
    setError('');
    try {
      await signup(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h2>Student Sign up</h2>
      {error && <p className="error">{error}</p>}
      <input placeholder="Full name" value={form.name} onChange={set('name')} />
      <input type="email" placeholder="Email" value={form.email} onChange={set('email')} />
      <input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} />
      <button disabled={busy}>{busy ? 'Creating...' : 'Sign up'}</button>
      <p>Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
