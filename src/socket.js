import io from "socket.io-client";

export const socket = io("k8s-default-sigsvc-b3e52a2381-0d714db26662c7b9.elb.ap-northeast-2.amazonaws.com:5000", {
    cors: {
        origin: "*",
    },
    autoConnect: false
});