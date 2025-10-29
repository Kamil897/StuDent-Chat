import React, { useState, useEffect } from 'react';
import s from './Header.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import NotificationBell from '../NotificationBell/NotificationBell';

const Header = () => {
  const [active, setActive] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:3000/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        const data = await res.json();
        if (res.ok) {
          setUserData(data);
        } else {
          setUserData(null);
        }
      })
      .catch(() => setUserData(null));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserData(null);
    navigate('/login');
  };

  const toggleBurger = () => setActive(!active);
  const CloseMenu = () => setActive(false);

  return (
    <header className={s.header}>
      <div className={s.container}>
        <nav className={s.nav}>
          {/* Центр: Лого и ссылки */}
          <div className={s.center}>
            <Link to="/" className={s.logo}>Student Chat</Link>
            <Link to="/AiChat" className={s.link}>Cognia AI</Link>
            <Link to="/AISimulation" className={s.link}>Trai</Link>
          </div>

          {/* Правая часть */}
          <div className={s.right}>
            <NotificationBell />

            <div className={s.lang}>
              <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
                <option value="ru">RU</option>
                <option value="en">EN</option>
                <option value="uz">UZ</option>
              </select>
            </div>
            
            {userData ? (
              <div className={s.profile}>
                <Link to="/MainPage">
                  <img
                    src={userData.avatar || "/profileimg.png"}
                    alt="avatar"
                    className={s.avatar}
                  />
                </Link>
                <span className={s.userName}>
                  {userData.firstName || "User"}
                </span>
              </div>
            ) : (
              <div className={s.authButtons}>
                <Link to="/login">
                  <button className={s.loginBtn}>{t("menu.login")}</button>
                </Link>
                <Link to="/register">
                  <button className={s.registerBtn}>{t("menu.register")}</button>
                </Link>
              </div>
            )}

          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
