import { useState, useEffect, useRef } from 'react';
import Picker from 'emoji-picker-react';
import { io } from 'socket.io-client';
import { useTranslation } from "react-i18next";

const socket = io('https://student-chat.online', {
  transports: ['websocket'],
});

export default function GroupChat() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const containerRef = useRef(null);
  const { t } = useTranslation();

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useEffect(() => {
    setChats([{ id: 1, messages: [] }]); // начальный чат
  }, []);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === message.chatId
            ? { ...chat, messages: [...chat.messages, message] }
            : chat
        )
      );
    });
    return () => socket.off('receiveMessage');
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !currentChatId) return;

    const newMessage = {
      id: Date.now(),
      msgtext: input,
      msgtime: new Date().toLocaleTimeString(),
      msguser: 'Вы',
      chatId: currentChatId,
    };

    // локально
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );

    socket.emit('sendMessage', newMessage); // другим
    setInput('');
  };

  const addChat = () => {
    const newChatId = chats.length ? Math.max(...chats.map(c => c.id)) + 1 : 1;
    setChats([...chats, { id: newChatId, messages: [] }]);
  };

  const removeChat = (chatId) => {
    setChats(chats.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) setCurrentChatId(null);
  };

  const toggleChatSelection = (chatId) => {
    setCurrentChatId((prev) => (prev === chatId ? null : chatId));
  };

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const styles = {
    container: {
      display: 'flex',
      height: '90vh',
      borderRadius: '12px',
      backgroundColor: '#111b21',
      color: '#e9edef',
      overflow: 'hidden',
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: 'sans-serif',
    },
    sidebar: {
      width: isMobile && currentChatId ? '0' : '30%',
      minWidth: '200px',
      transition: 'width 0.3s',
      backgroundColor: '#202c33',
      display: isMobile && currentChatId ? 'none' : 'block',
    },
    chatListBtn: {
      display: 'block',
      width: '100%',
      padding: '15px',
      backgroundColor: '#2a2a2a',
      color: '#e9edef',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      borderTop: '2px solid #444444',
    },
    chatArea: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
    },
    chatWindow: {
      flex: 1,
      overflowY: 'auto',
      backgroundColor: '#0b141a',
      padding: '10px',
      borderRadius: '10px',
      marginBottom: '10px',
    },
    message: (isYou) => ({
      alignSelf: isYou ? 'flex-end' : 'flex-start',
      backgroundColor: isYou ? '#005c4b' : '#202c33',
      borderRadius: '10px',
      padding: '10px 14px',
      margin: '6px 0',
      maxWidth: '70%',
      wordWrap: 'break-word',
      color: '#e9edef',
      fontSize: '14px',
    }),
    inputBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    input: {
      flex: 1,
      padding: '10px',
      borderRadius: '20px',
      border: '1px solid #2a3942',
      backgroundColor: '#202c33',
      color: '#e9edef',
    },
    sendBtn: {
      backgroundColor: '#00a884',
      border: 'none',
      color: 'white',
      padding: '10px 16px',
      borderRadius: '20px',
      cursor: 'pointer',
    },
    emojiBtn: {
      backgroundColor: '#111b21',
      border: 'none',
      color: '#e9edef',
      fontSize: '20px',
      cursor: 'pointer',
    },
    backBtn: {
      display: isMobile ? 'inline-block' : 'none',
      marginBottom: '10px',
      backgroundColor: '#2a3942',
      color: '#e9edef',
      padding: '6px 12px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => toggleChatSelection(chat.id)}
            style={styles.chatListBtn}
          >
            {t("chat.chat")} {chat.id}
            <span
              onClick={(e) => {
                e.stopPropagation();
                removeChat(chat.id);
              }}
              style={{ float: 'right', color: '#f55', cursor: 'pointer' }}
            >
              ×
            </span>
          </button>
        ))}
        <button onClick={addChat} style={styles.chatListBtn}>
          ➕ {t("chat.add_chat")}
        </button>
      </div>

      <div style={styles.chatArea}>
        {isMobile && currentChatId && (
          <button onClick={() => setCurrentChatId(null)} style={styles.backBtn}>
            ← {t("chat.back_to_chats")}
          </button>
        )}

        {currentChatId && currentChat && (
          <div ref={containerRef} style={styles.chatWindow}>
            {currentChat.messages.map((msg) => (
              <div key={msg.id} style={styles.message(msg.msguser === 'Вы')}>
                <div><strong>{msg.msguser}</strong> <small>{msg.msgtime}</small></div>
                <div>{msg.msgtext}</div>
              </div>
            ))}
          </div>
        )}

        {currentChatId && (
          <div style={styles.inputBar}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.write_message")}
              style={styles.input}
            />
            <button onClick={sendMessage} style={styles.sendBtn}>
              {t("chat.send")}
            </button>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={styles.emojiBtn}>
              😀
            </button>
            {showEmojiPicker && <Picker onEmojiClick={(_, emoji) => handleEmojiClick(emoji)} />}
          </div>
        )}
      </div>
</div>
  );
}
