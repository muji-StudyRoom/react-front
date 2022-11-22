import React, { useContext } from 'react';
import { DataContext } from '../page/MeetingPage';
import { socket } from '../socket';
import "../css/inputbox.css"

const Input = () => {
    const roomData = useContext(DataContext);
    const sendMessage = () => { // chatting 보내기
        const data = {
            "sender": roomData["display_name"],
            "text": document.getElementById(roomData["display_name"]).value,
            "room_id": roomData["room_id"]
        }
        document.getElementById(roomData["display_name"]).value = "";
        document.getElementById(roomData["display_name"]).focus();
        socket.emit("chatting", data);
    }

    const deleteMessage = () => {
        document.getElementById(roomData["display_name"]).value = ""
        document.getElementById(roomData["display_name"]).focus();
    }

    return (
        <div className='input-box'>
            <div>
                <textarea id={roomData["display_name"]} onKeyPress={(event) => {
                    if (event.key == 'Enter') {
                        sendMessage();
                    }
                }} />
            </div>
            <div>
                <button onClick={deleteMessage} className='del_btn'>삭제</button>
                <button onClick={sendMessage} className="send_btn">전송</button>
            </div>
        </div>
    );
};

export default Input;