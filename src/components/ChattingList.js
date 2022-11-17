import React, {useState} from 'react';
import Chat from './Chat';
import {socket} from '../socket';

const ChattingList = React.memo(() =>{
    let [chatList,setChatList] = useState([]);
    let [chat,setChat] = useState("");

    socket.on("chatting", (data)=>{  // chatting 받기
        chat = {
            sender : data["sender"],
            text : data["text"],
            room_id : data["room_id"]
        }
        setChatList([...chatList,chat]);
    })

    return (
        <ul>
            {chatList.length > 0
                ? (chatList.map((chat, idx) => (<Chat key={idx} chat={chat}/>)))
                : (<div></div>)
            }
        </ul>
    );
});



export default ChattingList;