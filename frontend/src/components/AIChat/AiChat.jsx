import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react"; // иконки
import s from "./AiChat.module.scss";

const API_LOGIN = "http://localhost:3000";
const API_MAIN = "http://localhost:7777";

const AiChat = () => {
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("chatTheme") || "light");
  const [isLoading, setIsLoading] = useState(false);

  const chatBoxRef = useRef(null);

  // автоскролл вниз
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // загрузка списка чатов
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${API_LOGIN}/chat/list`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setChatList(res.data))
      .catch((err) => console.error("Ошибка загрузки чатов:", err));
  }, []);

  const loadChat = async (chatId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_LOGIN}/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let history = [];
      if (Array.isArray(res.data)) {
        history = res.data.flatMap((c) =>
          (c.messages || []).map((msg) => ({
            role: msg.role === "assistant" ? "ai" : "user",
            text: msg.content,
          }))
        );
      } else if (res.data?.messages) {
        history = res.data.messages.map((msg) => ({
          role: msg.role === "assistant" ? "ai" : "user",
          text: msg.content,
        }));
      }
      setSelectedChat(chatId);
      setMessages(history);
    } catch (err) {
      console.error("Ошибка загрузки истории:", err);
    }
  };

  const newChat = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.post(
        `${API_LOGIN}/chat/new`,
        { title: `Chat ${chatList.length + 1}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newChatObj = res.data;
      setChatList((prev) => [...prev, newChatObj]);
      setSelectedChat(newChatObj.id);
      setMessages([]);
    } catch (err) {
      console.error("Ошибка создания чата:", err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
  
    const newMessages = [...messages, { role: "user", text: message }];
    setMessages(newMessages);
    setMessage("");
    setIsLoading(true);
  
    try {
      const token = localStorage.getItem("token");
  
      // сохраняем сообщение пользователя в БД
      await axios.post(
        `${API_LOGIN}/chat/${selectedChat}/message`,
        { role: "user", content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // спрашиваем у AI
      const res = await axios.post(
        `${API_MAIN}/api/ai/ask`,
        { message, history: newMessages },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const reply = res.data?.reply || "Нет ответа";
      const updatedMessages = [...newMessages, { role: "ai", text: reply }];
      setMessages(updatedMessages);
  
      // сохраняем ответ ассистента в БД
      await axios.post(
        `${API_LOGIN}/chat/${selectedChat}/message`,
        { role: "assistant", content: reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`${s.chatWrapper} ${theme === "light" ? s.light : s.dark}`}>
      {/* Sidebar */}
      <div className={s.sidebar}>
        <h2>💬 Чаты</h2>
        <button onClick={newChat} className={s.newChat}>+ Новый чат</button>
        {chatList.map((chat) => (
          <button
            key={chat.id}
            className={`${s.sidebarBtn} ${selectedChat === chat.id ? s.active : ""}`}
            onClick={() => loadChat(chat.id)}
          >
            {chat.title || "Без названия"}
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className={s.chatContainer}>
        <h1 className={s.Aititle}>🤖 Cognia</h1>
        <div className={s.chatBox} ref={chatBoxRef}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${s.message} ${msg.role === "user" ? s.user : s.ai}`}
            >
              <div className={s.messageAvatar}>
                {msg.role === "user" ? <User size={20}/> : <Bot size={20}/>}
              </div>
              <div className={s.messageContent}>{msg.text}</div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${s.message} ${s.ai}`}
            >
              <div className={s.messageAvatar}><Bot size={20}/></div>
              <div className={s.messageContent}>Печатает...</div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className={s.AiinputSection}>
          <div className={s.inputWrapper}>
            <textarea
              className={s.Aiinput}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите сообщение..."
              disabled={!selectedChat || isLoading}
            />
            <button
              className={s.AiButton}
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
