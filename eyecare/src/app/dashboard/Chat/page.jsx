
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from '@/app/firebase/config';
import {
    getDocs, collection, addDoc, query, orderBy, onSnapshot,
    serverTimestamp, doc, getDoc, updateDoc, deleteDoc
} from 'firebase/firestore';

const ChatApp = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [userRole, setUserRole] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const userRef = doc(db, "users", auth.currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserRole(userSnap.data().role);
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
        };

        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'users');
                const querySnapshot = await getDocs(usersCollection);
                const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole().then(fetchUsers);
    }, []);

    const filteredUsers = users.filter(user => {
        if (userRole === "patient") return user.role === "doctor";
        if (userRole === "doctor") return user.role === "patient";
        return false;
    });

    const openChat = (user) => {
        setSelectedUser(user);
        fetchMessages(user.id);
    };

    const fetchMessages = (receiverId) => {
        const chatRef = collection(db, 'chats');
        const chatQuery = query(chatRef, orderBy("timestamp"));

        onSnapshot(chatQuery, (snapshot) => {
            const chatMessages = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(msg =>
                    (msg.senderId === auth.currentUser.uid && msg.receiverId === receiverId) ||
                    (msg.senderId === receiverId && msg.receiverId === auth.currentUser.uid)
                );

            setMessages(chatMessages);
            scrollToBottom();
        });
    };

    const sendMessage = async () => {
        if ((!newMessage.trim() && !imageFile) || !selectedUser) return;

        try {
            let messageData = {
                senderId: auth.currentUser.uid,
                receiverId: selectedUser.id,
                timestamp: serverTimestamp()
            };

            if (imageFile) {
                setIsUploading(true);
                
                // Convert image to base64
                const reader = new FileReader();
                reader.readAsDataURL(imageFile);
                
                reader.onload = async () => {
                    const base64String = reader.result;
                    messageData.imageBase64 = base64String;
                    
                    if (newMessage.trim()) {
                        messageData.text = newMessage;
                    }
                    
                    try {
                        await addDoc(collection(db, 'chats'), messageData);
                        setNewMessage("");
                        setImageFile(null);
                        setIsUploading(false);
                    } catch (error) {
                        console.error("Error adding message:", error);
                        setIsUploading(false);
                    }
                };
                
                reader.onerror = (error) => {
                    console.error("Error converting image:", error);
                    setIsUploading(false);
                };
                
            } else {
                messageData.text = newMessage;
                await addDoc(collection(db, 'chats'), messageData);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setIsUploading(false);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            // Validate file size (e.g., 2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB');
                return;
            }
            setImageFile(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            await deleteDoc(doc(db, "chats", messageId));
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const editMessage = (message) => {
        setEditingMessage(message);
        setNewMessage(message.text);
    };

    const saveEditedMessage = async () => {
        if (!editingMessage || (!newMessage.trim() && !editingMessage.imageBase64)) return;

        try {
            const messageRef = doc(db, "chats", editingMessage.id);
            await updateDoc(messageRef, { text: newMessage });
            setEditingMessage(null);
            setNewMessage("");
        } catch (error) {
            console.error("Error updating message:", error);
        }
    };

    const cancelEdit = () => {
        setEditingMessage(null);
        setNewMessage("");
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return { time: "Just now", date: "", fullDate: "" };
        const date = timestamp.toDate();
        return {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
            date: date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }),
            fullDate: date.toDateString()
        };
    };

    return (
        <div className="min-h-screen bg-blue-50 p-6 font-sans">
            {!selectedUser ? (
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
                        <h2 className="text-2xl font-bold">Available {userRole === "patient" ? "Doctors" : "Patients"}</h2>
                    </div>
                    
                    {loading ? (
                        <div className="p-6 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <ul className="divide-y divide-blue-100">
                            {filteredUsers.map(user => (
                                <li
                                    key={user.id}
                                    onClick={() => openChat(user)}
                                    className="p-4 hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                            {user.username?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium text-gray-900">{user.username || "N/A"}</p>
                                            <p className="text-sm text-blue-600">{user.role || 'Medical Professional'}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            No {userRole === "patient" ? "doctors" : "patients"} available.
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white flex items-center">
                        <button 
                            onClick={() => setSelectedUser(null)} 
                            className="mr-4 p-1 rounded-full hover:bg-blue-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-semibold">
                            {selectedUser.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-bold">Chat with {selectedUser.username}</h3>
                            <p className="text-sm text-blue-100">{selectedUser.role || 'Medical Professional'}</p>
                        </div>
                    </div>

                    <div className="h-96 overflow-y-auto p-4 bg-blue-50">
                        {messages.map((msg, index) => {
                            const formattedTime = formatTimestamp(msg.timestamp);
                            const currentDate = formattedTime.fullDate;
                            const prevDate = index > 0 ? formatTimestamp(messages[index - 1].timestamp).fullDate : null;

                            return (
                                <React.Fragment key={msg.id}>
                                    {currentDate !== prevDate && (
                                        <div className="flex justify-center my-4">
                                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                                                {formattedTime.date}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex ${msg.senderId === auth.currentUser.uid ? 'justify-end' : 'justify-start'} mb-4`}>
                                        <div 
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.senderId === auth.currentUser.uid 
                                                ? 'bg-blue-500 text-white rounded-br-none' 
                                                : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}
                                        >
                                            {msg.imageBase64 && (
                                                <div className="mb-2">
                                                    <img 
                                                        src={msg.imageBase64} 
                                                        alt="Uploaded content" 
                                                        className="max-w-full h-auto rounded-lg border border-blue-100 max-h-48 object-contain"
                                                        onClick={() => window.open(msg.imageBase64, '_blank')}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </div>
                                            )}
                                            {msg.text && <p className="text-sm">{msg.text}</p>}
                                            <div className={`flex items-center justify-end mt-1 ${msg.senderId === auth.currentUser.uid ? 'text-blue-100' : 'text-gray-500'}`}>
                                                <span className="text-xs">{formattedTime.time}</span>
                                                {msg.senderId === auth.currentUser.uid && (
                                                    <div className="ml-2 flex space-x-1">
                                                        <button
                                                            onClick={() => editMessage(msg)}
                                                            className="text-xs hover:text-blue-200 transition-colors"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => deleteMessage(msg.id)}
                                                            className="text-xs hover:text-red-300 transition-colors"
                                                        >
                                                            ❌
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-blue-100">
                        {editingMessage && (
                            <div className="mb-2 text-sm text-blue-600 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editing message
                            </div>
                        )}
                        
                        {imageFile && (
                            <div className="mb-3 relative">
                                <div className="border border-blue-200 rounded-lg p-2 inline-block">
                                    <img 
                                        src={URL.createObjectURL(imageFile)} 
                                        alt="Preview" 
                                        className="h-24 object-contain"
                                    />
                                    <button 
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}

                        {isUploading && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                                <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: '100%' }}
                                ></div>
                                <div className="text-center text-xs text-gray-500 mt-1">Processing image...</div>
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <button 
                                onClick={() => fileInputRef.current.click()}
                                className="p-2 text-blue-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                title="Attach image"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </button>
                            
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 rounded-full border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && (editingMessage ? saveEditedMessage() : sendMessage())}
                            />
                            
                            {editingMessage ? (
                                <>
                                    <button 
                                        onClick={saveEditedMessage}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={cancelEdit}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={sendMessage}
                                    disabled={isUploading || (!newMessage.trim() && !imageFile)}
                                    className={`px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                                        isUploading || (!newMessage.trim() && !imageFile)
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatApp;