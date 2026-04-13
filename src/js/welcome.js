// welcome.js - Floating Hearts + Page Load Logic
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