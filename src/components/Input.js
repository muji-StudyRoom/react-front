import React, {useContext} from 'react';
import { DataContext } from '../page/MeetingPage';
import { socket } from '../socket';

const Input = () => {
    const roomData = useContext(DataContext);
    const sendMessage = () => { // chatting 보내기
        const data = {
            "sender": roomData["display_name"],
            "text": document.getElementById(roomData["display_name"]).value,
            "room_id": roomData["room_id"]
        }
        document.getElementById(roomData["display_name"]).value = "";
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