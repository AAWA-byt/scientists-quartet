// Import the required React components from the "react" library
import React, { useEffect, useState, useRef } from 'react';
// Import the ChatBar, ChatBody, ChatFooter and Cards components from their respective files
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';
import Cards from './Cards';

// Define a functional component called "ChatPage" and pass the "socket" object as a prop
const ChatPage = ({ socket }) => {
    // Declare state variables using the useState hook
    const [messages, setMessages] = useState([]);
    const [typingStatus, setTypingStatus] = useState('');
    // Declare a ref using the useRef hook to reference the last message in the chat
    const lastMessageRef = useRef(null);

    // Use the useEffect hook to update the "messages" state whenever a new message is received from the server
    useEffect(() => {
        socket.on('messageResponse', (data) => setMessages([...messages, data]));
    }, [socket, messages]);

    // Use the useEffect hook to scroll to the bottom of the chat every time a new message is added
    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Use the useEffect hook to update the "typingStatus" state whenever a new typing status is received from the server
    useEffect(() => {
        socket.on('typingResponse', (data) => setTypingStatus(data));
    }, [socket]);

    // Render the ChatBar, ChatBody, and ChatFooter components along with their respective props
    return (
        <div className="chat-wrapper">
            <div className="chat">
                <ChatBar socket={socket} />
                <div className="chat__main">
                    <ChatBody
                        messages={messages}
                        typingStatus={typingStatus}
                        lastMessageRef={lastMessageRef}
                    />
                    <ChatFooter socket={socket} />
                </div>
            </div>
            <div className="cards">
                {/* Code for card deck #TODO */}
                <Cards socket={socket}/>
            </div>
        </div>
    );
};

// Export the "ChatPage" component as the default export of this module
export default ChatPage;





