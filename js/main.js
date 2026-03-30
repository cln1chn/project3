const grid = document.getElementById("grid");
const counter = document.getElementById("pickCounter");
const pokeball = document.getElementById("pokeball");
const popup = document.getElementById("popupOverlay");
const popupText = document.getElementById("popupMessage");
const closeBtn = document.getElementById("closePopupBtn");

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
let index = 0;
let picksLeft = 6;
let dragging = false;

const blocks = [];

function shuffle() {
  shuffled = [...pokemonList].sort(() => Math.random() - 0.5);
  index = 0;
}

function create() {
  for (let i = 0; i < 18; i++) {
    const b = document.createElement("div");
    b.className = "block";

    const img = document.createElement("img");
    img.className = "block-image";
    img.alt = "";

    b.appendChild(img);
    grid.appendChild(b);
    blocks.push(b);

    b.addEventListener("click", () => selectBlock(b));
  }
}

function selectBlock(block) {
  if (picksLeft <= 0) return;
  if (block.classList.contains("locked")) return;

  block.classList.add("locked");

  const img = block.querySelector("img");
  const name = shuffled[index];

  img.src = `img/pokemon/${name}.png`;
  block.dataset.name = name;

  block.classList.add("revealed");

  index++;
  picksLeft--;
  updateCounter();

  if (picksLeft === 0) {
    pokeball.classList.add("ready");
  }
}

function updateCounter() {
  if (picksLeft === 1) {
    counter.textContent = "1 cell left to pick";
  } else {
    counter.textContent = `${picksLeft} cells left to pick`;
  }
}

pokeball.addEventListener("mousedown", () => {
  if (picksLeft > 0) return;
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

  /* restart the snap animation cleanly */
  void block.offsetWidth;
  block.classList.add("snap");

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
  shuffle();
  picksLeft = 6;
  updateCounter();

  blocks.forEach((b) => {
    b.classList.remove("locked", "revealed", "chosen", "snap");
    b.querySelector("img").src = "";
    b.dataset.name = "";
  });

  pokeball.classList.remove("ready", "dragging");
  resetPokeballPosition();
}

create();
shuffle();
updateCounter();