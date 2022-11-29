import io from "socket.io-client";

export const socket = io("wss://rohee.tk:5000", {
    cors: {
        origin: "*",
    },
    autoConnect: false,
    withCredentials: true,
    transports: [ "websocket" ]
});