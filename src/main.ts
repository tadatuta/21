import './styles/base.css';
import './styles/components.css';
import './components/navigation/navigation.css';
import { storage } from './storage/storage';
import { WorkoutSet } from './types';

const WEBAPP = (window as any).Telegram?.WebApp;

if (WEBAPP) {
  WEBAPP.ready();
  WEBAPP.expand();
}

type Page = 'main' | 'stats' | 'settings';
let currentPage: Page = 'main';
let selectedStatType = 'all';

function navigate(page: Page) {
  currentPage = page;
  render();
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
    default:
      return '';
  }
}

function renderMainPage() {
  const types = storage.getWorkoutTypes();
  const logs = storage.getLogs();
  const lastLog = logs[logs.length - 1];
  const lastTypeId = lastLog?.workoutTypeId;

  return `
    <div class="page-content">
      <h1 class="title">Новый подход</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${types.map(t => `<option value="${t.id}" ${t.id === lastTypeId ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0">
          </div>
        </div>
        <button class="button" type="submit">Зафиксировать</button>
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
    html += `<div class="log-day">`;
    html += `<div class="log-day__header">${dateLabel}</div>`;

    // Group by exercise within day (preserving chronological order of groups)
    const exerciseGroups: Map<string, WorkoutSet[]> = new Map();
    [...dayLogs].reverse().forEach(log => {
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
            ${[...sets].reverse().map(set => `
              <div class="log-set">
                <div class="log-set__info">
                  <span class="log-set__weight">${set.weight} кг</span>
                  <span class="log-set__times">×</span>
                  <span class="log-set__reps">${set.reps}</span>
                </div>
                <button class="log-set__delete" data-id="${set.id}">×</button>
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

function bindPageEvents() {
  if (currentPage === 'main') {
    const form = document.getElementById('log-form') as HTMLFormElement;
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      await storage.addLog({
        workoutTypeId: formData.get('typeId') as string,
        weight: parseFloat(formData.get('weight') as string),
        reps: parseInt(formData.get('reps') as string, 10)
      });
      render();
    });

    document.querySelectorAll('.log-set__delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (id) {
          await storage.deleteLog(id);
          render();
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
}

storage.onUpdate(() => render());

async function initApp() {
  render();
  await storage.init();
}

initApp();
