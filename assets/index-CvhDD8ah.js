var S=Object.defineProperty;var E=(a,t,e)=>t in a?S(a,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):a[t]=e;var f=(a,t,e)=>E(a,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=e(n);fetch(n.href,s)}})();const b="gym_twa_data",w="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var T;const m=(T=window.Telegram)==null?void 0:T.WebApp,$={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class I{constructor(){f(this,"data");f(this,"onUpdateCallback");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return m!=null&&m.initData&&(t["X-Telegram-Init-Data"]=m.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}loadLocal(){const t=localStorage.getItem(b);if(!t)return $;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),$}}saveLocal(){localStorage.setItem(b,JSON.stringify(this.data))}async syncFromServer(){var t;try{const e=await fetch(w,{headers:this.getHeaders()});if(e.ok){const i=await e.json();i&&(i.workoutTypes||i.logs)&&(this.data=i,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this))}}catch(e){console.error("Failed to sync from server",e)}}async saveToServer(){try{await fetch(w,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)})}catch(t){console.error("Failed to save to server",t)}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}}const r=new I;var L;const _=(L=window.Telegram)==null?void 0:L.WebApp;_&&(_.ready(),_.expand());let d="main",v="all";function D(a){d=a,l()}function l(){const a=document.getElementById("app");a&&(a.innerHTML=`
    <main class="content">
      ${j()}
    </main>
    <nav class="navigation">
      <button class="navigation__item ${d==="main"?"navigation__item_active":""}" data-page="main">
        <span class="navigation__icon">🏋️</span>
        <span class="navigation__label">Тренировка</span>
      </button>
      <button class="navigation__item ${d==="stats"?"navigation__item_active":""}" data-page="stats">
        <span class="navigation__icon">📊</span>
        <span class="navigation__label">Статистика</span>
      </button>
      <button class="navigation__item ${d==="settings"?"navigation__item_active":""}" data-page="settings">
        <span class="navigation__icon">⚙️</span>
        <span class="navigation__label">Настройки</span>
      </button>
    </nav>
  `,a.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");D(e)})}),q())}function j(){switch(d){case"main":return x();case"stats":return A();case"settings":return P();default:return""}}function x(){return`
    <div class="page-content">
      <h1 class="title">Новый подход</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${r.getWorkoutTypes().map(t=>`<option value="${t.id}">${t.name}</option>`).join("")}
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
          ${O()}
        </div>
      </div>
    </div>
  `}function O(){const a=r.getLogs().slice(-10).reverse(),t=r.getWorkoutTypes();return a.length===0?'<p class="hint">Пока нет записей</p>':a.map(e=>{const i=t.find(n=>n.id===e.workoutTypeId);return`
      <div class="log-card">
        <div class="log-card__info">
          <div class="log-card__name">${(i==null?void 0:i.name)||"Удалено"}</div>
          <div class="log-card__details">${e.weight} кг × ${e.reps}</div>
        </div>
        <div class="log-card__date">${new Date(e.date).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
        <button class="log-card__delete" data-id="${e.id}">×</button>
      </div>
    `}).join("")}function P(){return`
    <div class="page-content">
      <h1 class="title">Настройки</h1>
      <div class="settings-section">
        <h2 class="subtitle">Типы тренировок</h2>
        <div class="type-list">
          ${r.getWorkoutTypes().map(t=>`
            <div class="type-item">
              <span>${t.name}</span>
              <button class="type-item__delete" data-id="${t.id}">Удалить</button>
            </div>
          `).join("")}
        </div>
        <form class="add-type-form" id="add-type-form">
          <input class="input" type="text" id="new-type-name" placeholder="Название (напр. Жим гантелей)" required>
          <button class="button button_secondary" type="submit">Добавить</button>
        </form>
      </div>
    </div>
  `}function A(){const a=r.getLogs(),t=r.getWorkoutTypes();if(a.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=v==="all"?a:a.filter(s=>s.workoutTypeId===v),i=e.reduce((s,o)=>s+o.weight*o.reps,0),n=e.reduce((s,o)=>s+o.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(s=>`<option value="${s.id}" ${v===s.id?"selected":""}>${s.name}</option>`).join("")}
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
           ${W(e)}
        </div>
      </div>
    </div>
  `}function W(a){if(a.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...a].sort((p,g)=>new Date(p.date).getTime()-new Date(g.date).getTime()).map(p=>p.weight),i=Math.min(...e),n=Math.max(...e),s=n-i||1,o=400,u=150,c=20,k=e.map((p,g)=>{const h=c+g/(e.length-1)*(o-2*c),y=u-c-(p-i)/s*(u-2*c);return`${h},${y}`}).join(" ");return`
    <svg viewBox="0 0 ${o} ${u}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${k}"
      />
      ${e.map((p,g)=>{const h=c+g/(e.length-1)*(o-2*c),y=u-c-(p-i)/s*(u-2*c);return`<circle cx="${h}" cy="${y}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${i}кг</span>
      <span class="hint">${n}кг</span>
    </div>
  `}function q(){if(d==="main"){const a=document.getElementById("log-form");a==null||a.addEventListener("submit",async t=>{t.preventDefault();const e=new FormData(a);await r.addLog({workoutTypeId:e.get("typeId"),weight:parseFloat(e.get("weight")),reps:parseInt(e.get("reps"),10)}),l()}),document.querySelectorAll(".log-card__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&(await r.deleteLog(e),l())})})}if(d==="settings"){const a=document.getElementById("add-type-form");a==null||a.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await r.addWorkoutType(e.value),l())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await r.deleteWorkoutType(e),l())})})}if(d==="stats"){const a=document.getElementById("stat-type-select");a==null||a.addEventListener("change",()=>{v=a.value,l()})}}r.onUpdate(()=>l());async function F(){l(),await r.init()}F();
