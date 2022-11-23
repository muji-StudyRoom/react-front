import React, { useContext } from 'react';
import { DataContext } from '../page/MeetingPage';
import { socket } from '../socket';
import "../css/inputbox.css"

const Input = () => {
    const roomData = useContext(DataContext);
    console.log(roomData)
    const sendMessage = () => { // chatting 보내기
        const data = {
            "sender": roomData["userNickname"],
            "text": document.getElementById(roomData["userNickname"]).value,
            "room_id": roomData["roomName"]
        }
        document.getElementById(roomData["userNickname"]).value = "";
        document.getElementById(roomData["userNickname"]).focus();
        socket.emit("chatting", data);
    }

    const deleteMessage = () => {
        document.getElementById(roomData["userNickname"]).value = ""
        document.getElementById(roomData["userNickname"]).focus();
    }

    return (
        <div className='input-box'>
            <div>
                <textarea id={roomData["userNickname"]} onKeyPress={(event) => {
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