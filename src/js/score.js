//  score.js  –  Flappy Heart Leaderboard Page
//  High Cohesion: score display ONLY
//  Low Coupling:  reads from Firebase independently

/* Floating Hearts Background */
(function spawnHearts() {
    const container = document.getElementById("heartsBg");
    if (!container) return;

    function createHeart() {
        const el       = document.createElement("span");
        el.className   = "float-heart";
        el.textContent = "🩷";

        const size      = 12 + Math.random() * 18;
        const duration  = 7  + Math.random() * 9;
        const hue       = 330 + Math.random() * 30;
        const lightness = 60  + Math.random() * 22;

        el.style.left              = Math.random() * 100 + "vw";
        el.style.bottom            = "-" + (size + 10) + "px";
        el.style.fontSize          = size + "px";
        el.style.color             = `hsl(${hue}, 100%, ${lightness}%)`;
        el.style.textShadow        = `0 0 ${Math.round(size * 0.45)}px hsl(${hue}, 90%, 72%)`;
        el.style.animationDuration = duration + "s";
        el.style.animationDelay    = "0s";
        el.style.opacity           = "0";

        container.appendChild(el);
        el.addEventListener("animationend", () => el.remove(), { once: true });
    }

    createHeart();
    setInterval(createHeart, 600);
})();

/* Cookie helper */
function getCookie(name) {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
}

/* Auth guard */
function guard() {
    if (!getCookie("fh_session")) {
        window.location.href = "./index.html";
    }
}

/* Get current player */
function getCurrentPlayer() {
    return sessionStorage.getItem("fh_player") || getCookie("fh_session") || "Player";
}

/* Rank label helper */
// 1→🥇  2→🥈  3→🥉  4→04  5→05 ... 10→10
function rankLabel(n) {
    if (n === 1) return "🥇";
    if (n === 2) return "🥈";
    if (n === 3) return "🥉";
    return `<span class="lb-rank-num">${String(n).padStart(2, "0")}</span>`;
}

/* Render leaderboard rows */
function renderRows(scores, currentPlayer) {
    const list = document.getElementById("lbList");

    if (!scores.length) {
        list.innerHTML = `
            <div class="lb-empty">
                <div class="lb-empty-icon">🏆</div>
                <p>No scores yet.</p>
                <p>Be the first champion!</p>
            </div>`;
        return;
    }

    list.innerHTML = scores.map((s, i) => {
        const rank   = i + 1;
        const isMe   = s.player.toLowerCase() === currentPlayer.toLowerCase();
        const rowCls = isMe       ? "lb-row lb-me"
                     : rank === 1 ? "lb-row lb-top"
                     :              "lb-row";
        return `
        <div class="${rowCls}" style="animation-delay:${i * 60}ms">
            <span class="lb-rank">${rankLabel(rank)}</span>
            <span class="lb-name">
                ${s.player}
                ${isMe ? '<span class="lb-you-badge">YOU</span>' : ""}
            </span>
            <span class="lb-score">${s.bestScore}</span>
        </div>`;
    }).join("");
}

/* Load scores from Firestore */
async function loadScores() {
    const currentPlayer = getCurrentPlayer();
    const loadingEl = document.getElementById("lbLoading");
    const listEl    = document.getElementById("lbList");

    loadingEl.style.display = "flex";
    listEl.style.display    = "none";

    try {
        const snap = await db.collection("scores")
            .orderBy("bestScore", "desc")
            .limit(10)
            .get();

        const scores = snap.docs.map(d => d.data());

        loadingEl.style.display = "none";
        listEl.style.display    = "block";
        renderRows(scores, currentPlayer);

        // Show player's rank in banner
        const myIdx = scores.findIndex(
            s => s.player.toLowerCase() === currentPlayer.toLowerCase()
        );
        if (myIdx !== -1) {
            const rankNum = myIdx + 1;
            const rankStr = rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : rankNum === 3 ? "🥉"
                          : String(rankNum).padStart(2, "0");
            document.getElementById("myRankText").textContent =
                `Your Rank: ${rankStr}  —  ${scores[myIdx].bestScore} pts`;
            document.getElementById("myRankBanner").style.display = "flex";
        }

    } catch (e) {
        console.warn("[ScorePage]", e);
        loadingEl.style.display = "none";
        listEl.style.display    = "block";
        listEl.innerHTML = `
            <div class="lb-empty">
                <p>Could not load scores.</p>
                <p>Check your connection.</p>
            </div>`;
    }
}

/* Logout */
function logout() {
    // Clear cookie
    document.cookie = "fh_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    sessionStorage.removeItem("fh_player");
    window.location.href = "./index.html";
}

/* Boot */
window.addEventListener("DOMContentLoaded", () => {
    guard();
    loadScores();
});