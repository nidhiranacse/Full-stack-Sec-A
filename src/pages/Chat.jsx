import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    withCredentials: true
});

function Chat() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on("receiveMessage", (newMessage) => {
            setMessages((previousMessages) => [
                ...previousMessages,
                newMessage
            ]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    const sendMessage = () => {
        if (message.trim() === "") return;

        socket.emit("sendMessage", message);
        setMessage("");
    };

    return (
        <div>
            <h1>CampusConnect Chat</h1>

            <div>
                {messages.map((msg, index) => (
                    <p key={index}>
                        💬 {msg}
                    </p>
                ))}
            </div>

            <input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        sendMessage();
                    }
                }}
            />

            <button onClick={sendMessage}>
                Send
            </button>
        </div>
    );
}

export default Chat;