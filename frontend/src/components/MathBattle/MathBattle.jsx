import { useState, useEffect, useRef } from "react";
import s from "./MathBattle.module.scss";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext";
import { useTranslation } from "react-i18next";
import { saveGameProgress } from "../utils/gamesApi";

export default function MathBattle() {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [playerHealth, setPlayerHealth] = useState(100);
  const [botHealth, setBotHealth] = useState(100);
  const [message, setMessage] = useState("");
  const [startTime, setStartTime] = useState(null);
  const navigate = useNavigate();
  const { addPoints } = useUser();
  const pointsAdded = useRef(false);

  useEffect(() => {
    if (difficulty) generateQuestion();
  }, [difficulty]);

  useEffect(() => {
    if (botHealth === 0 && !pointsAdded.current) {
      addPoints(100);
      pointsAdded.current = true;
    }
  }, [botHealth, addPoints]);

  const generateQuestion = () => {
    let num1, num2, operations;

    if (difficulty === "5") {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operations = ["+", "-", "*"];
    } else if (difficulty === "8") {
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operations = ["+", "-", "*", "/"];
    } else if (difficulty === "11") {
      num1 = Math.floor(Math.random() * 100) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      operations = ["+", "-", "*", "/", "^"];
    }

    const operation = operations[Math.floor(Math.random() * operations.length)];
    let formattedQuestion;

    if (operation === "/") {
      formattedQuestion = `${num1 * num2} / ${num1}`;
    } else if (operation === "^") {
      formattedQuestion = `${num1} ** 2`;
    } else {
      formattedQuestion = `${num1} ${operation} ${num2}`;
    }

    setQuestion(formattedQuestion);
    setStartTime(Date.now());
  };

  const handleSubmit = () => {
    if (playerHealth === 0 || botHealth === 0) return;

    let correctAnswer;
    if (question.includes("**")) {
      correctAnswer = Math.pow(parseInt(question.split(" ")[0]), 2);
    } else {
      correctAnswer = eval(question);
    }

    const timeTaken = (Date.now() - startTime) / 1000;
    let damage = 10;

    if (parseInt(answer) === correctAnswer) {
      if (timeTaken < 3) damage = 20;
      setBotHealth((prev) => Math.max(0, prev - damage));
      setMessage(t("math_battle.hit", { damage }));
    } else {
      setPlayerHealth((prev) => Math.max(0, prev - 25));
      setMessage(t("math_battle.miss", { damage: 25 }));
    }

    setAnswer("");
    generateQuestion();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className={s.container}>
      {!difficulty ? (
        <div className={s.difficultySelection}>
          <button className={s.backButton} onClick={() => navigate("/Games")}>
            <svg height="16" width="16" viewBox="0 0 1024 1024">
              <path d="M874.69 495.52c0 11.3-9.17 20.47-20.47 20.47H249.45l188.08 188.08c7.99 7.99 7.99 20.95 0 28.94-4 3.99-9.24 6-14.47 6s-10.48-2-14.48-6L185.53 509.95c-3.84-3.84-6-9.05-6-14.47s2.16-10.63 6-14.47L408.55 258.01c7.99-7.99 20.96-7.99 28.95 0 7.99 8 7.99 20.96 0 28.95L249.43 475.03H854.22c11.3 0 20.47 9.17 20.47 20.49z"></path>
            </svg>
            <span>{t("math_battle.back")}</span>
          </button>

          <h2>{t("math_battle.choose_difficulty")}</h2>
          {["5", "8", "11"].map((level) => (
            <button
              key={level}
              className={s.cssbuttons_io_button}
              onClick={() => setDifficulty(level)}
            >
              {t(`math_battle.grade_${level}`)}
              <div className={s.cssicon}>
                <svg height="24" width="24" viewBox="0 0 24 24">
                  <path d="M0 0h24v24H0z" fill="none"></path>
                  <path
                    d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          {(playerHealth === 0 || botHealth === 0) && (
            <div className={s.gameOverScreen}>
              <h2 className={s.gameOver}>
                {playerHealth === 0
                  ? t("math_battle.you_lost")
                  : t("math_battle.you_won")}
              </h2>
              {botHealth === 0 && (
                <button
                  className={s.backButton}
                  onClick={() => {
                    // Сохраняем прогресс в backend при победе
                    saveGameProgress('mathbattle', {
                      score: 500,
                      level: parseInt(difficulty),
                      timeSpent: 0,
                      completed: true
                    });
                    navigate("/Games");
                  }}
                >
                  <span>{t("math_battle.back")}</span>
                </button>
              )}
              {playerHealth === 0 && (
                <button
                  className={s.backButton}
                  onClick={() => navigate("/Games")}
                >
                  <span>{t("math_battle.back")}</span>
                </button>
              )}
            </div>
          )}

          <div className={s.card}>
            <h1>{t("math_battle.title")}</h1>
            <p>{t("math_battle.subtitle")}</p>
            <p className={s.health}>
              {t("math_battle.your_health", {
                player: playerHealth,
                bot: botHealth,
              })}
            </p>
            <h2 className={s.question}>{question} = ?</h2>
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              className={s.input}
              disabled={playerHealth === 0 || botHealth === 0}
            />
            <button
              onClick={handleSubmit}
              className={s.button}
              disabled={playerHealth === 0 || botHealth === 0}
            >
              {t("math_battle.attack")}
            </button>
            <p className={s.message}>{message}</p>
          </div>
        </>
      )}
    </div>
  );
}
