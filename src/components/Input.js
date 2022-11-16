import React from 'react';
import { socket } from '../socket';

let myID = 'energy-been';
let myRoomID = '999';

const Input = () => {
    const sendMessage = () => { // chatting 보내기
        // 보내야할 데이터 -  myRoomId(내 방 Id) + myID
        console.log("I am sender!");
        const data = {
            "sender": myID,
            "text": document.getElementById(myID).value,
            "room_id": myRoomID
        }
        console.log(data);
        socket.emit("chatting", data);
    }

    return (
        <div className='input'>
            <input id={myID} />
            <button onClick={sendMessage}>채팅 전송</button>
        </div>
    );
};

export default Input;