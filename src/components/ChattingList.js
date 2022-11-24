import React, {useEffect, useState, useRef} from 'react';
import Chat from './Chat';
import {socket} from '../socket';

const ChattingList = React.memo(() =>{
    let [chatList,setChatList] = useState([]);
    let chat = useState("");
    const chatbox = useRef()
    socket.on("chatting", (data)=>{  // chatting 받기
        chat = {
            sender : data["sender"],
            text : data["text"],
            room_id : data["room_id"]
        }
        setChatList([...chatList,chat]);
        document.getElementById("chat_scroll").scrollTop = document.getElementById("chat_scroll").scrollHeight;
        console.log("scroll")
    })


    // useEffect(() => {
    //     chatbox.current.scrollTop = chatbox.current.scrollHeight;
    //     // chatbox.current.lastChild.focus()
    //     // console.log("HI")
    // }, [chatList])

    return (
        <ul ref={chatbox} id="chat_scroll">
            {chatList.length > 0
                ? (chatList.map((chat, idx) => (<Chat key={idx} chat={chat}/>)))
                : (<div></div>)
            }
        </ul>
    );
});



export default ChattingList;