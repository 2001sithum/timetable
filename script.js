const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const STORAGE_KEY = 'timetable-entries-v1';
const initialEntries = [
  { id: crypto.randomUUID(), name: 'Mathematics', day: 'Monday', start: '09:00', end: '10:00', location: 'Room 204', color: 'blue' },
  { id: crypto.randomUUID(), name: 'Design studio', day: 'Tuesday', start: '11:00', end: '12:30', location: 'Creative lab', color: 'purple' },
  { id: crypto.randomUUID(), name: 'Computer science', day: 'Wednesday', start: '09:30', end: '11:00', location: 'Lab 3', color: 'green' },
  { id: crypto.randomUUID(), name: 'Physics', day: 'Thursday', start: '14:00', end: '15:00', location: 'Room 108', color: 'orange' },
  { id: crypto.randomUUID(), name: 'Study group', day: 'Friday', start: '10:00', end: '11:00', location: 'Library', color: 'pink' }
];
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || initialEntries;
let weekOffset = 0;
const $ = (id) => document.getElementById(id);
const dialog = $('classDialog');

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
function dayDate(dayIndex) { const date = new Date(); date.setHours(0,0,0,0); date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + dayIndex + weekOffset * 7); return date; }
function formatTime(time) { return new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour:'numeric', minute:'2-digit' }); }
function render() {
  const timetable = $('timetable');
  timetable.innerHTML = DAYS.map((day, index) => {
    const date = dayDate(index); const today = weekOffset === 0 && date.toDateString() === new Date().toDateString();
    const dayEntries = entries.filter((entry) => entry.day === day).sort((a,b) => a.start.localeCompare(b.start));
    return `<section class="day-column"><header class="day-head ${today ? 'today' : ''}"><div class="name">${day.slice(0,3)}</div><div class="date">${date.getDate()}</div></header><div class="day-items">${dayEntries.length ? dayEntries.map(card).join('') : '<div class="empty-day">—</div>'}</div></section>`;
  }).join('');
  $('emptyState').hidden = entries.length > 0; timetable.hidden = entries.length === 0;
  const start = dayDate(0); const end = dayDate(6); const sameMonth = start.getMonth() === end.getMonth();
  $('weekLabel').textContent = weekOffset === 0 ? 'This week' : `${start.toLocaleDateString([], {month:'short',day:'numeric'})} – ${end.toLocaleDateString([], {month:sameMonth ? undefined : 'short',day:'numeric'})}`;
  $('classCount').textContent = entries.length; $('hourCount').textContent = `${Math.round(entries.reduce((sum,e) => sum + (minutes(e.end)-minutes(e.start)),0)/60 * 10)/10}h`;
  const next = entries.slice().sort((a,b) => a.start.localeCompare(b.start))[0]; $('nextClass').textContent = next ? next.name : '—';
}
function card(entry) { return `<article class="class-card ${entry.color}" data-id="${entry.id}" tabindex="0"><div class="class-name">${escapeHtml(entry.name)}</div><div class="class-time">${formatTime(entry.start)} – ${formatTime(entry.end)}</div>${entry.location ? `<div class="class-location">${escapeHtml(entry.location)}</div>` : ''}</article>`; }
function minutes(value) { const [hours, mins] = value.split(':').map(Number); return hours * 60 + mins; }
function escapeHtml(value) { return value.replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function openDialog(entry) { $('entryId').value = entry?.id || ''; $('dialogTitle').textContent = entry ? 'Edit class' : 'Add a class'; $('name').value = entry?.name || ''; $('day').value = entry?.day || 'Monday'; $('start').value = entry?.start || '09:00'; $('end').value = entry?.end || '10:00'; $('location').value = entry?.location || ''; $('color').value = entry?.color || 'blue'; dialog.showModal(); }
$('addButton').addEventListener('click', () => openDialog()); $('emptyAddButton').addEventListener('click', () => openDialog());
$('previousWeek').addEventListener('click', () => { weekOffset--; render(); }); $('nextWeek').addEventListener('click', () => { weekOffset++; render(); }); $('todayButton').addEventListener('click', () => { weekOffset = 0; render(); });
$('clearButton').addEventListener('click', () => { if (entries.length && confirm('Clear every class from your timetable?')) { entries = []; save(); render(); } });
$('timetable').addEventListener('click', (event) => { const cardElement = event.target.closest('.class-card'); if (cardElement) openDialog(entries.find((entry) => entry.id === cardElement.dataset.id)); });
$('classForm').addEventListener('submit', (event) => { event.preventDefault(); const entry = { id: $('entryId').value || crypto.randomUUID(), name: $('name').value.trim(), day: $('day').value, start: $('start').value, end: $('end').value, location: $('location').value.trim(), color: $('color').value }; if (minutes(entry.end) <= minutes(entry.start)) { alert('End time must be after start time.'); return; } const index = entries.findIndex((item) => item.id === entry.id); if (index >= 0) entries[index] = entry; else entries.push(entry); save(); dialog.close(); render(); });
render();
