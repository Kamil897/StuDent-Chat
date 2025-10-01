import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getWritingTask,
  getReadingTask,
  scoreWriting,
  scoreReading,
  aiCheckWriting,
  resultsList,
  resultsSave,
} from "../../api/ielts";
import s from "./AISimulation.module.scss";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function AISimulation() {
  const [mode, setMode] = useState("writing"); // writing | reading
  const [loading, setLoading] = useState(false);

  // Difficulty
  const [writingDifficulty, setWritingDifficulty] = useState("easy"); // easy|medium|hard
  const [readingDifficulty, setReadingDifficulty] = useState("easy");

  // Writing
  const [writingTask, setWritingTask] = useState(null); // { type, prompt }
  const [essay, setEssay] = useState("");
  const [writingScore, setWritingScore] = useState(null); // from scoreWriting
  const [writingAIResult, setWritingAIResult] = useState(null); // from aiCheckWriting
  const [writingTimerSec, setWritingTimerSec] = useState(40 * 60);

  // Reading
  const [readingTask, setReadingTask] = useState(null); // { passage, questions[40], correct[40] }
  const [readingAnswers, setReadingAnswers] = useState(Array(40).fill(""));
  const [readingScoreResult, setReadingScoreResult] = useState(null);
  const [readingTimerSec, setReadingTimerSec] = useState(60 * 60);

  // Results tab
  const [myResultsOpen, setMyResultsOpen] = useState(false);
  const [myResults, setMyResults] = useState([]);

  // Internal timers
  const writingIntervalRef = useRef(null);
  const readingIntervalRef = useRef(null);

  // Helpers
  function formatTime(sec) {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s2 = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s2}`;
  }

  function stopWritingTimer() {
    if (writingIntervalRef.current) {
      clearInterval(writingIntervalRef.current);
      writingIntervalRef.current = null;
    }
  }

  function stopReadingTimer() {
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current);
      readingIntervalRef.current = null;
    }
  }

  // Load tasks on difficulty change or mode change
  useEffect(() => {
    if (mode === "writing") {
      loadWritingTask(writingDifficulty);
    }
  }, [mode, writingDifficulty]);

  useEffect(() => {
    if (mode === "reading") {
      loadReadingTask(readingDifficulty);
    }
  }, [mode, readingDifficulty]);

  // Manage writing timer
  useEffect(() => {
    if (mode !== "writing") {
      if (writingIntervalRef.current) clearInterval(writingIntervalRef.current);
      return;
    }
    if (writingIntervalRef.current) clearInterval(writingIntervalRef.current);
    writingIntervalRef.current = setInterval(() => {
      setWritingTimerSec((t) => {
        if (t <= 1) {
          clearInterval(writingIntervalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (writingIntervalRef.current) clearInterval(writingIntervalRef.current);
    };
  }, [mode, writingTask]);

  // Manage reading timer
  useEffect(() => {
    if (mode !== "reading") {
      if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
      return;
    }
    if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
    readingIntervalRef.current = setInterval(() => {
      setReadingTimerSec((t) => {
        if (t <= 1) {
          clearInterval(readingIntervalRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
    };
  }, [mode, readingTask]);


  async function loadWritingTask(diff) {
    try {
      setLoading(true);
      const data = await getWritingTask(diff);
      setWritingTask(data || null);
      setEssay("");
      setWritingScore(null);
      setWritingAIResult(null);
      setWritingTimerSec(40 * 60);
    } catch (e) {
      console.error("Writing task load error", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadReadingTask(diff) {
    try {
      setLoading(true);
      const data = await getReadingTask(diff);
      setReadingTask(data || null);
      setReadingAnswers(Array(40).fill(""));
      setReadingScoreResult(null);
      setReadingTimerSec(60 * 60);
    } catch (e) {
      console.error("Reading task load error", e);
    } finally {
      setLoading(false);
    }
  }

  // Writing actions
  async function onScoreWriting() {
    if (!essay.trim()) return;
    try {
      setLoading(true);
      const res = await scoreWriting(essay);
      setWritingScore(res);
      stopWritingTimer();
    } catch (e) {
      console.error("scoreWriting error", e);
    } finally {
      setLoading(false);
    }
  }

  async function onAICheckWriting() {
    if (!essay.trim()) return;
    try {
      setLoading(true);
      const res = await aiCheckWriting(essay);
      setWritingAIResult(res);
      // do not auto-stop on AI check; only regular check stops timer
    } catch (e) {
      console.error("aiCheckWriting error", e);
    } finally {
      setLoading(false);
    }
  }

  async function onSaveWriting() {
    try {
      setLoading(true);
      const band =
        writingAIResult && !writingAIResult.error
          ? writingAIResult.band
          : writingScore?.overall || undefined;
      const payload = {
        difficulty: writingDifficulty,
        task: writingTask,
        essay,
        writingScore,
        writingAIResult,
      };
      await resultsSave({ type: "writing", payload, band });
      if (myResultsOpen) {
        try {
          const data = await resultsList();
          setMyResults(Array.isArray(data) ? data : []);
        } catch {}
      }
      alert("Сохранено");
    } catch (e) {
      console.error("save writing error", e);
      alert("Не удалось сохранить");
    } finally {
      setLoading(false);
    }
  }

  // Reading actions
  async function onScoreReading() {
    try {
      setLoading(true);
      const res = await scoreReading(readingAnswers, readingTask?.correct);
      setReadingScoreResult(res);
      stopReadingTimer();
    } catch (e) {
      console.error("scoreReading error", e);
    } finally {
      setLoading(false);
    }
  }

  async function onSaveReading() {
    try {
      setLoading(true);
      const band = readingScoreResult?.band || undefined;
      const payload = {
        difficulty: readingDifficulty,
        task: { passage: readingTask?.passage, questions: readingTask?.questions },
        answers: readingAnswers,
        result: readingScoreResult,
      };
      await resultsSave({ type: "reading", payload, band });
      if (myResultsOpen) {
        try {
          const data = await resultsList();
          setMyResults(Array.isArray(data) ? data : []);
        } catch {}
      }
      alert("Сохранено");
    } catch (e) {
      console.error("save reading error", e);
      alert("Не удалось сохранить");
    } finally {
      setLoading(false);
    }
  }

  // Results
  async function onToggleMyResults() {
    const next = !myResultsOpen;
    setMyResultsOpen(next);
    if (next) {
      try {
        setLoading(true);
        const data = await resultsList();
        setMyResults(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("resultsList error", e);
      } finally {
        setLoading(false);
      }
    }
  }

  const writingSeries = useMemo(() => {
    return (myResults || [])
      .filter((r) => r.type === "writing" && typeof r.band !== "undefined")
      .map((r) => ({
        date: new Date(r.createdAt).toLocaleDateString(),
        band: Number(r.band),
      }))
      .reverse();
  }, [myResults]);


  const readingSeries = useMemo(() => {
    return (myResults || [])
      .filter((r) => r.type === "reading" && typeof r.band !== "undefined")
      .map((r) => ({
        date: new Date(r.createdAt).toLocaleDateString(),
        band: Number(r.band),
      }))
      .reverse();
  }, [myResults]);

  return (
    <div className={s.container}>
      <h1 className={s.title}>IELTS Simulation</h1>

      <div className={s.switcher}>
        <button
          onClick={() => setMode("writing")}
          className={`${s.button} ${mode === "writing" ? s.buttonActive : s.buttonInactive}`}
        >
          Writing
        </button>
        <button
          onClick={() => setMode("reading")}
          className={`${s.button} ${mode === "reading" ? s.buttonActive : s.buttonInactive}`}
        >
          Reading
        </button>
        <button
          onClick={onToggleMyResults}
          className={`${s.button} ${myResultsOpen ? s.buttonActive : s.buttonInactive}`}
          style={{ marginLeft: 12 }}
        >
          Мои результаты
        </button>
      </div>

      {/* Difficulty */}
      <div className={s.card} style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className={s.title} style={{ fontSize: 16, margin: 0 }}>Сложность:</div>
          {["easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              className={`${s.button} ${
                (mode === "writing" ? writingDifficulty : readingDifficulty) === d
                  ? s.buttonActive
                  : s.buttonInactive
              }`}
              onClick={() =>
                mode === "writing" ? setWritingDifficulty(d) : setReadingDifficulty(d)
              }
            >
              {d}
            </button>
          ))}
          <div style={{ marginLeft: "auto", fontWeight: 600 }}>
            {mode === "writing" ? (
              <span>⏱️ 40:00 → {formatTime(writingTimerSec)}</span>
            ) : (
              <span>⏱️ 60:00 → {formatTime(readingTimerSec)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Writing */}
      {mode === "writing" && (
        <div className={s.card} style={{ marginTop: 12 }}>
          <h2 className={s.title} style={{ marginBottom: 8 }}>Задание Writing</h2>
          <div className={s.card} style={{ background: "#fafafa" }}>
            <div className={s.tableCell} style={{ whiteSpace: "pre-wrap" }}>
              {writingTask ? (
                <>
                  <div><b>Type:</b> {writingTask.type?.toUpperCase?.()}</div>
                  <div style={{ marginTop: 6 }}>{writingTask.prompt}</div>
                </>
              ) : (
                <div>Загрузка задания...</div>
              )}
            </div>
          </div>

          <textarea
            className={s.textarea}
            rows={10}
            placeholder="Write your essay here..."
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
          />

          <div className={s.actionsRow} style={{ display: "flex", gap: 8 }}>
            <button onClick={onScoreWriting} className={`${s.button} ${s.buttonActive}`}>
              {loading ? "Checking..." : "Проверить"}
            </button>
            <button onClick={onAICheckWriting} className={`${s.button} ${s.buttonInactive}`}>
              {loading ? "Checking..." : "Check with AI"}
            </button>
            <button onClick={onSaveWriting} className={`${s.button} ${s.buttonInactive}`}>
              {loading ? "Saving..." : "Сохранить"}
            </button>
          </div>


          {(writingScore || writingAIResult) && (
            <div className={s.resultCard}>
              {writingScore && (
                <>
                  <h3 className={s.title}>Writing Score</h3>
                  <div className={`${s.tableCell} ${s.scoreHigh}`}>
                    Overall: {writingScore.overall}
                  </div>
                </>
              )}
              {writingAIResult && !writingAIResult.error && (
                <>
                  <h3 className={s.title}>AI Writing Assessment</h3>
                  <div className={s.title} style={{ fontSize: "20px", marginBottom: 8 }}>
                    Band: <span className={s.scoreHigh}>{writingAIResult.band}</span>
                  </div>
                  <ul className={s.table} style={{ listStyle: "disc", paddingLeft: 20 }}>
                    <li className={s.tableCell}><b>Task Achievement:</b> {writingAIResult.feedback?.taskAchievement}</li>
                    <li className={s.tableCell}><b>Coherence:</b> {writingAIResult.feedback?.coherence}</li>
                    <li className={s.tableCell}><b>Lexical Resource:</b> {writingAIResult.feedback?.lexicalResource}</li>
                    <li className={s.tableCell}><b>Grammar:</b> {writingAIResult.feedback?.grammar}</li>
                  </ul>
                </>
              )}
              {writingAIResult?.error && <div className={s.scoreLow}>AI ошибка</div>}
            </div>
          )}
        </div>
      )}

      {/* Reading */}
      {mode === "reading" && (
        <div className={s.card} style={{ marginTop: 12 }}>
          <h2 className={s.title} style={{ marginBottom: 8 }}>Задание Reading</h2>
          <div className={s.card} style={{ background: "#fafafa" }}>
            <div className={s.tableCell} style={{ whiteSpace: "pre-wrap" }}>
              {readingTask?.passage || ""}
            </div>
          </div>

          <div className={s.inputGrid}>
            {Array.from({ length: 40 }).map((_, i) => (
              <input
                key={i}
                className={s.input}
                placeholder={String(i + 1)}
                value={readingAnswers[i] || ""}
                onChange={(e) => {
                  const copy = [...readingAnswers];
                  copy[i] = e.target.value;
                  setReadingAnswers(copy);
                }}
              />
            ))}
          </div>

          <div className={s.actionsRow} style={{ display: "flex", gap: 8 }}>
            <button onClick={onScoreReading} className={`${s.button} ${s.buttonActive}`}>
              {loading ? "Checking..." : "Проверить"}
            </button>
            <button onClick={onSaveReading} className={`${s.button} ${s.buttonInactive}`}>
              {loading ? "Saving..." : "Сохранить"}
            </button>
          </div>

          {readingScoreResult && (
            <div className={s.resultCard}>
              <h3 className={s.title}>Reading Result</h3>
              <p>
                Correct: <span className={s.scoreHigh}>{readingScoreResult.correct}</span> /{" "}
                {readingScoreResult.total}
              </p>
              <p>
                Band: <span className={s.scoreHigh}>{readingScoreResult.band}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {myResultsOpen && (
        <div className={s.card} style={{ marginTop: 12 }}>
          <h2 className={s.title}>Мои результаты</h2>

          {(!myResults || myResults.length === 0) && (
            <div className={s.tableCell}>Пока пусто</div>
          )}


{myResults && myResults.length > 0 && (
            <>
              <table className={s.table} style={{ marginBottom: 16 }}>
                <thead>
                  <tr className={s.tableRow}>
                    <th className={s.tableCell}>Тип</th>
                    <th className={s.tableCell}>Band</th>
                    <th className={s.tableCell}>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {myResults.map((r) => (
                    <tr key={r.id} className={s.tableRow}>
                      <td className={s.tableCell}>{r.type}</td>
                      <td className={s.tableCell}>{r.band ?? "-"}</td>
                      <td className={s.tableCell}>
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={s.card} style={{ height: 300 }}>
                <h3 className={s.title}>Прогресс — Writing</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={writingSeries}>
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 9]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="band" stroke="#2563eb" name="Band" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={s.card} style={{ height: 300, marginTop: 12 }}>
                <h3 className={s.title}>Прогресс — Reading</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={readingSeries}>
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 9]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="band" stroke="#16a34a" name="Band" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
