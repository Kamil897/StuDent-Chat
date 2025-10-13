import React, { useEffect, useRef, useState } from "react";

// Single-file React component that contains HTML, CSS and JS converted from the original
// Exports default React component for preview/use. No external CSS or JS files required.

export default function TeleportingCubeGameApp() {
  // Game state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [speedText, setSpeedText] = useState("1x");
  const [cubeSkin, setCubeSkin] = useState("default");
  const [bombSkin, setBombSkin] = useState("default");
  const [achievementsUnlocked, setAchievementsUnlocked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("achievementsUnlocked") || "[]");
    } catch {
      return [];
    }
  });

  const gameAreaRef = useRef(null);
  const cubeRef = useRef(null);
  const teleportTimerRef = useRef(null);
  const isGameRunningRef = useRef(true);
  const cubeClickedRef = useRef(false);
  const isBombRef = useRef(false);
  const baseSpeedRef = useRef(2000);
  const currentSpeedRef = useRef(baseSpeedRef.current);
  const maxScoreRef = useRef(parseInt(localStorage.getItem("maxScore") || "0", 10));
  const maxScoreValueRef = useRef(null);

  // Achievements definitions
  const achievementsDef = useRef([
    { id: "firstClick", text: "First Click!", check: () => score >= 1 },
    { id: "score10", text: "Score 10 Points!", check: () => score >= 10 },
    { id: "score50", text: "Score 50 Points!", check: () => score >= 50 },
    { id: "level5", text: "Reach Level 5!", check: () => level >= 5 },
    { id: "speed3x", text: "Speed 3x!", check: () => parseFloat(speedText) >= 3 },
  ]);

  // Helper to persist max score & achievements
  const saveMaxScore = (value) => {
    localStorage.setItem("maxScore", String(value));
  };
  const saveAchievements = (arr) => {
    localStorage.setItem("achievementsUnlocked", JSON.stringify(arr));
  };

  // Utilities: position cube inside game area
  const positionCube = () => {
    const gameArea = gameAreaRef.current;
    const cube = cubeRef.current;
    if (!gameArea || !cube) return;
    const cubeSize = 60; // logic from original
    const padding = 20;
    const maxX = Math.max(0, gameArea.offsetWidth - cubeSize - padding);
    const maxY = Math.max(0, gameArea.offsetHeight - cubeSize - padding);
    const x = Math.random() * maxX + padding;
    const y = Math.random() * maxY + padding;
    cube.style.left = x + "px";
    cube.style.top = y + "px";
  };

  // Apply skins and bomb/cube class
  const applyCurrentSkin = () => {
    const cube = cubeRef.current;
    if (!cube) return;
    cube.className = "cube"; // reset
    if (isBombRef.current) {
      cube.classList.add("bomb");
      if (bombSkin !== "default") cube.classList.add(bombSkin);
    } else {
      if (cubeSkin !== "default") cube.classList.add(cubeSkin);
    }
  };

  // Set random mode (bomb or not)
  const setMode = () => {
    isBombRef.current = Math.random() < 0.25;
    applyCurrentSkin();
  };

  // Click effects (ripples)
  const createClickEffect = (clientX, clientY, type = "") => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;
    const rect = gameArea.getBoundingClientRect();
    const effect = document.createElement("div");
    effect.className = `click-effect ${type}`.trim();
    effect.style.left = clientX - rect.left - 15 + "px";
    effect.style.top = clientY - rect.top - 15 + "px";
    gameArea.appendChild(effect);
    setTimeout(() => {
      if (gameArea.contains(effect)) gameArea.removeChild(effect);
    }, 600);
  };

  // Update achievements check
  const checkAchievements = () => {
    let updated = false;
    const unlocked = [...achievementsUnlocked];
    achievementsDef.current.forEach((a) => {
      if (!unlocked.includes(a.id) && a.check()) {
        unlocked.push(a.id);
        updated = true;
      }
    });
    if (updated) {
      setAchievementsUnlocked(unlocked);
      saveAchievements(unlocked);
    }
  };

  // Update score & level & speed logic
  useEffect(() => {
    // score changed
    if (score > maxScoreRef.current) {
      maxScoreRef.current = score;
      saveMaxScore(score);
      if (maxScoreValueRef.current) maxScoreValueRef.current.textContent = String(score);
      // trigger new record animation by toggling class
      const el = maxScoreValueRef.current?.parentElement;
      if (el) {
        el.classList.add("new-record");
        setTimeout(() => el.classList.remove("new-record"), 1500);
      }
    }
    checkAchievements();
  }, [score]);

  useEffect(() => {
    // level changed
    checkAchievements();
  }, [level]);

  useEffect(() => {
    // speed text changed
    checkAchievements();
  }, [speedText]);

  // Update level based on score
  const updateLevelFromScore = (newScore) => {
    const newLevel = Math.floor(newScore / 10) + 1;
    if (newLevel !== level) setLevel(newLevel);
  };

  // Update speed based on score
  const updateSpeedFromScore = (newScore) => {
    const speedReduction = Math.floor(newScore / 5) * 0.05;
    const newSpeed = Math.max(400, baseSpeedRef.current * (1 - speedReduction));
    currentSpeedRef.current = newSpeed;
    const speedMultiplier = (baseSpeedRef.current / currentSpeedRef.current).toFixed(1);
    setSpeedText(speedMultiplier + "x");
  };

  // Teleport timer
  const startTeleportTimer = () => {
    clearTeleportTimer();
    if (!isGameRunningRef.current) return;
    teleportTimerRef.current = setTimeout(() => {
      // if cube was not clicked and not a bomb -> lose 1 score
      if (!cubeClickedRef.current && !isBombRef.current) {
        setScore((prev) => Math.max(0, prev - 1));
      }
      cubeClickedRef.current = false;
      setMode();
      positionCube();
      startTeleportTimer();
    }, currentSpeedRef.current);
  };

  const clearTeleportTimer = () => {
    if (teleportTimerRef.current) {
      clearTimeout(teleportTimerRef.current);
      teleportTimerRef.current = null;
    }
  };

  // Cube click handler
  const onCubeClick = (e) => {
    e.stopPropagation();
    const cube = cubeRef.current;
    if (!cube) return;
    cube.classList.add("clicked");
    setTimeout(() => cube.classList.remove("clicked"), 600);

    if (isBombRef.current) {
      createClickEffect(e.clientX, e.clientY, "error");
      // reset
      setScore(0);
      setLevel(1);
      currentSpeedRef.current = baseSpeedRef.current;
      setSpeedText("1x");
      // check max score not updated here (already in effect)
    } else {
      createClickEffect(e.clientX, e.clientY, "success");
      cubeClickedRef.current = true;
      setScore((prev) => {
        const ns = prev + 1;
        updateLevelFromScore(ns);
        updateSpeedFromScore(ns);
        return ns;
      });
    }

    clearTeleportTimer();
    setTimeout(() => {
      setMode();
      positionCube();
      startTeleportTimer();
    }, 100);
  };

  // Click on game area (create ripple)
  const onGameAreaClick = (e) => {
    // only create ripple if not clicking cube (cube click stops propagation to game area)
    createClickEffect(e.clientX, e.clientY, "");
  };

  // Initialize on mount
  useEffect(() => {
    positionCube();
    setMode();
    startTeleportTimer();

    // cleanup on unmount
    return () => {
      clearTeleportTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update skin changes to reflect instantly
  useEffect(() => {
    applyCurrentSkin();
  }, [cubeSkin, bombSkin]);

  // Provide method to set skins from UI
  const applySkinsClick = () => {
    applyCurrentSkin();
  };

  // Provide achievements list from definitions + unlocked state
  const achievementsList = achievementsDef.current.map((a) => ({ ...a, unlocked: achievementsUnlocked.includes(a.id) }));

  // JSX and embedded CSS
  const css = `
    * { margin:0;padding:0;box-sizing:border-box }
    :root{--bg1:#667eea;--bg2:#764ba2}
    body, #root { font-family: Arial, sans-serif }
    .app-wrap { padding:20px; color: white; min-height:100vh; background: linear-gradient(135deg,var(--bg1) 0%, var(--bg2) 100%); display:flex; flex-direction:column; align-items:center }
    .game-header{ display:flex; justify-content:space-between; width:100%; max-width:900px; margin-bottom:10px; font-size:18px; font-weight:700 }
    .speed-indicator{ font-size:16px; margin-bottom:20px; color:#ffeb3b; font-weight:700 }
    .container { display:flex; align-items:flex-start; justify-content:center; gap:30px; margin-top:20px; width:100%; max-width:1000px }
    .skin-selector{ background: rgba(255,255,255,0.08); padding:20px; border-radius:15px; backdrop-filter: blur(6px); box-shadow: 0 8px 32px rgba(0,0,0,0.25); width:100%; max-width:360px }
    .skin-selector h3 { margin-bottom:12px; color:#ffeb3b; text-align:center }
    .skin-selector label{ display:block; margin-bottom:10px; font-weight:700 }
    .skin-selector select{ background:#fff; color:#333; padding:8px; border-radius:6px; border:none; margin-left:10px }
    .skin-selector button{ background: linear-gradient(45deg,#00d2d3,#54a0ff); border:none; padding:10px 20px; border-radius:25px; color:#fff; font-weight:700; cursor:pointer; display:block; margin:10px auto 0 }

    .game-area { position:relative; width:600px; height:400px; background: rgba(255,255,255,0.08); border:3px solid rgba(255,255,255,0.2); border-radius:15px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.3) }
    .cube{ width:50px; height:50px; background: linear-gradient(45deg,#ff6b6b,#ee5a24); border-radius:10px; position:absolute; cursor:pointer; transition:all .3s ease; box-shadow:0 4px 15px rgba(0,0,0,0.3); border:2px solid rgba(255,255,255,0.2); z-index:10; display:block }
    .cube:hover{ transform:scale(1.1); box-shadow:0 6px 20px rgba(0,0,0,0.4) }
    .cube:active{ transform:scale(0.95); transition:all .1s }
    .cube.clicked{ animation: clickPulse .6s ease-out }
    @keyframes clickPulse{ 0%{transform:scale(1)}30%{transform:scale(1.3)}60%{transform:scale(.9)}100%{transform:scale(1)} }
    .cube.bomb{ width:40px;height:40px;border-radius:50%; background: linear-gradient(45deg,#2c2c54,#40407a) }

    /* skins */
    .cube.blue { background: linear-gradient(45deg,#667eea,#764ba2); box-shadow:0 0 20px rgba(102,126,234,0.6), inset 0 0 20px rgba(255,255,255,0.08); border:2px solid #667eea }
    .cube.gradient { background: linear-gradient(45deg,#ff9a9e,#fecfef,#fecfef,#ff9a9e); background-size:400% 400%; animation: gradientShift 3s ease infinite }
    @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    .cube.emoji{ background: radial-gradient(circle at 30% 30%, #ffeaa7,#fdcb6e,#e17055); position:relative; }
    .cube.emoji::before{ content:'😎'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:24px }

    .cube.bomb.red{ background: radial-gradient(circle at 30% 30%, #e74c3c,#c0392b,#8b0000); box-shadow:0 0 25px rgba(231,76,60,0.8) }
    .cube.bomb.skull{ background: linear-gradient(135deg,#2c2c54 0%,#40407a 50%,#706fd3 100%); position:relative }
    .cube.bomb.skull::before{ content:'💀'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:20px }
    .cube.bomb.fire{ background: linear-gradient(45deg,#ff4757,#ff6348,#ff7675,#fd79a8); position:relative }
    .cube.bomb.fire::before{ content:'🔥'; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:18px }

    .click-effect{ position:absolute; width:30px; height:30px; border-radius:50%; pointer-events:none; z-index:5; animation: rippleEffect .6s ease-out }
    @keyframes rippleEffect{0%{transform:scale(0); background:rgba(255,255,255,0.8);opacity:1}50%{background:rgba(255,255,255,0.4)}100%{transform:scale(4); background:rgba(255,255,255,0); opacity:0}}
    .click-effect.success{ animation: successRipple .6s }
    @keyframes successRipple{0%{transform:scale(0);background:rgba(76,217,100,0.8)}50%{background:rgba(76,217,100,0.4)}100%{transform:scale(4);background:rgba(76,217,100,0);opacity:0}}
    .click-effect.error{ animation: errorRipple .6s }
    @keyframes errorRipple{0%{transform:scale(0);background:rgba(255,71,87,0.8)}50%{background:rgba(255,71,87,0.4)}100%{transform:scale(4);background:rgba(255,71,87,0);opacity:0}}

    .instructions{ text-align:center; font-size:16px; margin:12px 0; background:rgba(255,255,255,0.08); padding:8px 12px; border-radius:10px }

    .achievements{ width:220px; background: rgba(0,0,0,0.3); border-radius:12px; padding:15px }
    .achievements h3{ text-align:center; margin-bottom:10px }
    .achievements ul{ list-style:none; padding:0 }
    .achievements li{ background:rgba(255,255,255,0.06); margin-bottom:8px; padding:6px 10px; border-radius:8px; opacity:0.6 }
    .achievements li.unlocked{ opacity:1; background: rgba(0,255,100,0.12); border-left:4px solid #0f0 }

    .max-score{ position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); color:#fff; padding:6px 12px; border-radius:8px; font-weight:700; pointer-events:none }
    .max-score .label{ display:block; font-size:12px; opacity:0.8 }
    .max-score.new-record{ animation: flash 1.5s ease }
    @keyframes flash{0%,100%{background:rgba(0,0,0,0.6)}50%{background:rgba(0,150,0,0.8)}}

    @media (max-width:650px){ .game-area{ width:90vw; height:300px } .skin-selector, .game-header{ max-width:90vw } .max-score{ position:static; margin:10px auto } }
  `;

  return (
    <div className="app-wrap">
      <style>{css}</style>

      <div className="game-header">
        <div>Score: <span id="score">{score}</span></div>
        <div>Level: <span id="level">{level}</span></div>
      </div>

      <div className="speed-indicator">Speed: <span id="speed">{speedText}</span></div>

      <div className="container">
        <div className="skin-selector">
          <h3>Choose a Skin</h3>
          <label>
            Cube skin:
            <select id="cubeSkin" value={cubeSkin} onChange={(e) => setCubeSkin(e.target.value)}>
              <option value="default">Default</option>
              <option value="blue">Blue</option>
              <option value="gradient">Gradient</option>
              <option value="emoji">Emoji 😎</option>
            </select>
          </label>

          <label>
            Bomb skin:
            <select id="bombSkin" value={bombSkin} onChange={(e) => setBombSkin(e.target.value)}>
              <option value="default">Default</option>
              <option value="red">Red</option>
              <option value="skull">💀 Skull</option>
              <option value="fire">🔥 Fire</option>
            </select>
          </label>

          <button id="applySkins" onClick={applySkinsClick}>Apply Skins</button>
        </div>

        <div className="game-area" id="gameArea" ref={gameAreaRef} onClick={onGameAreaClick}>
          <div className="cube" id="cube" ref={cubeRef} onClick={onCubeClick} />

          <div className="max-score" ref={maxScoreValueRef}>
            <span className="label">BEST SCORE</span>
            <div className="value" id="maxScoreValue">{maxScoreRef.current}</div>
          </div>
        </div>

        <div className="achievements" id="achievements">
          <h3>Achievements</h3>
          <ul id="achievementsList">
            {achievementsList.map((a) => (
              <li key={a.id} id={a.id} className={a.unlocked ? "unlocked" : ""}>{a.text}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="instructions">Click the cube before it teleports! Avoid bombs. Game gets faster as you progress.</div>
    </div>
  );
}
