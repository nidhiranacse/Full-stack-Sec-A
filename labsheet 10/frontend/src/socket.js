import {
    io
} from 'socket.io-client';

import {
    store
} from './app/store';

import {
    announcementReceived
} from './features/events/eventsSlice';


let socket = null;


export function connectSocket() {

    const token =
        store.getState()
            .auth
            .accessToken;


    if (!token) {
        return null;
    }


    socket =
        io(
            import.meta.env.VITE_SOCKET_URL ||
            'http://localhost:5000',
            {
                auth: {
                    token
                },

                reconnection: true,

                reconnectionAttempts:
                    Infinity,

                reconnectionDelay:
                    1000,

                reconnectionDelayMax:
                    5000
            }
        );


    socket.on(
        'connect',
        () => {

            console.log(
                '[socket] connected:',
                socket.id
            );
        }
    );


    socket.on(
        'disconnect',
        (reason) => {

            console.log(
                '[socket] disconnected:',
                reason
            );
        }
    );


    socket.on(
        'connect_error',
        (error) => {

            console.log(
                '[socket] error:',
                error.message
            );
        }
    );


    socket.on(
        'new-announcement',
        (announcement) => {

            console.log(
                'New announcement:',
                announcement.title
            );


            store.dispatch(
                announcementReceived()
            );
        }
    );


    return socket;
}


export function disconnectSocket() {

    if (socket) {
        socket.disconnect();
        socket = null;
    }
}