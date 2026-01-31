var D=Object.defineProperty;var C=(s,t,e)=>t in s?D(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var _=(s,t,e)=>C(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function e(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(a){if(a.ep)return;a.ep=!0;const o=e(a);fetch(a.href,o)}})();const T="gym_twa_data",L="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var I;const S=(I=window.Telegram)==null?void 0:I.WebApp,E={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class j{constructor(){_(this,"data");_(this,"onUpdateCallback");_(this,"onSyncStatusChangeCallback");_(this,"status","idle");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return S!=null&&S.initData&&(t["X-Telegram-Init-Data"]=S.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(T);if(!t)return E;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),E}}saveLocal(){localStorage.setItem(T,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(L,{headers:this.getHeaders()});if(e.ok){const n=await e.json();n&&(n.workoutTypes||n.logs)&&(this.data=n,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(L,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}async updateLog(t){const e=this.data.logs.findIndex(n=>n.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}}const c=new j;var x;const w=(x=window.Telegram)==null?void 0:x.WebApp;w&&(w.ready(),w.expand());let v="main",k="all",p=null;function A(s){v=s,y()}function y(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${O()}
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
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");A(e)})}),R())}function O(){switch(v){case"main":return W();case"stats":return F();case"settings":return M();default:return""}}function W(){var o;const s=c.getWorkoutTypes(),t=c.getLogs(),e=t[t.length-1],n=e==null?void 0:e.workoutTypeId,a=p?t.find(i=>i.id===p):null;return`
    <div class="page-content" id="main-content">
      <h1 class="title">${p?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(i=>`<option value="${i.id}" ${(p?a&&i.id===a.workoutTypeId:i.id===n)?"selected":""}>${i.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${p&&a?a.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${p&&a?a.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${p?"Сохранить изменения":"Зафиксировать"}</button>
        ${p?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!p&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(o=s.find(i=>i.id===e.workoutTypeId))==null?void 0:o.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <h2 class="subtitle">Последние записи</h2>
        <div id="logs-list">
          ${q()}
        </div>
      </div>
    </div>
  `}function q(){const s=c.getLogs(),t=c.getWorkoutTypes();if(s.length===0)return'<p class="hint">Пока нет записей</p>';const e=new Date,n=new Date(e.getTime()-7*24*60*60*1e3);n.setHours(0,0,0,0);const a=s.filter(r=>new Date(r.date)>=n);if(a.length===0)return'<p class="hint">За последнюю неделю записей нет</p>';const o=new Map;[...a].sort((r,d)=>new Date(d.date).getTime()-new Date(r.date).getTime()).forEach(r=>{const l=new Date(r.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});o.has(l)||o.set(l,[]),o.get(l).push(r)});let i="";return o.forEach((r,d)=>{var h;const l=((h=r[0])==null?void 0:h.date.split("T")[0])||"";i+='<div class="log-day">',i+=`<div class="log-day__header">
      <span>${d}</span>
      <button class="share-btn" data-date="${l}" title="Поделиться">📤</button>
    </div>`;const u=new Map;r.forEach(g=>{u.has(g.workoutTypeId)||u.set(g.workoutTypeId,[]),u.get(g.workoutTypeId).push(g)}),u.forEach((g,b)=>{const $=t.find(m=>m.id===b);i+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${($==null?void 0:$.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${g.map(m=>`
              <div class="log-set ${m.id===p?"log-set_active-edit":""}">
                <div class="log-set__info">
                  <span class="log-set__weight">${m.weight} кг</span>
                  <span class="log-set__times">×</span>
                  <span class="log-set__reps">${m.reps}</span>
                </div>
                <div class="log-set__actions">
                  <button class="log-set__edit" data-id="${m.id}">✏️</button>
                  <button class="log-set__delete" data-id="${m.id}">×</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      `}),i+="</div>"}),i}function M(){return`
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
  `}function F(){const s=c.getLogs(),t=c.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=k==="all"?s:s.filter(o=>o.workoutTypeId===k),n=e.reduce((o,i)=>o+i.weight*i.reps,0),a=e.reduce((o,i)=>o+i.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(o=>`<option value="${o.id}" ${k===o.id?"selected":""}>${o.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${k==="all"?"все":"тип"})</div>
          <div class="stat-card__value">${Math.round(n)} кг</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Повторений</div>
          <div class="stat-card__value">${a}</div>
        </div>
      </div>

      <div class="charts-section">
        <h2 class="subtitle">Прогресс (макс. вес)</h2>
        <div class="chart-container">
           ${N(e)}
        </div>
      </div>
    </div>
  `}function N(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((u,h)=>new Date(u.date).getTime()-new Date(h.date).getTime()).map(u=>u.weight),n=Math.min(...e),a=Math.max(...e),o=a-n||1,i=400,r=150,d=20,l=e.map((u,h)=>{const g=d+h/(e.length-1)*(i-2*d),b=r-d-(u-n)/o*(r-2*d);return`${g},${b}`}).join(" ");return`
    <svg viewBox="0 0 ${i} ${r}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${l}"
      />
      ${e.map((u,h)=>{const g=d+h/(e.length-1)*(i-2*d),b=r-d-(u-n)/o*(r-2*d);return`<circle cx="${g}" cy="${b}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${n}кг</span>
      <span class="hint">${a}кг</span>
    </div>
  `}function P(s){const t=c.getLogs(),e=c.getWorkoutTypes(),n=t.filter(l=>l.date.startsWith(s));if(n.length===0)return"";const o=new Date(n[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),i=new Map;n.forEach(l=>{i.has(l.workoutTypeId)||i.set(l.workoutTypeId,[]),i.get(l.workoutTypeId).push(l)});let r=`🏋️ Тренировка ${o}

`;i.forEach((l,u)=>{const h=e.find(g=>g.id===u);r+=`${(h==null?void 0:h.name)||"Упражнение"}:
`,l.forEach(g=>{r+=`  ${g.weight} кг × ${g.reps}
`}),r+=`
`});const d=n.reduce((l,u)=>l+u.weight*u.reps,0);return r+=`💪 Общий объём: ${Math.round(d)} кг`,r}function U(s){const t=P(s);t&&(w!=null&&w.switchInlineQuery?w.switchInlineQuery(t,["users","groups","channels"]):navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")}))}function R(){if(v==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",async n=>{n.preventDefault();const a=new FormData(s),o={workoutTypeId:a.get("typeId"),weight:parseFloat(a.get("weight")),reps:parseInt(a.get("reps"),10)};if(p){const r=c.getLogs().find(d=>d.id===p);r&&(await c.updateLog({...r,...o}),p=null)}else await c.addLog(o);y()});const t=document.getElementById("duplicate-last-btn");t==null||t.addEventListener("click",async()=>{const n=c.getLogs(),a=n[n.length-1];a&&(await c.addLog({workoutTypeId:a.workoutTypeId,weight:a.weight,reps:a.reps}),y())});const e=document.getElementById("cancel-edit-btn");e==null||e.addEventListener("click",()=>{p=null,y()}),document.querySelectorAll(".log-set__delete").forEach(n=>{n.addEventListener("click",async()=>{const a=n.getAttribute("data-id");a&&(p===a&&(p=null),await c.deleteLog(a),y())})}),document.querySelectorAll(".log-set__edit").forEach(n=>{n.addEventListener("click",()=>{p=n.getAttribute("data-id"),y(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(n=>{n.addEventListener("click",()=>{const a=n.getAttribute("data-date");a&&U(a)})})}if(v==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await c.addWorkoutType(e.value),y())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await c.deleteWorkoutType(e),y())})})}if(v==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{k=s.value,y()})}}const f=document.createElement("div");f.className="sync-status";document.body.appendChild(f);function B(s){switch(f.className="sync-status visible "+s,s){case"saving":f.textContent="Сохранение...";break;case"success":f.textContent="Сохранено";break;case"error":f.textContent="Ошибка сохранения";break;default:f.className="sync-status"}}c.onUpdate(()=>y());c.onSyncStatusChange(B);async function H(){y(),await c.init()}H();
