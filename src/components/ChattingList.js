import React, {useState} from 'react';
import Chat from './Chat';
import {socket} from '../socket';

const ChattingList = React.memo(() =>{
    let [chatList,setChatList] = useState([]);
    let [chat,setChat] = useState("");
    socket.on("chatting", (data)=>{  // chatting 받기
        console.log("received from server");
        chat = {
            sender : data["sender"],
            text : data["text"],
            room_id : data["room_id"]
        }
        // console.log(chat);
        setChatList([...chatList,chat]);
        // console.log(chatList)
    })

    console.log(chatList);
    return (
        <ul>
            {chatList.length > 0
                ? (chatList.map((chat) => (<Chat key={chat.Id} chat={chat}/>)))
                : (<div></div>)
            }
        </ul>
    );
});



export default ChattingList;