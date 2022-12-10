import React from "react";

const Chat = React.memo(({ chat, setChat }) => {
  return <li> {chat["sender"] + " : " + chat["text"]}</li>;
});

export default Chat;
