var I=Object.defineProperty;var S=(a,t,e)=>t in a?I(a,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):a[t]=e;var b=(a,t,e)=>S(a,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=e(s);fetch(s.href,n)}})();const $="gym_twa_data",L="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var k;const w=(k=window.Telegram)==null?void 0:k.WebApp,T={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class D{constructor(){b(this,"data");b(this,"onUpdateCallback");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return w!=null&&w.initData&&(t["X-Telegram-Init-Data"]=w.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}loadLocal(){const t=localStorage.getItem($);if(!t)return T;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),T}}saveLocal(){localStorage.setItem($,JSON.stringify(this.data))}async syncFromServer(){var t;try{const e=await fetch(L,{headers:this.getHeaders()});if(e.ok){const i=await e.json();i&&(i.workoutTypes||i.logs)&&(this.data=i,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this))}}catch(e){console.error("Failed to sync from server",e)}}async saveToServer(){try{await fetch(L,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)})}catch(t){console.error("Failed to save to server",t)}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}async updateLog(t){const e=this.data.logs.findIndex(i=>i.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}}const c=new D;var E;const _=(E=window.Telegram)==null?void 0:E.WebApp;_&&(_.ready(),_.expand());let h="main",f="all",l=null;function x(a){h=a,g()}function g(){const a=document.getElementById("app");a&&(a.innerHTML=`
    <main class="content">
      ${A()}
    </main>
    <nav class="navigation">
      <button class="navigation__item ${h==="main"?"navigation__item_active":""}" data-page="main">
        <span class="navigation__icon">🏋️</span>
        <span class="navigation__label">Тренировка</span>
      </button>
      <button class="navigation__item ${h==="stats"?"navigation__item_active":""}" data-page="stats">
        <span class="navigation__icon">📊</span>
        <span class="navigation__label">Статистика</span>
      </button>
      <button class="navigation__item ${h==="settings"?"navigation__item_active":""}" data-page="settings">
        <span class="navigation__icon">⚙️</span>
        <span class="navigation__label">Настройки</span>
      </button>
    </nav>
  `,a.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");x(e)})}),F())}function A(){switch(h){case"main":return j();case"stats":return q();case"settings":return P();default:return""}}function j(){var n;const a=c.getWorkoutTypes(),t=c.getLogs(),e=t[t.length-1],i=e==null?void 0:e.workoutTypeId,s=l?t.find(o=>o.id===l):null;return`
    <div class="page-content" id="main-content">
      <h1 class="title">${l?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${a.map(o=>`<option value="${o.id}" ${(l?s&&o.id===s.workoutTypeId:o.id===i)?"selected":""}>${o.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${l&&s?s.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${l&&s?s.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${l?"Сохранить изменения":"Зафиксировать"}</button>
        ${l?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!l&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(n=a.find(o=>o.id===e.workoutTypeId))==null?void 0:n.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <h2 class="subtitle">Последние записи</h2>
        <div id="logs-list">
          ${O()}
        </div>
      </div>
    </div>
  `}function O(){const a=c.getLogs(),t=c.getWorkoutTypes();if(a.length===0)return'<p class="hint">Пока нет записей</p>';const e=new Date,i=new Date(e.getTime()-7*24*60*60*1e3);i.setHours(0,0,0,0);const s=a.filter(r=>new Date(r.date)>=i);if(s.length===0)return'<p class="hint">За последнюю неделю записей нет</p>';const n=new Map;[...s].sort((r,d)=>new Date(d.date).getTime()-new Date(r.date).getTime()).forEach(r=>{const v=new Date(r.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});n.has(v)||n.set(v,[]),n.get(v).push(r)});let o="";return n.forEach((r,d)=>{o+='<div class="log-day">',o+=`<div class="log-day__header">${d}</div>`;const v=new Map;[...r].reverse().forEach(p=>{v.has(p.workoutTypeId)||v.set(p.workoutTypeId,[]),v.get(p.workoutTypeId).push(p)}),v.forEach((p,y)=>{const m=t.find(u=>u.id===y);o+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${(m==null?void 0:m.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${[...p].reverse().map(u=>`
              <div class="log-set ${u.id===l?"log-set_active-edit":""}">
                <div class="log-set__info">
                  <span class="log-set__weight">${u.weight} кг</span>
                  <span class="log-set__times">×</span>
                  <span class="log-set__reps">${u.reps}</span>
                </div>
                <div class="log-set__actions">
                  <button class="log-set__edit" data-id="${u.id}">✏️</button>
                  <button class="log-set__delete" data-id="${u.id}">×</button>
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
  `}function q(){const a=c.getLogs(),t=c.getWorkoutTypes();if(a.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=f==="all"?a:a.filter(n=>n.workoutTypeId===f),i=e.reduce((n,o)=>n+o.weight*o.reps,0),s=e.reduce((n,o)=>n+o.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(n=>`<option value="${n.id}" ${f===n.id?"selected":""}>${n.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${f==="all"?"все":"тип"})</div>
          <div class="stat-card__value">${Math.round(i)} кг</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Повторений</div>
          <div class="stat-card__value">${s}</div>
        </div>
      </div>

      <div class="charts-section">
        <h2 class="subtitle">Прогресс (макс. вес)</h2>
        <div class="chart-container">
           ${W(e)}
        </div>
      </div>
    </div>
  `}function W(a){if(a.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...a].sort((p,y)=>new Date(p.date).getTime()-new Date(y.date).getTime()).map(p=>p.weight),i=Math.min(...e),s=Math.max(...e),n=s-i||1,o=400,r=150,d=20,v=e.map((p,y)=>{const m=d+y/(e.length-1)*(o-2*d),u=r-d-(p-i)/n*(r-2*d);return`${m},${u}`}).join(" ");return`
    <svg viewBox="0 0 ${o} ${r}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${v}"
      />
      ${e.map((p,y)=>{const m=d+y/(e.length-1)*(o-2*d),u=r-d-(p-i)/n*(r-2*d);return`<circle cx="${m}" cy="${u}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${i}кг</span>
      <span class="hint">${s}кг</span>
    </div>
  `}function F(){if(h==="main"){const a=document.getElementById("log-form");a==null||a.addEventListener("submit",async i=>{i.preventDefault();const s=new FormData(a),n={workoutTypeId:s.get("typeId"),weight:parseFloat(s.get("weight")),reps:parseInt(s.get("reps"),10)};if(l){const r=c.getLogs().find(d=>d.id===l);r&&(await c.updateLog({...r,...n}),l=null)}else await c.addLog(n);g()});const t=document.getElementById("duplicate-last-btn");t==null||t.addEventListener("click",async()=>{const i=c.getLogs(),s=i[i.length-1];s&&(await c.addLog({workoutTypeId:s.workoutTypeId,weight:s.weight,reps:s.reps}),g())});const e=document.getElementById("cancel-edit-btn");e==null||e.addEventListener("click",()=>{l=null,g()}),document.querySelectorAll(".log-set__delete").forEach(i=>{i.addEventListener("click",async()=>{const s=i.getAttribute("data-id");s&&(l===s&&(l=null),await c.deleteLog(s),g())})}),document.querySelectorAll(".log-set__edit").forEach(i=>{i.addEventListener("click",()=>{l=i.getAttribute("data-id"),g(),window.scrollTo({top:0,behavior:"smooth"})})})}if(h==="settings"){const a=document.getElementById("add-type-form");a==null||a.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await c.addWorkoutType(e.value),g())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await c.deleteWorkoutType(e),g())})})}if(h==="stats"){const a=document.getElementById("stat-type-select");a==null||a.addEventListener("change",()=>{f=a.value,g()})}}c.onUpdate(()=>g());async function M(){g(),await c.init()}M();
