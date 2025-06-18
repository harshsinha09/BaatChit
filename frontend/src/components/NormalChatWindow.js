import React, { useState, useEffect, useRef, useCallback } from "react";
import "./NormalChatWindow.css";
import Message from "./Message";
import TopNavbar from "./TopNavbar";
import { useSocket } from "../api/socket.api";
import { NEW_MESSAGE } from "../constants/events.js";
import { useParams } from "react-router-dom";
import chatAPI from "../api/chat.api";
import InfiniteScroll from "react-infinite-scroll-component";

function NormalChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [emotion, setEmotion] = useState("");
  const emotionTimeout = useRef(null);
  const socket = useSocket();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { chatId } = useParams();
  const [members, setMembers] = useState([]);
  const containerRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch chat members
  const getChatDetails = async () => {
    try {
      const response = await chatAPI.get(`/get-chats/${chatId}?populate=true`, {
        withCredentials: true,
      });
      setMembers(response.data?.data.members || []);
    } catch (err) {
      console.error("Error fetching chat details:", err);
    }
  };

  useEffect(() => {
    if (!chatId) return;
    getChatDetails();
  }, [chatId]);

  // Emotion detection
  function getEmotion(e) {
  const newInput = e.target.value;
  setInput(newInput);

  if (emotionTimeout.current) clearTimeout(emotionTimeout.current);
  if (newInput.trim().length === 0) {
    setEmotion("");
    return;
  }

  emotionTimeout.current = setTimeout(() => {
    fetch("http://localhost:5000/detect_emotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newInput }),
    })
      .then((res) => res.json())
      .then((data) => setEmotion(data.emotion))
      .catch((err) => {
        console.error("Emotion detection failed:", err);
        setEmotion("");
      });
  }, 10);
}


  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    socket.emit(NEW_MESSAGE, { chatId, members, message: input, emotion });
    setInput("");
    setEmotion("");
  };

  // Fetch messages
  const fetchOlderMessages = useCallback(async () => {
    if (!hasMore || !chatId) return;

    try {
      const response = await chatAPI.get(`/get-messages/${chatId}?page=${page}`, {
        withCredentials: true,
      });

      if (response.data.messages.length > 0) {
        setMessages((prev) => [...prev, ...response.data.messages]);
        setPage((prev) => prev + 1);
        if (response.data.messages.length < 10) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching older messages:", err);
      setHasMore(false);
    } finally {
      if (isInitialLoad) setIsInitialLoad(false);
    }
  }, [chatId, page, hasMore, isInitialLoad]);

  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setIsInitialLoad(true);
    fetchOlderMessages();
  }, [chatId]);

  // Handle incoming messages
  const handleNewMessage = useCallback((msg) => {
    if ("" + msg.chat === "" + chatId) {
      setMessages((prev) => [msg, ...prev]);
    }
  }, [chatId]);

  useEffect(() => {
    if (!socket) return;
    socket.on(NEW_MESSAGE, handleNewMessage);
    return () => socket.off(NEW_MESSAGE, handleNewMessage);
  }, [socket, handleNewMessage]);

  const handleDeleteMessage = async (messageId) => {
    try {
      await chatAPI.delete("/delete-message", {
        data: { messageId },
        withCredentials: true,
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <div className="NormalchatWindow">
      <TopNavbar />

      {emotion && (
        <p style={{ marginLeft: "10px", color: "#555" }}>
          Detected Emotion: <strong>{emotion}</strong>
        </p>
      )}

      <div
        id="scrollableDiv"
        ref={containerRef}
        className="NormalchatWindow__body"
        style={{
          height: "400px",
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchOlderMessages}
          hasMore={hasMore}
          inverse={true}
          loader={<h4>Loading older messages...</h4>}
          scrollableTarget="scrollableDiv"
          style={{ display: "flex", flexDirection: "column-reverse" }}
        >
          {messages.map((msg, index) => (
            <Message
              key={index}
              sender_id={msg.sender._id}
              sender_name={msg.sender.name}
              text={msg.content}
              emotion={msg.emotion} // ✅ Display emotion per message
              time={`${new Date(msg.createdAt).toLocaleTimeString()} ${new Date(msg.createdAt).toLocaleDateString()}`}
              onDelete={() => handleDeleteMessage(msg._id)}
            />
          ))}
        </InfiniteScroll>
      </div>

      <div className="NormalchatWindow__footer">
        <form onSubmit={sendMessage} className="message-form">
          <div className="input-container">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={getEmotion}
              className="chat-box"
            />
            <button type="submit" className="send-button">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NormalChatWindow;
