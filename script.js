const TMDB_API_KEY = '18d86f7fbb95d4be8059cb0ec503ad1a';
const WATCHMODE_API_KEY = 'eCkhTlhX1HM46um9l4HbeUYyDOTCjWfnLt69JI2p';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const WATCHMODE_BASE = 'https://api.watchmode.com/v1';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const searchBtn = document.getElementById('searchBtn');

// Load trending on page load
document.addEventListener('DOMContentLoaded', () => loadTrending());

// Search functionality
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());

async function loadTrending() {
    moviesGrid.innerHTML = '<div class="col-span-full text-center py-12">Loading movies...</div>';
    
    try {
        const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        displayMovies(data.results);
    } catch (error) {
        moviesGrid.innerHTML = '<div class="col-span-full text-center py-12 text-red-400">Error loading movies</div>';
    }
}

async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return loadTrending();
    
    moviesGrid.innerHTML = '<div class="col-span-full text-center py-12">Searching...</div>';
    
    try {
        const res = await fetch(`${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        displayMovies(data.results);
    } catch (error) {
        moviesGrid.innerHTML = '<div class="col-span-full text-center py-12 text-red-400">Search failed</div>';
    }
}

async function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    
    for (const movie of movies.slice(0, 20)) { // Limit to 20 results
        const title = movie.title || movie.name;
        const tmdbId = movie.id;
        
        // Get Watchmode data
        const platforms = await getStreamingPlatforms(tmdbId);
        
        const movieCard = createMovieCard(movie, platforms, title);
        moviesGrid.appendChild(movieCard);
    }
}

async function getStreamingPlatforms(tmdbId) {
    try {
        // First get Watchmode title ID from TMDb ID
        const res = await fetch(`${WATCHMODE_BASE}/title-by-imdb/?apiKey=${WATCHMODE_API_KEY}&imdb_id=${movie.imdb_id || 'tt0000000'}`);
        const data = await res.json();
        
        if (data.title_results?.[0]?.id) {
            const sources = await fetch(`${WATCHMODE_BASE}/title/${data.title_results[0].id}/sources/?apiKey=${WATCHMODE_API_KEY}`);
            const sourcesData = await sources.json();
            return sourcesData.map(s => ({ name: s.name, url: s.url }));
        }
    } catch (error) {
        console.log('Watchmode unavailable, skipping platforms');
    }
    return [];
}

function createMovieCard(movie, platforms, title) {
    const div = document.createElement('div');
    div.className = 'bg-gray-800 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl';
    
    const hasPlatforms = platforms.length > 0;
    
    div.innerHTML = `
        <div class="h-64 bg-gradient-to-r from-gray-700 to-transparent relative">
            <img src="${IMG_BASE}${movie.poster_path || movie.backdrop_path}" 
                 alt="${title}" class="w-full h-full object-cover">
            <div class="absolute top-4 right-4">
                <span class="bg-black/50 px-2 py-1 rounded-full text-xs">
                    ${movie.media_type === 'movie' ? '🎬' : '📺'}
                </span>
            </div>
        </div>
        <div class="p-6">
            <h3 class="font-bold text-xl mb-2 line-clamp-2">${title}</h3>
            <p class="text-gray-400 text-sm mb-4 line-clamp-2">${movie.overview || 'No description available'}</p>
            <div class="flex flex-wrap gap-2">
                ${hasPlatforms ? platforms.map(p => 
                    `<a href="${p.url}" target="_blank" 
                       class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 rounded-lg text-sm font-medium">
                        ${p.name}
                    </a>`
                ).join('') : '<span class="text-gray-500 text-sm">No streaming links found</span>'}
            </div>
            <p class="text-xs text-gray-500 mt-3">${movie.release_date || movie.first_air_date || 'TBA'}</p>
        </div>
    `;
    
    return div;
}