import io from "socket.io-client";

export const socket = io("https://eyestalk.site:5000/socket", {
    cors: {
        origin: "*",
    },
    autoConnect: false
});