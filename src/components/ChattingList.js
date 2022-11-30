import React, {useRef} from 'react';
import {socket} from '../socket';
import '../css/ChattingList.css'

const ChattingList = React.memo(() =>{
    const chatbox = useRef()
    socket.on("chatting", (data)=>{
        let chat_element = document.createElement("li");

        if(data["type"] === "disconnect") {
            chat_element.className = "notice_element"
            chat_element.innerText = data["text"];
            document.getElementById("chat_scroll").appendChild(chat_element)
        }
        else if(data["type"] === "join") {
            chat_element.className = "notice_element"
            chat_element.innerText = data["text"];
            document.getElementById("chat_scroll").appendChild(chat_element)
        }
        else {
            chat_element.className = "chat_element";
            chat_element.innerText = data["sender"] + " : " + data["text"];
            document.getElementById("chat_scroll").appendChild(chat_element)
        }
 
        document.getElementById("chat_scroll").scroll({top: document.getElementById("chat_scroll").scrollHeight, behavior:'smooth'})
    })

    return (
        <ul ref={chatbox} id="chat_scroll">
        </ul>
    );
});



export default ChattingList;