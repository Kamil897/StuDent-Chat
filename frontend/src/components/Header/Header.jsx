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
      <div className={s.container__main}>
        <nav className={s.nav}>
          {/* Логотип */}
          <div className={s.logo}>
            <Link onClick={CloseMenu} to={'/'} className={s.h1__logo}>
              StuDent ChaT
            </Link>
          </div>

          {/* Ссылки */}
          <div className={`${s.links} ${active ? s.active : ''}`}>
            {/* Cognia */}
            <div className={s.group}>
              <Link className={`${s.teach} ${s.cognia}`} onClick={CloseMenu} to={'/AiChat'}>
                Cognia AI
              </Link>
            </div>

            <div className={s.divider}></div>

            {/* IELTS */}
            <div className={s.group}>
              <Link className={`${s.teach} ${s.ielts}`} onClick={CloseMenu} to={'/AISimulation'}>
                IELTS Simulation
              </Link>
            </div>

            {/* Авторизация */}
            {!userData ? (
              <div className={s.authButtons}>
                <Link onClick={CloseMenu} to={'/login'}>
                  <button className={s.loginBtn}>{t("menu.login")}</button>
                </Link>
                <Link onClick={CloseMenu} to={'/register'}>
                  <button className={s.registerBtn}>{t("menu.register")}</button>
                </Link>
              </div>
            ) : (
              <div className={s.userSection}>
                <NotificationBell />
                <Link className={s.main} onClick={CloseMenu} to={'/MainPage'}>
                  <img
                    src={userData.avatar || '/profileimg.png'}
                    alt="Avatar"
                    className={s.avatar}
                  />
                </Link>
                <span className={s.userName}>
                  {userData.firstName || "User"}
                </span>
                {/* Если захочешь logout кнопку */}
                {/* <button onClick={handleLogout} className={s.logoutBtn}>
                  {t("menu.logout")}
                </button> */}
              </div>
            )}
          </div>

          {/* Бургер */}
          <div onClick={toggleBurger} className={`${s.burger} ${active ? s.active : ''}`}>
            <span></span>
            <span></span>
          </div>

          {/* Переключение языков */}
          <div className={s.langSwitcher}>
            <button onClick={() => i18n.changeLanguage('ru')}>RU</button>
            <button onClick={() => i18n.changeLanguage('en')}>EN</button>
            <button onClick={() => i18n.changeLanguage('uz')}>UZ</button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
