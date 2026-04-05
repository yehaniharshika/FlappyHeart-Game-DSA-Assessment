// Virtual Identity Management
export const Session = (() => {
    const COOKIE_NAME = 'fh_session';

    function setCookie(name, value, days = 1) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }

    function deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    }

    function getPlayer() {
        return sessionStorage.getItem('fh_player') || getCookie(COOKIE_NAME) || 'Player';
    }

    function guard() {
        if (!getCookie(COOKIE_NAME)) {
            window.location.href = './index.html';
        }
    }

    function login(name) {
        setCookie(COOKIE_NAME, name);
        sessionStorage.setItem('fh_player', name);
    }

    function logout() {
        deleteCookie(COOKIE_NAME);
        sessionStorage.removeItem('fh_player');
        window.location.href = './index.html';
    }

    return { getPlayer, guard, login, logout };
})();