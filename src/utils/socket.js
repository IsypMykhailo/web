import { io } from "socket.io-client";

function createSocket(url, jwt, institutionId) {
    const socket = io(url, {
        autoConnect: false,
        auth: {
            token: jwt
        },
        query: {
            institutionId: institutionId
        }
    });

    /*socket.onAny((event, ...args) => {
        console.log(event, args); // debug only
    });*/

    return socket
}

export default createSocket;