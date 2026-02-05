import './telegram-mock';
import './styles/base.css';
import './styles/components.css';
import './styles/profile.css';
import './components/navigation/navigation.css';
import { storage, SyncStatus } from './storage/storage';
import { WorkoutSet, PublicProfileData, WorkoutType } from './types';

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

// Workout UI state
let isStartingWorkout = false;

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



function renderWorkoutControls() {
  const activeWorkout = storage.getActiveWorkout();

  if (activeWorkout) {
    const isPaused = activeWorkout.status === 'paused';
    return `
      <div class="workout-controls card">
        <div class="workout-controls__header">
          <span class="workout-status ${isPaused ? 'workout-status_paused' : ''}">
            ${isPaused ? '⏸️ Пауза' : '🔥 Тренировка активна'}
          </span>
          ${activeWorkout.name ? `<span class="workout-name">${activeWorkout.name}</span>` : ''}
        </div>
        <div class="workout-controls__actions">
          ${isPaused
        ? `<button class="button" id="resume-workout-btn">Продолжить</button>`
        : `<button class="button button_secondary" id="pause-workout-btn">Пауза</button>`
      }
          <button class="button button_destructive" id="finish-workout-btn">Завершить</button>
        </div>
      </div>
    `;
  }

  if (isStartingWorkout) {
    return `
      <div class="workout-controls card">
        <h3 class="subtitle" style="margin-top: 0">Начало тренировки</h3>
        <form id="start-workout-form" style="display: flex; flex-direction: column; gap: 12px;">
          <input class="input" type="text" name="workoutName" placeholder="Название (опционально)">
          <div style="display: flex; gap: 8px;">
            <button class="button" type="submit">Начать</button>
            <button class="button button_secondary" type="button" id="cancel-start-workout-btn">Отмена</button>
          </div>
        </form>
      </div>
    `;
  }

  return `
    <button class="button" id="start-workout-btn" style="margin-bottom: 24px;">▶️ Начать тренировку</button>
  `;
}

let currentWeekOffset = 0;
let lastCalendarValue = '';

function getWeekRange(offset: number) {
  const now = new Date();
  // Adjust to start of today (00:00:00)
  now.setHours(0, 0, 0, 0);

  // Calculate start of the "current" week window based on offset
  // offset 0: last 7 days (today - 6 days) to today
  // offset 1: (today - 13 days) to (today - 7 days)
  const end = new Date(now);
  end.setDate(now.getDate() - (offset * 7));
  // Set end time to end of day
  end.setHours(23, 59, 59, 999);

  const start = new Date(end);
  start.setDate(end.getDate() - 6); // 7 day window
  start.setHours(0, 0, 0, 0);

  return {
    start,
    end,
    label: `${start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`
  };
}

function renderMainPage() {
  const types = storage.getWorkoutTypes();
  const logs = storage.getLogs();
  const lastLog = logs[logs.length - 1];
  const lastTypeId = lastLog?.workoutTypeId;

  const editingLog = editingLogId ? logs.find(l => l.id === editingLogId) : null;
  const { label } = getWeekRange(currentWeekOffset);

  return `
    <div class="page-content" id="main-content">
      ${renderWorkoutControls()}
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
        <div class="recent-logs__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
           <button class="icon-btn" id="prev-week-btn">◀️</button>
           <div id="week-label-container" style="display: flex; align-items: center; gap: 8px; position: relative;">
             <h2 class="subtitle" style="margin: 0;">${currentWeekOffset === 0 ? 'Последние 7 дней' : label}</h2>
             <span style="font-size: 18px; position: relative; display: inline-block;">
               📅
               <input type="date" id="calendar-input" value="${lastCalendarValue}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
             </span>
           </div>
           <button class="icon-btn" id="next-week-btn" ${currentWeekOffset === 0 ? 'disabled' : ''} style="${currentWeekOffset === 0 ? 'opacity: 0.3; cursor: default;' : ''}">▶️</button>
        </div>
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
  const { start, end } = getWeekRange(currentWeekOffset);

  const weekLogs = allLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= start && logDate <= end;
  });

  return generateLogsListHtml(weekLogs, types, true);
}

// Partial update for week navigation - updates only the header label and logs list
function updateWeekView() {
  const logsListEl = document.getElementById('logs-list');
  const weekLabelEl = document.querySelector('#week-label-container .subtitle');

  if (logsListEl) {
    logsListEl.innerHTML = renderLogsList();
    // Re-bind log item events
    bindLogItemEvents();
  }

  if (weekLabelEl) {
    const { label } = getWeekRange(currentWeekOffset);
    weekLabelEl.textContent = currentWeekOffset === 0 ? 'Последние 7 дней' : label;
  }

  // Update next button state
  const nextWeekBtn = document.getElementById('next-week-btn') as HTMLButtonElement;
  if (nextWeekBtn) {
    nextWeekBtn.disabled = currentWeekOffset === 0;
    nextWeekBtn.style.opacity = currentWeekOffset === 0 ? '0.3' : '';
    nextWeekBtn.style.cursor = currentWeekOffset === 0 ? 'default' : '';
  }
}

// Bind events for log items (edit, delete, share buttons)
function bindLogItemEvents() {
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

  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dateStr = btn.getAttribute('data-date');
      if (dateStr) {
        shareWorkout(dateStr);
      }
    });
  });
}

function generateLogsListHtml(logs: WorkoutSet[], types: WorkoutType[], isEditable: boolean) {
  if (logs.length === 0) return '<p class="hint">Нет записей за этот период</p>';

  const logsByDay = new Map<string, WorkoutSet[]>();
  // Sort logs by date descending
  [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(log => {
    const d = new Date(log.date);
    const dateKey = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    if (!logsByDay.has(dateKey)) logsByDay.set(dateKey, []);
    logsByDay.get(dateKey)!.push(log);
  });

  const workouts = storage.getWorkouts();
  let html = '';

  logsByDay.forEach((dayLogs, dateLabel) => {
    const dayDateStr = dayLogs[0]?.date.split('T')[0] || '';

    // Identify workouts in this day
    const dayWorkouts = new Set<string>();
    dayLogs.forEach(l => {
      if (l.workoutId) dayWorkouts.add(l.workoutId);
    });

    // Sort workouts by time (using stored workout or log time)
    const sortedWorkoutIds = Array.from(dayWorkouts).sort((a, b) => {
      const wA = workouts.find(w => w.id === a);
      const wB = workouts.find(w => w.id === b);
      const timeA = wA?.startTime || dayLogs.find(l => l.workoutId === a)?.date || '';
      const timeB = wB?.startTime || dayLogs.find(l => l.workoutId === b)?.date || '';
      // Descending order for display? Usually logs are descending.
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    const singleWorkoutId = sortedWorkoutIds.length === 1 ? sortedWorkoutIds[0] : null;
    const singleWorkout = singleWorkoutId ? workouts.find(w => w.id === singleWorkoutId) : null;
    const showNameInHeader = singleWorkout && singleWorkout.name;
    const singleWorkoutDuration = singleWorkout ? Math.round(storage.getWorkoutDuration(singleWorkout)) : 0;

    html += `<div class="log-day">`;
    html += `<div class="log-day__header">
      <span>${dateLabel}${showNameInHeader ? ` • ${singleWorkout.name}` : ''}${singleWorkout ? ` • ${singleWorkoutDuration} мин` : ''}</span>
      ${isEditable ? `<button class="share-btn" data-date="${dayDateStr}" title="Поделиться">📤</button>` : ''}
    </div>`;

    // Render each workout group
    sortedWorkoutIds.forEach(workoutId => {
      const workout = workouts.find(w => w.id === workoutId);
      const workoutLogs = dayLogs.filter(l => l.workoutId === workoutId);

      // Subheader if multiple workouts OR single workout didn't put name in header (e.g. it has start/end time we might want to show?)
      // Requirements: "Если в этот день было несколько тренировок, выводим их названия в отдельных подзаголовках."
      // Also implicit workouts might not have names.
      // Let's hide subheader if it's the ONLY workout and we either showed name or it has no name.
      const hideSubheader = sortedWorkoutIds.length === 1 && (showNameInHeader || !workout?.name);

      if (!hideSubheader) {
        const duration = workout ? Math.round(storage.getWorkoutDuration(workout)) : 0;

        html += `<h3 class="workout-subheader">
                ${workout?.name || 'Тренировка'} 
                <span class="workout-subheader__time">${duration} мин</span>
            </h3>`;
      }

      // Group by exercise within workout
      const exerciseGroups: Map<string, WorkoutSet[]> = new Map();
      workoutLogs.forEach(log => {
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
                    ${isEditable ? `
                    <div class="log-set__actions">
                      <button class="log-set__edit" data-id="${set.id}">✏️</button>
                      <button class="log-set__delete" data-id="${set.id}">×</button>
                    </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
      });
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
          <div class="toggle-row" style="margin-top: 12px;">
            <div class="toggle-label">
              <span class="toggle-label-text">Показывать все упражнения</span>
              <span class="toggle-label-hint">Подробный список упражнений в публичном профиле</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="profile-history-toggle" ${profile?.showFullHistory ? 'checked' : ''}>
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

      ${profile.logs && profile.logs.length > 0 && profile.workoutTypes ? `
        <div class="recent-logs">
          <h2 class="subtitle">История тренировок</h2>
          <div id="logs-list">
            ${generateLogsListHtml(profile.logs, profile.workoutTypes, false)}
          </div>
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
    // Workout controls events
    const startWorkoutBtn = document.getElementById('start-workout-btn');
    startWorkoutBtn?.addEventListener('click', () => {
      isStartingWorkout = true;
      render();
    });

    const cancelStartWorkoutBtn = document.getElementById('cancel-start-workout-btn');
    cancelStartWorkoutBtn?.addEventListener('click', () => {
      isStartingWorkout = false;
      render();
    });

    const startWorkoutForm = document.getElementById('start-workout-form') as HTMLFormElement;
    startWorkoutForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(startWorkoutForm);
      const name = formData.get('workoutName') as string;
      await storage.startWorkout(name);
      isStartingWorkout = false;
      render();
    });

    const pauseWorkoutBtn = document.getElementById('pause-workout-btn');
    pauseWorkoutBtn?.addEventListener('click', async () => {
      await storage.pauseWorkout();
      render();
    });

    const resumeWorkoutBtn = document.getElementById('resume-workout-btn');
    resumeWorkoutBtn?.addEventListener('click', async () => {
      await storage.resumeWorkout();
      render();
    });

    const finishWorkoutBtn = document.getElementById('finish-workout-btn');
    finishWorkoutBtn?.addEventListener('click', async () => {
      if (confirm('Завершить тренировку?')) {
        await storage.finishWorkout();
        render();
      }
    });

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

    const prevWeekBtn = document.getElementById('prev-week-btn');
    prevWeekBtn?.addEventListener('click', () => {
      currentWeekOffset++;
      updateWeekView();
    });

    const nextWeekBtn = document.getElementById('next-week-btn');
    nextWeekBtn?.addEventListener('click', () => {
      if (currentWeekOffset > 0) {
        currentWeekOffset--;
        updateWeekView();
      }
    });

    // Calendar navigation
    const calendarInput = document.getElementById('calendar-input') as HTMLInputElement;

    calendarInput?.addEventListener('change', () => {
      // Only process if value actually changed and is not empty
      if (!calendarInput.value || calendarInput.value === lastCalendarValue) {
        return;
      }
      lastCalendarValue = calendarInput.value;

      const selectedDate = new Date(calendarInput.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate the week offset for the selected date
      const diffTime = today.getTime() - selectedDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      currentWeekOffset = Math.max(0, Math.floor(diffDays / 7));

      // Use partial update instead of full render
      updateWeekView();
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
      const historyToggle = document.getElementById('profile-history-toggle') as HTMLInputElement;
      const nameInput = document.getElementById('profile-display-name') as HTMLInputElement;

      await storage.updateProfileSettings({
        isPublic: toggle?.checked ?? false,
        showFullHistory: historyToggle?.checked ?? false,
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
