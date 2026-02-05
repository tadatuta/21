var Z=Object.defineProperty;var tt=(s,t,e)=>t in s?Z(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var W=(s,t,e)=>tt(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=e(n);fetch(n.href,i)}})();const V="gym_twa_data",q="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var K;const T=(K=window.Telegram)==null?void 0:K.WebApp,P={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[],workouts:[]};class et{constructor(){W(this,"data");W(this,"onUpdateCallback");W(this,"onSyncStatusChangeCallback");W(this,"status","idle");this.data=this.loadLocal(),this.migrateData()}getHeaders(){const t={"Content-Type":"application/json"};return T!=null&&T.initData&&(t["X-Telegram-Init-Data"]=T.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(V);if(!t)return P;try{const e=JSON.parse(t);return{...P,...e,workouts:e.workouts||[]}}catch(e){return console.error("Failed to parse storage data",e),P}}migrateData(){let t=!1;const e=this.data.logs.filter(a=>!a.workoutId);if(e.length>0){t=!0;const a=new Map;e.forEach(n=>{const i=n.date.split("T")[0];a.has(i)||a.set(i,[]),a.get(i).push(n)}),a.forEach((n,i)=>{const o=n.sort((g,c)=>new Date(g.date).getTime()-new Date(c.date).getTime()),r=o[0].date,d=o[o.length-1].date,u=`implicit_${i}_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,p={id:u,startTime:r,endTime:d,status:"finished",isManual:!1,pauseIntervals:[]};this.data.workouts.push(p),n.forEach(g=>{g.workoutId=u})})}t&&this.saveLocal()}saveLocal(){localStorage.setItem(V,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(q,{headers:this.getHeaders()});if(e.ok){const a=await e.json();a&&(a.workoutTypes||a.logs)&&(this.data={...this.data,...a,workouts:a.workouts||this.data.workouts},this.migrateData(),this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(q,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}getWorkouts(){return this.data.workouts}getActiveWorkout(){return this.data.workouts.find(t=>t.status==="active"||t.status==="paused")}async startWorkout(t){this.getActiveWorkout()&&await this.finishWorkout();const a={id:Date.now().toString(),startTime:new Date().toISOString(),status:"active",name:t,isManual:!0,pauseIntervals:[]};return this.data.workouts.push(a),await this.persist(),a}async pauseWorkout(){const t=this.getActiveWorkout();t&&t.status==="active"&&(t.status="paused",t.pauseIntervals.push({start:new Date().toISOString()}),await this.persist())}async resumeWorkout(){const t=this.getActiveWorkout();if(t&&t.status==="paused"){t.status="active";const e=t.pauseIntervals[t.pauseIntervals.length-1];e&&!e.end&&(e.end=new Date().toISOString()),await this.persist()}}async finishWorkout(){const t=this.getActiveWorkout();if(t){t.status="finished",t.endTime=new Date().toISOString();const e=t.pauseIntervals[t.pauseIntervals.length-1];e&&!e.end&&(e.end=t.endTime),await this.persist()}}getWorkoutDuration(t){const e=new Date(t.startTime).getTime(),a=t.endTime?new Date(t.endTime).getTime():Date.now();let n=a-e;return t.pauseIntervals.forEach(o=>{const r=new Date(o.start).getTime(),d=o.end?new Date(o.end).getTime():t.status==="paused"?Date.now():a;d>r&&(n-=d-r)}),Math.floor(Math.max(0,n)/6e4)}ensureActiveWorkout(){const t=this.getActiveWorkout();if(t)return t.id;const e=new Date().toISOString().split("T")[0],i=this.data.workouts.filter(d=>d.startTime.startsWith(e)).sort((d,u)=>new Date(u.startTime).getTime()-new Date(d.startTime).getTime())[0];if(i&&!i.isManual&&i.status==="finished")return i.endTime=new Date().toISOString(),this.saveLocal(),i.id;const o=`implicit_${e}_${Date.now()}`,r={id:o,startTime:new Date().toISOString(),endTime:new Date().toISOString(),status:"finished",isManual:!1,pauseIntervals:[]};return this.data.workouts.push(r),o}updateImplicitWorkoutBounds(t){const e=this.data.workouts.find(i=>i.id===t);if(!e||e.isManual)return;const a=this.data.logs.filter(i=>i.workoutId===t);if(a.length===0)return;const n=[...a].sort((i,o)=>new Date(i.date).getTime()-new Date(o.date).getTime());e.startTime=n[0].date,e.endTime=n[n.length-1].date,e.status!=="finished"&&(e.status="finished")}async addLog(t){const e=this.ensureActiveWorkout(),a={...t,id:Date.now().toString(),date:new Date().toISOString(),workoutId:e};return this.data.logs.push(a),this.updateImplicitWorkoutBounds(e),await this.persist(),a}async deleteLog(t){const e=this.data.logs.find(a=>a.id===t);if(e){const a=e.workoutId;this.data.logs=this.data.logs.filter(n=>n.id!==t),a&&this.updateImplicitWorkoutBounds(a),await this.persist()}}async updateLog(t){const e=this.data.logs.findIndex(a=>a.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}getProfile(){return this.data.profile}getProfileIdentifier(){var a,n;const t=this.data.profile;if(t!=null&&t.telegramUsername)return t.telegramUsername;if(t!=null&&t.telegramUserId)return`id_${t.telegramUserId}`;const e=(n=(a=T==null?void 0:T.initDataUnsafe)==null?void 0:a.user)==null?void 0:n.id;return e?`id_${e}`:""}async updateProfileSettings(t){var o,r;const e=(o=T==null?void 0:T.initDataUnsafe)==null?void 0:o.user,a=e==null?void 0:e.id,n=e==null?void 0:e.username,i=e==null?void 0:e.photo_url;this.data.profile?i&&(this.data.profile.photoUrl=i):this.data.profile={isPublic:!1,showFullHistory:!1,telegramUserId:a||0,telegramUsername:n,photoUrl:i,createdAt:new Date().toISOString()},this.data.profile={...this.data.profile,...t},await this.persist(),(r=this.onUpdateCallback)==null||r.call(this)}async getPublicProfile(t){try{const e=await fetch(`${q}?profile=${encodeURIComponent(t)}`);return e.ok?await e.json():null}catch(e){return console.error("Failed to fetch public profile",e),null}}}const l=new et;var G;const h=(G=window.Telegram)==null?void 0:G.WebApp;h&&(h.ready(),h.expand());let $="main",U="all",m=null,J=null,N=null,F=!1,C=null,O=!1;function st(s){$=s,f()}let j=null;function z(s){let t=document.querySelector(".toast");t||(t=document.createElement("div"),t.className="toast",document.body.appendChild(t)),t.textContent=s,t.classList.add("visible"),j&&clearTimeout(j),j=setTimeout(()=>{t==null||t.classList.remove("visible")},2e3)}function f(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${at()}
    </main>
    <nav class="navigation">
      <button class="navigation__item ${$==="main"?"navigation__item_active":""}" data-page="main">
        <span class="navigation__icon">🏋️</span>
        <span class="navigation__label">Тренировка</span>
      </button>
      <button class="navigation__item ${$==="stats"?"navigation__item_active":""}" data-page="stats">
        <span class="navigation__icon">📊</span>
        <span class="navigation__label">Статистика</span>
      </button>
      <button class="navigation__item ${$==="profile-settings"?"navigation__item_active":""}" data-page="profile-settings">
        <span class="navigation__icon">👤</span>
        <span class="navigation__label">Профиль</span>
      </button>
      <button class="navigation__item ${$==="settings"?"navigation__item_active":""}" data-page="settings">
        <span class="navigation__icon">⚙️</span>
        <span class="navigation__label">Настройки</span>
      </button>
    </nav>
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");st(e)})}),gt())}function at(){switch($){case"main":return nt();case"stats":return dt();case"settings":return rt();case"profile-settings":return lt();case"public-profile":return ct();default:return""}}function it(){const s=l.getActiveWorkout();if(s){const t=s.status==="paused";return`
      <div class="workout-controls card">
        <div class="workout-controls__header">
          <span class="workout-status ${t?"workout-status_paused":""}">
            ${t?"⏸️ Пауза":"🔥 Тренировка активна"}
          </span>
          ${s.name?`<span class="workout-name">${s.name}</span>`:""}
        </div>
        <div class="workout-controls__actions">
          ${t?'<button class="button" id="resume-workout-btn">Продолжить</button>':'<button class="button button_secondary" id="pause-workout-btn">Пауза</button>'}
          <button class="button button_destructive" id="finish-workout-btn">Завершить</button>
        </div>
      </div>
    `}return O?`
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
    `:`
    <button class="button" id="start-workout-btn" style="margin-bottom: 24px;">▶️ Начать тренировку</button>
  `}let b=0,H="";function B(s){const t=new Date;t.setHours(0,0,0,0);const e=new Date(t);e.setDate(t.getDate()-s*7),e.setHours(23,59,59,999);const a=new Date(e);return a.setDate(e.getDate()-6),a.setHours(0,0,0,0),{start:a,end:e,label:`${a.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})} - ${e.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}`}}function nt(){var o;const s=l.getWorkoutTypes(),t=l.getLogs(),e=t[t.length-1],a=e==null?void 0:e.workoutTypeId,n=m?t.find(r=>r.id===m):null,{label:i}=B(b);return`
    <div class="page-content" id="main-content">
      ${it()}
      <h1 class="title">${m?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(r=>`<option value="${r.id}" ${(m?n&&r.id===n.workoutTypeId:r.id===a)?"selected":""}>${r.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${m&&n?n.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${m&&n?n.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${m?"Сохранить изменения":"Зафиксировать"}</button>
        ${m?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!m&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(o=s.find(r=>r.id===e.workoutTypeId))==null?void 0:o.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <div class="recent-logs__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
           <button class="icon-btn" id="prev-week-btn">◀️</button>
           <div id="week-label-container" style="display: flex; align-items: center; gap: 8px; position: relative;">
             <h2 class="subtitle" style="margin: 0;">${b===0?"Последние 7 дней":i}</h2>
             <span style="font-size: 18px; position: relative; display: inline-block;">
               📅
               <input type="date" id="calendar-input" value="${H}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
             </span>
           </div>
           <button class="icon-btn" id="next-week-btn" ${b===0?"disabled":""} style="${b===0?"opacity: 0.3; cursor: default;":""}">▶️</button>
        </div>
        <div id="logs-list">
          ${X()}
        </div>
      </div>
    </div>
  `}function X(){const s=l.getLogs(),t=l.getWorkoutTypes(),{start:e,end:a}=B(b),n=s.filter(i=>{const o=new Date(i.date);return o>=e&&o<=a});return Y(n,t,!0)}function R(){const s=document.getElementById("logs-list"),t=document.querySelector("#week-label-container .subtitle");if(s&&(s.innerHTML=X(),ot()),t){const{label:a}=B(b);t.textContent=b===0?"Последние 7 дней":a}const e=document.getElementById("next-week-btn");e&&(e.disabled=b===0,e.style.opacity=b===0?"0.3":"",e.style.cursor=b===0?"default":"")}function ot(){document.querySelectorAll(".log-set__delete").forEach(s=>{s.addEventListener("click",async()=>{const t=s.getAttribute("data-id");t&&(m===t&&(m=null),await l.deleteLog(t),f())})}),document.querySelectorAll(".log-set__edit").forEach(s=>{s.addEventListener("click",()=>{m=s.getAttribute("data-id"),f(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(s=>{s.addEventListener("click",()=>{const t=s.getAttribute("data-date");t&&Q(t)})})}function Y(s,t,e){if(s.length===0)return'<p class="hint">Нет записей за этот период</p>';const a=new Map;[...s].sort((o,r)=>new Date(r.date).getTime()-new Date(o.date).getTime()).forEach(o=>{const d=new Date(o.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});a.has(d)||a.set(d,[]),a.get(d).push(o)});const n=l.getWorkouts();let i="";return a.forEach((o,r)=>{var L;const d=((L=o[0])==null?void 0:L.date.split("T")[0])||"",u=new Set;o.forEach(k=>{k.workoutId&&u.add(k.workoutId)});const p=Array.from(u).sort((k,_)=>{var A,E;const x=n.find(y=>y.id===k),M=n.find(y=>y.id===_),D=(x==null?void 0:x.startTime)||((A=o.find(y=>y.workoutId===k))==null?void 0:A.date)||"",w=(M==null?void 0:M.startTime)||((E=o.find(y=>y.workoutId===_))==null?void 0:E.date)||"";return new Date(w).getTime()-new Date(D).getTime()}),g=p.length===1?p[0]:null,c=g?n.find(k=>k.id===g):null,v=c&&c.name,I=c?Math.round(l.getWorkoutDuration(c)):0;i+='<div class="log-day">',i+=`<div class="log-day__header">
      <span>${r}${v?` • ${c.name}`:""}${c?` • ${I} мин`:""}</span>
      ${e?`<button class="share-btn" data-date="${d}" title="Поделиться">📤</button>`:""}
    </div>`,p.forEach(k=>{const _=n.find(w=>w.id===k),x=o.filter(w=>w.workoutId===k);if(!(p.length===1&&(v||!(_!=null&&_.name)))){const w=_?Math.round(l.getWorkoutDuration(_)):0;i+=`<h3 class="workout-subheader">
                ${(_==null?void 0:_.name)||"Тренировка"} 
                <span class="workout-subheader__time">${w} мин</span>
            </h3>`}const D=new Map;x.forEach(w=>{D.has(w.workoutTypeId)||D.set(w.workoutTypeId,[]),D.get(w.workoutTypeId).push(w)}),D.forEach((w,A)=>{const E=t.find(y=>y.id===A);i+=`
            <div class="log-exercise">
              <div class="log-exercise__name">${(E==null?void 0:E.name)||"Удалено"}</div>
              <div class="log-exercise__sets">
                ${w.map(y=>`
                  <div class="log-set ${y.id===m?"log-set_active-edit":""} ${y.id===C?"log-set_new":""}">
                    <div class="log-set__info">
                      <span class="log-set__weight">${y.weight} кг</span>
                      <span class="log-set__times">×</span>
                      <span class="log-set__reps">${y.reps}</span>
                    </div>
                    ${e?`
                    <div class="log-set__actions">
                      <button class="log-set__edit" data-id="${y.id}">✏️</button>
                      <button class="log-set__delete" data-id="${y.id}">×</button>
                    </div>
                    `:""}
                  </div>
                `).join("")}
              </div>
            </div>
          `})}),i+="</div>"}),i}function rt(){return`
    <div class="page-content">
      <h1 class="title">Настройки</h1>
      <div class="settings-section">
        <h2 class="subtitle">Типы тренировок</h2>
        <div class="type-list">
          ${l.getWorkoutTypes().map(t=>`
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
  `}function lt(){var d,u;const s=l.getProfile(),t=(s==null?void 0:s.isPublic)??!1,e=(s==null?void 0:s.displayName)||((u=(d=h==null?void 0:h.initDataUnsafe)==null?void 0:d.user)==null?void 0:u.first_name)||"",a=l.getProfileIdentifier(),n=a?`https://t.me/gymgym21bot/app?startapp=profile_${a}`:"",i=l.getLogs(),o=i.reduce((p,g)=>p+g.weight*g.reps,0),r=new Set(i.map(p=>p.date.split("T")[0])).size;return`
    <div class="page-content profile-page">
      <h1 class="title">Профиль</h1>
      
      <div class="profile-header">
        <div class="profile-avatar">
          ${s!=null&&s.photoUrl?`<img src="${s.photoUrl}" alt="${e}" class="profile-avatar-img">`:e.charAt(0).toUpperCase()}
        </div>
        <div class="profile-name">${e}</div>
        <div class="profile-subtitle">${t?"Публичный профиль":"Приватный профиль"}</div>
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
              <input type="checkbox" id="profile-public-toggle" ${t?"checked":""}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-row" style="margin-top: 12px;">
            <div class="toggle-label">
              <span class="toggle-label-text">Показывать все упражнения</span>
              <span class="toggle-label-hint">Подробный список упражнений в публичном профиле</span>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" id="profile-history-toggle" ${s!=null&&s.showFullHistory?"checked":""}>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section-title">Имя</div>
          <input class="input" type="text" id="profile-display-name" value="${e}" placeholder="Ваше имя">
        </div>

        ${t&&a?`
          <div class="settings-section">
            <div class="settings-section-title">Ссылка на профиль</div>
            <div class="profile-link-section">
              <a href="${n}" target="_blank" class="profile-link-url">${n}</a>
              <div class="profile-link-actions">
                <button class="button button_secondary" id="copy-profile-link">Копировать</button>
                <button class="button" id="share-profile-link">Поделиться</button>
              </div>
            </div>
          </div>
        `:""}

        <div class="settings-section">
          <div class="settings-section-title">Превью статистики</div>
          <div class="profile-stats">
            <div class="stat-card">
              <div class="stat-value">${r}</div>
              <div class="stat-label">Тренировок</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${Math.round(o/1e3)}т</div>
              <div class="stat-label">Общий объём</div>
            </div>
          </div>
        </div>

        <button class="button" id="save-profile-btn">Сохранить</button>
      </div>
    </div>
  `}function ct(){if(!J)return`
      <div class="page-content">
        <div class="profile-not-found">
          <div class="profile-not-found-icon">🔍</div>
          <div class="profile-not-found-text">Профиль не найден</div>
        </div>
      </div>
    `;if(!N)return F?`
        <div class="page-content">
          <div class="profile-not-found">
            <div class="profile-not-found-icon">🔒</div>
            <div class="profile-not-found-text">Профиль скрыт или не существует</div>
          </div>
        </div>
      `:`
      <div class="page-content">
        <div class="profile-loading">Загрузка профиля...</div>
      </div>
    `;const s=N;return`
    <div class="page-content profile-page">
      <div class="profile-header">
        <div class="profile-avatar">
          ${s.photoUrl?`<img src="${s.photoUrl}" alt="${s.displayName}" class="profile-avatar-img">`:s.displayName.charAt(0).toUpperCase()}
        </div>
        <div class="profile-name">${s.displayName}</div>
        <div class="profile-subtitle">@${s.identifier}</div>
      </div>

      <div class="profile-stats">
        <div class="stat-card">
          <div class="stat-value">${s.stats.totalWorkouts}</div>
          <div class="stat-label">Тренировок</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(s.stats.totalVolume/1e3)}т</div>
          <div class="stat-label">Общий объём</div>
        </div>
        ${s.stats.favoriteExercise?`
          <div class="stat-card">
            <div class="stat-value" style="font-size: 1rem;">${s.stats.favoriteExercise}</div>
            <div class="stat-label">Любимое упражнение</div>
          </div>
        `:""}
        ${s.stats.lastWorkoutDate?`
          <div class="stat-card">
            <div class="stat-value" style="font-size: 1rem;">${new Date(s.stats.lastWorkoutDate).toLocaleDateString()}</div>
            <div class="stat-label">Последняя тренировка</div>
          </div>
        `:""}
      </div>

      ${s.recentActivity.length>0?`
        <div class="activity-list">
          <h2 class="subtitle">Недавняя активность</h2>
          ${s.recentActivity.map(t=>`
            <div class="activity-item">
              <span class="activity-date">${new Date(t.date).toLocaleDateString()}</span>
              <span class="activity-count">${t.exerciseCount} упражнений</span>
            </div>
          `).join("")}
        </div>
      `:""}

      ${s.logs&&s.logs.length>0&&s.workoutTypes?`
        <div class="recent-logs">
          <h2 class="subtitle">История тренировок</h2>
          <div id="logs-list">
            ${Y(s.logs,s.workoutTypes,!1)}
          </div>
        </div>
      `:""}
    </div>
  `}function dt(){const s=l.getLogs(),t=l.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=U==="all"?s:s.filter(i=>i.workoutTypeId===U),a=e.reduce((i,o)=>i+o.weight*o.reps,0),n=e.reduce((i,o)=>i+o.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(i=>`<option value="${i.id}" ${U===i.id?"selected":""}>${i.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${U==="all"?"все":"тип"})</div>
          <div class="stat-card__value">${Math.round(a)} кг</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Повторений</div>
          <div class="stat-card__value">${n}</div>
        </div>
      </div>

      <div class="charts-section">
        <h2 class="subtitle">Прогресс (макс. вес)</h2>
        <div class="chart-container">
           ${ut(e)}
        </div>
      </div>
    </div>
  `}function ut(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((p,g)=>new Date(p.date).getTime()-new Date(g.date).getTime()).map(p=>p.weight),a=Math.min(...e),n=Math.max(...e),i=n-a||1,o=400,r=150,d=20,u=e.map((p,g)=>{const c=d+g/(e.length-1)*(o-2*d),v=r-d-(p-a)/i*(r-2*d);return`${c},${v}`}).join(" ");return`
    <svg viewBox="0 0 ${o} ${r}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${u}"
      />
      ${e.map((p,g)=>{const c=d+g/(e.length-1)*(o-2*d),v=r-d-(p-a)/i*(r-2*d);return`<circle cx="${c}" cy="${v}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${a}кг</span>
      <span class="hint">${n}кг</span>
    </div>
  `}function pt(s){const t=l.getLogs(),e=l.getWorkoutTypes(),a=t.filter(u=>u.date.startsWith(s));if(a.length===0)return"";const i=new Date(a[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),o=new Map;a.forEach(u=>{o.has(u.workoutTypeId)||o.set(u.workoutTypeId,[]),o.get(u.workoutTypeId).push(u)});let r=`🏋️ Тренировка ${i}

`;o.forEach((u,p)=>{const g=e.find(c=>c.id===p);r+=`${(g==null?void 0:g.name)||"Упражнение"}:
`,u.forEach(c=>{r+=`  ${c.weight} кг × ${c.reps}
`}),r+=`
`});const d=a.reduce((u,p)=>u+p.weight*p.reps,0);return r+=`💪 Общий объём: ${Math.round(d)} кг`,r}function Q(s){const t=pt(s);if(t)if(h!=null&&h.openTelegramLink){const e=`https://t.me/share/url?url=${encodeURIComponent("https://t.me/gymgym21bot")}&text=${encodeURIComponent(t)}`;h.openTelegramLink(e)}else navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")})}function gt(){if($==="main"){const s=document.getElementById("start-workout-btn");s==null||s.addEventListener("click",()=>{O=!0,f()});const t=document.getElementById("cancel-start-workout-btn");t==null||t.addEventListener("click",()=>{O=!1,f()});const e=document.getElementById("start-workout-form");e==null||e.addEventListener("submit",async c=>{c.preventDefault();const I=new FormData(e).get("workoutName");await l.startWorkout(I),O=!1,f()});const a=document.getElementById("pause-workout-btn");a==null||a.addEventListener("click",async()=>{await l.pauseWorkout(),f()});const n=document.getElementById("resume-workout-btn");n==null||n.addEventListener("click",async()=>{await l.resumeWorkout(),f()});const i=document.getElementById("finish-workout-btn");i==null||i.addEventListener("click",async()=>{confirm("Завершить тренировку?")&&(await l.finishWorkout(),f())});const o=document.getElementById("log-form");o==null||o.addEventListener("submit",async c=>{c.preventDefault();const v=new FormData(o),I={workoutTypeId:v.get("typeId"),weight:parseFloat(v.get("weight")),reps:parseInt(v.get("reps"),10)};if(m){const k=l.getLogs().find(_=>_.id===m);k&&(await l.updateLog({...k,...I}),m=null)}else C=(await l.addLog(I)).id;f(),C=null});const r=document.getElementById("duplicate-last-btn");r==null||r.addEventListener("click",async()=>{const c=l.getLogs(),v=c[c.length-1];v&&(C=(await l.addLog({workoutTypeId:v.workoutTypeId,weight:v.weight,reps:v.reps})).id,f(),C=null)});const d=document.getElementById("cancel-edit-btn");d==null||d.addEventListener("click",()=>{m=null,f()}),document.querySelectorAll(".log-set__delete").forEach(c=>{c.addEventListener("click",async()=>{const v=c.getAttribute("data-id");v&&(m===v&&(m=null),await l.deleteLog(v),f())})}),document.querySelectorAll(".log-set__edit").forEach(c=>{c.addEventListener("click",()=>{m=c.getAttribute("data-id"),f(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(c=>{c.addEventListener("click",()=>{const v=c.getAttribute("data-date");v&&Q(v)})});const u=document.getElementById("prev-week-btn");u==null||u.addEventListener("click",()=>{b++,R()});const p=document.getElementById("next-week-btn");p==null||p.addEventListener("click",()=>{b>0&&(b--,R())});const g=document.getElementById("calendar-input");g==null||g.addEventListener("change",()=>{if(!g.value||g.value===H)return;H=g.value;const c=new Date(g.value),v=new Date;v.setHours(0,0,0,0);const I=v.getTime()-c.getTime(),L=Math.floor(I/(1e3*60*60*24));b=Math.max(0,Math.floor(L/7)),R()})}if($==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await l.addWorkoutType(e.value),f())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await l.deleteWorkoutType(e),f())})})}if($==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{U=s.value,f()})}if($==="profile-settings"){const s=document.getElementById("save-profile-btn");s==null||s.addEventListener("click",async()=>{const a=document.getElementById("profile-public-toggle"),n=document.getElementById("profile-history-toggle"),i=document.getElementById("profile-display-name");await l.updateProfileSettings({isPublic:(a==null?void 0:a.checked)??!1,showFullHistory:(n==null?void 0:n.checked)??!1,displayName:(i==null?void 0:i.value)||void 0}),f()});const t=document.getElementById("copy-profile-link");t==null||t.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${l.getProfileIdentifier()}`;navigator.clipboard.writeText(n).then(()=>{z("Ссылка скопирована")})});const e=document.getElementById("share-profile-link");e==null||e.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${l.getProfileIdentifier()}`;if(h!=null&&h.openTelegramLink){const i=`https://t.me/share/url?url=${encodeURIComponent(n)}&text=${encodeURIComponent("Мой профиль тренировок 💪")}`;h.openTelegramLink(i)}else navigator.clipboard.writeText(n).then(()=>{z("Ссылка скопирована")})})}}const S=document.createElement("div");S.className="sync-status";document.body.appendChild(S);function vt(s){switch(S.className="sync-status visible "+s,s){case"saving":S.textContent="Сохранение...";break;case"success":S.textContent="Сохранено";break;case"error":S.textContent="Ошибка сохранения";break;default:S.className="sync-status"}}l.onUpdate(()=>f());l.onSyncStatusChange(vt);async function ft(){var e;const t=new URLSearchParams(window.location.search).get("startapp")||((e=h==null?void 0:h.initDataUnsafe)==null?void 0:e.start_param);if(t&&t.startsWith("profile_")){const a=t.replace("profile_","");J=a,$="public-profile",F=!1,f(),N=await l.getPublicProfile(a),N||(F=!0),f()}else f();await l.init()}ft();
