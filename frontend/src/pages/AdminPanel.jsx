import React, { useEffect, useState } from 'react';
import api from '../components/utils/axios';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [editAdminId, setEditAdminId] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    username: '', email: '', password: '', first_name: '', last_name: ''
  });

  const [editedUser, setEditedUser] = useState({ username: '', email: '' });
  const [editedAdmin, setEditedAdmin] = useState({ username: '', email: '' });

  useEffect(() => {
    fetchUsers();
    fetchAdmins();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      alert('Ошибка загрузки пользователей');
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/all');
      setAdmins(res.data);
    } catch (err) {
      alert('Ошибка загрузки админов');
    }
  };

  const updateUser = async (id) => {
    try {
      await api.patch(`/users/${id}`, editedUser);
      setEditUserId(null);
      fetchUsers();
    } catch (err) {
      alert('Ошибка обновления');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  const createAdmin = async () => {
    try {
      await api.post('/admin', newAdmin);
      setNewAdmin({ username: '', email: '', password: '', first_name: '', last_name: '' });
      fetchAdmins();
    } catch (err) {
      alert('Ошибка создания админа');
    }
  };

  const updateAdmin = async (id) => {
    try {
      await api.patch(`/admin/${id}`, editedAdmin);
      setEditAdminId(null);
      fetchAdmins();
    } catch (err) {
      alert('Ошибка обновления');
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm('Удалить админа?')) return;
    await api.delete(`/admin/${id}`);
    fetchAdmins();
  };

  return (
    <div className="admin-panel">
      <h2>Панель администратора</h2>

      <h3>Пользователи</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Email</th><th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>
                {editUserId === u.id ? (
                  <input value={editedUser.username}
                    onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                  />
                ) : u.username}
              </td>
              <td>
                {editUserId === u.id ? (
                  <input value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  />
                ) : u.email}
              </td>
              <td>
                {editUserId === u.id ? (
                  <button onClick={() => updateUser(u.id)}>💾</button>
                ) : (
                  <button onClick={() => {
                    setEditUserId(u.id);
                    setEditedUser({ username: u.username, email: u.email });
                  }}>✏️</button>
                )}
                <button onClick={() => deleteUser(u.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Админы</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Email</th><th>Создатель?</th><th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>
                {editAdminId === a.id ? (
                  <input value={editedAdmin.username}
                    onChange={(e) => setEditedAdmin({ ...editedAdmin, username: e.target.value })}
                  />
                ) : a.username}
              </td>
              <td>
                {editAdminId === a.id ? (
                  <input value={editedAdmin.email}
                    onChange={(e) => setEditedAdmin({ ...editedAdmin, email: e.target.value })}
                  />
                ) : a.email}
              </td>
              <td>{a.is_creator ? '✅' : '❌'}</td>
              <td>
                {editAdminId === a.id ? (
                  <button onClick={() => updateAdmin(a.id)}>💾</button>
                ) : (
                  <button onClick={() => {
                    setEditAdminId(a.id);
                    setEditedAdmin({ username: a.username, email: a.email });
                  }}>✏️</button>
                )}
                {!a.is_creator && (
                  <button onClick={() => deleteAdmin(a.id)}>🗑️</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Создать нового админа</h3>
      <div className="admin-create">
        {['username', 'email', 'password', 'first_name', 'last_name'].map((field) => (
          <input
            key={field}
            placeholder={field}
            value={newAdmin[field]}
            onChange={(e) => setNewAdmin({ ...newAdmin, [field]: e.target.value })}
          />
        ))}
        <button onClick={createAdmin}>Создать</button>
      </div>
    </div>
  );
};

export default AdminPanel;
