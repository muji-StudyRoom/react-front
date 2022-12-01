import io from "socket.io-client";

export const socket = io("https://rohee.tk", {
    cors: {
        origin: "*",
    },
    autoConnect: false,
    withCredentials: true,
    //transports: [ "websocket" ]
});