let currentId = 1;
let isShiny = false;
let cachedPokemon = null;
let cachedSpecies = null;

const els = {
    img: document.getElementById('poke-img'),
    name: document.getElementById('poke-name'),
    id: document.getElementById('poke-id'),
    height: document.getElementById('poke-height'),
    weight: document.getElementById('poke-weight'),
    types: document.getElementById('poke-types'),
    desc: document.getElementById('poke-desc'),
    badge: document.getElementById('shiny-badge'),
    audio: document.getElementById('pokemon-audio'),
    input: document.getElementById('search-input')
};

const typeColors = {
    fire:'#EE8130', water:'#6390F0', grass:'#7AC74C',
    electric:'#F7D02C', normal:'#A8A77A',
    psychic:'#F95587', fighting:'#C22E28'
};

async function loadPokemon(query) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!res.ok) throw 'Pokémon no encontrado';

        const data = await res.json();
        const sRes = await fetch(data.species.url);
        const species = await sRes.json();

        cachedPokemon = data;
        cachedSpecies = species;
        currentId = data.id;

        renderUI(data, species);
    } catch (e) {
        showError(e);
    }
}

function renderUI(data, species) {
    els.name.textContent = data.name.toUpperCase();
    els.id.textContent = `#${data.id}`;
    els.height.textContent = (data.height / 10) + ' m';
    els.weight.textContent = (data.weight / 10) + ' kg';

    els.types.innerHTML = '';
    data.types.forEach(t => {
        const badge = document.createElement('span');
        badge.className = 'type-badge';
        badge.style.background = typeColors[t.type.name] || '#777';
        badge.textContent = t.type.name;
        els.types.appendChild(badge);
    });

    const entry =
        species.flavor_text_entries.find(e => e.language.name === 'es') ||
        species.flavor_text_entries[0];

    els.desc.textContent = entry.flavor_text.replace(/\f/g, ' ');

    const s = data.sprites.other?.showdown;
    els.img.src = isShiny
        ? (s?.front_shiny || data.sprites.front_shiny)
        : (s?.front_default || data.sprites.front_default);

    els.audio.src = data.cries.latest;
    els.badge.classList.toggle('active', isShiny);
}

function showError(msg) {
    els.desc.textContent = 'ERROR: ' + msg;
    els.types.innerHTML = '';
    els.img.src = '';
}

function toggleShiny() {
    isShiny = !isShiny;
    if (cachedPokemon) renderUI(cachedPokemon, cachedSpecies);
}

function playCry() {
    els.audio.currentTime = 0;
    els.audio.play().catch(() => {
        els.desc.textContent = 'Interactúa para habilitar sonido';
    });
}

function nextPokemon() {
    loadPokemon(++currentId);
}

function prevPokemon() {
    if (--currentId < 1) currentId = 1;
    loadPokemon(currentId);
}

/* EVENTOS */
document.getElementById('btn-search').onclick = () => {
    if (els.input.value) loadPokemon(els.input.value.toLowerCase());
};
document.getElementById('btn-shiny').onclick = toggleShiny;
document.getElementById('btn-cry').onclick = playCry;

document.getElementById('pad-up').onclick = prevPokemon;
document.getElementById('pad-left').onclick = prevPokemon;
document.getElementById('pad-down').onclick = nextPokemon;
document.getElementById('pad-right').onclick = nextPokemon;

/* TECLADO */
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') prevPokemon();
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nextPokemon();
});

/* INIT */
loadPokemon(1);



