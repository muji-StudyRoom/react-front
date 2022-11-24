import React, { useContext } from 'react';
import { DataContext } from '../page/MeetingPage';
import { socket } from '../socket';
import "../css/inputbox.css"
import Swal from 'sweetalert2';
const Input = () => {
    const roomData = useContext(DataContext);
    const sendMessage = () => { // chatting 보내기
        const data = {
            "sender": roomData["userNickname"],
            "text": document.getElementById(roomData["userNickname"]).value,
            "room_id": roomData["roomName"]
        }
        if(data["text"].length > 50 || data["text"].length === 0) {
            document.getElementById(roomData["userNickname"]).focus();
            document.getElementById(roomData["userNickname"]).value = null;
            Swal.fire({
                position: 'bottom-end',
                icon: 'warning',
                title: '1자 이상 50자 이하만 전송 가능합니다.',
                showConfirmButton: false,
                timer: 1000
              })
        }
        else {
            document.getElementById(roomData["userNickname"]).focus();
            document.getElementById(roomData["userNickname"]).value = null;
            socket.emit("chatting", data);
        }

    }

    const deleteMessage = () => {
        document.getElementById(roomData["userNickname"]).value = ""
        document.getElementById(roomData["userNickname"]).focus();
    }

    return (
        <div className='input-box'>
            <div>
                <textarea id={roomData["userNickname"]} onKeyPress={(event) => {
                    if (event.key === 'Enter') {
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