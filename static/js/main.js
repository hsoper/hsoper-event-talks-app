let allNotes = [];
let selectedNoteId = null;
let selectedCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchReleaseNotes();

    const refreshBtn = document.getElementById('refreshBtn');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const tweetTextarea = document.getElementById('tweetTextarea');
    const tweetSubmitBtn = document.getElementById('tweetSubmitBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const chipBtns = document.querySelectorAll('.chip-btn');

    refreshBtn.addEventListener('click', () => {
        fetchReleaseNotes();
    });

    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        clearSearchBtn.style.display = val.trim() ? 'flex' : 'none';
        filterNotes();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        filterNotes();
        searchInput.focus();
    });

    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chipBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCategory = btn.getAttribute('data-chip');
            filterNotes();
        });
    });

    tweetTextarea.addEventListener('input', () => {
        updateCharCount();
    });

    tweetSubmitBtn.addEventListener('click', () => {
        openTwitterIntent();
    });

    themeToggleBtn.addEventListener('click', () => {
        toggleTheme();
    });
});

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    if (theme === 'light') {
        // Moon icon for switching back to dark
        icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    } else {
        // Sun icon for switching to light
        icon.innerHTML = `
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
    }
}

async function fetchReleaseNotes() {
    const refreshBtn = document.getElementById('refreshBtn');
    const notesContainer = document.getElementById('notesContainer');
    const feedMeta = document.getElementById('feedMeta');
    
    refreshBtn.classList.add('spinning');
    refreshBtn.disabled = true;

    // Show skeletons if empty
    if (allNotes.length === 0) {
        renderSkeletons();
    }

    try {
        const response = await fetch('/api/notes');
        const data = await response.json();

        if (data.status === 'success') {
            allNotes = data.notes;
            filterNotes();
            
            // Auto select the first note if none selected
            if (allNotes.length > 0 && !selectedNoteId) {
                selectNoteForTweet(allNotes[0].id);
            }
        } else {
            notesContainer.innerHTML = `<div class="empty-state">Failed to load release notes: ${data.message}</div>`;
        }
    } catch (err) {
        notesContainer.innerHTML = `<div class="empty-state">Network error while fetching release notes.</div>`;
    } finally {
        refreshBtn.classList.remove('spinning');
        refreshBtn.disabled = false;
    }
}

function renderSkeletons() {
    const notesContainer = document.getElementById('notesContainer');
    notesContainer.innerHTML = Array(3).fill(0).map(() => `
        <div class="note-card" style="height: 140px;">
            <div class="skeleton" style="width: 30%; height: 20px; margin-bottom: 12px;"></div>
            <div class="skeleton" style="width: 90%; height: 16px; margin-bottom: 8px;"></div>
            <div class="skeleton" style="width: 70%; height: 16px;"></div>
        </div>
    `).join('');
}

function renderNotes(notes) {
    const notesContainer = document.getElementById('notesContainer');

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--text-primary);">No release notes found</p>
                <p style="margin-bottom: 1rem;">Try adjusting your keyword search or category filter.</p>
                <button onclick="resetFilters()" class="action-btn" style="margin: 0 auto; display: inline-flex;">Reset Filters</button>
            </div>
        `;
        return;
    }

    notesContainer.innerHTML = notes.map(note => {
        const isSelected = note.id === selectedNoteId;
        return `
            <div class="note-card ${isSelected ? 'selected' : ''}" id="card-${note.id}" onclick="selectNoteForTweet('${note.id}')">
                <div class="note-card-header">
                    <span class="note-date">${note.title}</span>
                    <div class="note-actions">
                        <button class="action-btn tweet-card-btn" onclick="event.stopPropagation(); selectNoteForTweet('${note.id}'); openTwitterIntent();">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            Tweet
                        </button>
                        <a href="${note.link}" target="_blank" class="action-btn" onclick="event.stopPropagation();">
                            Docs ↗
                        </a>
                    </div>
                </div>
                <div class="note-content">
                    ${note.content_html}
                </div>
            </div>
        `;
    }).join('');
}

function filterNotes() {
    const searchInput = document.getElementById('searchInput');
    const feedMeta = document.getElementById('feedMeta');
    const q = searchInput.value.toLowerCase().trim();

    let filtered = allNotes;

    // Filter by Category Chip
    if (selectedCategory !== 'all') {
        const categoryKeywords = {
            'SQL': ['sql', 'function', 'query', 'operator', 'select', 'table'],
            'BigLake': ['biglake', 'iceberg', 'delta', 'parquet', 'hudi', 'lake'],
            'Spark': ['spark', 'dataproc', 'pyspark', 'jar'],
            'Storage': ['storage', 'load', 'gcs', 'export', 'import', 'write', 'read'],
            'Security': ['security', 'governance', 'iam', 'kms', 'masking', 'policy', 'role', 'permission', 'row-level'],
            'Performance': ['performance', 'optimize', 'index', 'partition', 'cluster', 'slot', 'speed']
        };

        const keywords = categoryKeywords[selectedCategory] || [selectedCategory.toLowerCase()];
        filtered = filtered.filter(note => {
            const text = (note.title + ' ' + note.clean_text).toLowerCase();
            return keywords.some(kw => text.includes(kw));
        });
    }

    // Filter by Search Query
    if (q) {
        filtered = filtered.filter(note => {
            return note.title.toLowerCase().includes(q) || 
                   note.clean_text.toLowerCase().includes(q);
        });
    }

    feedMeta.textContent = `Showing ${filtered.length} of ${allNotes.length} updates`;
    renderNotes(filtered);
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const chipBtns = document.querySelectorAll('.chip-btn');

    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    selectedCategory = 'all';

    chipBtns.forEach(b => {
        if (b.getAttribute('data-chip') === 'all') {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    filterNotes();
}

function selectNoteForTweet(noteId) {
    selectedNoteId = noteId;

    // Highlight card
    document.querySelectorAll('.note-card').forEach(card => {
        card.classList.remove('selected');
    });
    const selectedCard = document.getElementById(`card-${noteId}`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }

    const note = allNotes.find(n => n.id === noteId);
    if (!note) return;

    // Populate Info & Textarea
    const selectedInfo = document.getElementById('selectedInfo');
    selectedInfo.textContent = `Selected: ${note.title}`;

    // Craft default tweet text
    let tweetDraft = `🚨 BigQuery Update (${note.title}):\n\n`;
    
    // Take first 160 chars of clean text
    let textSnippet = note.clean_text;
    if (textSnippet.length > 160) {
        textSnippet = textSnippet.substring(0, 157) + '...';
    }

    tweetDraft += `${textSnippet}\n\nRead details: ${note.link}\n#BigQuery #GoogleCloud #DataEngineering`;

    const tweetTextarea = document.getElementById('tweetTextarea');
    tweetTextarea.value = tweetDraft;
    updateCharCount();
}

function updateCharCount() {
    const textarea = document.getElementById('tweetTextarea');
    const charCountEl = document.getElementById('charCount');
    const len = textarea.value.length;

    charCountEl.textContent = `${len}/280`;

    if (len > 280) {
        charCountEl.classList.add('over');
    } else {
        charCountEl.classList.remove('over');
    }
}

function openTwitterIntent() {
    const textarea = document.getElementById('tweetTextarea');
    const text = textarea.value;
    if (!text.trim()) return;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
}
