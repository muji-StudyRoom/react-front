import io from "socket.io-client";
import React from 'react';

export const socket = io('http://localhost:5000', {
    cors: {
        origin: "*",
    }
});
export const SocketContext = React.createContext();