import io from "socket.io-client";
const url = proces.env.REACT_APP_BACK_URL;
export const socket = io(url, {
    cors: {
        origin: "*",
    },
    autoConnect: false
});