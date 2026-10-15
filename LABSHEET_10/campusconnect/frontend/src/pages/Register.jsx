import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../features/auth/authSlice';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { status, error } = useSelector(
    (state) => state.auth
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await dispatch(
      register({
        name,
        email,
        password
      })
    );

    if (register.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <h2>Create CampusConnect Account</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating...' : 'Register'}
        </button>

        {error && <p>{error}</p>}
      </form>
    </div>
  );
}