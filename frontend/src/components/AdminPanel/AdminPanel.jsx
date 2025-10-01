import { useState } from "react";
import styles from "./AdminPanel.module.scss";

const AdminPanel = () => {
  const [section, setSection] = useState("analytics");

  const renderContent = () => {
    switch (section) {
      case "analytics":
        return <div> <h2>📊 Аналитика: графики, активность, пользователи</h2></div>;
      case "incognito":
        return <div> <h2>🕵️ Режим инкогнито включён. Вы можете наблюдать за действиями.</h2></div>;
      case "deleteUser":
        return (
          <div>
            <h3>Удалить пользователя</h3>
            <input type="text" placeholder="Введите ID пользователя" />
            <button>Удалить</button>
          </div>
        );
      case "complaints":
        return (
          <div>
            <h3>Список жалоб</h3>
            <ul>
              <li>Пользователь #102 пожаловался на спам</li>
              <li>Пользователь #230 — неподобающий контент</li>
            </ul>
          </div>
        );
      case "removeAdmin":
        return (
          <div>
            <h3>Снять админку</h3>
            <input type="text" placeholder="Введите ID администратора" />
            <button>Снять права</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1>Админ Панель</h1>
      <div className={styles.menu}>
        <button onClick={() => setSection("analytics")}>Аналитика</button>
        <button onClick={() => setSection("incognito")}>Инкогнито</button>
        <button onClick={() => setSection("deleteUser")}>Удалить пользователя</button>
        <button onClick={() => setSection("complaints")}>Список жалоб</button>
        <button onClick={() => setSection("removeAdmin")}>Снять админку</button>
      </div>
      <div className={styles.content}>{renderContent()}</div>
    </div>
  );
};

export default AdminPanel;
