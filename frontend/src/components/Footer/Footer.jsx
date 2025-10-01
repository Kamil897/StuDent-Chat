import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import s from './Footer.module.scss';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className={s.footer}>
      <div className={s.container}>

        {/* Логотип */}
        <div className={s.logoSection}>
          <img src="/Sdct.png" alt="SDCT Logo" className={s.logo} />
          <span className={s.logoText}>STUDENTCHAT</span>
        </div>

        <div className={s.center} aria-hidden={false}>
          <blockquote className={s.quote}>
            {t("footer.slogan")}
          </blockquote>
        </div>

        {/* Ссылки */}
        <nav className={s.nav}>
          <Link to="/ChatGroup">{t("footer.groups")}</Link>
          <Link to="/AiChat">Cognia AI</Link>
          <Link to="/MainPage">{t("footer.account")}</Link>
        </nav>

      </div>

      {/* Нижняя часть */}
      <div className={s.bottom}>
        <p>© 2025 OOO STUDENTCHAT. Все права защищены.</p>
        <p>contact@student-chat.online</p>
      </div>
    </footer>
  );
};

export default Footer;
