import React, {useState, useRef} from 'react';
import Chat from './Chat';
import {socket} from '../socket';
import '../css/ChattingList.css'

const ChattingList = React.memo(() =>{
    const [chatList,setChatList] = useState([]);
    let chat = useState("");
    const chatbox = useRef()
    socket.on("chatting", (data)=>{
        chat = {
            sender : data["sender"],
            text : data["text"],
            room_id : data["room_id"]
        }
        // setChatList([...chatList,chat]);
        let chat_element = document.createElement("li");
        chat_element.className = "chat_element";
        chat_element.innerText = data["sender"] + " : " + data["text"];
        document.getElementById("chat_scroll").appendChild(chat_element)
        console.log("scroll")
    })

    // useEffect(() => {
    //     chatbox.current.scrollTop = chatbox.current.scrollHeight;
    //     // chatbox.current.lastChild.focus()
    //     // console.log("HI")
    // }, [chatList])

    return (
        <ul ref={chatbox} id="chat_scroll">

        </ul>
    );
});



export default ChattingList;