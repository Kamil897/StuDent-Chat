import styled from 'styled-components';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Dock = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedPrivilege, setSelectedPrivilege] = useState(t('dock.moderator'));
  const [selectedTitle, setSelectedTitle] = useState(t('dock.newbie'));

  const handleLogout = () => {
    localStorage.removeItem('loggedInUsername');
    navigate('/login');
  };

  const privileges = [
    t('dock.admin'),
    t('dock.moderator'),
    t('dock.user')
  ];
  const titles = [
    t('dock.newbie'),
    t('dock.experienced'),
    t('dock.veteran')
  ];

  return (
    <StyledWrapper>
      <div className="card">
        <ul className="list">
          <Link to={'/'}>
            <li className="element">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house">
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              <p className="label">{t('dock.home')}</p>
            </li>
          </Link>

          <Link to={'/LeaderBoard'}>
            <li className="element">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                <path d="m15 5 4 4"/>
              </svg>
              <p className="label">Leaderboard</p>
            </li>
          </Link>
        </ul>

        <div className="separator"></div>

        <ul className="list">
          <Link to={'/Shop'}>
            <li className="element">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              <p className="label">{t('dock.shop')}</p>
            </li>
          </Link>

          <Link to={'/Games'}>
            <li className="element">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gamepad-2">
                <line x1="6" x2="10" y1="11" y2="11"/>
                <line x1="8" x2="8" y1="9" y2="13"/>
                <line x1="15" x2="15.01" y1="12" y2="12"/>
                <line x1="18" x2="18.01" y1="10" y2="10"/>
                <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
              </svg>
              <p className="label">{t('dock.games')}</p>
            </li>
          </Link>

          <Link to={'/Wallet'}>
            <li className="element">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v1.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 0 5 10.5v3A1.5 1.5 0 0 0 6.5 15h13a1.5 1.5 0 0 1 1.5 1.5V20a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a1 1 0 0 0 1-1z"/>
              </svg>
              <p className="label">Кошелек</p>
            </li>
          </Link>

          <Link to={'/Achievements'}>
            <li className="element">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 1.1.9 2 2 2s2-.9 2-2v-2.34"/>
                <path d="M12 14V6"/>
              </svg>
              <p className="label">Достижения</p>
            </li>
          </Link>

          <Link to={'/Friends'}>
            <li className="element">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 21-2-2"/>
                <path d="M16 16.28A6 6 0 0 0 18 7h-2a4 4 0 0 0-4 4v2"/>
              </svg>
              <p className="label">Друзья</p>
            </li>
          </Link>
        </ul>

        <div className="separator"></div>

        <ul className="list">
          <li className="element delete" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" x2="9" y1="12" y2="12"/>
            </svg>
            <p className="label">{t('dock.logout')}</p>
          </li>
        </ul>

        {/* <div className="separator"></div> */}

        {/* <ul className="list">
          <div className="dropdown-group">
            <label htmlFor="privilege">{t('dock.privilege')}</label>
            <select
              id="privilege"
              value={selectedPrivilege}
              onChange={(e) => setSelectedPrivilege(e.target.value)}
            >
              {privileges.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </ul> */}

        {/* <ul className="list">
          <div className="dropdown-group">
            <label htmlFor="title">{t('dock.title')}</label>
            <select
              id="title"
              value={selectedTitle}
              onChange={(e) => setSelectedTitle(e.target.value)}
            >
              {titles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </ul> */}
      </div>
    </StyledWrapper>
  );
};


const StyledWrapper = styled.div`
  .menu-wrapper {
  display: flex;
  flex-direction: row;
  gap: 24px;
  background-color: #1e1f24;
  padding: 20px;
  border-radius: 12px;
  width: 300px;
  color: #e1e1e1;
  font-family: 'Segoe UI', sans-serif;
}

.dropdown-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
    padding: 0 10px;
}

.dropdown-group label {
  font-size: 14px;
  color: #9da1ad;
  text-transform: uppercase;
}

.dropdown-group select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d0d0d0;
  background-color: #ffffff;
  color: #141414;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.dropdown-group select:hover {
  border-color: #a0a0a0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

/* From Uiverse.io by imtausef */ 
.card {
  width: 300px;
  background-color: rgb(255, 255, 255);
  background-image: linear-gradient(
    139deg,
    rgb(255, 255, 255) 0%,
    rgb(255, 255, 255) 50%,
    rgb(255, 255, 255) 100%
  );

  border-radius: 10px;
  padding: 15px 0px;
  display: flex;
  flex-direction: column;
  gap: 10px;

}

.card .separator {
  border-top: 1.5px solid #42434a;
}

.card .list {
  list-style-type: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0px 10px;
}

.card .list Link {
  text-decoration: none;
}

.card .list .element {
  display: flex;
  align-items: center;
  color: #141414;
  gap: 10px;
  transition: all 0.3s ease-out;
  padding: 4px 7px;
  border-radius: 6px;
  cursor: pointer;
}

.card .list .element svg {
  width: 19px;
  height: 19px;
  transition: all 0.3s ease-out;
}

.card .list .element .label {
  font-weight: 600;
}

.card .list .element:hover {
  background-color: #5353ff;
  color: #fff;
  transform: translate(1px, -1px);
}
.card .list .delete:hover {
  background-color: #8e2a2a;
}

.card .list .element:active {
  transform: scale(0.99);
}

.card .list:not(:last-child) .element:hover svg {
  stroke: #fff;
}

.card .list:last-child svg {
  stroke: #bd89ff;
}
.card .list:last-child .element {
  color: #bd89ff;
}

.card .list:last-child .element:hover {
  background-color: rgba(0, 0, 0, 0.85);
}

`;

export default Dock;
