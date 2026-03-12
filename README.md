# Flappy Heart Game 🩷

A browser-based game built with HTML, CSS, and JavaScript as part of the **CIS045-3** module assignment.

---

## 🎮 How to Play

- Press **SPACE** or **click** the canvas to flap
- Avoid the pipes
- When you hit a pipe, a **heart puzzle** appears — answer correctly to continue the game again!
- Score as many points as possible before time runs out (**60 seconds**)

---

## 📁 Project Structure
```
flappy-heart-v2/
│
├── index.html          # Login & Register page
├── menu.html           # Main menu
├── game.html           # Game page
├── score.html          # Leaderboard page
│
├── src/
│   ├── css/
│   │   ├── auth.css
│   │   ├── menu.css
│   │   ├── game.css
│   │   └── score.css
│   │
│   ├── js/
│   │   ├── auth.js         # Login / Register logic
│   │   ├── menu.js         # Menu logic
│   │   ├── game.js         # Game engine (10 modules)
│   │   ├── score.js        # Leaderboard logic
│   │   └── config/
│   │       └── firebase.config.js   # Firebase setup
│   │
│   └── assets/
│       └── images/         # Game sprites
```

---

## ⚙️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML / CSS / JavaScript | Frontend |
| Firebase Firestore | Database (scores + users) |
| SweetAlert2 | Alert popups |
| Google Fonts | Typography |
| Heart API | Puzzle images |

---

## 🧩 CIS045-3 Themes Covered

1. **Software Design** — 10 IIFE modules in `game.js`, each with a single responsibility
2. **Event-Driven Programming** — `keydown`, `click`, `requestAnimationFrame`, `setInterval`
3. **Interoperability** — `HeartAPI` module fetches puzzle via HTTP GET → JSON
4. **Virtual Identity** — Session cookie (`fh_session`) + Firebase Firestore user storage

---

## 🚀 Running the Project

1. Open the project folder in **VS Code**
2. Use **Live Server** extension to run
3. Open `http://127.0.0.1:5500/index.html`
4. Register an account and start playing

> ⚠️ Firebase config values must be filled in `src/js/config/firebase.config.js`

---

## 🔥 Firebase Collections
```
users/
  └── {username}  →  { name, email, password, createdAt }

scores/
  └── {username}  →  { player, bestScore, updatedAt }
```

---

## 🪪 License
© 2026 All Right Reserved Created By Yehani Harshika
This project is licensed under the [MIT](License.txt) License
 
