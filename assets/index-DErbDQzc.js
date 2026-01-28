var S=Object.defineProperty;var E=(s,t,e)=>t in s?S(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var w=(s,t,e)=>E(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=e(n);fetch(n.href,a)}})();const b="gym_twa_data",T="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var $;const f=($=window.Telegram)==null?void 0:$.WebApp,k={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class D{constructor(){w(this,"data");w(this,"onUpdateCallback");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return f!=null&&f.initData&&(t["X-Telegram-Init-Data"]=f.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}loadLocal(){const t=localStorage.getItem(b);if(!t)return k;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),k}}saveLocal(){localStorage.setItem(b,JSON.stringify(this.data))}async syncFromServer(){var t;try{const e=await fetch(T,{headers:this.getHeaders()});if(e.ok){const i=await e.json();i&&(i.workoutTypes||i.logs)&&(this.data=i,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this))}}catch(e){console.error("Failed to sync from server",e)}}async saveToServer(){try{await fetch(T,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)})}catch(t){console.error("Failed to save to server",t)}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}}const d=new D;var L;const _=(L=window.Telegram)==null?void 0:L.WebApp;_&&(_.ready(),_.expand());let v="main",y="all";function I(s){v=s,g()}function g(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${x()}
    </main>
    <nav class="navigation">
      <button class="navigation__item ${v==="main"?"navigation__item_active":""}" data-page="main">
        <span class="navigation__icon">🏋️</span>
        <span class="navigation__label">Тренировка</span>
      </button>
      <button class="navigation__item ${v==="stats"?"navigation__item_active":""}" data-page="stats">
        <span class="navigation__icon">📊</span>
        <span class="navigation__label">Статистика</span>
      </button>
      <button class="navigation__item ${v==="settings"?"navigation__item_active":""}" data-page="settings">
        <span class="navigation__icon">⚙️</span>
        <span class="navigation__label">Настройки</span>
      </button>
    </nav>
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");I(e)})}),q())}function x(){switch(v){case"main":return j();case"stats":return P();case"settings":return O();default:return""}}function j(){const s=d.getWorkoutTypes(),t=d.getLogs(),e=t[t.length-1],i=e==null?void 0:e.workoutTypeId;return`
    <div class="page-content">
      <h1 class="title">Новый подход</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(n=>`<option value="${n.id}" ${n.id===i?"selected":""}>${n.name}</option>`).join("")}
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
          ${A()}
        </div>
      </div>
    </div>
  `}function A(){const s=d.getLogs(),t=d.getWorkoutTypes();if(s.length===0)return'<p class="hint">Пока нет записей</p>';const e=new Date,i=new Date(e.getTime()-7*24*60*60*1e3);i.setHours(0,0,0,0);const n=s.filter(r=>new Date(r.date)>=i);if(n.length===0)return'<p class="hint">За последнюю неделю записей нет</p>';const a=new Map;[...n].sort((r,l)=>new Date(l.date).getTime()-new Date(r.date).getTime()).forEach(r=>{const p=new Date(r.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});a.has(p)||a.set(p,[]),a.get(p).push(r)});let o="";return a.forEach((r,l)=>{o+='<div class="log-day">',o+=`<div class="log-day__header">${l}</div>`;const p=new Map;[...r].reverse().forEach(c=>{p.has(c.workoutTypeId)||p.set(c.workoutTypeId,[]),p.get(c.workoutTypeId).push(c)}),p.forEach((c,h)=>{const m=t.find(u=>u.id===h);o+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${(m==null?void 0:m.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${[...c].reverse().map(u=>`
              <div class="log-set">
                <div class="log-set__info">
                  <span class="log-set__weight">${u.weight} кг</span>
                  <span class="log-set__times">×</span>
                  <span class="log-set__reps">${u.reps}</span>
                </div>
                <button class="log-set__delete" data-id="${u.id}">×</button>
              </div>
            `).join("")}
          </div>
        </div>
      `}),o+="</div>"}),o}function O(){return`
    <div class="page-content">
      <h1 class="title">Настройки</h1>
      <div class="settings-section">
        <h2 class="subtitle">Типы тренировок</h2>
        <div class="type-list">
          ${d.getWorkoutTypes().map(t=>`
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
  `}function P(){const s=d.getLogs(),t=d.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=y==="all"?s:s.filter(a=>a.workoutTypeId===y),i=e.reduce((a,o)=>a+o.weight*o.reps,0),n=e.reduce((a,o)=>a+o.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(a=>`<option value="${a.id}" ${y===a.id?"selected":""}>${a.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${y==="all"?"все":"тип"})</div>
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
  `}function W(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((c,h)=>new Date(c.date).getTime()-new Date(h.date).getTime()).map(c=>c.weight),i=Math.min(...e),n=Math.max(...e),a=n-i||1,o=400,r=150,l=20,p=e.map((c,h)=>{const m=l+h/(e.length-1)*(o-2*l),u=r-l-(c-i)/a*(r-2*l);return`${m},${u}`}).join(" ");return`
    <svg viewBox="0 0 ${o} ${r}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${p}"
      />
      ${e.map((c,h)=>{const m=l+h/(e.length-1)*(o-2*l),u=r-l-(c-i)/a*(r-2*l);return`<circle cx="${m}" cy="${u}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${i}кг</span>
      <span class="hint">${n}кг</span>
    </div>
  `}function q(){if(v==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=new FormData(s);await d.addLog({workoutTypeId:e.get("typeId"),weight:parseFloat(e.get("weight")),reps:parseInt(e.get("reps"),10)}),g()}),document.querySelectorAll(".log-set__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&(await d.deleteLog(e),g())})})}if(v==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await d.addWorkoutType(e.value),g())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await d.deleteWorkoutType(e),g())})})}if(v==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{y=s.value,g()})}}d.onUpdate(()=>g());async function F(){g(),await d.init()}F();
