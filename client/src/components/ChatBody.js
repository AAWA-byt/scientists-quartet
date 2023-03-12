import React from 'react'
import {useNavigate} from "react-router-dom"

const ChatBody = ({messages, typingStatus, lastMessageRef}) => { 
  const navigate = useNavigate()
  
  // This function is called when the "LEAVE CHAT" button is clicked
  const handleLeaveChat = () => {
    localStorage.removeItem("userName") // Remove the "userName" item from localStorage
    navigate("/") // Navigate to the home page
    window.location.reload() // Reload the page to reset the chat
  }
  
  return (
    <>
      <header className='chat__mainHeader'>
        <p>Made with socket.io</p>
        <button className='leaveChat__btn' onClick={handleLeaveChat}>LEAVE GAME</button>
      </header>

      <div className='message__container'>
        {/* Map over the messages array and create a ChatBubble component for each message */}
        {messages.map(message => (
          message.name === localStorage.getItem("userName") ? (
            <div className="message__chats" key={message.id}>
              <p className='sender__name'>You</p>
              <div className='message__sender'>
                <p>{message.text}</p>
              </div>
            </div>
          ): (
            <div className="message__chats" key={message.id}>
              <p className='sender__name'>{message.name}</p>
              <div className='message__recipient'>
                <p>{message.text}</p>
              </div>
            </div>
          )
        ))}
        
        {/*
        // Display the typing status 
        <div className='message__status'>
          <p>{typingStatus}</p>
        </div>
        */}

        {/* This empty div is used as a reference to scroll to the last message */}
        <div ref={lastMessageRef} />   
      </div>
    </>
  )
}

export default ChatBody


