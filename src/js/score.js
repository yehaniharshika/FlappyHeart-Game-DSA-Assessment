// ============================================================
//  score.js  –  Flappy Heart Leaderboard Page
//  High Cohesion: this module handles score display ONLY
//  Low Coupling:  reads from Firebase independently
// ============================================================

/* ── Cookie helper ── */
function getCookie(name) {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
}

/* ── Auth guard — must be logged in ── */
function guard() {
    if (!getCookie("fh_session")) {
        window.location.href = "./index.html";
    }
}

/* ── Get current player name ── */
function getCurrentPlayer() {
    return sessionStorage.getItem("fh_player") || getCookie("fh_session") || "Player";
}

/* ── Render leaderboard rows ── */
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

    const medals = ["🥇", "🥈", "🥉"];
    list.innerHTML = scores.map((s, i) => {
        const isMe   = s.player.toLowerCase() === currentPlayer.toLowerCase();
        const rank   = i + 1;
        const medal  = medals[i] || `#${rank}`;
        const rowCls = isMe ? "lb-row lb-me" : (rank === 1 ? "lb-row lb-top" : "lb-row");
        return `
        <div class="${rowCls}" style="animation-delay:${i * 60}ms">
            <span class="lb-rank">${medal}</span>
            <span class="lb-name">
                ${s.player}
                ${isMe ? '<span class="lb-you-badge">YOU</span>' : ""}
            </span>
            <span class="lb-score">${s.bestScore}</span>
        </div>`;
    }).join("");
}

/* ── Load scores from Firestore ── */
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

        // Highlight user's position in header
        const myIdx = scores.findIndex(
            s => s.player.toLowerCase() === currentPlayer.toLowerCase()
        );
        if (myIdx !== -1) {
            document.getElementById("myRankText").textContent =
                `Your Rank: #${myIdx + 1} — ${scores[myIdx].bestScore} pts`;
            document.getElementById("myRankBanner").style.display = "flex";
        }

    } catch (e) {
        console.warn("[ScorePage]", e);
        loadingEl.style.display = "none";
        listEl.style.display    = "block";
        listEl.innerHTML = `<div class="lb-empty"><p>Could not load scores.</p><p>Check your connection.</p></div>`;
    }
}

/* ── Boot ── */
window.addEventListener("DOMContentLoaded", () => {
    guard();
    loadScores();
});