# Pokemon Scramble – Interactive Web Experience

Concept:
This project is an interactive web experience centered around randomness and user choice. The user selects six hidden cards, each revealing a randomized Pokemon. After selecting six, the user can drag the Pokeball to choose one final Pokemon.
The idea is to create a balance between randomization and control (user choice), while keeping the experience playful and engaging.

---

Interactions:
- Click: Users click shuffled cards to reveal up to 6 random Pokemon  
- Drag: Users drag the Pokeball to select their final Pokemon  
- Hover: Cards subtly move when hovered to create a dynamic and interactive feeling  
- State-based interaction: experience changes after 6 selections (dragging becomes enabled, cannot select more than 6)

---

CSS Animations/Transitions:
- Transform-based movement (translate + rotate)
- Snap animation when picking cards  
- Pokeball shake animation during user drag  
- Glowing effect for final Pokemon selection  
JavaScript is used to control when animations occur and manage interaction states.

---

External Assets:
- Pokemon PNG images (stored locally in project folder)
- Pokeball PNG image
- Google font 'Fredoka' (used for headings and popup text)
