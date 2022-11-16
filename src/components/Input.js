import React from 'react';
import {socket} from '../socket';

let myID = 'test';
let myRoomID = '123';
let inputID = 'chatting';

const Input = () => {
    console.log(socket);

    const sendMessage =() => { // chatting 보내기
        // 보내야할 데이터 -  myRoomId(내 방 Id) + myID
        console.log("send Message Called");
        const data = {
            "sender" : myID,
            "text": document.getElementById("chatting").value,
            "room_id" : myRoomID
        }
        console.log(data);
        socket.emit("chatting",data);
    }

    return (
        <div className='input'>
            <input id={inputID}/>
            <button onClick={sendMessage}>채팅 전송</button>
        </div>
    );
};

export default Input;