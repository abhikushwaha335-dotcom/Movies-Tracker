const TMDB_API_KEY = '58882f7fd9932e795bde33c1056c7395'; // Your working key
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const moviesGrid = document.getElementById('moviesGrid');

document.addEventListener('DOMContentLoaded', loadMovies);

async function loadMovies() {
    moviesGrid.innerHTML = 'Loading movies...';
    
    try {
        const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        
        moviesGrid.innerHTML = ''; // Clear loading
        
        data.results.slice(0, 8).forEach(movie => {
            createMovieCard(movie);
        });
    } catch (error) {
        moviesGrid.innerHTML = 'Check your TMDB API key';
    }
}

function createMovieCard(movie) {
    const div = document.createElement('div');
    div.className = 'bg-gray-800 rounded-2xl p-6 hover:scale-105 transition-all shadow-xl';
    
    // SIMULATED STREAMING LINKS - Replace with real Watchmode later
    const streamingLinks = [
        { name: 'Netflix', url: 'https://netflix.com/search?q=' + encodeURIComponent(movie.title) },
        { name: 'Crunchyroll', url: 'https://crunchyroll.com/search?q=' + encodeURIComponent(movie.title) },
        { name: 'Prime Video', url: 'https://primevideo.com/search/ref=atv_nb_sr?phrase=' + encodeURIComponent(movie.title) }
    ];
    
    const linksHtml = streamingLinks.map(link => 
        `<a href="${link.url}" target="_blank" class="inline-block px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg mr-2 mb-2 hover:from-red-700 transition-all text-sm font-medium">
            ${link.name}
        </a>`
    ).join('');
    
    div.innerHTML = `
        <img src="${IMG_BASE}${movie.poster_path || '/no-poster.jpg'}" 
             alt="${movie.title}" class="w-full h-64 object-cover rounded-xl mb-4">
        <h3 class="text-xl font-bold mb-2">${movie.title || movie.name}</h3>
        <p class="text-gray-400 mb-4 text-sm">${movie.overview?.substring(0, 100) || 'No description'}...</p>
        <div class="flex flex-wrap gap-2">
            ${linksHtml}
            <span class="text-xs text-gray-500 bg-gray-700 px-3 py-1 rounded-full">Search to confirm</span>
        </div>
        <p class="text-xs text-gray-500 mt-3">${movie.release_date || movie.first_air_date || 'TBA'}</p>
    `;
    
    moviesGrid.appendChild(div);
}
