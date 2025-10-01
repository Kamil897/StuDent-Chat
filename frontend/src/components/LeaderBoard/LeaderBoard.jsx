import React, { useState, useEffect } from "react";
import styles from "./Leaderboard.module.scss";
import { getLeaderboard, getUserStats } from "../utils/gamesApi";

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState("games"); // games | shop
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState("snake");
  const itemsPerPage = 10;

  const games = [
    { name: "snake", label: "Snake" },
    { name: "asteroids", label: "Asteroids" },
    { name: "pingpong", label: "Ping Pong" },
    { name: "tictactoe", label: "Tic Tac Toe" },
    { name: "mathbattle", label: "Math Battle" },
    { name: "tir", label: "Tir" },
    { name: "knowledgemaze", label: "Knowledge Maze" },
    { name: "don", label: "Don" },
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedGame]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(selectedGame, 50);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(leaderboardData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPlayers = leaderboardData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className={styles.leaderboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Лидерборд</h1>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "games" ? styles.isActive : ""}`}
            onClick={() => setActiveTab("games")}
          >
            Очки по играм
          </button>
          <button
            className={`${styles.tab} ${activeTab === "shop" ? styles.isActive : ""}`}
            onClick={() => setActiveTab("shop")}
          >
            Баллы в магазине
          </button>
        </div>
        {activeTab === "games" && (
          <div className={styles.gameSelector}>
            <select 
              value={selectedGame} 
              onChange={(e) => setSelectedGame(e.target.value)}
              className={styles.gameSelect}
            >
              {games.map(game => (
                <option key={game.name} value={game.name}>
                  {game.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      <div className={styles.panels}>
        {activeTab === "games" && (
          <div className={styles.panel}>
            {loading ? (
              <div className={styles.loading}>Загрузка...</div>
            ) : (
              <div className={styles.table}>
                <div className={`${styles.row} ${styles.head}`}>
                  <div className={styles.cell}>#</div>
                  <div className={styles.cell}>Игрок</div>
                  <div className={styles.cell}>Очки</div>
                  <div className={styles.cell}>Место</div>
                </div>
                {currentPlayers.length === 0 ? (
                  <div className={styles.emptyState}>
                    Нет данных для отображения
                  </div>
                ) : (
                  currentPlayers.map((p, i) => (
                    <div className={styles.row} key={p.id}>
                      <div className={styles.cell}>{startIndex + i + 1}</div>
                      <div className={`${styles.cell} ${styles.playerCell}`}>
                        <div className={styles.player}>
                          <div className={styles.avatar}>
                            {p.user?.avatar && (
                              <img src={p.user.avatar} alt="Avatar" />
                            )}
                          </div>
                          <div className={styles.playerInfo}>
                            <span className={styles.playerName}>
                              {p.user?.name || p.user?.email || 'Unknown'}
                            </span>
                            <span className={styles.playerTag}>
                              @{p.user?.id || 'user'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`${styles.cell} ${styles.points}`}>{p.score}</div>
                      <div className={styles.cell}>{p.rank || '—'}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "shop" && (
          <div className={styles.panel}>
            <div className={styles.table}>
              <div className={`${styles.row} ${styles.head}`}>
                <div className={styles.cell}>#</div>
                <div className={styles.cell}>Игрок</div>
                <div className={styles.cell}>Бонусы</div>
                <div className={styles.cell}>Потрачено</div>
                <div className={styles.cell}>Баланс</div>
              </div>
              {currentPlayers.map((p, i) => (
                <div className={styles.row} key={p.id}>
                  <div className={styles.cell}>{startIndex + i + 1}</div>
                  <div className={`${styles.cell} ${styles.playerCell}`}>
                    <div className={styles.player}>
                      <div className={styles.avatar} />
                      <div className={styles.playerInfo}>
                        <span className={styles.playerName}>{p.name}</span>
                        <span className={styles.playerTag}>{p.tag}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cell}>{p.bonuses}</div>
                  <div className={styles.cell}>{p.spent}</div>
                  <div className={`${styles.cell} ${styles.points}`}>
                    {p.bonuses - p.spent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`${styles.pageBtn} ${
                currentPage === i + 1 ? styles.isActive : ""
              }`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      </footer>
    </section>
  );
}
