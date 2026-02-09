console.log("JS cargó ✅");

const btn = document.getElementById("btn");
const reset = document.getElementById("reset");
const msg = document.getElementById("msg");

const theme = document.getElementById("theme");

const nameInput = document.getElementById("name");
const hello = document.getElementById("hello");
const helloMsg = document.getElementById("helloMsg");

let contador = 0;

btn.addEventListener("click", () => {
  contador++;
  msg.textContent = `Clic número ${contador} 🔥`;
});

reset.addEventListener("click", () => {
  contador = 0;
  msg.textContent = "Reiniciado ✅";
});

theme.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

hello.addEventListener("click", () => {
  const nombre = nameInput.value.trim();
  helloMsg.textContent = nombre ? `Hola, ${nombre} :)` : "Escribe tu nombre primero.";
});
// ===== Mini-juego: Adivina el número =====
let secret = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

const guessInput = document.getElementById("guess");
const guessBtn = document.getElementById("guessBtn");
const newGameBtn = document.getElementById("newGame");
const hint = document.getElementById("hint");
const tries = document.getElementById("tries");

function renderAttempts() {
  tries.textContent = `Intentos: ${attempts}`;
}

function resetGame() {
  secret = Math.floor(Math.random() * 100) + 1;
  attempts = 0;
  hint.textContent = "Nuevo número generado 😈 ¡dale!";
  guessInput.value = "";
  renderAttempts();
  guessInput.focus();
}

function handleGuess() {
  const value = Number(guessInput.value);

  if (!value || value < 1 || value > 100) {
    hint.textContent = "Pon un número válido del 1 al 100 👀";
    return;
  }

  attempts++;
  renderAttempts();

  if (value === secret) {
    hint.textContent = `¡BINGO! 🎉 Era ${secret}. Lo lograste en ${attempts} intento(s).`;
  } else if (value < secret) {
    hint.textContent = "Muy bajo 📉 Sube un poco.";
  } else {
    hint.textContent = "Muy alto 📈 Baja un poco.";
  }

  guessInput.select();
}

guessBtn.addEventListener("click", handleGuess);
guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleGuess();
});
newGameBtn.addEventListener("click", resetGame);

// Arranca con estado inicial
hint.textContent = "Estoy listo, escribe un número y presiona Probar. Perderas";
renderAttempts();
// ===== Juego: Simon Dice =====
const simonStart = document.getElementById("simonStart");
const simonStrictBtn = document.getElementById("simonStrict");
const simonStatus = document.getElementById("simonStatus");
const simonLevel = document.getElementById("simonLevel");
const pads = Array.from(document.querySelectorAll(".pad"));

let simonSeq = [];
let userSeq = [];
let level = 0;
let isPlayingBack = false;
let strictMode = false;

let bestSimon = Number(localStorage.getItem("bestSimon") || 0);

function updateHUD(text = "") {
  simonStatus.textContent = text;
  simonLevel.textContent = `Nivel: ${level} | Récord: ${bestSimon} 🏆`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function flashPad(i, ms = 260) {
  const el = pads[i];
  el.classList.add("flash");
  setTimeout(() => el.classList.remove("flash"), ms);
}

function speedForLevel(lv) {
  // Más nivel = más rápido (mínimo razonable)
  return Math.max(120, 320 - lv * 12);
}

async function playback() {
  isPlayingBack = true;
  updateHUD("Mira la secuencia");
  await sleep(250);

  const stepDelay = speedForLevel(level);

  for (const i of simonSeq) {
    flashPad(i, stepDelay);
    await sleep(stepDelay + 90);
  }

  isPlayingBack = false;
  updateHUD("Tu turno (clic en los colores)");
}

function addStep() {
  simonSeq.push(Math.floor(Math.random() * 4));
}

function startGame() {
  level = 0;
  simonSeq = [];
  userSeq = [];
  nextLevel();
}

async function nextLevel() {
  level++;
  userSeq = [];
  addStep();
  updateHUD("Preparando...");
  await playback();
}

function gameOver(msg) {
  updateHUD(`💥 ${msg} | ${strictMode ? "Strict" : "Normal"}`);
  if (level - 1 > bestSimon) {
    bestSimon = level - 1;
    localStorage.setItem("bestSimon", String(bestSimon));
    updateHUD(`💥 ${msg} | Nuevo récord: ${bestSimon} 🏆`);
  }
}

function handleUserInput(padIndex) {
  if (isPlayingBack || level === 0) return;

  flashPad(padIndex, 180);
  userSeq.push(padIndex);

  const pos = userSeq.length - 1;

  // ¿Falló?
  if (userSeq[pos] !== simonSeq[pos]) {
    if (strictMode) {
      gameOver("Te equivocaste. Todo de nuevo");
      setTimeout(startGame, 900);
    } else {
      updateHUD("Te equivocaste jjaja Repite la misma secuencia.");
      userSeq = [];
      setTimeout(playback, 650);
    }
    return;
  }

  // ¿Completó nivel?
  if (userSeq.length === simonSeq.length) {
    updateHUD("bien, Siguiente nivel...");
    setTimeout(nextLevel, 700);
  } else {
    updateHUD(`Bien. Vas ${userSeq.length}/${simonSeq.length}…`);
  }
}

// Eventos
simonStart.addEventListener("click", startGame);

simonStrictBtn.addEventListener("click", () => {
  strictMode = !strictMode;
  simonStrictBtn.textContent = `Strict: ${strictMode ? "ON" : "OFF"}`;
});

pads.forEach((pad) => {
  pad.addEventListener("click", () => {
    const idx = Number(pad.dataset.pad);
    handleUserInput(idx);
  });
});

// Estado inicial
updateHUD("Pulsa Empezar para jugar.");
