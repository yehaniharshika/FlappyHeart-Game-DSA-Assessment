// ============================================================
//  menu.js  –  Menu page logic
// ============================================================

/* ── Cookie helpers ─────────────────────────────────────── */
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

/* ── Auth guard + init ──────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
    const session = getCookie('fh_session');
    if (!session) {
        window.location.href = './index.html';
        return;
    }

    // Set player name in welcome message
    sessionStorage.setItem('fh_player', session);
    document.getElementById('playerNameDisplay').textContent = session;

    // Start floating hearts
    spawnHearts();

    // Attach modal close-on-overlay-click
    document.getElementById('howToPlayModal').addEventListener('click', function (e) {
        if (e.target === this) closeHowToPlay();
    });
});

/* ── Navigation ─────────────────────────────────────────── */
function startGame() {
    window.location.href = './game.html';
}

function logout() {
    deleteCookie('fh_session');
    sessionStorage.removeItem('fh_player');
    window.location.href = './index.html';
}

/* ── How to Play Modal ──────────────────────────────────── */
function showHowToPlay() {
    document.getElementById('howToPlayModal').style.display = 'flex';
}

function closeHowToPlay() {
    document.getElementById('howToPlayModal').style.display = 'none';
}

/* ── Floating Hearts  (🩷 only, continuous) ─────────────── */
function spawnHearts() {
    const container = document.getElementById('heartsBg');
    if (!container) return;

    const symbol = '🩷';

    function createHeart() {
        const el = document.createElement('span');
        el.className   = 'float-heart';
        el.textContent = symbol;

        const size      = 12 + Math.random() * 18;       // 12–30 px
        const duration  = 7  + Math.random() * 9;        // 7–16 s
        const startX    = Math.random() * 100;           // 0–100 vw
        const hue       = 330 + Math.random() * 30;      // pink-red
        const lightness = 58  + Math.random() * 22;

        el.style.left              = startX + 'vw';
        el.style.bottom            = '-' + (size + 10) + 'px';
        el.style.fontSize          = size + 'px';
        el.style.color             = `hsl(${hue}, 80%, ${lightness}%)`;
        el.style.textShadow        = `0 0 ${Math.round(size * 0.45)}px hsl(${hue}, 90%, 72%)`;
        el.style.animationDuration = duration + 's';
        el.style.animationDelay    = '0s';
        el.style.opacity           = '0';

        container.appendChild(el);

        // Remove from DOM after animation ends (no memory leak)
        el.addEventListener('animationend', () => el.remove(), { once: true });
    }

    createHeart();                       // spawn one immediately
    setInterval(createHeart, 600);       // then every 600 ms
}