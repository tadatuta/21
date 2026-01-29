var S=Object.defineProperty;var E=(s,e,t)=>e in s?S(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var w=(s,e,t)=>E(s,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function t(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(o){if(o.ep)return;o.ep=!0;const a=t(o);fetch(o.href,a)}})();const b="gym_twa_data",T="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var $;const f=($=window.Telegram)==null?void 0:$.WebApp,k={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class I{constructor(){w(this,"data");w(this,"onUpdateCallback");this.data=this.loadLocal()}getHeaders(){const e={"Content-Type":"application/json"};return f!=null&&f.initData&&(e["X-Telegram-Init-Data"]=f.initData),e}async init(){await this.syncFromServer()}onUpdate(e){this.onUpdateCallback=e}loadLocal(){const e=localStorage.getItem(b);if(!e)return k;try{return JSON.parse(e)}catch(t){return console.error("Failed to parse storage data",t),k}}saveLocal(){localStorage.setItem(b,JSON.stringify(this.data))}async syncFromServer(){var e;try{const t=await fetch(T,{headers:this.getHeaders()});if(t.ok){const n=await t.json();n&&(n.workoutTypes||n.logs)&&(this.data=n,this.saveLocal(),(e=this.onUpdateCallback)==null||e.call(this))}}catch(t){console.error("Failed to sync from server",t)}}async saveToServer(){try{await fetch(T,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)})}catch(e){console.error("Failed to save to server",e)}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(e){const t={id:Date.now().toString(),name:e};return this.data.workoutTypes.push(t),await this.persist(),t}async deleteWorkoutType(e){this.data.workoutTypes=this.data.workoutTypes.filter(t=>t.id!==e),await this.persist()}getLogs(){return this.data.logs}async addLog(e){const t={...e,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(t),await this.persist(),t}async deleteLog(e){this.data.logs=this.data.logs.filter(t=>t.id!==e),await this.persist()}}const r=new I;var L;const _=(L=window.Telegram)==null?void 0:L.WebApp;_&&(_.ready(),_.expand());let v="main",m="all";function D(s){v=s,g()}function g(){const s=document.getElementById("app");s&&(s.innerHTML=`
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
  `,s.querySelectorAll(".navigation__item").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-page");D(t)})}),q())}function x(){switch(v){case"main":return j();case"stats":return P();case"settings":return O();default:return""}}function j(){var o;const s=r.getWorkoutTypes(),e=r.getLogs(),t=e[e.length-1],n=t==null?void 0:t.workoutTypeId;return`
    <div class="page-content">
      <h1 class="title">Новый подход</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(a=>`<option value="${a.id}" ${a.id===n?"selected":""}>${a.name}</option>`).join("")}
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
        ${t?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(o=s.find(a=>a.id===t.workoutTypeId))==null?void 0:o.name} ${t.weight}кг × ${t.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <h2 class="subtitle">Последние записи</h2>
        <div id="logs-list">
          ${A()}
        </div>
      </div>
    </div>
  `}function A(){const s=r.getLogs(),e=r.getWorkoutTypes();if(s.length===0)return'<p class="hint">Пока нет записей</p>';const t=new Date,n=new Date(t.getTime()-7*24*60*60*1e3);n.setHours(0,0,0,0);const o=s.filter(c=>new Date(c.date)>=n);if(o.length===0)return'<p class="hint">За последнюю неделю записей нет</p>';const a=new Map;[...o].sort((c,d)=>new Date(d.date).getTime()-new Date(c.date).getTime()).forEach(c=>{const p=new Date(c.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});a.has(p)||a.set(p,[]),a.get(p).push(c)});let i="";return a.forEach((c,d)=>{i+='<div class="log-day">',i+=`<div class="log-day__header">${d}</div>`;const p=new Map;[...c].reverse().forEach(l=>{p.has(l.workoutTypeId)||p.set(l.workoutTypeId,[]),p.get(l.workoutTypeId).push(l)}),p.forEach((l,h)=>{const y=e.find(u=>u.id===h);i+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${(y==null?void 0:y.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${[...l].reverse().map(u=>`
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
      `}),i+="</div>"}),i}function O(){return`
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
  `}function P(){const s=r.getLogs(),e=r.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const t=m==="all"?s:s.filter(a=>a.workoutTypeId===m),n=t.reduce((a,i)=>a+i.weight*i.reps,0),o=t.reduce((a,i)=>a+i.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${e.map(a=>`<option value="${a.id}" ${m===a.id?"selected":""}>${a.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${m==="all"?"все":"тип"})</div>
          <div class="stat-card__value">${Math.round(n)} кг</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Повторений</div>
          <div class="stat-card__value">${o}</div>
        </div>
      </div>

      <div class="charts-section">
        <h2 class="subtitle">Прогресс (макс. вес)</h2>
        <div class="chart-container">
           ${W(t)}
        </div>
      </div>
    </div>
  `}function W(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const t=[...s].sort((l,h)=>new Date(l.date).getTime()-new Date(h.date).getTime()).map(l=>l.weight),n=Math.min(...t),o=Math.max(...t),a=o-n||1,i=400,c=150,d=20,p=t.map((l,h)=>{const y=d+h/(t.length-1)*(i-2*d),u=c-d-(l-n)/a*(c-2*d);return`${y},${u}`}).join(" ");return`
    <svg viewBox="0 0 ${i} ${c}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${p}"
      />
      ${t.map((l,h)=>{const y=d+h/(t.length-1)*(i-2*d),u=c-d-(l-n)/a*(c-2*d);return`<circle cx="${y}" cy="${u}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${n}кг</span>
      <span class="hint">${o}кг</span>
    </div>
  `}function q(){if(v==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const n=new FormData(s);await r.addLog({workoutTypeId:n.get("typeId"),weight:parseFloat(n.get("weight")),reps:parseInt(n.get("reps"),10)}),g()});const e=document.getElementById("duplicate-last-btn");e==null||e.addEventListener("click",async()=>{const t=r.getLogs(),n=t[t.length-1];n&&(await r.addLog({workoutTypeId:n.workoutTypeId,weight:n.weight,reps:n.reps}),g())}),document.querySelectorAll(".log-set__delete").forEach(t=>{t.addEventListener("click",async()=>{const n=t.getAttribute("data-id");n&&(await r.deleteLog(n),g())})})}if(v==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("new-type-name");t.value&&(await r.addWorkoutType(t.value),g())}),document.querySelectorAll(".type-item__delete").forEach(e=>{e.addEventListener("click",async()=>{const t=e.getAttribute("data-id");t&&confirm("Удалить этот тип тренировки?")&&(await r.deleteWorkoutType(t),g())})})}if(v==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{m=s.value,g()})}}r.onUpdate(()=>g());async function F(){g(),await r.init()}F();
