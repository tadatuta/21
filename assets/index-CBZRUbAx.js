var T=Object.defineProperty;var k=(s,e,t)=>e in s?T(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var y=(s,e,t)=>k(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();const _="gym_twa_data",b={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class L{constructor(){y(this,"data");this.data=this.load()}load(){const e=localStorage.getItem(_);if(!e)return b;try{return JSON.parse(e)}catch(t){return console.error("Failed to parse storage data",t),b}}save(){localStorage.setItem(_,JSON.stringify(this.data))}getWorkoutTypes(){return this.data.workoutTypes}addWorkoutType(e){const t={id:Date.now().toString(),name:e};return this.data.workoutTypes.push(t),this.save(),t}deleteWorkoutType(e){this.data.workoutTypes=this.data.workoutTypes.filter(t=>t.id!==e),this.save()}getLogs(){return this.data.logs}addLog(e){const t={...e,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(t),this.save(),t}deleteLog(e){this.data.logs=this.data.logs.filter(t=>t.id!==e),this.save()}}const r=new L;var w;const h=(w=window.Telegram)==null?void 0:w.WebApp;h&&(h.ready(),h.expand());let c="main",v="all";function S(s){c=s,u()}function u(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${E()}
    </main>
    <nav class="navigation">
      <button class="navigation__item ${c==="main"?"navigation__item_active":""}" data-page="main">
        <span class="navigation__icon">🏋️</span>
        <span class="navigation__label">Тренировка</span>
      </button>
      <button class="navigation__item ${c==="stats"?"navigation__item_active":""}" data-page="stats">
        <span class="navigation__icon">📊</span>
        <span class="navigation__label">Статистика</span>
      </button>
      <button class="navigation__item ${c==="settings"?"navigation__item_active":""}" data-page="settings">
        <span class="navigation__icon">⚙️</span>
        <span class="navigation__label">Настройки</span>
      </button>
    </nav>
  `,s.querySelectorAll(".navigation__item").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-page");S(t)})}),A())}function E(){switch(c){case"main":return I();case"stats":return D();case"settings":return x();default:return""}}function I(){return`
    <div class="page-content">
      <h1 class="title">Новый подход</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${r.getWorkoutTypes().map(e=>`<option value="${e.id}">${e.name}</option>`).join("")}
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
          ${P()}
        </div>
      </div>
    </div>
  `}function P(){const s=r.getLogs().slice(-10).reverse(),e=r.getWorkoutTypes();return s.length===0?'<p class="hint">Пока нет записей</p>':s.map(t=>{const i=e.find(n=>n.id===t.workoutTypeId);return`
      <div class="log-card">
        <div class="log-card__info">
          <div class="log-card__name">${(i==null?void 0:i.name)||"Удалено"}</div>
          <div class="log-card__details">${t.weight} кг × ${t.reps}</div>
        </div>
        <div class="log-card__date">${new Date(t.date).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
        <button class="log-card__delete" data-id="${t.id}">×</button>
      </div>
    `}).join("")}function x(){return`
    <div class="page-content">
      <h1 class="title">Настройки</h1>
      <div class="settings-section">
        <h2 class="subtitle">Типы тренировок</h2>
        <div class="type-list">
          ${r.getWorkoutTypes().map(e=>`
            <div class="type-item">
              <span>${e.name}</span>
              <button class="type-item__delete" data-id="${e.id}">Удалить</button>
            </div>
          `).join("")}
        </div>
        <form class="add-type-form" id="add-type-form">
          <input class="input" type="text" id="new-type-name" placeholder="Название (напр. Жим гантелей)" required>
          <button class="button button_secondary" type="submit">Добавить</button>
        </form>
      </div>
    </div>
  `}function D(){const s=r.getLogs(),e=r.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const t=v==="all"?s:s.filter(a=>a.workoutTypeId===v),i=t.reduce((a,o)=>a+o.weight*o.reps,0),n=t.reduce((a,o)=>a+o.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${e.map(a=>`<option value="${a.id}" ${v===a.id?"selected":""}>${a.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${v==="all"?"все":"тип"})</div>
          <div class="stat-card__value">${Math.round(i)} кг</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Повторений</div>
          <div class="stat-card__value">${n}</div>
        </div>
      </div>

      <div class="charts-section">
        <h2 class="subtitle">Прогресс (макс. вес)</h2>
        <div class="chart-container">
           ${W(t)}
        </div>
      </div>
    </div>
  `}function W(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const t=[...s].sort((d,g)=>new Date(d.date).getTime()-new Date(g.date).getTime()).map(d=>d.weight),i=Math.min(...t),n=Math.max(...t),a=n-i||1,o=400,p=150,l=20,$=t.map((d,g)=>{const m=l+g/(t.length-1)*(o-2*l),f=p-l-(d-i)/a*(p-2*l);return`${m},${f}`}).join(" ");return`
    <svg viewBox="0 0 ${o} ${p}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${$}"
      />
      ${t.map((d,g)=>{const m=l+g/(t.length-1)*(o-2*l),f=p-l-(d-i)/a*(p-2*l);return`<circle cx="${m}" cy="${f}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${i}кг</span>
      <span class="hint">${n}кг</span>
    </div>
  `}function A(){if(c==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",e=>{e.preventDefault();const t=new FormData(s);r.addLog({workoutTypeId:t.get("typeId"),weight:parseFloat(t.get("weight")),reps:parseInt(t.get("reps"),10)}),u()}),document.querySelectorAll(".log-card__delete").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-id");t&&(r.deleteLog(t),u())})})}if(c==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",e=>{e.preventDefault();const t=document.getElementById("new-type-name");t.value&&(r.addWorkoutType(t.value),u())}),document.querySelectorAll(".type-item__delete").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-id");t&&confirm("Удалить этот тип тренировки?")&&(r.deleteWorkoutType(t),u())})})}if(c==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{v=s.value,u()})}}u();
