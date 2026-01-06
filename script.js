const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxOGQ4NmY3ZmJiOTVkNGJlODA1OWNiMGVjNTAzYWQxYSIsIm5iZiI6MTc2NzY4NjQzOC43MDMsInN1YiI6IjY5NWNjMTI2ZGM0OTFkM2Y2NTE3OGZhZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.stKcJBoS35gkDqrGA2-eFEC-uLscttpbOg7B2O-ISU8'; // Paste your token here
const WATCHMODE_API_KEY = 'eCkhTlhX1HM46um9l4HbeUYyDOTCjWfnLt69JI2p'; // Optional for now
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const searchBtn = document.getElementById('searchBtn');

// Load trending on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTrending();
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
});

async function loadTrending() {
    moviesGrid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">Loading movies...</div>';
    
    try {
        const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        if (data.results) {
            displayMovies(data.results.slice(0, 12));
        }
    } catch (error) {
        moviesGrid.innerHTML = '<div class="col-span-full text-center py-12 text-red-400">API key error - check TMDB token</div>';
    }
}

async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return loadTrending();
    
    moviesGrid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">Searching...</div>';
    
    try {
        const res = await fetch(`${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        if (data.results) {
            displayMovies(data.results.slice(0, 12));
        }
    } catch (error) {
        moviesGrid.innerHTML = '<div class="col-span-full text-center py-12 text-red-400">Search failed</div>';
    }
}

async function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    
    for (const movie of movies) {
        const platforms = []; // Skip Watchmode for now - movies show instantly
        
        const movieCard = createMovieCard(movie, platforms);
        moviesGrid.appendChild(movieCard);
    }
}

function createMovieCard(movie, platforms) {
    const title = movie.title || movie.name || 'Unknown Title';
    const overview = movie.overview ? movie.overview.substring(0, 100) + '...' : 'No description available';
    const date = movie.release_date || movie.first_air_date || 'TBA';
    const poster = movie.poster_path ? IMG_BASE + movie.poster_path : 'https://via.placeholder.com/300x450/374151/ffffff?text=No+Poster';
    const type = movie.media_type === 'movie' ? '🎬 Movie' : '📺 TV/Anime';
    
    const div = document.createElement('div');
    div.className = 'bg-gray-800 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl group';
    
    div.innerHTML = `
        <div class="h-64 bg-gradient-to-r from-gray-700 to-transparent relative overflow-hidden">
            <img src="${poster}" alt="${title}" 
                 class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
            <div class="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-xs font-semibold">
                ${type}
            </div>
        </div>
        <div class="p-6">
            <h3 class="font-bold text-xl mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">${title}</h3>
            <p class="text-gray-400 text-sm mb-4 line-clamp-2">${overview}</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${platforms.length > 0 ? platforms.map(p => 
                    `<a href="${p.url}" target="_blank" 
                       class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 rounded-lg text-sm font-medium transition-all">
                        ${p.name}
                    </a>`
                ).join('') : '<span class="text-gray-500 text-sm italic">Check platforms like Netflix, Crunchyroll</span>'}
            </div>
            <p class="text-xs text-gray-500">${date}</p>
        </div>
    `;
    
    return div;
}
