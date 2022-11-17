import React, {useContext} from 'react';
import { DataContext } from '../page/MeetingPage';
import { socket } from '../socket';
let myID = 'energy-been';
let myRoomID = '999';

const Input = () => {
    const roomData = useContext(DataContext);
    const sendMessage = () => { // chatting 보내기
        // 보내야할 데이터 -  myRoomId(내 방 Id) + myID
        const test= process.env.REACT_APP_API_URL
        console.log("I am sender!");
        console.log(test);

        const data = {
            "sender": roomData["display_name"],
            "text": document.getElementById(roomData["display_name"]).value,
            "room_id": roomData["room_id"]
        }
        socket.emit("chatting", data);
    }

    return (
        <div className='input'>
            <input id={roomData["display_name"]} />
            <button onClick={sendMessage}>채팅 전송</button>
        </div>
    );
};

export default Input;