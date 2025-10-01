import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from '../../Context/UserContext'; 
import s from "./KnowledgeMaze.module.scss";
import { saveGameProgress } from '../utils/gamesApi';

export default function KnowledgeMaze() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addPoints } = useUser();

  const questionsAll = t("knowledge_maze.questions", { returnObjects: true });
  const categoryNames = t("knowledge_maze.categories", { returnObjects: true });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [level, setLevel] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(2);
  const [gameFinished, setGameFinished] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      const shuffled = [...questionsAll[selectedCategory]].sort(() => 0.5 - Math.random()).slice(0, 8);
      setQuestions(shuffled);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (level >= questions.length && questions.length > 0 && !gameFinished) {
      setGameFinished(true);
      addPoints(score);
      // Сохраняем прогресс в backend
      saveGameProgress('knowledgemaze', {
        score: score * 10,
        level: Math.floor(score / 2) + 1,
        timeSpent: 0,
        completed: score >= questions.length * 0.7
      });
    }
  }, [level, questions.length, score, addPoints, gameFinished]);

  const handleAnswer = (option) => {
    setSelected(option);
    if (option === questions[level].answer) {
      setTimeout(() => {
        setScore(score + 1);
        setLevel(level + 1);
        setSelected(null);
        setAttempts(2);
      }, 1000);
    } else {
      if (attempts > 1) {
        setTimeout(() => {
          setSelected(null);
          setAttempts(attempts - 1);
        }, 1000);
      } else {
        setTimeout(() => {
          setLevel(level + 1);
          setSelected(null);
          setAttempts(2);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setSelectedCategory(null);
    setQuestions([]);
    setLevel(0);
    setSelected(null);
    setScore(0);
    setAttempts(2);
    setGameFinished(false);
  };

  return (
    <div className={s.container}>
      {!selectedCategory ? (
        <div className={s.goodMenu}>
          <button className={s.backButton} onClick={() => navigate("/Games")} style={{ margin: "50px" }}>
            ← {t("knowledge_maze.back")}
          </button>

          <h2 className={s.categoryChoose}>{t("knowledge_maze.choose_category")}</h2>
          <div className={s.categoryList}>
            {Object.keys(categoryNames).map((category) => (
              <button className={s.cssbuttons_io_button} key={category} onClick={() => setSelectedCategory(category)}>
                {categoryNames[category]}
              </button>
            ))}
          </div>
        </div>
      ) : level < questions.length ? (
        <>
          <button className={s.backButton} onClick={() => navigate("/Games")} style={{ marginBottom: "50px" }}>
            ← {t("knowledge_maze.back")}
          </button>

          <div className={s.card}>
            <motion.h2 className={s.question} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {questions[level].q}
            </motion.h2>
            <p className={s.attempts}>{t("knowledge_maze.attempts", { count: attempts })}</p>
            <div className={s.optionsContainer}>
              {questions[level].options.map((option, index) => (
                <button
                  key={index}
                  className={`${s.option} ${
                    selected === option ? (option === questions[level].answer ? s.correct : s.wrong) : ""
                  }`}
                  onClick={() => handleAnswer(option)}
                  disabled={selected !== null}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={s.card} style={{ height: "300px" }}>
          <h2 className={s.gameOver}>{t("knowledge_maze.game_over")}</h2>
          <p className={s.score}>{t("knowledge_maze.score", { score, total: questions.length })}</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button className={s.backButton} onClick={resetGame}>
              {t("knowledge_maze.play_again")}
            </button>
            <button className={s.backButton} onClick={() => navigate("/Games")}>
              ← {t("knowledge_maze.back")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
