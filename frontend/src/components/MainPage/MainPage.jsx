import { Link, useNavigate } from 'react-router-dom';
import s from './MainPage.module.scss';
import { useEffect, useState } from 'react';
import Dock from '../Dock/Dock.jsx';
import { useTranslation } from 'react-i18next';

const MainPage = () => {
  const { t } = useTranslation();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:3000/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async res => {
        const data = await res.json();
        console.log("Ответ /auth/me:", res.status, data);
        if (res.ok) {
          setUserData(data);
        } else {
          navigate("/login");
        }
      })
      .catch(err => {
        console.error("Ошибка запроса:", err);
        navigate("/login");
      });
  }, [navigate]);

  if (!userData) {
    return <p>{t("main.loading")}</p>;
  }

  return (
    <div className={s.sects}>
      <div className={s.section_2}>
        <div className={s.main}>
          <img
            className={`${userData.avatar ? s.pfp : s.defoltpfp} ${userData.avatarBorders ? s[userData.avatarBorders] : ''}`}
            src={userData.avatar || '/profileimg.png'}
            alt="profile"
          />
          <div className={s.info}>
            <h2 className={s.username}>
              <b>{userData.firstName} {userData.lastName}</b>
            </h2>
            <p><b>{t("main.first_name")}: </b>{userData.firstName || "—"}</p>
            <p><b>{t("main.email")}:</b> {userData.email || "—"}</p>
          </div>
        </div>
      </div>
      <Dock />
    </div>
  );
};

export default MainPage;
