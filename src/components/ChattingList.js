import React, { useRef } from 'react';
import { socket } from '../socket';
import '../css/ChattingList.css'

const ChattingList = React.memo(() => {
    const chatbox = useRef()
    socket.on("chatting", (data) => {
        console.log(data)
        let name_element = document.createElement("li");
        let chat_element = document.createElement("li");
        let space_element = document.createElement("li");
        let chat_scroll = document.getElementById("chat_scroll");
        space_element.innerText = "\n"
        
        console.log(typeof (data))
        if (data["type"] === "disconnect") {
            name_element.className = "name_element";
            chat_element.className = "notice_element"
            name_element.innerText = "알림"
            chat_element.innerText = data["name"] + " 님이 퇴장하셨습니다.";
            chat_scroll.appendChild(name_element)
            chat_scroll.appendChild(chat_element)
            chat_scroll.appendChild(space_element)
            document.getElementById(data["sid"]).remove();
        }
        else if (data["type"] === "join") {
            name_element.className = "name_element";
            name_element.innerText = "알림"
            chat_element.className = "notice_element"
            chat_element.innerText = data["name"] + " 님이 입장하셨습니다.";
            chat_scroll.appendChild(name_element)
            chat_scroll.appendChild(chat_element)
            chat_scroll.appendChild(space_element)
            
            let dm_select = document.createElement("option");
            dm_select.id = data["sid"]
            dm_select.value = data["sid"];
            dm_select.innerText = data["name"]
            console.log(document.getElementById("dm-select"))
            console.log(dm_select)
            document.getElementById("dm-select").appendChild(dm_select);
        }
        else {
            name_element.className = "name_element";
            chat_element.className = "chat_element";
            name_element.innerText = data["sender"]
            chat_element.innerText = data["text"];
            chat_scroll.appendChild(name_element)
            chat_scroll.appendChild(chat_element)
            chat_scroll.appendChild(space_element)
        }
        document.getElementById("chat_scroll").scroll({ top: document.getElementById("chat_scroll").scrollHeight, behavior: 'smooth' })
    })

    return (
        <>
            <ul ref={chatbox} id="chat_scroll">
            </ul>
        </>

    );
});



export default ChattingList;