// Import the required modules from the react-router-dom library
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Import the "Home" and "ChatPage" components from their respective files
import Home from './components/Home';
import ChatPage from './components/ChatPage';
// Import the "socket.io-client" module to establish a connection to the server
import socketIO from 'socket.io-client';

// Use the "socket.io-client" module to create a socket object that connects to the server at "http://localhost:4000"
const socket = socketIO.connect('http://localhost:4000');

// Define a functional component called "App"
function App() {
  // Render the component hierarchy using the BrowserRouter, Routes, and Route components from react-router-dom
  return (
    <BrowserRouter>
      <div>
        <Routes>
          {/* Render the Home component when the path is "/" and pass the socket object as a prop */} 
          <Route path="/" element={<Home socket={socket} />}></Route>
          {/* Render the ChatPage component when the path is "/chat" and pass the socket object as a prop */}
          <Route path="/chat" element={<ChatPage socket={socket} />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// Export the "App" component as the default export of this module
export default App;
