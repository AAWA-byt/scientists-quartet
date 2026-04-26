// Import the required React components from the "react" library
import React, { useEffect, useState, useRef } from 'react';
// Import the ChatBar, ChatBody, ChatFooter and Cards components from their respective files
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';
import Cards from './Cards';
import Footer from './FooterPage';

// Define a functional component called "ChatPage" and pass the "socket" object as a prop
const ChatPage = ({ socket }) => {
    // Declare state variables using the useState hook
    const [messages, setMessages] = useState([]);
    const [typingStatus, setTypingStatus] = useState('');
    // Declare a ref using the useRef hook to reference the last message in the chat
    const lastMessageRef = useRef(null);

    useEffect(() => {
        const onMessage = (data) => setMessages((prev) => [...prev, data]);
        const onTyping = (data) => setTypingStatus(data);
        socket.on('messageResponse', onMessage);
        socket.on('typingResponse', onTyping);
        return () => {
            socket.off('messageResponse', onMessage);
            socket.off('typingResponse', onTyping);
        };
    }, [socket]);

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Render the ChatBar, ChatBody, and ChatFooter components along with their respective props
    return (
        <><div className="chat-wrapper">
            <div className="cards">
                {/* Code for card deck #TODO */}
                <Cards socket={socket} />
            </div>
            <div className="chat">
                <ChatBar socket={socket} />
                <div className="chat__main">
                    <ChatBody
                        messages={messages}
                        typingStatus={typingStatus}
                        lastMessageRef={lastMessageRef} />
                    <ChatFooter socket={socket} />
                </div>
            </div>
        </div><Footer /></>
    );
};

// Export the "ChatPage" component as the default export of this module
export default ChatPage;





