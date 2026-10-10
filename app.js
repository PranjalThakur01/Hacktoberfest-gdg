const navItems = [...document.querySelectorAll('.nav-item[data-view]')];
const crumb = document.querySelector('#crumb');
const input = document.querySelector('#memory-input');
const chat = document.querySelector('#chat-panel');
const toast = document.querySelector('#toast');
const page = document.querySelector('#page-content');
const overviewMarkup = page.innerHTML;
let toastTimer;
const moments = [
  { time: '10:42 AM', category: 'Creative work', app: 'Figma', title: 'Exploring a new onboarding flow', detail: 'Iterating on a calmer first-run experience with a welcome screen, progress indicator, and a softer violet palette.', ago: '3 min ago', color: 'violet' },
  { time: '10:18 AM', category: 'Research', app: 'Arc', title: 'Reading about cognitive design', detail: 'An article about designing interfaces around attention, memory, and how people process information.', ago: '27 min ago', color: 'blue' },
  { time: '9:36 AM', category: 'Development', app: 'VS Code', title: 'Building your memory dashboard', detail: 'Working through the responsive dashboard layout and adding local interactions for search and saved moments.', ago: '1 hr ago', color: 'mint' },
  { time: '9:12 AM', category: 'Communication', app: 'Slack', title: 'Project sync with the design team', detail: 'The team agreed to test the new onboarding direction before the next product review.', ago: '1 hr ago', color: 'amber' },
  { time: '8:48 AM', category: 'Planning', app: 'Notion', title: 'Mapping the week ahead', detail: 'A short planning session: prioritize the dashboard, finish the portfolio review, and leave time for research.', ago: '2 hrs ago', color: 'violet' },
  { time: '8:21 AM', category: 'Research', app: 'Arc', title: 'Comparing local AI models', detail: 'Notes on running multimodal models locally, memory requirements, and keeping personal data on-device.', ago: '2 hrs ago', color: 'blue' }
];
const savedMoments = new Set(JSON.parse(localStorage.getItem('screenmind-saved') || '[]'));

function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
}

function openMemory(question) {
  const query = question.trim();
  if (!query) {
    document.querySelector('#memory-input')?.focus();
    notify('Ask a question about your screen history.');
    return;
  }
  const matches = moments.filter(moment => `${moment.title} ${moment.detail} ${moment.app} ${moment.category}`.toLowerCase().includes(query.toLowerCase().replace(/[?.,]/g, '')));
  document.querySelector('#chat-title').textContent = matches.length ? `I found ${matches.length} ${matches.length === 1 ? 'moment' : 'moments'}.` : 'Your memory is ready.';
  document.querySelector('#chat-answer').textContent = matches.length ? `These moments match “${query}” in your local screen history.` : `No exact match for “${query}” yet. Try searching for Figma, research, planning, or design.`;
  const result = matches[0] || moments[0];
  document.querySelector('.chat-result b').textContent = `${result.time} · ${result.app}`;
  document.querySelector('.chat-result small').textContent = result.title;
  chat.classList.add('open');
  if (document.querySelector('#memory-input')) document.querySelector('#memory-input').value = '';
}

document.querySelector('#chat-close').addEventListener('click', () => chat.classList.remove('open'));

function changeView(view) {
  const names = { overview: 'Overview', timeline: 'Timeline', search: 'Search memory', insights: 'Insights' };
  navItems.forEach(item => item.classList.toggle('active', item.dataset.view === view));
  crumb.textContent = names[view] || 'Overview';
  if (view === 'overview') page.innerHTML = overviewMarkup;
  if (view === 'timeline') renderTimeline();
  if (view === 'search') renderSearch();
  if (view === 'insights') renderInsights();
  bindPageActions();
}
navItems.forEach(item => item.addEventListener('click', () => changeView(item.dataset.view)));
function renderTimeline(filter = 'All moments') {
  const visible = filter === 'Saved moments' ? moments.filter(moment => savedMoments.has(moment.title)) : moments;
  page.innerHTML = `<div class="welcome-row"><div><div class="eyebrow">FRIDAY, OCTOBER 10, 2026</div><h1>Your timeline<span>.</span></h1><p class="intro">A searchable trail of the moments that made up your day.</p></div><button class="date-button">Today <span>⌄</span></button></div><div class="timeline-toolbar panel"><div class="timeline-filters"><button class="filter-pill ${filter === 'All moments' ? 'selected' : ''}" data-filter="All moments">All moments <span>${moments.length}</span></button><button class="filter-pill ${filter === 'Saved moments' ? 'selected' : ''}" data-filter="Saved moments">♡ Saved <span>${savedMoments.size}</span></button></div><button class="text-link" data-go="search">⌕ Search your day</button></div><div class="timeline-list">${visible.length ? visible.map(moment => `<article class="timeline-row panel"><div class="timeline-time">${moment.time}<i></i></div><div class="timeline-marker ${moment.color}"></div><div class="timeline-moment"><div class="moment-meta"><span class="app-badge ${moment.color}">${moment.app.slice(0,1)}</span><span>${moment.app}</span><b>·</b><span>${moment.category}</span></div><h3>${moment.title}</h3><p>${moment.detail}</p></div><button class="bookmark ${savedMoments.has(moment.title) ? 'saved' : ''}" data-save="${moment.title}" aria-label="Save moment">${savedMoments.has(moment.title) ? '♥' : '♡'}</button></article>`).join('') : '<div class="empty-state panel"><span>♡</span><h3>No saved moments yet</h3><p>Save a moment from your timeline to find it here.</p></div>'}</div><footer class="page-footer"><span>6 moments captured today</span><span><i></i> Stored locally on this device</span></footer>`;
}

function renderSearch(value = '') {
  const hits = value ? moments.filter(moment => `${moment.title} ${moment.detail} ${moment.app} ${moment.category}`.toLowerCase().includes(value.toLowerCase())) : moments;
  page.innerHTML = `<div class="eyebrow">YOUR PERSONAL MEMORY</div><h1 class="view-title">Find that <span>moment.</span></h1><p class="intro view-intro">Search by app, topic, or something you remember seeing.</p><label class="full-search panel"><span>⌕</span><input id="full-search-input" value="${escapeHtml(value)}" placeholder="Try ‘Figma onboarding’ or ‘that article about focus’…" autofocus><kbd>↵</kbd></label><div class="search-hint"><span>Try a search</span>${['Figma', 'Design research', 'Planning', 'Local AI'].map(term => `<button class="search-chip" data-query="${term}">${term}</button>`).join('')}</div><div class="section-heading search-results-heading"><div><span class="section-kicker">${value ? `${hits.length} MATCHING MOMENTS` : 'RECENT MOMENTS'}</span><h2>${value ? `Results for “${escapeHtml(value)}”` : 'Your recent history'}</h2></div></div><div class="timeline-list">${hits.length ? hits.map(moment => `<article class="timeline-row panel"><div class="timeline-time">${moment.time}<i></i></div><div class="timeline-marker ${moment.color}"></div><div class="timeline-moment"><div class="moment-meta"><span class="app-badge ${moment.color}">${moment.app.slice(0,1)}</span><span>${moment.app}</span><b>·</b><span>${moment.category}</span></div><h3>${moment.title}</h3><p>${moment.detail}</p></div><button class="bookmark ${savedMoments.has(moment.title) ? 'saved' : ''}" data-save="${moment.title}">${savedMoments.has(moment.title) ? '♥' : '♡'}</button></article>`).join('') : '<div class="empty-state panel"><span>⌕</span><h3>No moments found</h3><p>Try a broader search, like “design” or “research”.</p></div>'}</div>`;
  const searchInput = document.querySelector('#full-search-input');
  searchInput.addEventListener('input', event => renderSearch(event.target.value));
  searchInput.focus();
  searchInput.setSelectionRange(value.length, value.length);
}

function renderInsights() {
  page.innerHTML = `<div class="welcome-row"><div><div class="eyebrow">YOUR WEEK IN FOCUS</div><h1>Make space for<br/><span>what matters.</span></h1><p class="intro">A gentle read on how your attention moved this week.</p></div><button class="date-button">This week <span>⌄</span></button></div><div class="insights-grid"><article class="insight-card panel"><span class="section-kicker">FOCUS TIME</span><div class="insight-number">18h 42m <small>↗ 12%</small></div><p>You've made more room for focused work than last week.</p><div class="week-bars">${[49,68,45,84,72,34,23].map((n,i)=>`<div><i style="height:${n}%"></i><span>${['M','T','W','T','F','S','S'][i]}</span></div>`).join('')}</div></article><article class="insight-card panel"><span class="section-kicker">WHERE YOUR TIME WENT</span><div class="donut-wrap"><div class="donut"><span>6h 24m<small>today</small></span></div><div class="donut-legend"><span><i class="legend-purple"></i>Creative work <b>42%</b></span><span><i class="legend-blue"></i>Productive <b>31%</b></span><span><i class="legend-gray"></i>Communication <b>17%</b></span><span><i class="legend-dark"></i>Other <b>10%</b></span></div></div></article></div><div class="section-heading"><div><span class="section-kicker">A SMALL OBSERVATION</span><h2>Your attention has a rhythm</h2></div></div><article class="observation panel"><div class="obs-icon">✳</div><div><h3>Your clearest stretch was 9–11 AM.</h3><p>You spent 1h 42m in uninterrupted creative work. That’s a great window to protect for the work that needs your full attention.</p></div><span class="obs-badge">A GOOD RHYTHM</span></article><div class="insight-bottom"><span>Insights are generated on this device from your screen activity.</span><button class="text-link" data-go="timeline">Explore your timeline ↗</button></div>`;
}

function escapeHtml(text) { return text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }

function bindPageActions() {
  page.querySelectorAll('[data-go]').forEach(button => button.onclick = () => changeView(button.dataset.go));
  page.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => renderTimeline(button.dataset.filter));
  page.querySelectorAll('[data-query]').forEach(button => button.onclick = () => renderSearch(button.dataset.query));
  page.querySelectorAll('[data-save]').forEach(button => button.onclick = () => {
    const title = button.dataset.save;
    savedMoments.has(title) ? savedMoments.delete(title) : savedMoments.add(title);
    localStorage.setItem('screenmind-saved', JSON.stringify([...savedMoments]));
    const view = navItems.find(item => item.classList.contains('active'))?.dataset.view;
    if (view === 'timeline') renderTimeline(document.querySelector('[data-filter].selected')?.dataset.filter || 'All moments');
    else if (view === 'search') renderSearch(document.querySelector('#full-search-input')?.value || '');
    else bindPageActions();
    notify(savedMoments.has(title) ? 'Moment saved to Saved moments' : 'Moment removed from Saved moments');
  });
  page.querySelectorAll('.moment-card').forEach(card => card.onclick = () => notify('Moment details are ready to explore.'));
  page.querySelectorAll('.bookmark:not([data-save])').forEach(button => button.onclick = event => {
    event.stopPropagation(); const title = button.closest('.moment-card')?.querySelector('h3')?.textContent || moments[0].title;
    savedMoments.has(title) ? savedMoments.delete(title) : savedMoments.add(title);
    localStorage.setItem('screenmind-saved', JSON.stringify([...savedMoments]));
    button.classList.toggle('saved', savedMoments.has(title)); button.textContent = savedMoments.has(title) ? '♥' : '♡';
    notify(savedMoments.has(title) ? 'Moment saved to Saved moments' : 'Moment removed from Saved moments');
  });
  const ask = page.querySelector('#ask-button');
  if (ask) ask.onclick = () => openMemory(page.querySelector('#memory-input').value);
  const memoryInput = page.querySelector('#memory-input');
  if (memoryInput) memoryInput.onkeydown = event => { if (event.key === 'Enter') openMemory(memoryInput.value); };
  page.querySelectorAll('.suggestion').forEach(button => button.onclick = () => openMemory(button.textContent));
}
bindPageActions();
document.querySelector('.date-button').addEventListener('click', () => notify('Showing Friday, October 10, 2026'));
document.querySelector('.help-button').addEventListener('click', () => notify('ScreenMind keeps your screen history on this device.'));
document.querySelector('.icon-button').addEventListener('click', () => notify('Collections help you group saved moments.'));
document.querySelector('.profile').addEventListener('click', () => notify('Personal workspace'));

document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    changeView('search');
  }
  if (event.key === 'Escape') chat.classList.remove('open');
});
