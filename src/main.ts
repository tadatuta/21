import './telegram-mock';
import './styles/base.css';
import './styles/components.css';
import './styles/profile.css';
import './components/navigation/navigation.css';
import { storage, SyncStatus } from './storage/storage';
import { WorkoutSet, PublicProfileData } from './types';

const WEBAPP = (window as any).Telegram?.WebApp;

if (WEBAPP) {
  WEBAPP.ready();
  WEBAPP.expand();
}

type Page = 'main' | 'stats' | 'settings' | 'profile-settings' | 'public-profile';
let currentPage: Page = 'main';
let selectedStatType = 'all';
let editingLogId: string | null = null;
let viewingProfileIdentifier: string | null = null;
let loadedPublicProfile: PublicProfileData | null = null;
let profileLoadFailed = false;

function navigate(page: Page) {
  currentPage = page;
  render();
}

// Toast notification
let toastTimeout: ReturnType<typeof setTimeout> | null = null;
function showToast(message: string) {
  let toastEl = document.querySelector('.toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl?.classList.remove('visible');
  }, 2000);
}

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <main class="content">
      ${renderPage()}
    </main>
    <nav class="navigation">
      <button class="navigation__item ${currentPage === 'main' ? 'navigation__item_active' : ''}" data-page="main">
        <span class="navigation__icon">🏋️</span>
        <span class="navigation__label">Тренировка</span>
      </button>
      <button class="navigation__item ${currentPage === 'stats' ? 'navigation__item_active' : ''}" data-page="stats">
        <span class="navigation__icon">📊</span>
        <span class="navigation__label">Статистика</span>
      </button>
      <button class="navigation__item ${currentPage === 'profile-settings' ? 'navigation__item_active' : ''}" data-page="profile-settings">
        <span class="navigation__icon">👤</span>
        <span class="navigation__label">Профиль</span>
      </button>
      <button class="navigation__item ${currentPage === 'settings' ? 'navigation__item_active' : ''}" data-page="settings">
        <span class="navigation__icon">⚙️</span>
        <span class="navigation__label">Настройки</span>
      </button>
    </nav>
  `;

  // Bind events
  app.querySelectorAll('.navigation__item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page') as Page;
      navigate(page);
    });
  });

  bindPageEvents();
}

function renderPage() {
  switch (currentPage) {
    case 'main':
      return renderMainPage();
    case 'stats':
      return renderStatsPage();
    case 'settings':
      return renderSettingsPage();
    case 'profile-settings':
      return renderProfileSettingsPage();
    case 'public-profile':
      return renderPublicProfilePage();
    default:
      return '';
  }
}


function renderMainPage() {
  const types = storage.getWorkoutTypes();
  const logs = storage.getLogs();
  const lastLog = logs[logs.length - 1];
  const lastTypeId = lastLog?.workoutTypeId;

  const editingLog = editingLogId ? logs.find(l => l.id === editingLogId) : null;

  return `
    <div class="page-content" id="main-content">
      <h1 class="title">${editingLogId ? 'Редактирование подхода' : 'Новый подход'}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${types.map(t => `<option value="${t.id}" ${(editingLogId ? (editingLog && t.id === editingLog.workoutTypeId) : (t.id === lastTypeId)) ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${editingLogId && editingLog ? editingLog.weight : ''}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${editingLogId && editingLog ? editingLog.reps : ''}">
          </div>
        </div>
        <button class="button" type="submit">${editingLogId ? 'Сохранить изменения' : 'Зафиксировать'}</button>
        ${editingLogId ? `<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>` : ''}
        ${!editingLogId && lastLog ? `<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${types.find(t => t.id === lastLog.workoutTypeId)?.name} ${lastLog.weight}кг × ${lastLog.reps}</button>` : ''}
      </form>
      <div class="recent-logs">
        <h2 class="subtitle">Последние записи</h2>
        <div id="logs-list">
          ${renderLogsList()}
        </div>
      </div>
    </div>
  `;
}

function renderLogsList() {
  const allLogs = storage.getLogs();
  const types = storage.getWorkoutTypes();

  if (allLogs.length === 0) return '<p class="hint">Пока нет записей</p>';

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  weekAgo.setHours(0, 0, 0, 0);

  const weekLogs = allLogs.filter(log => new Date(log.date) >= weekAgo);

  if (weekLogs.length === 0) return '<p class="hint">За последнюю неделю записей нет</p>';

  // Group by day
  const groupsByDay: Map<string, WorkoutSet[]> = new Map();
  // Sort logs by date descending
  [...weekLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(log => {
    const d = new Date(log.date);
    const dateKey = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groupsByDay.has(dateKey)) groupsByDay.set(dateKey, []);
    groupsByDay.get(dateKey)!.push(log);
  });

  let html = '';
  groupsByDay.forEach((dayLogs, dateLabel) => {
    const dayDateStr = dayLogs[0]?.date.split('T')[0] || '';
    html += `<div class="log-day">`;
    html += `<div class="log-day__header">
      <span>${dateLabel}</span>
      <button class="share-btn" data-date="${dayDateStr}" title="Поделиться">📤</button>
    </div>`;

    // Group by exercise within day (latest exercise group first)
    const exerciseGroups: Map<string, WorkoutSet[]> = new Map();
    dayLogs.forEach(log => {
      if (!exerciseGroups.has(log.workoutTypeId)) {
        exerciseGroups.set(log.workoutTypeId, []);
      }
      exerciseGroups.get(log.workoutTypeId)!.push(log);
    });

    exerciseGroups.forEach((sets, typeId) => {
      const type = types.find(t => t.id === typeId);
      html += `
        <div class="log-exercise">
          <div class="log-exercise__name">${type?.name || 'Удалено'}</div>
          <div class="log-exercise__sets">
            ${sets.map(set => `
              <div class="log-set ${set.id === editingLogId ? 'log-set_active-edit' : ''}">
                <div class="log-set__info">
                  <span class="log-set__weight">${set.weight} кг</span>
                  <span class="log-set__times">×</span>
                  <span class="log-set__reps">${set.reps}</span>
                </div>
                <div class="log-set__actions">
                  <button class="log-set__edit" data-id="${set.id}">✏️</button>
                  <button class="log-set__delete" data-id="${set.id}">×</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    html += `</div>`;
  });

  return html;
}

function renderSettingsPage() {
  const types = storage.getWorkoutTypes();
  return `
    <div class="page-content">
      <h1 class="title">Настройки</h1>
      <div class="settings-section">
        <h2 class="subtitle">Типы тренировок</h2>
        <div class="type-list">
          ${types.map(t => `
            <div class="type-item">
              <span>${t.name}</span>
              <button class="type-item__delete" data-id="${t.id}">Удалить</button>
            </div>
          `).join('')}
        </div>
        <form class="add-type-form" id="add-type-form">
          <input class="input" type="text" id="new-type-name" placeholder="Название (напр. Жим гантелей)" required>
          <button class="button button_secondary" type="submit">Добавить</button>
        </form>
      </div>
    </div>
  `;
}

function renderProfileSettingsPage() {
  const profile = storage.getProfile();
  const isPublic = profile?.isPublic ?? false;
  const displayName = profile?.displayName || WEBAPP?.initDataUnsafe?.user?.first_name || '';
  const identifier = storage.getProfileIdentifier();
  const profileUrl = identifier ? `https://t.me/gymgym21bot/app?startapp=profile_${identifier}` : '';

  // Calculate stats for preview
  const logs = storage.getLogs();
  const totalVolume = logs.reduce((acc, l) => acc + (l.weight * l.reps), 0);
  const uniqueDays = new Set(logs.map(l => l.date.split('T')[0])).size;

  return `
    <div class="page-content profile-page">
      <h1 class="title">Профиль</h1>
      
      <div class="profile-header">
        <div class="profile-avatar">
          ${profile?.photoUrl ? `<img src="${profile.photoUrl}" alt="${displayName}" class="profile-avatar-img">` : displayName.charAt(0).toUpperCase()}
        </div>
        <div class="profile-name">${displayName}</div>
        <div class="profile-subtitle">${isPublic ? 'Публичный профиль' : 'Приватный профиль'}</div>
      </div>

      <div class="profile-settings">
        <div class="settings-section">
          <div class="settings-section-title">Видимость</div>
          <div class="toggle-row">
            <div class="toggle-label">
              <span class="toggle-label-text">Публичный профиль</span>
              <span class="toggle-label-hint">Другие смогут видеть вашу статистику</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="profile-public-toggle" ${isPublic ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section-title">Имя</div>
          <input class="input" type="text" id="profile-display-name" value="${displayName}" placeholder="Ваше имя">
        </div>

        ${isPublic && identifier ? `
          <div class="settings-section">
            <div class="settings-section-title">Ссылка на профиль</div>
            <div class="profile-link-section">
              <a href="${profileUrl}" target="_blank" class="profile-link-url">${profileUrl}</a>
              <div class="profile-link-actions">
                <button class="button button_secondary" id="copy-profile-link">Копировать</button>
                <button class="button" id="share-profile-link">Поделиться</button>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="settings-section">
          <div class="settings-section-title">Превью статистики</div>
          <div class="profile-stats">
            <div class="stat-card">
              <div class="stat-value">${uniqueDays}</div>
              <div class="stat-label">Тренировок</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${Math.round(totalVolume / 1000)}т</div>
              <div class="stat-label">Общий объём</div>
            </div>
          </div>
        </div>

        <button class="button" id="save-profile-btn">Сохранить</button>
      </div>
    </div>
  `;
}

function renderPublicProfilePage() {
  if (!viewingProfileIdentifier) {
    return `
      <div class="page-content">
        <div class="profile-not-found">
          <div class="profile-not-found-icon">🔍</div>
          <div class="profile-not-found-text">Профиль не найден</div>
        </div>
      </div>
    `;
  }

  if (!loadedPublicProfile) {
    if (profileLoadFailed) {
      return `
        <div class="page-content">
          <div class="profile-not-found">
            <div class="profile-not-found-icon">🔒</div>
            <div class="profile-not-found-text">Профиль скрыт или не существует</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="page-content">
        <div class="profile-loading">Загрузка профиля...</div>
      </div>
    `;
  }

  const profile = loadedPublicProfile;
  return `
    <div class="page-content profile-page">
      <div class="profile-header">
        <div class="profile-avatar">
          ${profile.photoUrl ? `<img src="${profile.photoUrl}" alt="${profile.displayName}" class="profile-avatar-img">` : profile.displayName.charAt(0).toUpperCase()}
        </div>
        <div class="profile-name">${profile.displayName}</div>
        <div class="profile-subtitle">@${profile.identifier}</div>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <div class="stat-value">${profile.stats.totalWorkouts}</div>
          <div class="stat-label">Тренировок</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(profile.stats.totalVolume / 1000)}т</div>
          <div class="stat-label">Общий объём</div>
        </div>
        ${profile.stats.favoriteExercise ? `
          <div class="stat-card">
            <div class="stat-value" style="font-size: 1rem;">${profile.stats.favoriteExercise}</div>
            <div class="stat-label">Любимое упражнение</div>
          </div>
        ` : ''}
        ${profile.stats.lastWorkoutDate ? `
          <div class="stat-card">
            <div class="stat-value" style="font-size: 1rem;">${new Date(profile.stats.lastWorkoutDate).toLocaleDateString()}</div>
            <div class="stat-label">Последняя тренировка</div>
          </div>
        ` : ''}
      </div>

      ${profile.recentActivity.length > 0 ? `
        <div class="activity-list">
          <h2 class="subtitle">Недавняя активность</h2>
          ${profile.recentActivity.map(a => `
            <div class="activity-item">
              <span class="activity-date">${new Date(a.date).toLocaleDateString()}</span>
              <span class="activity-count">${a.exerciseCount} упражнений</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderStatsPage() {
  const logs = storage.getLogs();
  const types = storage.getWorkoutTypes();

  if (logs.length === 0) {
    return `
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;
  }

  const filteredLogs = selectedStatType === 'all'
    ? logs
    : logs.filter(l => l.workoutTypeId === selectedStatType);

  const totalVolume = filteredLogs.reduce((acc, l) => acc + (l.weight * l.reps), 0);
  const totalReps = filteredLogs.reduce((acc, l) => acc + l.reps, 0);

  return `
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${types.map(t => `<option value="${t.id}" ${selectedStatType === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${selectedStatType === 'all' ? 'все' : 'тип'})</div>
          <div class="stat-card__value">${Math.round(totalVolume)} кг</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Повторений</div>
          <div class="stat-card__value">${totalReps}</div>
        </div>
      </div>

      <div class="charts-section">
        <h2 class="subtitle">Прогресс (макс. вес)</h2>
        <div class="chart-container">
           ${renderSimpleChart(filteredLogs)}
        </div>
      </div>
    </div>
  `;
}

function renderSimpleChart(logs: any[]) {
  if (logs.length < 2) return '<p class="hint" style="text-align: center">Мало данных для графика</p>';

  // Sort by date
  const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get max weight per day or just points
  const points = sorted.map(l => l.weight);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const width = 400;
  const height = 150;
  const padding = 20;

  const svgPoints = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((p - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${svgPoints}"
      />
      ${points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((p - min) / range) * (height - 2 * padding);
    return `<circle cx="${x}" cy="${y}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`;
  }).join('')}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${min}кг</span>
      <span class="hint">${max}кг</span>
    </div>
  `;
}

function formatWorkoutForShare(dateStr: string): string {
  const allLogs = storage.getLogs();
  const types = storage.getWorkoutTypes();

  // Get logs for the specific date
  const dayLogs = allLogs.filter(log => log.date.startsWith(dateStr));
  if (dayLogs.length === 0) return '';

  // Format the date for display
  const dateObj = new Date(dayLogs[0].date);
  const dateLabel = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  // Group by exercise
  const exerciseGroups: Map<string, WorkoutSet[]> = new Map();
  dayLogs.forEach(log => {
    if (!exerciseGroups.has(log.workoutTypeId)) {
      exerciseGroups.set(log.workoutTypeId, []);
    }
    exerciseGroups.get(log.workoutTypeId)!.push(log);
  });

  let text = `🏋️ Тренировка ${dateLabel}\n\n`;

  exerciseGroups.forEach((sets, typeId) => {
    const type = types.find(t => t.id === typeId);
    text += `${type?.name || 'Упражнение'}:\n`;
    sets.forEach(set => {
      text += `  ${set.weight} кг × ${set.reps}\n`;
    });
    text += '\n';
  });

  // Calculate total volume
  const totalVolume = dayLogs.reduce((acc, l) => acc + (l.weight * l.reps), 0);
  text += `💪 Общий объём: ${Math.round(totalVolume)} кг`;

  return text;
}

function shareWorkout(dateStr: string) {
  const text = formatWorkoutForShare(dateStr);
  if (!text) return;

  if (WEBAPP?.openTelegramLink) {
    // Use Telegram share URL
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/gymgym21bot')}&text=${encodeURIComponent(text)}`;
    WEBAPP.openTelegramLink(shareUrl);
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
      alert('Текст скопирован в буфер обмена');
    });
  }
}

function bindPageEvents() {
  if (currentPage === 'main') {
    const form = document.getElementById('log-form') as HTMLFormElement;
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const logData = {
        workoutTypeId: formData.get('typeId') as string,
        weight: parseFloat(formData.get('weight') as string),
        reps: parseInt(formData.get('reps') as string, 10)
      };

      if (editingLogId) {
        const logs = storage.getLogs();
        const existingLog = logs.find(l => l.id === editingLogId);
        if (existingLog) {
          await storage.updateLog({
            ...existingLog,
            ...logData
          });
          editingLogId = null;
        }
      } else {
        await storage.addLog(logData);
      }
      render();
    });

    const duplicateBtn = document.getElementById('duplicate-last-btn');
    duplicateBtn?.addEventListener('click', async () => {
      const logs = storage.getLogs();
      const lastLog = logs[logs.length - 1];
      if (lastLog) {
        await storage.addLog({
          workoutTypeId: lastLog.workoutTypeId,
          weight: lastLog.weight,
          reps: lastLog.reps
        });
        render();
      }
    });

    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    cancelEditBtn?.addEventListener('click', () => {
      editingLogId = null;
      render();
    });

    document.querySelectorAll('.log-set__delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          if (editingLogId === id) editingLogId = null;
          await storage.deleteLog(id);
          render();
        }
      });
    });

    document.querySelectorAll('.log-set__edit').forEach(btn => {
      btn.addEventListener('click', () => {
        editingLogId = btn.getAttribute('data-id');
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Share button events
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dateStr = btn.getAttribute('data-date');
        if (dateStr) {
          shareWorkout(dateStr);
        }
      });
    });
  }

  if (currentPage === 'settings') {
    const form = document.getElementById('add-type-form') as HTMLFormElement;
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('new-type-name') as HTMLInputElement;
      if (input.value) {
        await storage.addWorkoutType(input.value);
        render();
      }
    });

    document.querySelectorAll('.type-item__delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (id && confirm('Удалить этот тип тренировки?')) {
          await storage.deleteWorkoutType(id);
          render();
        }
      });
    });
  }

  if (currentPage === 'stats') {
    const select = document.getElementById('stat-type-select') as HTMLSelectElement;
    select?.addEventListener('change', () => {
      selectedStatType = select.value;
      render();
    });
  }

  if (currentPage === 'profile-settings') {
    const saveBtn = document.getElementById('save-profile-btn');
    saveBtn?.addEventListener('click', async () => {
      const toggle = document.getElementById('profile-public-toggle') as HTMLInputElement;
      const nameInput = document.getElementById('profile-display-name') as HTMLInputElement;

      await storage.updateProfileSettings({
        isPublic: toggle?.checked ?? false,
        displayName: nameInput?.value || undefined,
      });
      render();
    });

    const copyBtn = document.getElementById('copy-profile-link');
    copyBtn?.addEventListener('click', () => {
      const identifier = storage.getProfileIdentifier();
      const profileUrl = `https://t.me/gymgym21bot/app?startapp=profile_${identifier}`;
      navigator.clipboard.writeText(profileUrl).then(() => {
        showToast('Ссылка скопирована');
      });
    });

    const shareBtn = document.getElementById('share-profile-link');
    shareBtn?.addEventListener('click', () => {
      const identifier = storage.getProfileIdentifier();
      const profileUrl = `https://t.me/gymgym21bot/app?startapp=profile_${identifier}`;
      if (WEBAPP?.openTelegramLink) {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent('Мой профиль тренировок 💪')}`;
        WEBAPP.openTelegramLink(shareUrl);
      } else {
        navigator.clipboard.writeText(profileUrl).then(() => {
          showToast('Ссылка скопирована');
        });
      }
    });
  }
}


const syncStatusEl = document.createElement('div');
syncStatusEl.className = 'sync-status';
document.body.appendChild(syncStatusEl);

function updateSyncStatus(status: SyncStatus) {
  syncStatusEl.className = 'sync-status visible ' + status;

  switch (status) {
    case 'saving':
      syncStatusEl.textContent = 'Сохранение...';
      break;
    case 'success':
      syncStatusEl.textContent = 'Сохранено';
      break;
    case 'error':
      syncStatusEl.textContent = 'Ошибка сохранения';
      break;
    default:
      syncStatusEl.className = 'sync-status'; // Hide
  }
}

storage.onUpdate(() => render());
storage.onSyncStatusChange(updateSyncStatus);

async function initApp() {
  // Check for profile deep link from startapp parameter
  const urlParams = new URLSearchParams(window.location.search);
  const startApp = urlParams.get('startapp') || WEBAPP?.initDataUnsafe?.start_param;

  if (startApp && startApp.startsWith('profile_')) {
    const identifier = startApp.replace('profile_', '');
    viewingProfileIdentifier = identifier;
    currentPage = 'public-profile';
    profileLoadFailed = false;
    render();

    // Load the public profile
    loadedPublicProfile = await storage.getPublicProfile(identifier);
    if (!loadedPublicProfile) {
      profileLoadFailed = true;
    }
    render();
  } else {
    render();
  }

  await storage.init();
}

initApp();
