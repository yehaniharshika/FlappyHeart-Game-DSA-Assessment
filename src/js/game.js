// ============================================================
//  game.js  –  Flappy Heart Game Engine
//
//  CIS045-3 Themes:
//  1. Software Design  – 9 IIFE modules, single-responsibility
//  2. Event-Driven     – keydown, click, rAF, setInterval
//  3. Interoperability – Heart API HTTP GET → JSON
//  4. Virtual Identity – session cookie auth guard
// ============================================================
'use strict';

// ─────────────────────────────────────────────────────────────
//  MODULE 1  –  Session  (Virtual Identity)
// ─────────────────────────────────────────────────────────────
const Session = (() => {
    const getCookie = n => {
        const m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : null;
    };
    const getPlayer = () =>
        sessionStorage.getItem('fh_player') || getCookie('fh_session') || 'Player';
    const guard = () => {
        if (!getCookie('fh_session')) window.location.href = './index.html';
    };
    return { getPlayer, guard };
})();

// ─────────────────────────────────────────────────────────────
//  MODULE 2  –  HeartAPI  (Interoperability)
//  HTTP GET → external PHP REST service → JSON response
//  Endpoint: https://marcconrad.com/uob/heart/api.php
// ─────────────────────────────────────────────────────────────
const HeartAPI = (() => {
    const ENDPOINT = 'https://marcconrad.com/uob/heart/api.php?out=json&decode=yes';

    async function fetchPuzzle() {
        try {
            const res  = await fetch(ENDPOINT);           // HTTP GET (interoperability)
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json();                // JSON deserialization
            // API returns: { question: "<img-url>", solution: <int> }
            return { imageUrl: data.question, solution: Number(data.solution) };
        } catch (e) {
            console.warn('[HeartAPI] fetch failed:', e.message);
            return null;   // graceful degradation
        }
    }
    return { fetchPuzzle };
})();

// ─────────────────────────────────────────────────────────────
//  MODULE 3  –  GameTimer  (2-minute game countdown)
// ─────────────────────────────────────────────────────────────
const GameTimer = (() => {
    const TOTAL = 120;
    let remaining = TOTAL, id = null, _onTick, _onEnd;

    const fmt = s =>
        `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    function start(onTick, onEnd) {
        remaining = TOTAL; _onTick = onTick; _onEnd = onEnd;
        id = setInterval(() => {
            if (--remaining <= 0) { stop(); _onEnd(); } else _onTick(remaining);
        }, 1000);
    }
    function stop()  { clearInterval(id); id = null; }
    function pause() { stop(); }
    function resume(onTick, onEnd) {
        if (id) return;
        if (onTick) _onTick = onTick;
        if (onEnd)  _onEnd  = onEnd;
        id = setInterval(() => {
            if (--remaining <= 0) { stop(); _onEnd(); } else _onTick(remaining);
        }, 1000);
    }
    function get() { return remaining; }
    return { start, stop, pause, resume, fmt, get };
})();

// ─────────────────────────────────────────────────────────────
//  MODULE 4  –  PuzzleTimer  (30-second puzzle countdown)
//  FIX: SVG elements don't support .className assignment —
//       use element.setAttribute('class', ...) instead.
// ─────────────────────────────────────────────────────────────
const PuzzleTimer = (() => {
    const TOTAL   = 30;
    const CIRCUMF = 2 * Math.PI * 26;   // r=26 → ≈ 163.4
    let remaining = TOTAL, id = null, _onEnd;

    function _update() {
        const offset = CIRCUMF * (1 - remaining / TOTAL);
        const ring   = document.getElementById('timerRingFill');
        const numEl  = document.getElementById('puzzleTimerNum');

        if (ring) {
            ring.style.strokeDashoffset = offset;
            // ✅ FIX: SVGElement.className is read-only → must use setAttribute
            const cls = 'timer-ring-fill' +
                (remaining <= 5  ? ' urgent' :
                 remaining <= 10 ? ' warn'   : '');
            ring.setAttribute('class', cls);
        }
        if (numEl) numEl.textContent = remaining;
    }

    function start(onEnd) {
        remaining = TOTAL;
        _onEnd    = onEnd;
        _update();
        id = setInterval(() => {
            if (--remaining <= 0) { stop(); _onEnd(); } else _update();
        }, 1000);
    }
    function stop() { clearInterval(id); id = null; }
    return { start, stop };
})();

// ─────────────────────────────────────────────────────────────
//  MODULE 5  –  Renderer
// ─────────────────────────────────────────────────────────────
const Renderer = (() => {
    let ctx, W, H;
    function init(canvas) { ctx = canvas.getContext('2d'); W = canvas.width; H = canvas.height; }
    function clear()  { ctx.clearRect(0, 0, W, H); }
    function image(img, x, y, w, h) {
        if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
    }
    function rect(color, x, y, w, h) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
    function get()  { return ctx; }
    function size() { return { W, H }; }
    return { init, clear, image, rect, get, size };
})();

// ─────────────────────────────────────────────────────────────
//  MODULE 6  –  Collision  (AABB)
// ─────────────────────────────────────────────────────────────
const Collision = (() => {
    function hit(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x &&
               a.y < b.y + b.h && a.y + a.h > b.y;
    }
    return { hit };
})();

// ─────────────────────────────────────────────────────────────
//  MODULE 7  –  PipeManager
// ─────────────────────────────────────────────────────────────
const PipeManager = (() => {
    let pipes = [], topImg, botImg;
    const PW = 64, PH = 512, VX = -2;

    function init(t, b) { topImg = t; botImg = b; pipes = []; }
    function reset()    { pipes = []; }

    function spawn(bw, bh) {
        const gapH = bh * 0.28;
        const minY = -PH + 80;
        const maxY = -PH + bh - gapH - 80;
        const topY = minY + Math.random() * (maxY - minY);
        pipes.push({ img: topImg, x: bw, y: topY,             w: PW, h: PH, isTop: true,  passed: false });
        pipes.push({ img: botImg, x: bw, y: topY + PH + gapH, w: PW, h: PH, isTop: false, passed: false });
    }

    function update(birdX, onPass) {
        for (const p of pipes) {
            p.x += VX;
            if (p.img && p.img.complete && p.img.naturalWidth) {
                Renderer.image(p.img, p.x, p.y, p.w, p.h);
            } else {
                _fallback(p);
            }
            if (!p.passed && p.isTop && birdX > p.x + p.w) {
                p.passed = true;
                onPass();
            }
        }
        while (pipes.length && pipes[0].x < -PW) pipes.splice(0, 2);
    }

    function _fallback(p) {
        const ctx = Renderer.get();
        const g   = ctx.createLinearGradient(p.x, 0, p.x + p.w, 0);
        g.addColorStop(0, '#66bb6a'); g.addColorStop(.45, '#4caf50'); g.addColorStop(1, '#388e3c');
        ctx.fillStyle = g;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        const capY = p.isTop ? p.y + p.h - 22 : p.y;
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(p.x - 8, capY, p.w + 16, 22);
    }

    function getAll() { return pipes; }

    // Remove pipes that overlap the bird (called after correct puzzle answer)
    function removeOverlapping(bird) {
        // Find X positions of pipes overlapping the bird
        const hitXSet = new Set();
        for (const p of pipes) {
            if (Collision.hit(bird, p)) hitXSet.add(Math.round(p.x));
        }
        // Remove both top and bottom of each hit pair
        if (hitXSet.size > 0) {
            pipes = pipes.filter(p => !hitXSet.has(Math.round(p.x)));
        }
    }

    return { init, reset, spawn, update, getAll, removeOverlapping };
})();

// ─────────────────────────────────────────────────────────────
//  MODULE 8  –  State
// ─────────────────────────────────────────────────────────────
const State = (() => {
    const BW = 34, BH = 24;
    const GRAVITY = 0.40, JUMP = -6.2;
    let birdX, birdY, vy, score, started, over, paused;

    function reset(boardH) {
        birdY = boardH / 2; birdX = 360 / 8;
        vy = 0; score = 0;
        started = false; over = false; paused = false;
    }
    function jump() { vy = JUMP; }
    function step() { vy += GRAVITY; birdY = Math.max(birdY + vy, 0); }
    function bird() { return { x: birdX, y: birdY, w: BW, h: BH }; }
    function addScore(n) { score += n; }
    function get()         { return { score, started, over, paused }; }
    function setStarted(v) { started = v; }
    function setOver(v)    { over    = v; }
    function setPaused(v)  { paused  = v; }
    return { reset, jump, step, bird, addScore, get, setStarted, setOver, setPaused };
})();

// ─────────────────────────────────────────────────────────────
//  MODULE 9  –  HUD
// ─────────────────────────────────────────────────────────────
const HUD = (() => {
    function update(player, score, timeSec) {
        const p = document.getElementById('hudPlayer');
        if (p) p.textContent = player.length > 9 ? player.slice(0, 9) + '…' : player;
        const s = document.getElementById('hudScore');
        if (s) s.textContent = String(score).padStart(2, '0');
        const t = document.getElementById('hudTime');
        if (t) {
            t.textContent = GameTimer.fmt(timeSec);
            if (timeSec <= 10) t.classList.add('danger');
            else               t.classList.remove('danger');
        }
    }
    return { update };
})();

// ─────────────────────────────────────────────────────────────
//  PUZZLE CONTROLLER
//  Wires PuzzleTimer + HeartAPI together.
//  Flow: show modal → spinner → API fetch → image displayed
//        30s countdown → timeout=fail | correct=resume | wrong=gameover
// ─────────────────────────────────────────────────────────────
const Puzzle = (() => {
    let solution = null, _onCorrect, _onFail;

    async function show(onCorrect, onFail) {
        _onCorrect = onCorrect;
        _onFail    = onFail;
        solution   = null;

        // Reset modal UI
        _el('puzzleError').textContent  = '';
        _el('puzzleAnswer').value       = '';
        _el('puzzleNote').textContent   = 'Loading quest…';
        _el('puzzleLoading').style.display = 'flex';
        _el('puzzleContent').style.display = 'none';
        _el('puzzleModal').style.display   = 'flex';

        // Start 30-second puzzle timer — timeout = automatic fail
        PuzzleTimer.start(() => {
            _dismiss();
            _onFail();
        });

        // HTTP GET to Heart API (Interoperability demo point)
        const data = await HeartAPI.fetchPuzzle();

        _el('puzzleLoading').style.display = 'none';
        _el('puzzleContent').style.display = 'block';

        if (!data) {
            // API unavailable — benefit of the doubt, auto-continue
            _el('puzzleNote').textContent  = 'API unavailable.';
            _el('puzzleError').textContent = 'Could not load puzzle — continuing…';
            setTimeout(() => { _dismiss(); _onCorrect(); }, 2000);
            return;
        }

        solution = data.solution;
        _el('puzzleImage').src      = data.imageUrl;
        _el('puzzleNote').textContent = 'Quest is ready.';
        _el('puzzleAnswer').focus();
    }

    function submit() {
        const raw = _el('puzzleAnswer').value;
        const ans = parseInt(raw, 10);
        const err = _el('puzzleError');
        err.textContent = '';

        if (raw === '' || isNaN(ans)) {
            err.textContent = 'Please enter a number!';
            return;
        }
        if (ans === solution) {
            _dismiss();
            _onCorrect();
        } else {
            err.textContent = `✗ Wrong! The answer was ${solution}.`;
            setTimeout(() => { _dismiss(); _onFail(); }, 1600);
        }
    }

    function cancel() { _dismiss(); _onFail(); }

    function _dismiss() {
        PuzzleTimer.stop();
        _el('puzzleModal').style.display = 'none';
    }

    function _el(id) { return document.getElementById(id); }

    return { show, submit, cancel };
})();

// ─────────────────────────────────────────────────────────────
//  GAME CONTROLLER
// ─────────────────────────────────────────────────────────────
const BOARD_W = 360, BOARD_H = 640;

let birdImg, topPipeImg, botPipeImg;
let pipeSpawnId  = null;
let playerName   = 'Player';
let puzzleOpen   = false;
let invincible   = false;   // true for 1.5s after correct answer → prevents re-collision

/* ── Images ── */
function loadImages() {
    birdImg    = new Image(); birdImg.src    = 'src/assets/images/flappy-heart.png';
    topPipeImg = new Image(); topPipeImg.src = 'src/assets/images/toppipe.png';
    botPipeImg = new Image(); botPipeImg.src = 'src/assets/images/bottompipe.png';
}

/* ── Background draw ── */
function drawBackground() {
    const ctx = Renderer.get();

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, BOARD_H);
    sky.addColorStop(0,    '#0d1b3e');
    sky.addColorStop(0.55, '#1a3a6e');
    sky.addColorStop(1,    '#2a5298');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    // Soft clouds
    ctx.fillStyle = 'rgba(255,255,255,.09)';
    [[50,110,70,22],[170,80,90,20],[270,130,60,18],[90,195,80,20],[230,255,55,16]]
        .forEach(([cx, cy, cw, ch]) => {
            ctx.beginPath();
            ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);
            ctx.fill();
        });

    // Ground
    const grd = ctx.createLinearGradient(0, BOARD_H - 50, 0, BOARD_H);
    grd.addColorStop(0, '#7a4a1e'); grd.addColorStop(.45, '#5c3317'); grd.addColorStop(1, '#3d2010');
    ctx.fillStyle = grd;
    ctx.fillRect(0, BOARD_H - 50, BOARD_W, 50);
    ctx.fillStyle = '#a0622a';
    ctx.fillRect(0, BOARD_H - 50, BOARD_W, 3);
}

/* ── Bird draw (image or heart shape fallback) ── */
function drawBird(b) {
    if (birdImg && birdImg.complete && birdImg.naturalWidth) {
        Renderer.image(birdImg, b.x, b.y, b.w, b.h);
    } else {
        _heartFallback(b.x, b.y, b.w);
    }
}

function _heartFallback(x, y, size) {
    const ctx = Renderer.get();
    ctx.save();
    ctx.fillStyle = '#e8437a';
    ctx.shadowColor = '#e8437a'; ctx.shadowBlur = 10;
    const s = size / 2;
    ctx.beginPath();
    ctx.moveTo(x + s, y + s * 0.4);
    ctx.bezierCurveTo(x + s, y,           x,         y,           x,         y + s * 0.5);
    ctx.bezierCurveTo(x,     y + s * 1.1, x + s,     y + s * 1.5, x + s,     y + s * 1.7);
    ctx.bezierCurveTo(x + s, y + s * 1.5, x + s * 2, y + s * 1.1, x + s * 2, y + s * 0.5);
    ctx.bezierCurveTo(x + s * 2, y,       x + s,     y,           x + s,     y + s * 0.4);
    ctx.fill();
    ctx.restore();
}

/* ── Responsive canvas scale ── */
function scaleCanvas() {
    const canvas = document.getElementById('board');
    const wrap   = document.getElementById('canvasWrap');
    const scale  = Math.min(
        (wrap.clientHeight - 8)  / BOARD_H,
        (wrap.clientWidth  - 16) / BOARD_W,
        1
    );
    canvas.style.transform = `scale(${scale})`;
}

/* ── INIT ── */
function init() {
    Session.guard();
    playerName = Session.getPlayer();

    loadImages();

    const canvas = document.getElementById('board');
    canvas.width  = BOARD_W;
    canvas.height = BOARD_H;
    Renderer.init(canvas);

    PipeManager.init(topPipeImg, botPipeImg);
    State.reset(BOARD_H);
    HUD.update(playerName, 0, 120);

    scaleCanvas();
    window.addEventListener('resize', scaleCanvas);

    // Event listeners (Event-Driven Programming)
    document.addEventListener('keydown', onKeyDown);          // keyboard
    canvas.addEventListener('click', onTap);                   // mouse/touch
    document.getElementById('startOverlay').addEventListener('click', onTap);

    requestAnimationFrame(gameLoop);                           // render loop
}

/* ── Input handlers ── */
function onKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyX') {
        e.preventDefault();
        flap();
    }
}
function onTap() { flap(); }

function flap() {
    if (puzzleOpen) return;
    const { started, over, paused } = State.get();
    if (!started) { startGame(); return; }
    if (over || paused) return;
    State.jump();
}

/* ── Start ── */
function startGame() {
    document.getElementById('startOverlay').style.display = 'none';
    State.setStarted(true);

    pipeSpawnId = setInterval(() => {                          // Event: pipe timer
        const { over, paused } = State.get();
        if (!over && !paused) PipeManager.spawn(BOARD_W, BOARD_H);
    }, 1500);

    GameTimer.start(                                           // Event: game timer
        rem => HUD.update(playerName, State.get().score, rem),
        ()  => onTimeUp()
    );
}

/* ── Render loop (requestAnimationFrame event) ── */
function gameLoop() {
    requestAnimationFrame(gameLoop);
    const { started, over, paused } = State.get();

    drawBackground();

    if (!started || paused || over) {
        drawBird(State.bird());
        return;
    }

    State.step();
    const b = State.bird();

    PipeManager.update(b.x, () => {
        State.addScore(25);
        HUD.update(playerName, State.get().score, GameTimer.get());
    });

    drawBird(b);

    // Ground hit (invincibility doesn't protect from ground)
    if (b.y + b.h >= BOARD_H - 50) { onCollision(); return; }

    // Pipe hit — skip while invincible (brief grace after correct answer)
    if (!invincible) {
        for (const p of PipeManager.getAll()) {
            if (Collision.hit(b, p)) { onCollision(); return; }
        }
    }
}

/* ── Collision → Heart API puzzle ── */
function onCollision() {
    if (puzzleOpen) return;
    puzzleOpen = true;
    State.setPaused(true);
    GameTimer.pause();

    Puzzle.show(
        () => {                                                // ✅ correct answer
            puzzleOpen = false;

            // Remove any pipe the bird is currently overlapping
            // so it doesn't instantly re-trigger a collision
            PipeManager.removeOverlapping(State.bird());

            // Give 1.5 s invincibility so the bird flies clear
            invincible = true;
            setTimeout(() => { invincible = false; }, 1500);

            // Give a small upward boost so the player can react
            State.jump();

            State.setPaused(false);
            GameTimer.resume(
                rem => HUD.update(playerName, State.get().score, rem),
                ()  => onTimeUp()
            );
        },
        () => {                                                // ❌ wrong / timeout
            puzzleOpen = false;
            triggerGameOver();
        }
    );
}

/* ── Game Over ── */
function triggerGameOver() {
    State.setOver(true);
    GameTimer.stop();
    clearInterval(pipeSpawnId);
    document.getElementById('finalScore').textContent  = State.get().score;
    document.getElementById('finalPlayer').textContent = playerName;
    document.getElementById('gameOverModal').style.display = 'flex';
}

/* ── Time Up ── */
function onTimeUp() {
    State.setOver(true);
    clearInterval(pipeSpawnId);
    document.getElementById('timeUpScore').textContent  = State.get().score;
    document.getElementById('timeUpPlayer').textContent = playerName;
    document.getElementById('timeUpModal').style.display = 'flex';
}

/* ── Restart ── */
function restartGame() {
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('timeUpModal').style.display   = 'none';
    clearInterval(pipeSpawnId);
    GameTimer.stop();
    PipeManager.reset();
    State.reset(BOARD_H);
    puzzleOpen  = false;
    invincible  = false;
    HUD.update(playerName, 0, 120);
    document.getElementById('startOverlay').style.display = 'flex';
}

/* ── Change player ── */
function changePlayer() { window.location.href = './menu.html'; }

/* ── HTML onclick hooks ── */
function submitPuzzle() { Puzzle.submit(); }
function failPuzzle()   { Puzzle.cancel(); }

// Boot
window.addEventListener('DOMContentLoaded', init);