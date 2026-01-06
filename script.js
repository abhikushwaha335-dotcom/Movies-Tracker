const TMDB_API_KEY = '58882f7fd9932e795bde33c1056c7395'; // ← YOUR WORKING KEY HERE
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

document.addEventListener('DOMContentLoaded', () => {
    loadMovies();
    
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
});

async function loadMovies() {
    moviesGrid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">Loading movies...</div>';
    
    try {
        const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        displayMovies(data.results.slice(0, 8));
    } catch (error) {
        moviesGrid.innerHTML = '<div class="col-span-full text-center py-12 text-red-400">Check TMDB API key</div>';
    }
}

async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return loadMovies();
    
    moviesGrid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">Searching...</div>';
    
    try {
        const res = await fetch(`${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        displayMovies(data.results.slice(0, 8));
    } catch (error) {  // ← FIXED: was "type (error)"
        moviesGrid.innerHTML = '<div class="col-span-full text-center py-12 text-red-400">Search failed</div>';
    }
}

function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    movies.forEach(movie => createMovieCard(movie));
}

function createMovieCard(movie) {
    const div = document.createElement('div');
    div.className = 'bg-gray-800 rounded-2xl p-6 hover:scale-105 transition-all shadow-xl';
    
    const title = movie.title || movie.name;
    const streamingLinks = [
        { name: 'Netflix', url: `https://www.netflix.com/search?q=${encodeURIComponent(title)}` },
        { name: 'Crunchyroll', url: `https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}` },
        { name: 'Prime Video', url: `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}` }
    ];
    
    const linksHtml = streamingLinks.map(link => 
        `<a href="${link.url}" target="_blank" class="inline-block px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg mr-2 mb-2 hover:from-red-700 transition-all text-sm font-medium">
            ${link.name}
        </a>`
    ).join('');
    
    div.innerHTML = `
        <img src="${IMG_BASE}${movie.poster_path || '/no-poster.jpg'}" 
             alt="${title}" class="w-full h-64 object-cover rounded-xl mb-4" onerror="this.src='https://via.placeholder.com/300x450/374151/ffffff?text=No+Image'">
        <h3 class="text-xl font-bold mb-2">${title}</h3>
        <p class="text-gray-400 mb-4 text-sm">${movie.overview?.substring(0, 100) || 'No description'}...</p>
        <div class="flex flex-wrap gap-2 mb-4">
            ${linksHtml}
            <span class="text-xs text-gray-500 bg-gray-700 px-3 py-1 rounded-full">Search to watch</span>
        </div>
        <p class="text-xs text-gray-500">${movie.release_date || movie.first_air_date || 'TBA'}</p>
    `;
    
    moviesGrid.appendChild(div);
}
