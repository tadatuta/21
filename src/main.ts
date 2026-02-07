import './telegram-mock';
import './styles/base.css';
import './styles/components.css';
import './styles/profile.css';
import './components/navigation/navigation.css';
import { storage, SyncStatus } from './storage/storage';
import { WorkoutSet, PublicProfileData, WorkoutType } from './types';
import './styles/stats.css';
import { getOneRepMaxByDate, getWorkoutDates, getDurationStats } from './utils/statistics';
import { renderHeatmap } from './components/stats/Heatmap';
import { renderVolumeChart, render1RMChart, renderDurationChart } from './components/stats/Charts';
import { getAuthData, saveAuthData, TelegramLoginData } from './auth';
import { renderLogin } from './components/auth/Login';
import { registerSW } from 'virtual:pwa-register';
import Sortable from 'sortablejs';
import { downloadFile, generateMarkdown } from './utils/export';

// Register Service Worker
registerSW({ immediate: true });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
let lastAddedLogId: string | null = null;
let editingTypeId: string | null = null;
let currentStatsTab: 'overview' | 'progress' = 'overview';
let isFilterEnabled = false;

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

  // Don't render main content if not authenticated
  const skipTmaAuth = localStorage.getItem('skip_tma_auth') === 'true';
  const isTma = !!(WEBAPP?.initData) && !skipTmaAuth;
  const authData = getAuthData();
  const isWebAuth = !!authData;

  if (!isTma && !isWebAuth) {
    // Not authenticated, don't overwrite login screen
    return;
  }

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
    <div id="sync-status" class="sync-status"></div>
  `;

  // Bind events
  app.querySelectorAll('.navigation__item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page') as Page;
      navigate(page);
    });
  });

  bindPageEvents();
  manageWorkoutTimer();
}

// Sync Status Logic
let syncStatus: SyncStatus = 'idle';
storage.onSyncStatusChange((status) => {
  syncStatus = status;
  updateSyncStatusUI();
});

function updateSyncStatusUI() {
  const statusEl = document.getElementById('sync-status');
  if (!statusEl) return;

  statusEl.className = 'sync-status';
  let text = '';
  let icon = '';

  switch (syncStatus) {
    case 'saving':
      text = 'Синхронизация...';
      icon = '🔄';
      statusEl.classList.add('sync-status_saving');
      break;
    case 'success':
      text = 'Сохранено';
      icon = '✅';
      statusEl.classList.add('sync-status_success');
      break;
    case 'error':
      text = 'Ошибка синхронизации';
      icon = '⚠️';
      statusEl.classList.add('sync-status_error');
      break;
    case 'idle':
      if (!navigator.onLine) {
        text = 'Оффлайн';
        icon = '📡';
        statusEl.classList.add('sync-status_offline');
      } else {
        return; // Hide if idle and online
      }
      break;
  }

  statusEl.innerHTML = `${icon} ${text}`;
}

// Listen to network status
window.addEventListener('online', () => {
  storage.sync();
  updateSyncStatusUI();
});
window.addEventListener('offline', () => updateSyncStatusUI());

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
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="workout-status ${isPaused ? 'workout-status_paused' : ''}">
              ${isPaused ? '⏸️ Пауза' : '🔥 Тренировка активна'}
            </span>
            <span class="workout-timer">00:00</span>
          </div>
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

let workoutTimerInterval: ReturnType<typeof setInterval> | null = null;

function updateWorkoutTimer() {
  const activeWorkout = storage.getActiveWorkout();
  const timerEl = document.querySelector('.workout-timer');

  if (!activeWorkout || !timerEl) {
    if (workoutTimerInterval) {
      clearInterval(workoutTimerInterval);
      workoutTimerInterval = null;
    }
    return;
  }

  const start = new Date(activeWorkout.startTime).getTime();
  const now = Date.now();
  let totalTime = now - start;

  activeWorkout.pauseIntervals.forEach(interval => {
    const pStart = new Date(interval.start).getTime();
    const pEnd = interval.end ? new Date(interval.end).getTime() : (activeWorkout.status === 'paused' ? now : now);
    if (pEnd > pStart) {
      totalTime -= (pEnd - pStart);
    }
  });

  const totalSeconds = Math.floor(Math.max(0, totalTime) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Start/Stop timer based on workout state
function manageWorkoutTimer() {
  const activeWorkout = storage.getActiveWorkout();

  // Update once immediately to set initial state
  updateWorkoutTimer();

  if (activeWorkout && activeWorkout.status === 'active') {
    if (!workoutTimerInterval) {
      workoutTimerInterval = setInterval(updateWorkoutTimer, 1000);
    }
  } else {
    if (workoutTimerInterval) {
      clearInterval(workoutTimerInterval);
      workoutTimerInterval = null;
    }
  }
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
          <select class="select" name="typeId" id="workout-type-select" required>
            ${types.map(t => `<option value="${t.id}" ${(editingLogId ? (editingLog && t.id === editingLog.workoutTypeId) : (t.id === lastTypeId)) ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
        </div>
        
        <div id="strength-inputs" style="display: none;">
            <div class="form-row">
              <div class="form-group">
                <label class="label">Вес (кг)</label>
                <input class="input" type="number" name="weight" step="0.5" placeholder="0" value="${editingLogId && editingLog ? editingLog.weight : ''}">
              </div>
              <div class="form-group">
                <label class="label">Повторений</label>
                <input class="input" type="number" name="reps" placeholder="0" value="${editingLogId && editingLog ? editingLog.reps : ''}">
              </div>
            </div>
        </div>

        <div id="time-inputs" style="display: none;">
            <div class="form-group">
                <label class="label">Время (мин)</label>
                <input class="input" type="number" name="duration" placeholder="0" value="${editingLogId && editingLog ? (editingLog.duration || '') : ''}">
            </div>
        </div>

        <button class="button" type="submit">${editingLogId ? 'Сохранить изменения' : 'Зафиксировать'}</button>
        ${editingLogId ? `<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>` : ''}
        ${!editingLogId && lastLog ? `<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${types.find(t => t.id === lastLog.workoutTypeId)?.name} ${lastLog.weight ? `${lastLog.weight}кг × ${lastLog.reps}` : `${lastLog.duration} мин`}</button>` : ''}
      </form>
      <div class="recent-logs">
        <div class="recent-logs__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
           <button class="icon-btn" id="prev-week-btn">◀️</button>
           <div id="week-label-container" style="display: flex; align-items: center; gap: 8px; position: relative;">
             <span style="font-size: 18px; position: relative; display: inline-block;">
               📅
               <input type="date" id="calendar-input" value="${lastCalendarValue}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
             </span>
             <h2 class="subtitle" style="margin: 0;">${currentWeekOffset === 0 ? 'Последние 7 дней' : label}</h2>
             <label class="filter-toggle" title="Фильтр по типу упражнения">
               <input type="checkbox" id="filter-toggle-input" ${isFilterEnabled ? 'checked' : ''}>
               <span class="filter-toggle__icon">🔍</span>
             </label>
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

  let weekLogs = allLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= start && logDate <= end;
  });

  // Apply filter by selected exercise type if enabled
  if (isFilterEnabled) {
    const selectedTypeId = (document.querySelector('select[name="typeId"]') as HTMLSelectElement)?.value;
    if (selectedTypeId) {
      weekLogs = weekLogs.filter(log => log.workoutTypeId === selectedTypeId);
    }
  }

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
                  <div class="log-set ${set.id === editingLogId ? 'log-set_active-edit' : ''} ${set.id === lastAddedLogId ? 'log-set_new' : ''}">
                    <div class="log-set__info">
                      ${set.weight !== undefined && set.reps !== undefined ? `
                        <span class="log-set__weight">${set.weight} кг</span>
                        <span class="log-set__times">×</span>
                        <span class="log-set__reps">${set.reps}</span>
                      ` : `
                        <span class="log-set__reps">⏱ ${set.duration} мин</span>
                      `}
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
  const editingType = editingTypeId ? types.find(t => t.id === editingTypeId) : null;

  return `
    <div class="page-content">
      <h1 class="title">Настройки</h1>
      <div class="settings-section">
        <h2 class="subtitle">${editingTypeId ? 'Редактирование типа' : 'Добавить тип тренировки'}</h2>
        <form class="add-type-form" id="add-type-form" style="margin-bottom: 24px;">
          <div style="display: flex; gap: 8px; flex-direction: column;">
            <input class="input" type="text" id="new-type-name" placeholder="Название (напр. Жим гантелей)" required value="${editingType ? editingType.name : ''}">
            
            <div class="category-switch" style="display: flex; gap: 12px; margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 4px;">
                    <input type="radio" name="new-type-category" value="strength" ${!editingType || editingType.category !== 'time' ? 'checked' : ''}>
                    Силовое
                </label>
                <label style="display: flex; align-items: center; gap: 4px;">
                    <input type="radio" name="new-type-category" value="time" ${editingType && editingType.category === 'time' ? 'checked' : ''}>
                    На время
                </label>
            </div>

            <button class="button" type="submit">${editingTypeId ? 'Сохранить' : 'Добавить'}</button>
          </div>
          ${editingTypeId ? `<button class="button button_secondary" type="button" id="cancel-edit-type-btn" style="margin-top: 8px; width: 100%;">Отмена</button>` : ''}
        </form>

        <h2 class="subtitle">Типы тренировок</h2>
        <div class="type-list" id="workout-type-list">
          ${types.map(t => `
            <div class="type-item" data-id="${t.id}">
              <span class="drag-handle" style="cursor: grab; margin-right: 12px; opacity: 0.5;">⋮⋮</span>
              <span style="flex-grow: 1;">${t.name}</span>
              <div style="display: flex; gap: 8px;">
                <button class="type-item__edit icon-btn" data-id="${t.id}" title="Редактировать">✏️</button>
                <button class="type-item__delete icon-btn" data-id="${t.id}" title="Удалить">×</button>
              </div>
            </div>
          `).join('')}
        </div>
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
  const totalVolume = logs.reduce((acc, l) => acc + ((l.weight || 0) * (l.reps || 0)), 0);
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

        <div class="settings-section">
          <div class="settings-section-title">Управление данными</div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="button button_secondary" id="export-json-btn">Экспорт JSON (Backup)</button>
            <button class="button button_secondary" id="export-md-btn">Экспорт Markdown</button>
            <button class="button button_secondary" id="import-json-btn">Импорт JSON (Restore)</button>
            <input type="file" id="import-file-input" style="display: none" accept=".json">
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
  const workouts = storage.getWorkouts();
  const types = storage.getWorkoutTypes();

  if (logs.length === 0) {
    return `
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;
  }

  // Calculate generic stats
  const totalVolume = logs.reduce((acc, l) => acc + ((l.weight || 0) * (l.reps || 0)), 0);
  const totalReps = logs.reduce((acc, l) => acc + (l.reps || 0), 0);
  const durationStats = getDurationStats(workouts);

  let html = `
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      <div class="stats-tabs">
        <button class="stats-tab ${currentStatsTab === 'overview' ? 'active' : ''}" data-tab="overview">Обзор</button>
        <button class="stats-tab ${currentStatsTab === 'progress' ? 'active' : ''}" data-tab="progress">Прогресс</button>
      </div>
  `;

  if (currentStatsTab === 'overview') {
    const dates = getWorkoutDates(workouts, logs);

    html += `
        <div class="stats-section">
            <h2 class="subtitle">Активность</h2>
            ${renderHeatmap(dates)}
        </div>

        <div class="stats-summary">
            <div class="stat-metric">
                <div class="stat-metric__label">Всего тренировок</div>
                <div class="stat-metric__value">${dates.size}</div>
            </div>
            <div class="stat-metric">
                <div class="stat-metric__label">Сред. длительность</div>
                <div class="stat-metric__value">${durationStats.averageMinutes}<span class="stat-metric__unit">мин</span></div>
            </div>
             <div class="stat-metric">
                <div class="stat-metric__label">Общий объем</div>
                <div class="stat-metric__value">${Math.round(totalVolume / 1000)}<span class="stat-metric__unit">т</span></div>
            </div>
            <div class="stat-metric">
                <div class="stat-metric__label">Всего повторений</div>
                <div class="stat-metric__value">${totalReps}</div>
            </div>
        </div>

        <div class="charts-section">
            <h2 class="subtitle">Длительность тренировок</h2>
            <div class="chart-container">
                ${renderDurationChart(workouts)}
            </div>
        </div>
     `;
  } else {
    // Progress Tab
    html += `
        <div class="form-group">
            <label class="label">Упражнение</label>
            <select class="select" id="stat-type-select">
                <option value="all">Все упражнения (Объем)</option>
                ${types.map(t => `<option value="${t.id}" ${selectedStatType === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
            </select>
        </div>
    `;

    if (selectedStatType === 'all') {
      html += `
            <div class="charts-section">
                <h2 class="subtitle">Общий объем по дням</h2>
                <div class="chart-container">
                    ${renderVolumeChart(logs)}
                </div>
            </div>
        `;
    } else {
      const typeLogs = logs.filter(l => l.workoutTypeId === selectedStatType);
      const oneRepMaxData = getOneRepMaxByDate(typeLogs, selectedStatType);

      html += `
             <div class="charts-section">
                <h2 class="subtitle">Прогресс силовых (1RM)</h2>
                <div class="chart-container">
                    ${render1RMChart(oneRepMaxData)}
                </div>
            </div>
            
            <div class="charts-section" style="margin-top: 24px;">
                <h2 class="subtitle">Объем нагрузки</h2>
                 <div class="chart-container">
                    ${renderVolumeChart(typeLogs)}
                </div>
            </div>
        `;
    }
  }

  html += `</div>`;
  return html;
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
      if (set.duration) {
        text += `  ⏱ ${set.duration} мин\n`;
      } else {
        text += `  ${set.weight} кг × ${set.reps}\n`;
      }
    });
    text += '\n';
  });

  // Calculate total volume
  const totalVolume = dayLogs.reduce((acc, l) => acc + (l.weight && l.reps ? (l.weight * l.reps) : 0), 0);
  if (totalVolume) {
    text += `💪 Общий объём: ${Math.round(totalVolume)} кг`;
  }

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

    // Helper to update visibility
    const updateFormVisibility = () => {
      const typeSelect = document.getElementById('workout-type-select') as HTMLSelectElement;
      const types = storage.getWorkoutTypes();
      const selectedId = typeSelect?.value;
      const selectedType = types.find(t => t.id === selectedId);

      const strengthInputs = document.getElementById('strength-inputs');
      const timeInputs = document.getElementById('time-inputs');

      if (selectedType && selectedType.category === 'time') {
        if (strengthInputs) strengthInputs.style.display = 'none';
        if (timeInputs) timeInputs.style.display = 'block';

        // Required attributes management
        form.querySelectorAll('input[name="weight"], input[name="reps"]').forEach(el => el.removeAttribute('required'));
        form.querySelectorAll('input[name="duration"]').forEach(el => el.setAttribute('required', 'true'));
      } else {
        if (strengthInputs) strengthInputs.style.display = 'block';
        if (timeInputs) timeInputs.style.display = 'none';

        form.querySelectorAll('input[name="weight"], input[name="reps"]').forEach(el => el.setAttribute('required', 'true'));
        form.querySelectorAll('input[name="duration"]').forEach(el => el.removeAttribute('required'));
      }
    };

    // Initial check
    updateFormVisibility();

    // Listen for changes
    const typeSelect = document.getElementById('workout-type-select');
    typeSelect?.addEventListener('change', updateFormVisibility);

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const typeId = formData.get('typeId') as string;
      const types = storage.getWorkoutTypes();
      const type = types.find(t => t.id === typeId);

      const logData: Partial<WorkoutSet> & { workoutTypeId: string } = {
        workoutTypeId: typeId,
      };

      if (type?.category === 'time') {
        logData.duration = parseInt(formData.get('duration') as string, 10);
      } else {
        logData.weight = parseFloat(formData.get('weight') as string);
        logData.reps = parseInt(formData.get('reps') as string, 10);
      }

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
        const newLog = await storage.addLog(logData);
        lastAddedLogId = newLog.id;
      }
      render();
      lastAddedLogId = null;
    });

    const duplicateBtn = document.getElementById('duplicate-last-btn');
    duplicateBtn?.addEventListener('click', async () => {
      const logs = storage.getLogs();
      const lastLog = logs[logs.length - 1];
      if (lastLog) {
        const newLog = await storage.addLog({
          workoutTypeId: lastLog.workoutTypeId,
          weight: lastLog.weight,
          reps: lastLog.reps,
          duration: lastLog.duration
        });
        lastAddedLogId = newLog.id;
        render();
        lastAddedLogId = null;
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

    // Filter toggle
    const filterToggle = document.getElementById('filter-toggle-input') as HTMLInputElement;
    filterToggle?.addEventListener('change', () => {
      isFilterEnabled = filterToggle.checked;
      updateWeekView();
    });
  }

  if (currentPage === 'settings') {
    const form = document.getElementById('add-type-form') as HTMLFormElement;
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('new-type-name') as HTMLInputElement;
      const category = (document.querySelector('input[name="new-type-category"]:checked') as HTMLInputElement)?.value as 'strength' | 'time';

      if (input.value) {
        if (editingTypeId) {
          await storage.updateWorkoutType(editingTypeId, input.value, category);
          editingTypeId = null;
        } else {
          await storage.addWorkoutType(input.value, category);
        }
        render();
      }
    });

    const cancelEditBtn = document.getElementById('cancel-edit-type-btn');
    cancelEditBtn?.addEventListener('click', () => {
      editingTypeId = null;
      render();
    });

    document.querySelectorAll('.type-item__edit').forEach(btn => {
      btn.addEventListener('click', () => {
        editingTypeId = btn.getAttribute('data-id');
        render();
        // Focus input
        const input = document.getElementById('new-type-name') as HTMLInputElement;
        input?.focus();
      });
    });

    document.querySelectorAll('.type-item__delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (id && confirm('Удалить этот тип тренировки?')) {
          if (editingTypeId === id) editingTypeId = null;
          await storage.deleteWorkoutType(id);
          render();
        }
      });
    });
  }

  if (currentPage === 'settings') {
    const typeList = document.getElementById('workout-type-list');
    if (typeList) {
      Sortable.create(typeList, {
        animation: 150,
        handle: '.type-item', // Drag by the whole item
        onEnd: async () => {
          // Get new order
          const newOrder = Array.from(typeList.children).map(child => child.getAttribute('data-id') || '').filter(Boolean);
          await storage.updateWorkoutTypeOrder(newOrder);
          // No need to re-render immediately as the DOM is already updated by Sortable
          // But we might want to ensure consistency? 
          // If we re-render, it might jitter. 
          // But generic render() pulls from storage, so if we navigate away and back, it should be fine.
          // Main page select list needs update though?
          // Navigation to main page triggers render(), so it will fetch fresh sorted list.
        }
      });
    }

    // Bind edit/delete buttons again because we just bound Sortable
    // Oh wait, renderSettingsPage renders the HTML, then bindPageEvents is called.
    // The previous block bound edit/delete.
    // Ensure we don't break that.

    document.querySelectorAll('.type-item__edit').forEach(btn => {
      btn.addEventListener('click', () => {
        editingTypeId = btn.getAttribute('data-id');
        render();
        // Focus input
        const input = document.getElementById('new-type-name') as HTMLInputElement;
        input?.focus();
      });
    });

    document.querySelectorAll('.type-item__delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (id && confirm('Удалить этот тип тренировки?')) {
          if (editingTypeId === id) editingTypeId = null;
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
      showToast('Профиль обновлен');
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
    /*eslint no-empty: "error"*/
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

    // Export/Import Logic
    document.getElementById('export-json-btn')?.addEventListener('click', async () => {
      try {
        const data = await storage.exportData();
        const filename = `gym_backup_${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
        showToast('Экспорт выполнен');
      } catch (e) {
        console.error(e);
        showToast('Ошибка экспорта');
      }
    });

    document.getElementById('export-md-btn')?.addEventListener('click', async () => {
      try {
        const data = await storage.exportData();
        const markdown = generateMarkdown(data);
        const filename = `gym_history_${new Date().toISOString().split('T')[0]}.md`;
        downloadFile(markdown, filename, 'text/markdown');
        showToast('Экспорт выполнен');
      } catch (e) {
        console.error(e);
        showToast('Ошибка экспорта');
      }
    });

    document.getElementById('import-json-btn')?.addEventListener('click', () => {
      document.getElementById('import-file-input')?.click();
    });

    document.getElementById('import-file-input')?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = event.target?.result as string;
          const data = JSON.parse(json);

          if (confirm('Внимание! Все текущие данные будут заменены данными из файла. Продолжить?')) {
            await storage.importData(data);
            showToast('Данные успешно импортированы');
            setTimeout(() => location.reload(), 1000);
          }
        } catch (err) {
          console.error(err);
          showToast('Ошибка импорта: Неверный формат файла');
        }
      };
      reader.readAsText(file);
      // Clear input so same file can be selected again if needed
      (e.target as HTMLInputElement).value = '';
    });
  }

  if (currentPage === 'stats') {
    const tabs = document.querySelectorAll('.stats-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        if (tabId === 'overview' || tabId === 'progress') {
          currentStatsTab = tabId;
          render();
        }
      });
    });

    const typeSelect = document.getElementById('stat-type-select');
    typeSelect?.addEventListener('change', (e) => {
      selectedStatType = (e.target as HTMLSelectElement).value;
      render();
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
      syncStatusEl.textContent = 'Синхронизация...';
      break;
    case 'success':
      syncStatusEl.textContent = 'Синхронизировано';
      break;
    case 'error':
      syncStatusEl.textContent = 'Ошибка синхронизации';
      break;
    default:
      syncStatusEl.className = 'sync-status'; // Hide
  }
}

storage.onUpdate(() => render());
storage.onSyncStatusChange(updateSyncStatus);

async function initApp() {
  // 1. Check for Telegram Login Widget redirect data
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('hash') && urlParams.has('id')) {
    const user: TelegramLoginData = {
      id: parseInt(urlParams.get('id') || '0', 10),
      first_name: urlParams.get('first_name') || '',
      last_name: urlParams.get('last_name') || undefined,
      username: urlParams.get('username') || undefined,
      photo_url: urlParams.get('photo_url') || undefined,
      auth_date: parseInt(urlParams.get('auth_date') || '0', 10),
      hash: urlParams.get('hash') || ''
    };

    saveAuthData(user);

    // Clean URL
    urlParams.delete('hash');
    urlParams.delete('id');
    urlParams.delete('first_name');
    urlParams.delete('last_name');
    urlParams.delete('username');
    urlParams.delete('photo_url');
    urlParams.delete('auth_date');
    urlParams.delete('auth'); // Sometimes sent

    const newSearch = urlParams.toString();
    const newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '');
    window.history.replaceState({}, document.title, newUrl);

    // Reload to ensure clean state initialization
    location.reload();
    return;
  }

  // 2. Standard Auth Check
  const skipTmaAuth = localStorage.getItem('skip_tma_auth') === 'true';
  const isTma = !!(WEBAPP?.initData) && !skipTmaAuth;
  const authData = getAuthData();
  const isWebAuth = !!authData;


  if (!isTma && !isWebAuth) {
    renderLogin(document.getElementById('app')!, () => {
      // This callback might still be used if we keep DEV button or if widget decides to use callback for some reason,
      // but primary flow is now redirect.
      location.reload();
    });
    return;
  }

  // Check for profile deep link from startapp parameter
  // Note: urlParams was already defined above, but we need to re-read if we didn't return
  // Actually, we can reuse if we didn't redirect.
  const currentParams = new URLSearchParams(window.location.search);
  const startApp = currentParams.get('startapp') || WEBAPP?.initDataUnsafe?.start_param;

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
