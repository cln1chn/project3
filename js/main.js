const grid = document.getElementById("grid");
const resetBtn = document.getElementById("resetBtn");
const toggleDriftBtn = document.getElementById("toggleDriftBtn");

const blockConfig = [
  "block--large",
  "",
  "",
  "block--tall",
  "",
  "",
  "",
  "block--wide",
  "",
  "",
  "block--muted",
  "",
  "",
  "",
  "block--large",
  "",
  "",
  "block--tall"
];

const blocks = [];
let driftEnabled = true;
let driftLevel = 0;
let lastDriftTime = 0;

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createBlocks() {
  blockConfig.forEach((modifier, index) => {
    const block = document.createElement("button");
    block.type = "button";
    block.className = `block ${modifier}`.trim();
    block.setAttribute("aria-label", `Grid block ${index + 1}`);
    block.dataset.index = index;
    block.dataset.baseX = "0";
    block.dataset.baseY = "0";
    block.dataset.hoverX = "0";
    block.dataset.hoverY = "0";
    block.dataset.locked = "false";

    const status = document.createElement("span");
    status.className = "status";
    status.textContent = "stable";

    const label = document.createElement("span");
    label.className = "block-label";
    label.textContent = `cell ${String(index + 1).padStart(2, "0")}`;

    block.appendChild(status);
    block.appendChild(label);
    grid.appendChild(block);
    blocks.push(block);

    block.addEventListener("pointerenter", () => handleHoverEnter(block));
    block.addEventListener("pointerleave", () => handleHoverLeave(block));
    block.addEventListener("click", () => handleLock(block));
  });
}

function applyTransform(block) {
  const baseX = parseFloat(block.dataset.baseX);
  const baseY = parseFloat(block.dataset.baseY);
  const hoverX = parseFloat(block.dataset.hoverX);
  const hoverY = parseFloat(block.dataset.hoverY);

  const totalX = baseX + hoverX;
  const totalY = baseY + hoverY;
  const rotation = totalX * 0.03;

  block.style.transform = `translate(${totalX}px, ${totalY}px) rotate(${rotation}deg)`;
}

function handleHoverEnter(targetBlock) {
  const targetIndex = Number(targetBlock.dataset.index);

  blocks.forEach((block) => {
    const index = Number(block.dataset.index);
    const distance = Math.abs(index - targetIndex);
    const isLocked = block.dataset.locked === "true";

    if (distance > 3 || isLocked) return;

    const influence = clamp(1 - distance / 4, 0.2, 1);
    block.dataset.hoverX = String(randomInRange(-9, 9) * influence);
    block.dataset.hoverY = String(randomInRange(-7, 7) * influence);
    applyTransform(block);
  });
}

function handleHoverLeave(targetBlock) {
  const targetIndex = Number(targetBlock.dataset.index);

  blocks.forEach((block) => {
    const index = Number(block.dataset.index);
    const distance = Math.abs(index - targetIndex);
    const isLocked = block.dataset.locked === "true";

    if (distance > 3 || isLocked) return;

    block.dataset.hoverX = "0";
    block.dataset.hoverY = "0";
    applyTransform(block);
  });
}

function handleLock(block) {
  const isLocked = block.dataset.locked === "true";
  const status = block.querySelector(".status");

  if (!isLocked) {
    const extraX = randomInRange(-24, 24);
    const extraY = randomInRange(-20, 20);

    block.dataset.baseX = String(parseFloat(block.dataset.baseX) + extraX);
    block.dataset.baseY = String(parseFloat(block.dataset.baseY) + extraY);
    block.dataset.locked = "true";
    block.classList.add("locked");
    status.textContent = "locked";
  } else {
    block.dataset.locked = "false";
    block.classList.remove("locked");
    status.textContent = "drifting";
  }

  applyTransform(block);
}

function updateDrift(timestamp) {
  if (!lastDriftTime) lastDriftTime = timestamp;
  const elapsed = timestamp - lastDriftTime;

  if (driftEnabled && elapsed > 950) {
    driftLevel = clamp(driftLevel + 0.12, 0, 1.8);

    blocks.forEach((block) => {
      const isLocked = block.dataset.locked === "true";
      const multiplier = isLocked ? 1.35 : 0.55;

      const driftX = randomInRange(-1.5, 1.5) * driftLevel * multiplier;
      const driftY = randomInRange(-1.1, 1.1) * driftLevel * multiplier;

      block.dataset.baseX = String(parseFloat(block.dataset.baseX) + driftX);
      block.dataset.baseY = String(parseFloat(block.dataset.baseY) + driftY);

      const status = block.querySelector(".status");
      if (!isLocked) {
        status.textContent = driftLevel > 0.8 ? "drifting" : "stable";
      }

      applyTransform(block);
    });

    lastDriftTime = timestamp;
  }

  window.requestAnimationFrame(updateDrift);
}

function resetOrder() {
  driftLevel = 0;
  lastDriftTime = 0;

  blocks.forEach((block) => {
    block.dataset.baseX = "0";
    block.dataset.baseY = "0";
    block.dataset.hoverX = "0";
    block.dataset.hoverY = "0";
    block.dataset.locked = "false";
    block.classList.remove("locked");

    const status = block.querySelector(".status");
    status.textContent = "stable";

    applyTransform(block);
  });
}

function toggleDrift() {
  driftEnabled = !driftEnabled;
  toggleDriftBtn.textContent = driftEnabled ? "pause drift" : "resume drift";
  toggleDriftBtn.setAttribute("aria-pressed", String(driftEnabled));
}

createBlocks();

resetBtn.addEventListener("click", resetOrder);
toggleDriftBtn.addEventListener("click", toggleDrift);

window.requestAnimationFrame(updateDrift);