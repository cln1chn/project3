const grid = document.getElementById("grid");
const counter = document.getElementById("pickCounter");
const pokeball = document.getElementById("pokeball");
const popup = document.getElementById("popupOverlay");
const popupText = document.getElementById("popupMessage");
const closeBtn = document.getElementById("closePopupBtn");
const miniNotice = document.getElementById("miniNotice");

const pokemonList = [
  "articuno","beedrill","ditto","dragonite","drifloon","duosion",
  "houndoom","jigglypuff","krabby","leafeon","mew","morpeko",
  "sentret","shellder","spheal","tepig","wartortle","woobat"
];

let shuffled = [];
let index = 0;
let picksLeft = 6;
let dragging = false;
let miniNoticeTimer = null;

const blocks = [];

/* shuffle pokemon */
function shuffle() {
  shuffled = [...pokemonList].sort(() => Math.random() - 0.5);
  index = 0;
}

/* create grid */
function create() {
  for (let i = 0; i < 18; i++) {
    const b = document.createElement("div");
    b.className = "block";

    const img = document.createElement("img");
    img.className = "block-image";

    b.appendChild(img);
    grid.appendChild(b);
    blocks.push(b);

    b.addEventListener("click", () => selectBlock(b));
  }
}

/* update counter text */
function updateCounter() {
  if (picksLeft === 1) {
    counter.textContent = "1 cell left to pick";
  } else {
    counter.textContent = `${picksLeft} cells left to pick`;
  }
}

/* mini popup message */
function showMiniNotice(message) {
  if (miniNoticeTimer) clearTimeout(miniNoticeTimer);

  miniNotice.textContent = message;
  miniNotice.classList.remove("hidden", "show");

  void miniNotice.offsetWidth;
  miniNotice.classList.add("show");

  miniNoticeTimer = setTimeout(() => {
    miniNotice.classList.remove("show");
  }, 2400);
}

/* select block */
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

  /* show checkmark when done */
  if (picksLeft === 0) {
    pokeball.classList.add("ready");
    showMiniNotice("✔ selections complete");
  }
}

/* start dragging */
pokeball.addEventListener("mousedown", () => {
  if (picksLeft > 0) {
    showMiniNotice("pick all 6 first");
    return;
  }

  dragging = true;
  pokeball.classList.add("dragging");
});

/* move pokeball */
document.addEventListener("mousemove", (e) => {
  if (!dragging) return;

  pokeball.style.position = "absolute";
  pokeball.style.left = e.pageX - 35 + "px";
  pokeball.style.top = e.pageY - 35 + "px";
  pokeball.style.zIndex = "999";
});

/* drop pokeball */
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
    resetPokeball();
  }
});

/* choose final pokemon */
function choosePokemon(block) {
  const name = block.dataset.name;

  block.classList.add("chosen");

  /* restart snap animation */
  block.classList.remove("snap");
  void block.offsetWidth;
  block.classList.add("snap");

  popupText.textContent = `${name}, i choose you!`;
  popup.classList.remove("hidden");

  resetPokeball();
}

/* reset pokeball position */
function resetPokeball() {
  pokeball.style.position = "static";
  pokeball.style.left = "";
  pokeball.style.top = "";
  pokeball.style.zIndex = "";
}

/* close popup + reset everything */
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
  resetPokeball();
}

/* init */
create();
shuffle();
updateCounter();