import io from "socket.io-client";

export const socket = io("https://rohee.tk:5000", {
    cors: {
        origin: "*",
    },
    autoConnect: false,
    withCredentials: true
});