/* ================== TABS ================== */
function goTab(screenId, btn) {
  const tabbar = btn.closest('.tabbar');
  if (!tabbar) return;

  // screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');

  // reset all tabs + icons
  tabbar.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
    const img = tab.querySelector('img.tabicon');
    if (img) {
      const def = img.getAttribute('data-default');
      if (def) img.src = def;
    }
  });

  // activate
  btn.classList.add('active');
  const activeImg = btn.querySelector('img.tabicon');
  if (activeImg) {
    const act = activeImg.getAttribute('data-active');
    if (act) activeImg.src = act;
  }
}

// helper: перейти на таб по id (для кнопки "назад")
function goToTab(screenId){
  const tabBtn = document.querySelector(`.tabbar .tab[onclick*="goTab('${screenId}'"]`);
  if (tabBtn) goTab(screenId, tabBtn);
}

/* ================== TELEGRAM AVATAR ================== */
function initTelegramAvatar(){
  const avatarContainer = document.getElementById('profileAvatar');
  if (!avatarContainer) return;

  const tg = window.Telegram && window.Telegram.WebApp;
  if (!tg) return; // в браузере просто останутся инициалы

  try{
    tg.ready && tg.ready();

    const user = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (!user) return;

    if (user.photo_url) {
      avatarContainer.innerHTML = `<img src="${user.photo_url}" alt="Avatar">`;
    } else {
      const initials =
        (user.first_name?.[0] || '') +
        (user.last_name?.[0] || '');
      avatarContainer.textContent = initials.toUpperCase() || 'ME';
    }
  }catch(e){
    // молча
  }
}

/* ================== FAVORITES ================== */
const LS_KEY = 'mestigo:favorites';

const RESTAURANTS = {
  sunset: { id:'sunset', name:'SUNSET RESTAURANT', time:'25–30 мин', rate:'4.7' },
  bbq:    { id:'bbq',    name:'BBQ GARDEN',        time:'25–30 мин', rate:'4.5' },
  kubdari:{ id:'kubdari',name:'DOM KUBDARI',       time:'25–30 мин', rate:'4.9' },
  laila:  { id:'laila',  name:'CAFE LAILA',        time:'25–30 мин', rate:'4.8' },
  ushba:  { id:'ushba',  name:'CAFE USHBA',        time:'25–30 мин', rate:'4.6' }
};

function loadFavs(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  }catch{
    return new Set();
  }
}

function saveFavs(set){
  localStorage.setItem(LS_KEY, JSON.stringify(Array.from(set)));
}

function setHeartUI(id, isActive){
  document.querySelectorAll(`.fav-btn[data-id="${id}"]`).forEach(btn=>{
    btn.classList.toggle('active', isActive);
  });
}

function toggleFavorite(id){
  const favs = loadFavs();
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);

  saveFavs(favs);
  setHeartUI(id, favs.has(id));
  renderFavorites();
}

function bindHearts(){
  document.querySelectorAll('.fav-btn[data-id]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (id) toggleFavorite(id);
    });
  });
}

function applyFavsToUI(){
  const favs = loadFavs();
  Object.keys(RESTAURANTS).forEach(id=>{
    setHeartUI(id, favs.has(id));
  });
}

function buildFavCard(data){
  const card = document.createElement('article');
  card.className = 'rest-card searchable';
  card.dataset.search = (data.name || '').toLowerCase();

  card.innerHTML = `
    <div class="rest-media placeholder"></div>
    <button class="fav-btn active" type="button" aria-label="В избранное" data-id="${data.id}">♥</button>
    <div class="rest-bottom">
      <div class="rest-name">${data.name}</div>
      <div class="rest-row">
        <span class="time">${data.time}</span>
        <span class="rate">★ ${data.rate}</span>
      </div>
    </div>
  `;
  return card;
}

function renderFavorites(){
  const list = document.getElementById('favoritesList');
  const empty = document.getElementById('favoritesEmpty');
  if (!list || !empty) return;

  const favs = loadFavs();
  list.innerHTML = '';

  if (favs.size === 0){
    empty.hidden = false;
    list.style.display = 'none';
    return;
  }

  empty.hidden = true;
  list.style.display = 'flex';

  favs.forEach(id=>{
    const data = RESTAURANTS[id];
    if (!data) return;
    list.appendChild(buildFavCard(data));
  });

  // заново биндим кнопки на динамических карточках
  bindHearts();
}

/* ================== SEARCH ================== */
function initHomeSearch(){
  const input = document.getElementById('homeSearchInput');
  const btn = document.getElementById('homeSearchBtn');
  const empty = document.getElementById('homeSearchEmpty');
  if (!input || !btn) return;

  const targets = () => Array.from(document.querySelectorAll('#home .searchable'));

  function apply(){
    const q = (input.value || '').trim().toLowerCase();
    let shown = 0;

    targets().forEach(el=>{
      const hay = (el.dataset.search || el.textContent || '').toLowerCase();
      const ok = !q || hay.includes(q);
      el.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });

    if (empty) empty.hidden = shown !== 0;
  }

  btn.addEventListener('click', apply);
  input.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter'){ e.preventDefault(); apply(); }
  });
  input.addEventListener('input', ()=>{
    if (!input.value.trim()) apply();
  });
}

function initFavSearch(){
  const input = document.getElementById('favSearchInput');
  const btn = document.getElementById('favSearchBtn');
  const empty = document.getElementById('favSearchEmpty');
  if (!input || !btn) return;

  function apply(){
    const q = (input.value || '').trim().toLowerCase();
    const list = document.getElementById('favoritesList');
    if (!list) return;

    const cards = Array.from(list.querySelectorAll('.searchable'));
    let shown = 0;

    cards.forEach(card=>{
      const hay = (card.dataset.search || card.textContent || '').toLowerCase();
      const ok = !q || hay.includes(q);
      card.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });

    if (empty) empty.hidden = shown !== 0;
  }

  btn.addEventListener('click', apply);
  input.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter'){ e.preventDefault(); apply(); }
  });
  input.addEventListener('input', ()=>{
    if (!input.value.trim()) apply();
  });
}

/* ================== INIT ================== */
document.addEventListener('DOMContentLoaded', () => {
  // init active tab from HTML
  const tabbar = document.querySelector('.tabbar');
  if (tabbar) {
    const activeTab = tabbar.querySelector('.tab.active');
    if (activeTab) {
      const onclick = activeTab.getAttribute('onclick');
      const match = onclick && onclick.match(/goTab\('(.+?)'/);
      if (match) goTab(match[1], activeTab);
    }
  }

  initTelegramAvatar();

  // favorites
  bindHearts();
  applyFavsToUI();
  renderFavorites();

  // search
  initHomeSearch();
  initFavSearch();
});
