let notes = JSON.parse(localStorage.getItem('noteflow_notes')) || [
    { id: 1, title: 'Welcome to NoteFlow', category: 'Personal', content: 'This is a fully functional workspace application running completely client-side using browser LocalStorage!', date: 'Oct 27, 2026' },
    { id: 2, title: 'Full Stack Mini Project Goals', category: 'Work', content: 'Prepare documentation, UI layout styling with Tailwind CSS, and record demonstration video.', date: 'Oct 27, 2026' }
];

let currentFilter = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    renderNotes();
});

function renderNotes() {
    const grid = document.getElementById('notes-grid');
    const emptyState = document.getElementById('empty-state');
    const totalCountEl = document.getElementById('total-notes-count');
    const categoryCountEl = document.getElementById('category-count');
    const categoryTitleEl = document.getElementById('current-category-title');

    totalCountEl.innerText = `${notes.length} notes`;
    categoryTitleEl.innerText = currentFilter === 'all' ? 'All Notes' : `${currentFilter} Notes`;

    // Filter logic
    let filtered = notes.filter(note => {
        const matchesCategory = currentFilter === 'all' || note.category === currentFilter;
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              note.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    categoryCountEl.innerText = `Showing ${filtered.length} items`;
    grid.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    filtered.forEach(note => {
        let badgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        if (note.category === 'Work') badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (note.category === 'Ideas') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

        const card = document.createElement('div');
        card.className = "bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition shadow-lg group";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-3">
                    <span class="text-xs px-2.5 py-1 rounded-lg border font-medium ${badgeColor}">${note.category}</span>
                    <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                        <button onclick="editNote(${note.id})" class="text-slate-400 hover:text-white transition p-1"><i class="fa-solid fa-pen text-xs"></i></button>
                        <button onclick="deleteNote(${note.id})" class="text-slate-400 hover:text-red-400 transition p-1"><i class="fa-solid fa-trash text-xs"></i></button>
                    </div>
                </div>
                <h4 class="font-bold text-white text-base mb-2">${escapeHtml(note.title)}</h4>
                <p class="text-slate-400 text-sm line-clamp-3">${escapeHtml(note.content)}</p>
            </div>
            <div class="border-t border-slate-800/60 mt-4 pt-3 flex justify-between items-center text-xs text-slate-500">
                <span><i class="fa-regular fa-clock mr-1"></i>${note.date}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterNotes(category) {
    currentFilter = category;
    
    // Update sidebar styles
    ['all', 'Work', 'Personal', 'Ideas'].forEach(cat => {
        const btn = document.getElementById(`nav-${cat}`);
        if (cat === category) {
            btn.className = "w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition bg-indigo-600 text-white shadow-md shadow-indigo-600/20";
        } else {
            btn.className = "w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition text-slate-400 hover:bg-slate-800 hover:text-white";
        }
    });

    renderNotes();
}

function handleSearch() {
    searchQuery = document.getElementById('search-input').value;
    renderNotes();
}

function openModal(id = null) {
    const modal = document.getElementById('note-modal');
    const modalTitle = document.getElementById('modal-title');
    document.getElementById('note-form').reset();
    document.getElementById('note-id').value = '';

    if (id) {
        modalTitle.innerText = 'Edit Note';
        const note = notes.find(n => n.id === id);
        if (note) {
            document.getElementById('note-id').value = note.id;
            document.getElementById('note-title').value = note.title;
            document.getElementById('note-category').value = note.category;
            document.getElementById('note-content').value = note.content;
        }
    } else {
        modalTitle.innerText = 'Create New Note';
        if(currentFilter !== 'all') {
            document.getElementById('note-category').value = currentFilter;
        }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal() {
    const modal = document.getElementById('note-modal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

function saveNote(e) {
    e.preventDefault();
    const id = document.getElementById('note-id').value;
    const title = document.getElementById('note-title').value;
    const category = document.getElementById('note-category').value;
    const content = document.getElementById('note-content').value;
    
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (id) {
        // Edit existing
        const index = notes.findIndex(n => n.id == id);
        if (index !== -1) {
            notes[index].title = title;
            notes[index].category = category;
            notes[index].content = content;
        }
    } else {
        // Add new
        const newNote = {
            id: Date.now(),
            title,
            category,
            content,
            date: currentDate
        };
        notes.unshift(newNote);
    }

    localStorage.setItem('noteflow_notes', JSON.stringify(notes));
    closeModal();
    renderNotes();
}

function editNote(id) {
    openModal(id);
}

function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(n => n.id !== id);
        localStorage.setItem('noteflow_notes', JSON.stringify(notes));
        renderNotes();
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
