import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import getFirestore even if not directly used for chat messages

// Ensure Tailwind CSS is loaded for styling
// This comment is for context; Tailwind is assumed to be available in the Canvas environment.

function App() {
  // State variables for Firebase and user authentication
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // State variables for chat functionality
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // For initial loading state

  // Ref for auto-scrolling chat window
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect for Firebase initialization and authentication
  useEffect(() => {
    try {
      // Access global variables provided by the Canvas environment
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

      // Initialize Firebase app
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      // Listen for authentication state changes
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          // User is signed in
          setUserId(user.uid);
          setIsAuthReady(true);
          setIsLoading(false);
        } else {
          // No user is signed in, attempt anonymous sign-in or custom token sign-in
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (error) {
            console.error("Firebase authentication error:", error);
            setIsLoading(false);
          }
        }
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      setIsLoading(false);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Effect for auto-scrolling when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to start a new chat
  const startChat = () => {
    setMessages([]); // Clear previous messages
    setPartnerId(`user-${Math.random().toString(36).substring(2, 9)}`); // Simulate a new partner ID
    setIsChatting(true);
    // In a real application, this would trigger a WebSocket connection
    // to a backend service to find and connect to a real chat partner.
  };

  // Function to send a message
  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && isChatting) {
      const newMessage = {
        id: Date.now(),
        text: inputMessage,
        sender: userId, // Current user's ID
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');

      // Simulate an immediate response from the "partner"
      setTimeout(() => {
        const partnerResponse = {
          id: Date.now() + 1,
          text: `Echo from ${partnerId}: "${newMessage.text}"`,
          sender: partnerId,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prevMessages) => [...prevMessages, partnerResponse]);
      }, 1000); // Simulate a 1-second delay for partner's response
    }
  };

  // Function to find a new chat partner (disconnect current and start new)
  const nextChat = () => {
    setIsChatting(false);
    setPartnerId(null);
    setMessages([]);
    startChat(); // Immediately start a new chat
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading application...</p>
      </div>
    );
  }

  // Display user ID for debugging/identification in multi-user context (as per instructions)
  const displayUserId = userId || 'N/A';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-inter flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-6 flex flex-col h-[80vh] sm:h-[70vh]">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-400">Random Chat</h1>

        {/* Display User ID */}
        <div className="text-sm text-gray-400 text-center mb-4">
          Your User ID: <span className="font-mono text-indigo-300 break-all">{displayUserId}</span>
        </div>

        {!isChatting ? (
          <div className="flex-grow flex items-center justify-center">
            <button
              onClick={startChat}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Start Chat
            </button>
          </div>
        ) : (
          <>
            {/* Chat Window */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-700 rounded-lg mb-4 custom-scrollbar">
              {messages.length === 0 && (
                <p className="text-center text-gray-400 italic">
                  You've connected with <span className="font-bold text-indigo-300">{partnerId}</span>. Say hello!
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                      msg.sender === userId
                        ? 'bg-indigo-500 text-white rounded-br-none'
                        : 'bg-gray-600 text-gray-100 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className="block text-xs text-right mt-1 opacity-75">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* Scroll target */}
            </div>

            {/* Message Input and Send Button */}
            <form onSubmit={sendMessage} className="flex gap-2 mb-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-gray-400"
                disabled={!isChatting}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-5 rounded-lg shadow-md transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                disabled={!isChatting || !inputMessage.trim()}
              >
                Send
              </button>
            </form>

            {/* Next Chat Button */}
            <button
              onClick={nextChat}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transform transition duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Next Chat
            </button>
          </>
        )}
      </div>

      {/* Custom Scrollbar Style */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151; /* gray-700 */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5; /* indigo-600 */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4338ca; /* indigo-700 */
        }
      `}</style>
    </div>
  );
}

export default App;
