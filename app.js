function goTab(screenId, btn) {

  const tabbar = btn.closest('.tabbar');
  if (!tabbar) return;

  /* ---------- СТРАНИЦЫ ---------- */
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
  }

  /* ---------- СБРОС ВСЕХ КНОПОК ---------- */
  tabbar.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');

    const img = tab.querySelector('img.tabicon');
    if (img) {
      const def = img.getAttribute('data-default');
      if (def) img.src = def;
    }
  });

  /* ---------- АКТИВАЦИЯ ---------- */
  btn.classList.add('active');

  const activeImg = btn.querySelector('img.tabicon');
  if (activeImg) {
    const act = activeImg.getAttribute('data-active');
    if (act) activeImg.src = act;
  }
}

/* ---------- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const tabbar = document.querySelector('.tabbar');
  if (!tabbar) return;

  // ищем кнопку, которая помечена active в HTML
  const activeTab = tabbar.querySelector('.tab.active');

  // если есть — прогоняем через goTab
  if (activeTab) {
    // определяем экран по onclick
    const onclick = activeTab.getAttribute('onclick');
    const match = onclick && onclick.match(/goTab\('(.+?)'/);
    if (match) {
      goTab(match[1], activeTab);
    }
  }
});
