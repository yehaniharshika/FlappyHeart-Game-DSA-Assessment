//  Floating Hearts Background logic
(function spawnHearts() {
    const container = document.getElementById("heartsBg");
    if (!container) return;
    const symbol = "🩷";
    function createHeart() {
        const el        = document.createElement("span");
        el.className    = "float-heart";
        el.textContent  = symbol;
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

// Password Eye toggle logic
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isHidden  = input.type === "password";
    input.type      = isHidden ? "text" : "password";
    btn.querySelector("img").src = isHidden
        ? "src/assets/icon/eye-on.png"
        : "src/assets/icon/eye-off.png";
}
 
function toggleEyeVisibility(input) {
    const btn = input.parentElement.querySelector(".eye-toggle");
    if (!btn) return;
    if (input.value.length > 0) btn.classList.add("visible");
    else                        btn.classList.remove("visible");
}

// Cookie Helpers
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
}

// Page Load — already logged in → skip to menu
window.addEventListener("DOMContentLoaded", () => {
    if (getCookie("fh_session")) {
        window.location.href = "./menu.html";
    }
});

// Tab Switching logic
function showTab(tab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    if (event && event.currentTarget) event.currentTarget.classList.add("active");

    document.getElementById("loginForm").style.display    = tab === "login"    ? "block" : "none";
    document.getElementById("registerForm").style.display = tab === "register" ? "block" : "none";

    clearAllErrors();

    document.querySelectorAll(".tab").forEach(t => {
        const txt = t.textContent.trim().toUpperCase();
        if (tab === "login"    && txt.includes("LOGIN"))    t.classList.add("active");
        if (tab === "register" && txt.includes("REGISTER")) t.classList.add("active");
    });
}

// Field Error Helpers logic
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

// Button Loading State
function setButtonLoading(btnId, loading, originalText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled    = loading;
    btn.textContent = loading ? "Please wait..." : originalText;
}

// REGISTER — Firebase Firestore save
async function handleUserRegister() {
    const name      = document.getElementById("registerName").value.trim();
    const email     = document.getElementById("registerEmail").value.trim();
    const password  = document.getElementById("registerPassword").value;
    const confirmPW = document.getElementById("registerConfirmPW").value;
    const generalEl = document.getElementById("ErrorEl");

    // Reset errors
    generalEl.textContent = "";
    showFieldOk("registerName",      "registerNameErr");
    showFieldOk("registerEmail",     "registerEmailErr");
    showFieldOk("registerPassword",  "registerPasswordErr");
    showFieldOk("registerConfirmPW", "registerConfirmErr");

    // Validation
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

    // Firebase: duplicate check + save
    const registerBtn = document.querySelector("#registerForm .btn-main");
    if (registerBtn) { registerBtn.disabled = true; registerBtn.textContent = "Please wait..."; }

    try {
        // Document ID = name lowercase (spaces → underscore)
        const docId = name.toLowerCase().replace(/\s+/g, "_");

        // Check username exists
        const existingName = await db.collection("users").doc(docId).get();
        if (existingName.exists) {
            showFieldError("registerName", "registerNameErr", "Name already taken.");
            if (registerBtn) { registerBtn.disabled = false; registerBtn.textContent = "CREATE ACCOUNT"; }
            return;
        }

        // Check email exists
        const existingEmail = await db.collection("users")
            .where("email", "==", email.toLowerCase())
            .get();
        if (!existingEmail.empty) {
            showFieldError("registerEmail", "registerEmailErr", "Email already registered.");
            if (registerBtn) { registerBtn.disabled = false; registerBtn.textContent = "CREATE ACCOUNT"; }
            return;
        }

        // Save to Firestore
        await db.collection("users").doc(docId).set({
            name:      name,
            email:     email.toLowerCase(),
            password:  password,
            createdAt: new Date().toISOString()
        });

        // SweetAlert2 success popup
        await Swal.fire({
            icon:              'success',
            title:             'Account Created! 🎉',
            html:              `<p style="font-family:'Fredoka',sans-serif;font-size:16px;color:#e8c6d0;font-weight:400;line-height:1.6">
                                    Welcome, <strong style="color:#ff9abf">${name} </strong>!<br>
                                    Please log in with your credentials.
                                </p>`,
            confirmButtonText: 'GO TO LOGIN',
            confirmButtonColor:'#e8437a',
            background:        '#1a0d1a',
            color:             '#ffffff',
            iconColor:         '#4caf50',
            width:             '400px',
            height: "250px",
            customClass: {
                popup:         'swal-custom-popup',
                title:         'swal-custom-title',
                confirmButton: 'swal-custom-btn'
            }
        });

        // Clear form
        document.getElementById("registerName").value      = "";
        document.getElementById("registerEmail").value     = "";
        document.getElementById("registerPassword").value  = "";
        document.getElementById("registerConfirmPW").value = "";

        showTab("login");

    } catch (err) {
        console.error("[Register Error]", err);
        generalEl.textContent = "Registration failed. Check your internet connection.";
    }

    if (registerBtn) { registerBtn.disabled = false; registerBtn.textContent = "CREATE ACCOUNT"; }
}

// LOGIN — Firebase Firestore check
async function handleUserLogin() {
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

    // Firebase: read + verify
    const loginBtn = document.querySelector("#loginForm .btn-main");
    if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = "Please wait..."; }

    try {
        const docId   = username.toLowerCase().replace(/\s+/g, "_");
        const userDoc = await db.collection("users").doc(docId).get();

        if (!userDoc.exists) {
            showFieldError("loginUsername", "loginUsernameErr", "Invalid username or password.");
            showFieldError("loginPassword", "loginPasswordErr", " ");
            if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = "LOGIN"; }
            return;
        }

        const userData = userDoc.data();

        if (userData.password !== password) {
            showFieldError("loginUsername", "loginUsernameErr", "Invalid username or password.");
            showFieldError("loginPassword", "loginPasswordErr", " ");
            if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = "LOGIN"; }
            return;
        }

        // Login success
        loginUser(userData.name);

    } catch (err) {
        console.error("[Login Error]", err);
        generalEl.textContent = "Login failed. Check your internet connection.";
        if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = "LOGIN"; }
    }
}

//  Cookie Set + Redirect
function loginUser(name) {
    setCookie("fh_session", name, 1);
    sessionStorage.setItem("fh_player", name);
    window.location.href = "./menu.html";
}

//  Google Login — disabled for now
function handleGoogleLogin() {
    alert("Google Sign-In is not enabled yet.");
}