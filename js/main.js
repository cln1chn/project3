const grid = document.getElementById("grid");
const counter = document.getElementById("pickCounter");
const pokeball = document.getElementById("pokeball");
const popup = document.getElementById("popupOverlay");
const popupText = document.getElementById("popupMessage");
const popupPokemonImage = document.getElementById("popupPokemonImage");
const closeBtn = document.getElementById("closePopupBtn");
const miniNotice = document.getElementById("miniNotice");

const pokemonList = [
  "articuno",
  "aron",
  "azelf",
  "beedrill",
  "charizard",
  "cherubi",
  "darumaka",
  "ditto",
  "doduo",
  "dragonite",
  "drifloon",
  "duosion",
  "glameow",
  "houndoom",
  "jigglypuff",
  "jynx",
  "krabby",
  "leafeon",
  "mantyke",
  "meowth",
  "mew",
  "morpeko",
  "oshawott",
  "pikachu",
  "poliwhirl",
  "sentret",
  "shellder",
  "spheal",
  "squirtle",
  "staraptor",
  "tepig",
  "wartortle",
  "whiscash",
  "woobat"
];

let shuffled = [];
let pokemonIndex = 0;
let picksLeft = 6;
let dragging = false;
let miniNoticeTimer = null;
let interactionsFrozen = false;

/* these help with mobile auto-scroll */
let lastPointerPageX = 0;
let lastPointerClientY = 0;
let autoScrollFrame = null;

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
    counter.textContent = "1 card left";
  } else {
    counter.textContent = `${picksLeft} cards left`;
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
  img.alt = name;

  block.classList.add("revealed");

  pokemonIndex++;
  picksLeft--;
  updateCounter();

  if (picksLeft === 0) {
    interactionsFrozen = true;
    pokeball.classList.add("ready");
    showMiniNotice("✔ selection complete!");

    blocks.forEach((b) => {
      b.dataset.hoverX = "0";
      b.dataset.hoverY = "0";
      if (!b.classList.contains("snap")) {
        b.style.transform = "translate(0px, 0px) rotate(0deg)";
      }
    });
  }
}

function startDrag(pageX, clientY) {
  if (picksLeft > 0) {
    showMiniNotice("pick all 6 first!");
    return;
  }

  dragging = true;
  pokeball.classList.add("dragging");

  lastPointerPageX = pageX;
  lastPointerClientY = clientY;

  startAutoScroll();
}

function moveDrag(pageX, clientY) {
  if (!dragging) return;

  lastPointerPageX = pageX;
  lastPointerClientY = clientY;

  pokeball.style.position = "absolute";
  pokeball.style.left = `${pageX - 35}px`;
  pokeball.style.top = `${window.scrollY + clientY - 35}px`;
  pokeball.style.zIndex = "999";
}

function endDrag(clientX, clientY) {
  if (!dragging) return;

  dragging = false;
  pokeball.classList.remove("dragging");
  stopAutoScroll();

  let chosenBlock = null;

  blocks.forEach((block) => {
    const rect = block.getBoundingClientRect();

    if (
      clientX > rect.left &&
      clientX < rect.right &&
      clientY > rect.top &&
      clientY < rect.bottom &&
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
}

/* if the pokeball gets near top/bottom of screen, scroll page */
function startAutoScroll() {
  if (autoScrollFrame !== null) return;

  function stepAutoScroll() {
    if (!dragging) {
      autoScrollFrame = null;
      return;
    }

    const edgeSize = 100;
    const maxSpeed = 12;
    const viewportHeight = window.innerHeight;
    let scrollAmount = 0;

    if (lastPointerClientY < edgeSize) {
      const strength = 1 - lastPointerClientY / edgeSize;
      scrollAmount = -maxSpeed * strength;
    } else if (lastPointerClientY > viewportHeight - edgeSize) {
      const strength = (lastPointerClientY - (viewportHeight - edgeSize)) / edgeSize;
      scrollAmount = maxSpeed * strength;
    }

    if (scrollAmount !== 0) {
      window.scrollBy(0, scrollAmount);

      pokeball.style.top = `${window.scrollY + lastPointerClientY - 35}px`;
      pokeball.style.left = `${lastPointerPageX - 35}px`;
    }

    autoScrollFrame = requestAnimationFrame(stepAutoScroll);
  }

  autoScrollFrame = requestAnimationFrame(stepAutoScroll);
}

function stopAutoScroll() {
  if (autoScrollFrame !== null) {
    cancelAnimationFrame(autoScrollFrame);
    autoScrollFrame = null;
  }
}

pokeball.addEventListener("mousedown", (e) => {
  e.preventDefault();
  startDrag(e.pageX, e.clientY);
});

pokeball.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  startDrag(touch.pageX, touch.clientY);
}, { passive: true });

document.addEventListener("mousemove", (e) => {
  moveDrag(e.pageX, e.clientY);
});

document.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  const touch = e.touches[0];
  moveDrag(touch.pageX, touch.clientY);
}, { passive: true });

document.addEventListener("mouseup", (e) => {
  endDrag(e.clientX, e.clientY);
});

document.addEventListener("touchend", (e) => {
  if (!dragging) return;
  const touch = e.changedTouches[0];
  endDrag(touch.clientX, touch.clientY);
});

function choosePokemon(block) {
  const name = block.dataset.name;

  block.classList.add("chosen");
  block.classList.remove("snap");

  void block.offsetWidth;

  block.classList.add("snap");
  block.style.transform = "";

  popupPokemonImage.src = `img/pokemon/${name}.png`;
  popupPokemonImage.alt = name;

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
    img.alt = "";

    block.dataset.name = "";
    block.dataset.baseX = "0";
    block.dataset.baseY = "0";
    block.dataset.hoverX = "0";
    block.dataset.hoverY = "0";
    block.style.transform = "translate(0px, 0px) rotate(0deg)";
  });

  popupPokemonImage.src = "";
  popupPokemonImage.alt = "";

  pokeball.classList.remove("ready", "dragging");
  stopAutoScroll();
  resetPokeballPosition();
}

createBlocks();
shufflePokemon();
updateCounter();