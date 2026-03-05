/* Floating Hearts Background */
(function spawnHearts() {
    const container = document.getElementById("heartsBg");
    if (!container) return;

    const symbol = "🩷";

    function createHeart() {
        const el = document.createElement("span");
        el.className = "float-heart";
        el.textContent = symbol;

        const size      = 12 + Math.random() * 18;
        const duration  = 7  + Math.random() * 9;
        const startX    = Math.random() * 100;
        const hue       = 330 + Math.random() * 30;
        const lightness = 58  + Math.random() * 22;

        el.style.left              = startX + "vw";
        el.style.bottom            = "-" + (size + 10) + "px";
        el.style.fontSize          = size + "px";
        el.style.color             = `hsl(${hue}, 80%, ${lightness}%)`;
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

/* Tab Switching Part */
function showTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));

    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }

    document.getElementById("loginForm").style.display    = tab === "login"    ? "block" : "none";
    document.getElementById("registerForm").style.display = tab === "register" ? "block" : "none";

    // clear all errors when switching tabs
    clearAllErrors();

    document.querySelectorAll(".tab").forEach(t => {
        const txt = t.textContent.trim().toUpperCase();
        if (tab === "login"    && txt.includes("LOGIN"))    t.classList.add("active");
        if (tab === "register" && txt.includes("REGISTER")) t.classList.add("active");
    });
}

/* Cookie Helpers */
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
}

/* User Storage (localStorage as simulated DB) */
function getUserData()       { return JSON.parse(localStorage.getItem("game_user") || "[]"); }
function saveUserData(data)  { localStorage.setItem("game_user", JSON.stringify(data)); }


window.addEventListener("DOMContentLoaded", () => {
    if (getCookie("fh_session")) {
        window.location.href = "./menu.html";
    }
});

/* shows fields errors part */
function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const span  = document.getElementById(errorId);
    if (input) input.classList.add("input-error");
    if (span)  span.textContent = message;
}

function showFieldOk(inputId, errorId) {
    const input = document.getElementById(inputId);
    const span  = document.getElementById(errorId);
    if (input) input.classList.remove("input-error");
    if (span)  span.textContent = "";
}

function clearFieldError(errorId) {
    const span = document.getElementById(errorId);
    if (!span) return;
    const input = span.closest(".input-group")?.querySelector("input");
    if (input) input.classList.remove("input-error");
    span.textContent = "";
}

function clearAllErrors() {
    document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    ["loginError", "ErrorEl"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });
}

/* User Registration Part */
function handleUserRegister() {
    const name      = document.getElementById("registerName").value.trim();
    const email     = document.getElementById("registerEmail").value.trim();
    const password  = document.getElementById("registerPassword").value;
    const confirmPW = document.getElementById("registerConfirmPW").value;
    const generalEl = document.getElementById("ErrorEl");

    // Reset all errors first
    generalEl.textContent = "";
    showFieldOk("registerName",      "registerNameErr");
    showFieldOk("registerEmail",     "registerEmailErr");
    showFieldOk("registerPassword",  "registerPasswordErr");
    showFieldOk("registerConfirmPW", "registerConfirmErr");

    // field validation
    let hasError = false;

    if (!name) {
        showFieldError("registerName", "registerNameErr", "Name is required.");
        hasError = true;
    } else if (name.length < 3) {
        showFieldError("registerName", "registerNameErr", "Name must be at least 3 characters.");
        hasError = true;
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
        showFieldError("registerName", "registerNameErr", "Name must contain letters only.");
        hasError = true;
    }

    if (!email) {
        showFieldError("registerEmail", "registerEmailErr", "Email is required.");
        hasError = true;
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        showFieldError("registerEmail", "registerEmailErr", "Enter a valid email address.");
        hasError = true;
    }

    if (!password) {
        showFieldError("registerPassword", "registerPasswordErr", "Password is required.");
        hasError = true;
    } else if (password.length < 6) {
        showFieldError("registerPassword", "registerPasswordErr", "Password must be at least 6 characters.");
        hasError = true;
    }

    if (!confirmPW) {
        showFieldError("registerConfirmPW", "registerConfirmErr", "Please confirm your password.");
        hasError = true;
    } else if (password && confirmPW !== password) {
        showFieldError("registerConfirmPW", "registerConfirmErr", "Passwords do not match.");
        hasError = true;
    }

    if (hasError) return;

    // Checks duplication
    const users = getUserData();

    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
        showFieldError("registerName", "registerNameErr", "Name already taken.");
        return;
    }
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showFieldError("registerEmail", "registerEmailErr", "Email already registered.");
        return;
    }

    // Save & auto-login 
    users.push({ name, email, password, createdAt: new Date().toISOString() });
    saveUserData(users);

    // Show success alert and switch to Login tab — user must login manually
    alert("\u2705 Account created successfully!\nPlease log in with your credentials.");

    // Clear all register fields
    document.getElementById("registerName").value      = "";
    document.getElementById("registerEmail").value     = "";
    document.getElementById("registerPassword").value  = "";
    document.getElementById("registerConfirmPW").value = "";
    document.getElementById("ErrorEl").textContent     = "";

    // Switch to Login tab
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => {
        if (t.textContent.trim().toUpperCase().includes("LOGIN")) t.classList.add("active");
    });
    document.getElementById("loginForm").style.display    = "block";
    document.getElementById("registerForm").style.display = "none";
}

/* User Login Part */
function handleUserLogin() {
    const username  = document.getElementById("loginUsername").value.trim();
    const password  = document.getElementById("loginPassword").value;
    const generalEl = document.getElementById("loginError");

    generalEl.textContent = "";
    showFieldOk("loginUsername", "loginUsernameErr");
    showFieldOk("loginPassword", "loginPasswordErr");

    if (!username && !password) {
        generalEl.textContent = "Please fill in all fields.";
        return;
    }

    // Individual empty check validation
    let hasError = false;

    if (!username) {
        showFieldError("loginUsername", "loginUsernameErr", "Username is required.");
        hasError = true;
    }

    if (!password) {
        showFieldError("loginPassword", "loginPasswordErr", "Password is required.");
        hasError = true;
    }

    if (hasError) return;

    // Credentials check
    const user = getUserData().find(
        u => u.name.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!user) {
        // Show error on both fields (invalid combo)
        showFieldError("loginUsername", "loginUsernameErr", "Invalid username or password.");
        showFieldError("loginPassword", "loginPasswordErr", " ");   // highlights field
        return;
    }

    loginUser(user.name);
}

/* Google Signin */

// function handleGoogleLogin() {
//     const name = prompt("Simulated Google Sign-In\nEnter your display name:");
//     if (!name || !name.trim()) return;

//     const username = name.trim().replace(/\s+/g, "_");
//     const users    = getUserData();

//     if (!users.find(u => u.name.toLowerCase() === username.toLowerCase())) {
//         users.push({
//             name:      username,
//             email:     username + "@gmail.com",
//             password:  null,
//             provider:  "google",
//             createdAt: new Date().toISOString()
//         });
//         saveUserData(users);
//     }

//     loginUser(username);
// }

function loginUser(name) {
    setCookie("fh_session", name, 1);
    sessionStorage.setItem("fh_player", name);
    window.location.href = "./menu.html";
}