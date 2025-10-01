import React, { useState, useEffect } from 'react';
import styles from './FriendsList.module.scss';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  const [newFriendId, setNewFriendId] = useState('');

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
      const [friendsRes, requestsRes] = await Promise.all([
        fetch('http://localhost:3000/friends', { headers: authHeaders }),
        fetch('http://localhost:3000/friends/pending/requests', { headers: authHeaders })
      ]);

      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriends(Array.isArray(friendsData) ? friendsData : []);
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setPendingRequests(Array.isArray(requestsData) ? requestsData : []);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async () => {
    if (!newFriendId.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/friends/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ friendId: parseInt(newFriendId) })
      });

      if (response.ok) {
        alert('Заявка в друзья отправлена!');
        setNewFriendId('');
        loadFriends();
      } else {
        const error = await response.json();
        alert(error.message || 'Ошибка при отправке заявки');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Ошибка при отправке заявки');
    }
  };

  const acceptRequest = async (friendId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ friendId })
      });

      if (response.ok) {
        alert('Заявка принята!');
        loadFriends();
      } else {
        const error = await response.json();
        alert(error.message || 'Ошибка при принятии заявки');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Ошибка при принятии заявки');
    }
  };

  const removeFriend = async (friendId) => {
    if (!confirm('Удалить из друзей?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/friends/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ friendId })
      });

      if (response.ok) {
        alert('Друг удален из списка');
        loadFriends();
      } else {
        const error = await response.json();
        alert(error.message || 'Ошибка при удалении друга');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Ошибка при удалении друга');
    }
  };

  if (loading) {
    return (
      <div className={styles['friends-container']}>
        <div className={styles.loading}>Загрузка друзей...</div>
      </div>
    );
  }

  return (
    <div className={styles['friends-container']}>
      <div className={styles['friends-header']}>
        <h2>👥 Друзья</h2>
        <div className={styles['add-friend']}>
          <input
            type="number"
            placeholder="ID пользователя"
            value={newFriendId}
            onChange={(e) => setNewFriendId(e.target.value)}
            className={styles['friend-id-input']}
          />
          <button onClick={addFriend} className={styles['add-friend-btn']}>
            Добавить в друзья
          </button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'friends' ? styles.active : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          Друзья ({friends.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Заявки ({pendingRequests.length})
        </button>
      </div>

      {activeTab === 'friends' && (
        <div className={styles['friends-list']}>
          {friends.length === 0 ? (
            <div className={styles['empty-state']}>
              <p>У вас пока нет друзей</p>
              <p>Добавьте друзей, чтобы начать общение!</p>
            </div>
          ) : (
            friends.map((friend) => (
              <div key={friend?.friendshipId || friend?.id} className={styles['friend-item']}>
                <div className={styles['friend-avatar']}>
                  {friend?.avatar ? (
                    <img src={friend.avatar} alt={friend?.name || ''} />
                  ) : (
                    <div className={styles['avatar-placeholder']}>
                      {(friend?.name?.charAt(0) || '?').toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles['friend-info']}>
                  <h3 className={styles['friend-name']}>{friend?.name || 'Без имени'}</h3>
                  <p className={styles['friend-email']}>{friend?.email || ''}</p>
                  <p className={styles['friend-since']}>
                    Друзья с {friend?.createdAt ? new Date(friend.createdAt).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className={styles['friend-actions']}>
                  <button 
                    className={styles['message-btn']}
                    onClick={() => window.location.href = `/chat/${friend?.id}`}
                  >
                    💬 Сообщение
                  </button>
                  <button 
                    className={styles['remove-btn']}
                    onClick={() => friend?.id && removeFriend(friend.id)}
                  >
                    ❌ Удалить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className={styles['requests-list']}>
          {pendingRequests.length === 0 ? (
            <div className={styles['empty-state']}>
              <p>Нет новых заявок в друзья</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div key={request?.id} className={styles['request-item']}>
                <div className={styles['friend-avatar']}>
                  {request?.user?.avatar ? (
                    <img src={request.user.avatar} alt={request?.user?.name || ''} />
                  ) : (
                    <div className={styles['avatar-placeholder']}>
                      {(request?.user?.name?.charAt(0) || '?').toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles['friend-info']}>
                  <h3 className={styles['friend-name']}>{request?.user?.name || 'Без имени'}</h3>
                  <p className={styles['friend-email']}>{request?.user?.email || ''}</p>
                  <p className={styles['request-date']}>
                    Заявка от {request?.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div className={styles['request-actions']}>
                  <button 
                    className={styles['accept-btn']}
                    onClick={() => request?.user?.id && acceptRequest(request.user.id)}
                  >
                    ✓ Принять
                  </button>
                  <button 
                    className={styles['reject-btn']}
                    onClick={() => request?.user?.id && removeFriend(request.user.id)}
                  >
                    ✗ Отклонить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
