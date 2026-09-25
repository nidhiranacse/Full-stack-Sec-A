import {
    useState
} from 'react';

import {
    useDispatch,
    useSelector
} from 'react-redux';

import {
    login
} from '../features/auth/authSlice';

import {
    Link,
    useNavigate
} from 'react-router-dom';

import {
    connectSocket
} from '../socket';


export default function Login() {

    const dispatch =
        useDispatch();

    const navigate =
        useNavigate();


    const {
        status,
        error
    } =
        useSelector(
            (state) =>
                state.auth
        );


    const [
        email,
        setEmail
    ] =
        useState('');


    const [
        password,
        setPassword
    ] =
        useState('');


    async function handleSubmit(
        event
    ) {

        event.preventDefault();


        const result =
            await dispatch(
                login({
                    email,
                    password
                })
            );


        if (
            login.fulfilled.match(
                result
            )
        ) {

            setTimeout(
                () => {
                    connectSocket();
                },
                100
            );

            navigate(
                '/dashboard'
            );
        }
    }


    return (
        <div className="auth-page">

            <div className="card">

                <h1>
                    CampusConnect
                </h1>

                <h2>
                    Login
                </h2>


                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <label>
                        Email
                    </label>

                    <input
                        aria-label="email"
                        type="email"
                        value={email}
                        onChange={
                            (e) =>
                                setEmail(
                                    e.target.value
                                )
                        }
                        required
                    />


                    <label>
                        Password
                    </label>

                    <input
                        aria-label="password"
                        type="password"
                        value={password}
                        onChange={
                            (e) =>
                                setPassword(
                                    e.target.value
                                )
                        }
                        required
                    />


                    {error && (
                        <p
                            role="alert"
                            className="error"
                        >
                            {error}
                        </p>
                    )}


                    <button
                        type="submit"
                        disabled={
                            status ===
                            'loading'
                        }
                    >
                        {status === 'loading'
                            ? 'Logging in...'
                            : 'Login'}
                    </button>

                </form>


                <p>
                    Don't have an account?
                    {' '}

                    <Link
                        to="/register"
                    >
                        Register
                    </Link>
                </p>

            </div>

        </div>
    );
}