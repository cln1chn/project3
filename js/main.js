const grid = document.getElementById("grid");
const counter = document.getElementById("pickCounter");
const pokeball = document.getElementById("pokeball");
const popup = document.getElementById("popupOverlay");
const popupText = document.getElementById("popupMessage");
const closeBtn = document.getElementById("closePopupBtn");
const miniNotice = document.getElementById("miniNotice");

const pokemonList = [
  "articuno",
  "beedrill",
  "ditto",
  "dragonite",
  "drifloon",
  "duosion",
  "houndoom",
  "jigglypuff",
  "krabby",
  "leafeon",
  "mew",
  "morpeko",
  "sentret",
  "shellder",
  "spheal",
  "tepig",
  "wartortle",
  "woobat"
];

let shuffled = [];
let pokemonIndex = 0;
let picksLeft = 6;
let dragging = false;
let miniNoticeTimer = null;
let interactionsFrozen = false;

const blocks = [];

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function shufflePokemon() {
  shuffled = [...pokemonList].sort(() => Math.random() - 0.5);
  pokemonIndex = 0;
}

function updateCounter() {
  if (picksLeft === 1) {
    counter.textContent = "1 cell left to pick";
  } else {
    counter.textContent = `${picksLeft} cells left to pick`;
  }
}

function showMiniNotice(message) {
  if (miniNoticeTimer) {
    clearTimeout(miniNoticeTimer);
  }

  miniNotice.textContent = message;
  miniNotice.classList.remove("hidden", "show");

  void miniNotice.offsetWidth;

  miniNotice.classList.add("show");

  miniNoticeTimer = setTimeout(() => {
    miniNotice.classList.remove("show");
  }, 2400);
}

function createBlocks() {
  for (let i = 0; i < 18; i++) {
    const block = document.createElement("div");
    block.className = "block";

    block.dataset.index = i;
    block.dataset.baseX = "0";
    block.dataset.baseY = "0";
    block.dataset.hoverX = "0";
    block.dataset.hoverY = "0";
    block.dataset.name = "";

    const img = document.createElement("img");
    img.className = "block-image";
    img.alt = "";

    block.appendChild(img);
    grid.appendChild(block);
    blocks.push(block);

    block.addEventListener("pointerenter", () => handleHoverEnter(block));
    block.addEventListener("pointerleave", () => handleHoverLeave(block));
    block.addEventListener("click", () => selectBlock(block));
  }
}

function applyTransform(block) {
  const baseX = parseFloat(block.dataset.baseX);
  const baseY = parseFloat(block.dataset.baseY);
  const hoverX = parseFloat(block.dataset.hoverX);
  const hoverY = parseFloat(block.dataset.hoverY);

  const totalX = baseX + hoverX;
  const totalY = baseY + hoverY;
  const rotation = totalX * 0.03;

  if (block.classList.contains("snap")) return;

  block.style.transform = `translate(${totalX}px, ${totalY}px) rotate(${rotation}deg)`;
}

function handleHoverEnter(targetBlock) {
  if (interactionsFrozen) return;
  if (targetBlock.classList.contains("locked")) return;

  const targetIndex = Number(targetBlock.dataset.index);

  blocks.forEach((block) => {
    if (block.classList.contains("locked")) return;

    const index = Number(block.dataset.index);
    const distance = Math.abs(index - targetIndex);

    if (distance > 3) return;

    const influence = clamp(1 - distance / 4, 0.2, 1);

    block.dataset.hoverX = String(randomInRange(-9, 9) * influence);
    block.dataset.hoverY = String(randomInRange(-7, 7) * influence);

    applyTransform(block);
  });
}

function handleHoverLeave(targetBlock) {
  if (interactionsFrozen) return;

  const targetIndex = Number(targetBlock.dataset.index);

  blocks.forEach((block) => {
    if (block.classList.contains("locked")) return;

    const index = Number(block.dataset.index);
    const distance = Math.abs(index - targetIndex);

    if (distance > 3) return;

    block.dataset.hoverX = "0";
    block.dataset.hoverY = "0";

    applyTransform(block);
  });
}

function selectBlock(block) {
  if (picksLeft <= 0) return;
  if (block.classList.contains("locked")) return;

  block.classList.add("locked");

  block.dataset.hoverX = "0";
  block.dataset.hoverY = "0";
  applyTransform(block);

  const img = block.querySelector("img");
  const name = shuffled[pokemonIndex];

  img.src = `img/pokemon/${name}.png`;
  block.dataset.name = name;

  block.classList.add("revealed");

  pokemonIndex++;
  picksLeft--;
  updateCounter();

  if (picksLeft === 0) {
    interactionsFrozen = true;
    pokeball.classList.add("ready");
    showMiniNotice("✔ selections complete");

    blocks.forEach((b) => {
      b.dataset.hoverX = "0";
      b.dataset.hoverY = "0";
      if (!b.classList.contains("snap")) {
        b.style.transform = "translate(0px, 0px) rotate(0deg)";
      }
    });
  }
}

pokeball.addEventListener("mousedown", () => {
  if (picksLeft > 0) {
    showMiniNotice("pick all 6 first");
    return;
  }

  dragging = true;
  pokeball.classList.add("dragging");
});

document.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  pokeball.style.position = "absolute";
  pokeball.style.left = e.pageX - 35 + "px";
  pokeball.style.top = e.pageY - 35 + "px";
  pokeball.style.zIndex = "999";
});

document.addEventListener("mouseup", (e) => {
  if (!dragging) return;

  dragging = false;
  pokeball.classList.remove("dragging");

  let chosenBlock = null;

  blocks.forEach((block) => {
    const rect = block.getBoundingClientRect();

    if (
      e.clientX > rect.left &&
      e.clientX < rect.right &&
      e.clientY > rect.top &&
      e.clientY < rect.bottom &&
      block.classList.contains("locked")
    ) {
      chosenBlock = block;
    }
  });

  if (chosenBlock) {
    choosePokemon(chosenBlock);
  } else {
    resetPokeballPosition();
  }
});

function choosePokemon(block) {
  const name = block.dataset.name;

  block.classList.add("chosen");
  block.classList.remove("snap");

  void block.offsetWidth;

  block.classList.add("snap");
  block.style.transform = "";

  popupText.textContent = `${name}, i choose you!`;
  popup.classList.remove("hidden");

  resetPokeballPosition();
}

function resetPokeballPosition() {
  pokeball.style.position = "static";
  pokeball.style.left = "";
  pokeball.style.top = "";
  pokeball.style.zIndex = "";
}

closeBtn.onclick = () => {
  popup.classList.add("hidden");
  resetAll();
};

function resetAll() {
  shufflePokemon();
  picksLeft = 6;
  interactionsFrozen = false;
  updateCounter();

  blocks.forEach((block) => {
    block.classList.remove("locked", "revealed", "chosen", "snap");

    const img = block.querySelector("img");
    img.src = "";

    block.dataset.name = "";
    block.dataset.baseX = "0";
    block.dataset.baseY = "0";
    block.dataset.hoverX = "0";
    block.dataset.hoverY = "0";
    block.style.transform = "translate(0px, 0px) rotate(0deg)";
  });

  pokeball.classList.remove("ready", "dragging");
  resetPokeballPosition();
}

createBlocks();
shufflePokemon();
updateCounter();