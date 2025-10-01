import React, { useState, useEffect } from "react";
import s from "./DonDon.module.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext";
import { useTranslation } from "react-i18next";
import { saveGameProgress, awardTitle } from "../utils/gamesApi";

const choices = [
  { name: "Rock", image: "/rock.png" },
  { name: "Paper", image: "/paper.png" },
  { name: "Scissors", image: "/scissors.png" },
];

const getResult = (playerChoice, computerChoice) => {
  if (playerChoice === computerChoice) return "tie";
  if (
    (playerChoice === "Rock" && computerChoice === "Scissors") ||
    (playerChoice === "Paper" && computerChoice === "Rock") ||
    (playerChoice === "Scissors" && computerChoice === "Paper")
  ) {
    return "win";
  }
  return "lose";
};

const Don = () => {
  const { t } = useTranslation();
  const [rpsWins, setRpsWins] = useState(0);
  const navigate = useNavigate();
  const { addPoints } = useUser();

  const [gameState, setGameState] = useState({
    playerChoice: null,
    computerChoice: null,
    result: "",
    wins: 0,
    ties: 0,
    losses: 0,
  });

  useEffect(() => {
    localStorage.setItem("rpsWins", gameState.wins.toString());
  }, [gameState.wins]);

  useEffect(() => {
    const savedWins = parseInt(localStorage.getItem("rpsWins"), 10) || 0;
    setRpsWins(savedWins);
  }, []);

  const handlePlayerChoice = (choice) => {
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    const gameResult = getResult(choice.name, randomChoice.name);

    let didWin = false;
    let newWins = 0;

    setGameState((prev) => {
      newWins = gameResult === "win" ? prev.wins + 1 : prev.wins;
      didWin = gameResult === "win";

      return {
        ...prev,
        playerChoice: choice,
        computerChoice: randomChoice,
        result: gameResult,
        wins: newWins,
        ties: gameResult === "tie" ? prev.ties + 1 : prev.ties,
        losses: gameResult === "lose" ? prev.losses + 1 : prev.losses,
      };
    });

    // ✅ Побочные эффекты — снаружи setState
    if (didWin) {
      addPoints(1);
      saveGameProgress("don", {
        score: newWins * 10,
        level: Math.floor(newWins / 5) + 1,
        timeSpent: 0,
        completed: newWins >= 30,
      });
    }
  };

  useEffect(() => {
    if (gameState.wins >= 30) {
      const title = "rps";
      const titles = JSON.parse(localStorage.getItem("titlesUnlocked")) || [];

      if (!titles.includes(title)) {
        const updated = [...titles, title];
        localStorage.setItem("titlesUnlocked", JSON.stringify(updated));
        console.log(`🏆 Титул получен: ${t("titles.rps.title")}`);

        awardTitle(title)
          .then(() => console.log("Титул сохранён на сервере"))
          .catch((err) => console.error("Ошибка при сохранении титула:", err));
      }
    }
  }, [gameState.wins, t]);

  const { playerChoice, computerChoice, result, wins, ties, losses } = gameState;

  return (
    <div className={s.game}>
      <button className={s.backButton} onClick={() => navigate("/Games")}>
        <svg height="16" width="16" viewBox="0 0 1024 1024">
          <path d="..." />
        </svg>
        <span>{t("rps.back")}</span>
      </button>

      <h1>{t("rps.title")}</h1>

      <div className={s.scoreboard}>
        <ScoreboardItem label={t("rps.wins")} value={wins} />
        <ScoreboardItem label={t("rps.ties")} value={ties} />
        <ScoreboardItem label={t("rps.losses")} value={losses} />
      </div>

      {playerChoice && (
        <div className={s.result}>
          <ChoiceDisplay
            title={t("rps.computerChoice")}
            choice={computerChoice}
          />
          <ChoiceDisplay title={t("rps.yourChoice")} choice={playerChoice} />
          <h2 className={s.resultText}>{t(`rps.result.${result}`)}</h2>
          <h2 className={s.resultText}>{t("rps.chooseAgain")}</h2>
        </div>
      )}

      <div className={s.choices}>
        {choices.map((choice) => (
          <button
            key={choice.name}
            onClick={() => handlePlayerChoice(choice)}
            className={s.choiceButton}
            aria-label={`Select ${choice.name}`}
          >
            <img
              src={choice.image}
              alt={choice.name}
              className={s.choiceImage}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

const ScoreboardItem = ({ label, value }) => (
  <p className={s.scoreItem}>
    {label}: <span>{value}</span>
  </p>
);

const ChoiceDisplay = ({ title, choice }) => (
  <div className={s.choiceDisplay}>
    <p>
      {title}: {choice.name}
    </p>
    <img src={choice.image} alt={choice.name} className={s.resultImage} />
  </div>
);

export default Don;
