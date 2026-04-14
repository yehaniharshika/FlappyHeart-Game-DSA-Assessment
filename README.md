# Flappy Heart Game 🩷

A browser-based game built with HTML, CSS, and JavaScript as part of the **CIS045-3** module assignment.

---

## 🎮 How to Play

- Press **SPACE** or **up arrow button** the canvas to flap
- Navigate the heart through the gaps in the pipes to collect points.
- When you hit a pipe, a **heart puzzle** appears — answer correctly to continue the game again!
- The game lasts for **60 seconds**, making it a fast-paced competition to reach the highest score.

---

## 📁 Project Structure
```
flappy-heart-game/
│
├── index.html          # Login & Register page
├── menu.html           # Main menu
├── game.html           # Game page
├── score.html          # Leaderboard page
├── welcome.html        # Welcome page
│
├── src/
│   ├── style/
│   │   ├── auth.css    # Login/Register page styles
│   │   ├── menu.css    # Menu page styles
│   │   ├── game.css    # Game page styles
│   │   |── score.css   # Leaderboard page styles
|   |   └── welcome.css # Welcome page styles
│   │
│   ├── js/
│   │   ├── auth.js         # Login / Register logic
│   │   ├── menu.js         # Menu logic
│   │   ├── game.js         # Game engine (10 modules)
│   │   ├── score.js        # Leaderboard logic
|   |   ├── welcome.js      # welcome page logic
│   │   ├── config/
│   │   |   └── firebase.config.js   # Firebase setup
|   |   |
│   │   └── api/
│   │       └── heartAPI.js    # Heart Puzzle API (Interoperability)
|   |
│   └── assets/
|       ├── icon/
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

1. **Software Design principles (High Cohesion, Low Coupling)**
2. **Event-Driven Programming**
3. **Interoperability**
4. **Virtual Identity**

---

## 🚀 Running the Project

1. Open the project folder in **VS Code**
2. Use **Live Server** extension to run
3. Open `http://127.0.0.1:5500/welcome.html`
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
 
