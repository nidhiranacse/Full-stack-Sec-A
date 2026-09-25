import {
    useSelector
} from 'react-redux';

import {
    Navigate,
    Outlet
} from 'react-router-dom';


export default function RoleRoute({
    allowedRoles
}) {

    const user =
        useSelector(
            (state) =>
                state.auth.user
        );


    if (!user) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    return allowedRoles.includes(
        user.role
    )
        ? <Outlet />
        : <Navigate
            to="/dashboard"
            replace
        />;
}