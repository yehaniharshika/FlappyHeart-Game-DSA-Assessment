const HeartAPI = (() => {
    const ENDPOINT = 'https://marcconrad.com/uob/heart/api.php?out=json&decode=yes';
 
    async function fetchPuzzle() {
        try {
            const res  = await fetch(ENDPOINT); // HTTP GET (Interoperability)
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data = await res.json(); // JSON protocol
            return { imageUrl: data.question, solution: Number(data.solution) };
        } catch (e) {
            console.warn('[HeartAPI] fetchPuzzle failed:', e.message);
            return null; // caller handles null gracefully
        }
    }
 
    return { fetchPuzzle };
})();