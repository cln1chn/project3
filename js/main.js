const grid = document.getElementById("grid");
const resetBtn = document.getElementById("resetBtn");
const toggleDriftBtn = document.getElementById("toggleDriftBtn");

const pokemonList = [
  "articuno","beedrill","ditto","dragonite","drifloon","duosion",
  "houndoom","jigglypuff","krabby","leafeon","mew","morpeko",
  "sentret","shellder","spheal","tepig","wartortle","woobat"
];

let shuffledPokemon = [];
let pokemonIndex = 0;

const blocks = [];
let driftEnabled = true;
let driftLevel = 0;
let lastDriftTime = 0;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function shuffle() {
  shuffledPokemon = [...pokemonList].sort(() => Math.random() - 0.5);
  pokemonIndex = 0;
}

function createBlocks() {
  for (let i = 0; i < 18; i++) {
    const block = document.createElement("div");
    block.className = "block";
    block.dataset.baseX = 0;
    block.dataset.baseY = 0;

    const img = document.createElement("img");
    img.className = "block-image";

    const label = document.createElement("div");
    label.className = "block-label";
    label.textContent = "cell";

    block.appendChild(img);
    block.appendChild(label);

    grid.appendChild(block);
    blocks.push(block);

    block.addEventListener("mouseenter", () => hover(block));
    block.addEventListener("mouseleave", () => resetHover(block));
    block.addEventListener("click", () => lock(block));
  }
}

function move(block, x, y) {
  block.style.transform = `translate(${x}px, ${y}px)`;
}

function hover(block) {
  if (block.classList.contains("locked")) return;

  const x = random(-10, 10);
  const y = random(-8, 8);
  move(block, x, y);
}

function resetHover(block) {
  if (block.classList.contains("locked")) return;
  move(block, 0, 0);
}

function lock(block) {
  const img = block.querySelector("img");

  if (!block.classList.contains("locked")) {
    block.classList.add("locked");

    if (pokemonIndex < shuffledPokemon.length) {
      img.src = `img/pokemon/${shuffledPokemon[pokemonIndex]}.png`;
      block.classList.add("revealed");
      pokemonIndex++;
    }
  } else {
    block.classList.remove("locked", "revealed");
    img.src = "";
  }
}

function drift() {
  blocks.forEach(block => {
    if (block.classList.contains("locked")) return;

    const x = random(-2, 2) * driftLevel;
    const y = random(-2, 2) * driftLevel;

    move(block, x, y);
  });

  if (driftEnabled) driftLevel += 0.01;
  requestAnimationFrame(drift);
}

function resetAll() {
  shuffle();
  driftLevel = 0;

  blocks.forEach(block => {
    block.classList.remove("locked", "revealed");
    block.style.transform = "translate(0,0)";
    block.querySelector("img").src = "";
  });
}

toggleDriftBtn.onclick = () => {
  driftEnabled = !driftEnabled;
};

resetBtn.onclick = resetAll;

createBlocks();
shuffle();
drift();