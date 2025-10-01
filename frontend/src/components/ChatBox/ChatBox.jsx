import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ChatBox.module.scss';

const ChatBox = () => {
  const { friendId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (friendId && !isNaN(parseInt(friendId))) {
      loadMessages();
      loadFriendInfo();
    } else {
      setLoading(false);
    }
  }, [friendId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3000/messages/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:3000/friends`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const friendsData = await response.json();
        const friendData = friendsData.find(f => f.id === parseInt(friendId));
        setFriend(friendData || null);
      }
    } catch (error) {
      console.error('Error loading friend info:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          toUserId: parseInt(friendId),
          content: newMessage
        })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
      } else {
        const error = await response.json();
        alert(error.message || 'Ошибка при отправке сообщения');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка при отправке сообщения');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.loading}>Загрузка чата...</div>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.error}>Пользователь не найден</div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.friendInfo}>
          <div className={styles.friendAvatar}>
            {friend.avatar ? (
              <img src={friend.avatar} alt={friend.name || 'User'} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {(friend.name?.charAt(0) || '?').toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.friendDetails}>
            <h3 className={styles.friendName}>{friend.name || 'Без имени'}</h3>
            <p className={styles.friendStatus}>В сети</p>
          </div>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyChat}>
            <p>Начните разговор с {friend.name || 'пользователем'}!</p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((message, index) => {
              const isOwnMessage =
                message.fromUserId === parseInt(localStorage.getItem('userId') || '0');
              const showDate =
                index === 0 ||
                formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className={styles.dateSeparator}>
                      {formatDate(message.createdAt)}
                    </div>
                  )}
                  <div
                    className={`${styles.message} ${
                      isOwnMessage ? styles.own : styles.other
                    }`}
                  >
                    <div className={styles.messageContent}>
                      <p className={styles.messageText}>{message.content}</p>
                      <span className={styles.messageTime}>
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className={styles.messageInput}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..."
          className={styles.messageTextarea}
          rows="1"
        />
        <button
          onClick={sendMessage}
          className={styles.sendButton}
          disabled={!newMessage.trim()}
        >
          📤
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
