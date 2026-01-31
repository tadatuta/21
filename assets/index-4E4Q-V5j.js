var I=Object.defineProperty;var x=(s,t,e)=>t in s?I(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var w=(s,t,e)=>x(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(a){if(a.ep)return;a.ep=!0;const n=e(a);fetch(a.href,n)}})();const k="gym_twa_data",$="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var L;const _=(L=window.Telegram)==null?void 0:L.WebApp,T={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class D{constructor(){w(this,"data");w(this,"onUpdateCallback");w(this,"onSyncStatusChangeCallback");w(this,"status","idle");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return _!=null&&_.initData&&(t["X-Telegram-Init-Data"]=_.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(k);if(!t)return T;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),T}}saveLocal(){localStorage.setItem(k,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch($,{headers:this.getHeaders()});if(e.ok){const i=await e.json();i&&(i.workoutTypes||i.logs)&&(this.data=i,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch($,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}async updateLog(t){const e=this.data.logs.findIndex(i=>i.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}}const c=new D;var E;const S=(E=window.Telegram)==null?void 0:E.WebApp;S&&(S.ready(),S.expand());let v="main",b="all",l=null;function C(s){v=s,g()}function g(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${A()}
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
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");C(e)})}),N())}function A(){switch(v){case"main":return j();case"stats":return q();case"settings":return P();default:return""}}function j(){var n;const s=c.getWorkoutTypes(),t=c.getLogs(),e=t[t.length-1],i=e==null?void 0:e.workoutTypeId,a=l?t.find(o=>o.id===l):null;return`
    <div class="page-content" id="main-content">
      <h1 class="title">${l?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(o=>`<option value="${o.id}" ${(l?a&&o.id===a.workoutTypeId:o.id===i)?"selected":""}>${o.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${l&&a?a.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${l&&a?a.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${l?"Сохранить изменения":"Зафиксировать"}</button>
        ${l?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!l&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(n=s.find(o=>o.id===e.workoutTypeId))==null?void 0:n.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <h2 class="subtitle">Последние записи</h2>
        <div id="logs-list">
          ${O()}
        </div>
      </div>
    </div>
  `}function O(){const s=c.getLogs(),t=c.getWorkoutTypes();if(s.length===0)return'<p class="hint">Пока нет записей</p>';const e=new Date,i=new Date(e.getTime()-7*24*60*60*1e3);i.setHours(0,0,0,0);const a=s.filter(r=>new Date(r.date)>=i);if(a.length===0)return'<p class="hint">За последнюю неделю записей нет</p>';const n=new Map;[...a].sort((r,d)=>new Date(d.date).getTime()-new Date(r.date).getTime()).forEach(r=>{const h=new Date(r.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});n.has(h)||n.set(h,[]),n.get(h).push(r)});let o="";return n.forEach((r,d)=>{o+='<div class="log-day">',o+=`<div class="log-day__header">${d}</div>`;const h=new Map;r.forEach(u=>{h.has(u.workoutTypeId)||h.set(u.workoutTypeId,[]),h.get(u.workoutTypeId).push(u)}),h.forEach((u,y)=>{const m=t.find(p=>p.id===y);o+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${(m==null?void 0:m.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${u.map(p=>`
              <div class="log-set ${p.id===l?"log-set_active-edit":""}">
                <div class="log-set__info">
                  <span class="log-set__weight">${p.weight} кг</span>
                  <span class="log-set__times">×</span>
                  <span class="log-set__reps">${p.reps}</span>
                </div>
                <div class="log-set__actions">
                  <button class="log-set__edit" data-id="${p.id}">✏️</button>
                  <button class="log-set__delete" data-id="${p.id}">×</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `}),o+="</div>"}),o}function P(){return`
    <div class="page-content">
      <h1 class="title">Настройки</h1>
      <div class="settings-section">
        <h2 class="subtitle">Типы тренировок</h2>
        <div class="type-list">
          ${c.getWorkoutTypes().map(t=>`
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
  `}function q(){const s=c.getLogs(),t=c.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=b==="all"?s:s.filter(n=>n.workoutTypeId===b),i=e.reduce((n,o)=>n+o.weight*o.reps,0),a=e.reduce((n,o)=>n+o.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(n=>`<option value="${n.id}" ${b===n.id?"selected":""}>${n.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${b==="all"?"все":"тип"})</div>
          <div class="stat-card__value">${Math.round(i)} кг</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Повторений</div>
          <div class="stat-card__value">${a}</div>
        </div>
      </div>

      <div class="charts-section">
        <h2 class="subtitle">Прогресс (макс. вес)</h2>
        <div class="chart-container">
           ${W(e)}
        </div>
      </div>
    </div>
  `}function W(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((u,y)=>new Date(u.date).getTime()-new Date(y.date).getTime()).map(u=>u.weight),i=Math.min(...e),a=Math.max(...e),n=a-i||1,o=400,r=150,d=20,h=e.map((u,y)=>{const m=d+y/(e.length-1)*(o-2*d),p=r-d-(u-i)/n*(r-2*d);return`${m},${p}`}).join(" ");return`
    <svg viewBox="0 0 ${o} ${r}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${h}"
      />
      ${e.map((u,y)=>{const m=d+y/(e.length-1)*(o-2*d),p=r-d-(u-i)/n*(r-2*d);return`<circle cx="${m}" cy="${p}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${i}кг</span>
      <span class="hint">${a}кг</span>
    </div>
  `}function N(){if(v==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",async i=>{i.preventDefault();const a=new FormData(s),n={workoutTypeId:a.get("typeId"),weight:parseFloat(a.get("weight")),reps:parseInt(a.get("reps"),10)};if(l){const r=c.getLogs().find(d=>d.id===l);r&&(await c.updateLog({...r,...n}),l=null)}else await c.addLog(n);g()});const t=document.getElementById("duplicate-last-btn");t==null||t.addEventListener("click",async()=>{const i=c.getLogs(),a=i[i.length-1];a&&(await c.addLog({workoutTypeId:a.workoutTypeId,weight:a.weight,reps:a.reps}),g())});const e=document.getElementById("cancel-edit-btn");e==null||e.addEventListener("click",()=>{l=null,g()}),document.querySelectorAll(".log-set__delete").forEach(i=>{i.addEventListener("click",async()=>{const a=i.getAttribute("data-id");a&&(l===a&&(l=null),await c.deleteLog(a),g())})}),document.querySelectorAll(".log-set__edit").forEach(i=>{i.addEventListener("click",()=>{l=i.getAttribute("data-id"),g(),window.scrollTo({top:0,behavior:"smooth"})})})}if(v==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await c.addWorkoutType(e.value),g())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await c.deleteWorkoutType(e),g())})})}if(v==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{b=s.value,g()})}}const f=document.createElement("div");f.className="sync-status";document.body.appendChild(f);function F(s){switch(f.className="sync-status visible "+s,s){case"saving":f.textContent="Сохранение...";break;case"success":f.textContent="Сохранено";break;case"error":f.textContent="Ошибка сохранения";break;default:f.className="sync-status"}}c.onUpdate(()=>g());c.onSyncStatusChange(F);async function M(){g(),await c.init()}M();
