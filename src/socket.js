import io from "socket.io-client";
const url = "/socket";
const test = process.env.REACT_APP_API_URL;
export const socket = io( url, {
    cors: {
        origin: "*",
    },
    autoConnect: false
});