var tt=Object.defineProperty;var et=(s,t,e)=>t in s?tt(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var U=(s,t,e)=>et(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();const z="gym_twa_data",P="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var G;const I=(G=window.Telegram)==null?void 0:G.WebApp,j={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[],workouts:[]};class st{constructor(){U(this,"data");U(this,"onUpdateCallback");U(this,"onSyncStatusChangeCallback");U(this,"status","idle");this.data=this.loadLocal(),this.migrateData()}getHeaders(){const t={"Content-Type":"application/json"};return I!=null&&I.initData&&(t["X-Telegram-Init-Data"]=I.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(z);if(!t)return j;try{const e=JSON.parse(t);return{...j,...e,workouts:e.workouts||[]}}catch(e){return console.error("Failed to parse storage data",e),j}}migrateData(){let t=!1;const e=this.data.logs.filter(a=>!a.workoutId);if(e.length>0){t=!0;const a=new Map;e.forEach(i=>{const n=i.date.split("T")[0];a.has(n)||a.set(n,[]),a.get(n).push(i)}),a.forEach((i,n)=>{const o=i.sort((g,c)=>new Date(g.date).getTime()-new Date(c.date).getTime()),l=o[0].date,d=o[o.length-1].date,u=`implicit_${n}_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,p={id:u,startTime:l,endTime:d,status:"finished",isManual:!1,pauseIntervals:[]};this.data.workouts.push(p),i.forEach(g=>{g.workoutId=u})})}t&&this.saveLocal()}saveLocal(){localStorage.setItem(z,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(P,{headers:this.getHeaders()});if(e.ok){const a=await e.json();a&&(a.workoutTypes||a.logs)&&(this.data={...this.data,...a,workouts:a.workouts||this.data.workouts},this.migrateData(),this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(P,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}async updateWorkoutType(t,e){const a=this.data.workoutTypes.find(i=>i.id===t);a&&(a.name=e,await this.persist())}getLogs(){return this.data.logs}getWorkouts(){return this.data.workouts}getActiveWorkout(){return this.data.workouts.find(t=>t.status==="active"||t.status==="paused")}async startWorkout(t){this.getActiveWorkout()&&await this.finishWorkout();const a={id:Date.now().toString(),startTime:new Date().toISOString(),status:"active",name:t,isManual:!0,pauseIntervals:[]};return this.data.workouts.push(a),await this.persist(),a}async pauseWorkout(){const t=this.getActiveWorkout();t&&t.status==="active"&&(t.status="paused",t.pauseIntervals.push({start:new Date().toISOString()}),await this.persist())}async resumeWorkout(){const t=this.getActiveWorkout();if(t&&t.status==="paused"){t.status="active";const e=t.pauseIntervals[t.pauseIntervals.length-1];e&&!e.end&&(e.end=new Date().toISOString()),await this.persist()}}async finishWorkout(){const t=this.getActiveWorkout();if(t){t.status="finished",t.endTime=new Date().toISOString();const e=t.pauseIntervals[t.pauseIntervals.length-1];e&&!e.end&&(e.end=t.endTime),await this.persist()}}getWorkoutDuration(t){const e=new Date(t.startTime).getTime(),a=t.endTime?new Date(t.endTime).getTime():Date.now();let i=a-e;return t.pauseIntervals.forEach(o=>{const l=new Date(o.start).getTime(),d=o.end?new Date(o.end).getTime():t.status==="paused"?Date.now():a;d>l&&(i-=d-l)}),Math.floor(Math.max(0,i)/6e4)}ensureActiveWorkout(){const t=this.getActiveWorkout();if(t)return t.id;const e=new Date().toISOString().split("T")[0],n=this.data.workouts.filter(d=>d.startTime.startsWith(e)).sort((d,u)=>new Date(u.startTime).getTime()-new Date(d.startTime).getTime())[0];if(n&&!n.isManual&&n.status==="finished")return n.endTime=new Date().toISOString(),this.saveLocal(),n.id;const o=`implicit_${e}_${Date.now()}`,l={id:o,startTime:new Date().toISOString(),endTime:new Date().toISOString(),status:"finished",isManual:!1,pauseIntervals:[]};return this.data.workouts.push(l),o}updateImplicitWorkoutBounds(t){const e=this.data.workouts.find(n=>n.id===t);if(!e||e.isManual)return;const a=this.data.logs.filter(n=>n.workoutId===t);if(a.length===0)return;const i=[...a].sort((n,o)=>new Date(n.date).getTime()-new Date(o.date).getTime());e.startTime=i[0].date,e.endTime=i[i.length-1].date,e.status!=="finished"&&(e.status="finished")}async addLog(t){const e=this.ensureActiveWorkout(),a={...t,id:Date.now().toString(),date:new Date().toISOString(),workoutId:e};return this.data.logs.push(a),this.updateImplicitWorkoutBounds(e),await this.persist(),a}async deleteLog(t){const e=this.data.logs.find(a=>a.id===t);if(e){const a=e.workoutId;this.data.logs=this.data.logs.filter(i=>i.id!==t),a&&this.updateImplicitWorkoutBounds(a),await this.persist()}}async updateLog(t){const e=this.data.logs.findIndex(a=>a.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}getProfile(){return this.data.profile}getProfileIdentifier(){var a,i;const t=this.data.profile;if(t!=null&&t.telegramUsername)return t.telegramUsername;if(t!=null&&t.telegramUserId)return`id_${t.telegramUserId}`;const e=(i=(a=I==null?void 0:I.initDataUnsafe)==null?void 0:a.user)==null?void 0:i.id;return e?`id_${e}`:""}async updateProfileSettings(t){var o,l;const e=(o=I==null?void 0:I.initDataUnsafe)==null?void 0:o.user,a=e==null?void 0:e.id,i=e==null?void 0:e.username,n=e==null?void 0:e.photo_url;this.data.profile?n&&(this.data.profile.photoUrl=n):this.data.profile={isPublic:!1,showFullHistory:!1,telegramUserId:a||0,telegramUsername:i,photoUrl:n,createdAt:new Date().toISOString()},this.data.profile={...this.data.profile,...t},await this.persist(),(l=this.onUpdateCallback)==null||l.call(this)}async getPublicProfile(t){try{const e=await fetch(`${P}?profile=${encodeURIComponent(t)}`);return e.ok?await e.json():null}catch(e){return console.error("Failed to fetch public profile",e),null}}}const r=new st;var J;const h=(J=window.Telegram)==null?void 0:J.WebApp;h&&(h.ready(),h.expand());let T="main",C="all",m=null,X=null,N=null,H=!1,A=null,_=null,q=!1;function at(s){T=s,f()}let R=null;function K(s){let t=document.querySelector(".toast");t||(t=document.createElement("div"),t.className="toast",document.body.appendChild(t)),t.textContent=s,t.classList.add("visible"),R&&clearTimeout(R),R=setTimeout(()=>{t==null||t.classList.remove("visible")},2e3)}function f(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${it()}
    </main>
    <nav class="navigation">
      <button class="navigation__item ${T==="main"?"navigation__item_active":""}" data-page="main">
        <span class="navigation__icon">🏋️</span>
        <span class="navigation__label">Тренировка</span>
      </button>
      <button class="navigation__item ${T==="stats"?"navigation__item_active":""}" data-page="stats">
        <span class="navigation__icon">📊</span>
        <span class="navigation__label">Статистика</span>
      </button>
      <button class="navigation__item ${T==="profile-settings"?"navigation__item_active":""}" data-page="profile-settings">
        <span class="navigation__icon">👤</span>
        <span class="navigation__label">Профиль</span>
      </button>
      <button class="navigation__item ${T==="settings"?"navigation__item_active":""}" data-page="settings">
        <span class="navigation__icon">⚙️</span>
        <span class="navigation__label">Настройки</span>
      </button>
    </nav>
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");at(e)})}),vt())}function it(){switch(T){case"main":return ot();case"stats":return ut();case"settings":return rt();case"profile-settings":return ct();case"public-profile":return dt();default:return""}}function nt(){const s=r.getActiveWorkout();if(s){const t=s.status==="paused";return`
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
    `}return q?`
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
  `}let w=0,B="";function V(s){const t=new Date;t.setHours(0,0,0,0);const e=new Date(t);e.setDate(t.getDate()-s*7),e.setHours(23,59,59,999);const a=new Date(e);return a.setDate(e.getDate()-6),a.setHours(0,0,0,0),{start:a,end:e,label:`${a.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})} - ${e.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}`}}function ot(){var o;const s=r.getWorkoutTypes(),t=r.getLogs(),e=t[t.length-1],a=e==null?void 0:e.workoutTypeId,i=m?t.find(l=>l.id===m):null,{label:n}=V(w);return`
    <div class="page-content" id="main-content">
      ${nt()}
      <h1 class="title">${m?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(l=>`<option value="${l.id}" ${(m?i&&l.id===i.workoutTypeId:l.id===a)?"selected":""}>${l.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${m&&i?i.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${m&&i?i.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${m?"Сохранить изменения":"Зафиксировать"}</button>
        ${m?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!m&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(o=s.find(l=>l.id===e.workoutTypeId))==null?void 0:o.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <div class="recent-logs__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
           <button class="icon-btn" id="prev-week-btn">◀️</button>
           <div id="week-label-container" style="display: flex; align-items: center; gap: 8px; position: relative;">
             <h2 class="subtitle" style="margin: 0;">${w===0?"Последние 7 дней":n}</h2>
             <span style="font-size: 18px; position: relative; display: inline-block;">
               📅
               <input type="date" id="calendar-input" value="${B}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
             </span>
           </div>
           <button class="icon-btn" id="next-week-btn" ${w===0?"disabled":""} style="${w===0?"opacity: 0.3; cursor: default;":""}">▶️</button>
        </div>
        <div id="logs-list">
          ${Y()}
        </div>
      </div>
    </div>
  `}function Y(){const s=r.getLogs(),t=r.getWorkoutTypes(),{start:e,end:a}=V(w),i=s.filter(n=>{const o=new Date(n.date);return o>=e&&o<=a});return Q(i,t,!0)}function F(){const s=document.getElementById("logs-list"),t=document.querySelector("#week-label-container .subtitle");if(s&&(s.innerHTML=Y(),lt()),t){const{label:a}=V(w);t.textContent=w===0?"Последние 7 дней":a}const e=document.getElementById("next-week-btn");e&&(e.disabled=w===0,e.style.opacity=w===0?"0.3":"",e.style.cursor=w===0?"default":"")}function lt(){document.querySelectorAll(".log-set__delete").forEach(s=>{s.addEventListener("click",async()=>{const t=s.getAttribute("data-id");t&&(m===t&&(m=null),await r.deleteLog(t),f())})}),document.querySelectorAll(".log-set__edit").forEach(s=>{s.addEventListener("click",()=>{m=s.getAttribute("data-id"),f(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(s=>{s.addEventListener("click",()=>{const t=s.getAttribute("data-date");t&&Z(t)})})}function Q(s,t,e){if(s.length===0)return'<p class="hint">Нет записей за этот период</p>';const a=new Map;[...s].sort((o,l)=>new Date(l.date).getTime()-new Date(o.date).getTime()).forEach(o=>{const d=new Date(o.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});a.has(d)||a.set(d,[]),a.get(d).push(o)});const i=r.getWorkouts();let n="";return a.forEach((o,l)=>{var D;const d=((D=o[0])==null?void 0:D.date.split("T")[0])||"",u=new Set;o.forEach(k=>{k.workoutId&&u.add(k.workoutId)});const p=Array.from(u).sort((k,$)=>{var O,x;const W=i.find(y=>y.id===k),M=i.find(y=>y.id===$),E=(W==null?void 0:W.startTime)||((O=o.find(y=>y.workoutId===k))==null?void 0:O.date)||"",b=(M==null?void 0:M.startTime)||((x=o.find(y=>y.workoutId===$))==null?void 0:x.date)||"";return new Date(b).getTime()-new Date(E).getTime()}),g=p.length===1?p[0]:null,c=g?i.find(k=>k.id===g):null,v=c&&c.name,S=c?Math.round(r.getWorkoutDuration(c)):0;n+='<div class="log-day">',n+=`<div class="log-day__header">
      <span>${l}${v?` • ${c.name}`:""}${c?` • ${S} мин`:""}</span>
      ${e?`<button class="share-btn" data-date="${d}" title="Поделиться">📤</button>`:""}
    </div>`,p.forEach(k=>{const $=i.find(b=>b.id===k),W=o.filter(b=>b.workoutId===k);if(!(p.length===1&&(v||!($!=null&&$.name)))){const b=$?Math.round(r.getWorkoutDuration($)):0;n+=`<h3 class="workout-subheader">
                ${($==null?void 0:$.name)||"Тренировка"} 
                <span class="workout-subheader__time">${b} мин</span>
            </h3>`}const E=new Map;W.forEach(b=>{E.has(b.workoutTypeId)||E.set(b.workoutTypeId,[]),E.get(b.workoutTypeId).push(b)}),E.forEach((b,O)=>{const x=t.find(y=>y.id===O);n+=`
            <div class="log-exercise">
              <div class="log-exercise__name">${(x==null?void 0:x.name)||"Удалено"}</div>
              <div class="log-exercise__sets">
                ${b.map(y=>`
                  <div class="log-set ${y.id===m?"log-set_active-edit":""} ${y.id===A?"log-set_new":""}">
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
          `})}),n+="</div>"}),n}function rt(){const s=r.getWorkoutTypes(),t=_?s.find(e=>e.id===_):null;return`
    <div class="page-content">
      <h1 class="title">Настройки</h1>
      <div class="settings-section">
        <h2 class="subtitle">${_?"Редактирование типа":"Добавить тип тренировки"}</h2>
        <form class="add-type-form" id="add-type-form" style="margin-bottom: 24px;">
          <div style="display: flex; gap: 8px;">
            <input class="input" type="text" id="new-type-name" placeholder="Название (напр. Жим гантелей)" required value="${t?t.name:""}">
            <button class="button" type="submit">${_?"Сохранить":"Добавить"}</button>
          </div>
          ${_?'<button class="button button_secondary" type="button" id="cancel-edit-type-btn" style="margin-top: 8px; width: 100%;">Отмена</button>':""}
        </form>

        <h2 class="subtitle">Типы тренировок</h2>
        <div class="type-list">
          ${s.map(e=>`
            <div class="type-item">
              <span>${e.name}</span>
              <div style="display: flex; gap: 8px;">
                <button class="type-item__edit icon-btn" data-id="${e.id}" title="Редактировать">✏️</button>
                <button class="type-item__delete icon-btn" data-id="${e.id}" title="Удалить">×</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}function ct(){var d,u;const s=r.getProfile(),t=(s==null?void 0:s.isPublic)??!1,e=(s==null?void 0:s.displayName)||((u=(d=h==null?void 0:h.initDataUnsafe)==null?void 0:d.user)==null?void 0:u.first_name)||"",a=r.getProfileIdentifier(),i=a?`https://t.me/gymgym21bot/app?startapp=profile_${a}`:"",n=r.getLogs(),o=n.reduce((p,g)=>p+g.weight*g.reps,0),l=new Set(n.map(p=>p.date.split("T")[0])).size;return`
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
              <a href="${i}" target="_blank" class="profile-link-url">${i}</a>
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
              <div class="stat-value">${l}</div>
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
  `}function dt(){if(!X)return`
      <div class="page-content">
        <div class="profile-not-found">
          <div class="profile-not-found-icon">🔍</div>
          <div class="profile-not-found-text">Профиль не найден</div>
        </div>
      </div>
    `;if(!N)return H?`
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
            ${Q(s.logs,s.workoutTypes,!1)}
          </div>
        </div>
      `:""}
    </div>
  `}function ut(){const s=r.getLogs(),t=r.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=C==="all"?s:s.filter(n=>n.workoutTypeId===C),a=e.reduce((n,o)=>n+o.weight*o.reps,0),i=e.reduce((n,o)=>n+o.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(n=>`<option value="${n.id}" ${C===n.id?"selected":""}>${n.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${C==="all"?"все":"тип"})</div>
          <div class="stat-card__value">${Math.round(a)} кг</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Повторений</div>
          <div class="stat-card__value">${i}</div>
        </div>
      </div>

      <div class="charts-section">
        <h2 class="subtitle">Прогресс (макс. вес)</h2>
        <div class="chart-container">
           ${pt(e)}
        </div>
      </div>
    </div>
  `}function pt(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((p,g)=>new Date(p.date).getTime()-new Date(g.date).getTime()).map(p=>p.weight),a=Math.min(...e),i=Math.max(...e),n=i-a||1,o=400,l=150,d=20,u=e.map((p,g)=>{const c=d+g/(e.length-1)*(o-2*d),v=l-d-(p-a)/n*(l-2*d);return`${c},${v}`}).join(" ");return`
    <svg viewBox="0 0 ${o} ${l}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${u}"
      />
      ${e.map((p,g)=>{const c=d+g/(e.length-1)*(o-2*d),v=l-d-(p-a)/n*(l-2*d);return`<circle cx="${c}" cy="${v}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${a}кг</span>
      <span class="hint">${i}кг</span>
    </div>
  `}function gt(s){const t=r.getLogs(),e=r.getWorkoutTypes(),a=t.filter(u=>u.date.startsWith(s));if(a.length===0)return"";const n=new Date(a[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),o=new Map;a.forEach(u=>{o.has(u.workoutTypeId)||o.set(u.workoutTypeId,[]),o.get(u.workoutTypeId).push(u)});let l=`🏋️ Тренировка ${n}

`;o.forEach((u,p)=>{const g=e.find(c=>c.id===p);l+=`${(g==null?void 0:g.name)||"Упражнение"}:
`,u.forEach(c=>{l+=`  ${c.weight} кг × ${c.reps}
`}),l+=`
`});const d=a.reduce((u,p)=>u+p.weight*p.reps,0);return l+=`💪 Общий объём: ${Math.round(d)} кг`,l}function Z(s){const t=gt(s);if(t)if(h!=null&&h.openTelegramLink){const e=`https://t.me/share/url?url=${encodeURIComponent("https://t.me/gymgym21bot")}&text=${encodeURIComponent(t)}`;h.openTelegramLink(e)}else navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")})}function vt(){if(T==="main"){const s=document.getElementById("start-workout-btn");s==null||s.addEventListener("click",()=>{q=!0,f()});const t=document.getElementById("cancel-start-workout-btn");t==null||t.addEventListener("click",()=>{q=!1,f()});const e=document.getElementById("start-workout-form");e==null||e.addEventListener("submit",async c=>{c.preventDefault();const S=new FormData(e).get("workoutName");await r.startWorkout(S),q=!1,f()});const a=document.getElementById("pause-workout-btn");a==null||a.addEventListener("click",async()=>{await r.pauseWorkout(),f()});const i=document.getElementById("resume-workout-btn");i==null||i.addEventListener("click",async()=>{await r.resumeWorkout(),f()});const n=document.getElementById("finish-workout-btn");n==null||n.addEventListener("click",async()=>{confirm("Завершить тренировку?")&&(await r.finishWorkout(),f())});const o=document.getElementById("log-form");o==null||o.addEventListener("submit",async c=>{c.preventDefault();const v=new FormData(o),S={workoutTypeId:v.get("typeId"),weight:parseFloat(v.get("weight")),reps:parseInt(v.get("reps"),10)};if(m){const k=r.getLogs().find($=>$.id===m);k&&(await r.updateLog({...k,...S}),m=null)}else A=(await r.addLog(S)).id;f(),A=null});const l=document.getElementById("duplicate-last-btn");l==null||l.addEventListener("click",async()=>{const c=r.getLogs(),v=c[c.length-1];v&&(A=(await r.addLog({workoutTypeId:v.workoutTypeId,weight:v.weight,reps:v.reps})).id,f(),A=null)});const d=document.getElementById("cancel-edit-btn");d==null||d.addEventListener("click",()=>{m=null,f()}),document.querySelectorAll(".log-set__delete").forEach(c=>{c.addEventListener("click",async()=>{const v=c.getAttribute("data-id");v&&(m===v&&(m=null),await r.deleteLog(v),f())})}),document.querySelectorAll(".log-set__edit").forEach(c=>{c.addEventListener("click",()=>{m=c.getAttribute("data-id"),f(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(c=>{c.addEventListener("click",()=>{const v=c.getAttribute("data-date");v&&Z(v)})});const u=document.getElementById("prev-week-btn");u==null||u.addEventListener("click",()=>{w++,F()});const p=document.getElementById("next-week-btn");p==null||p.addEventListener("click",()=>{w>0&&(w--,F())});const g=document.getElementById("calendar-input");g==null||g.addEventListener("change",()=>{if(!g.value||g.value===B)return;B=g.value;const c=new Date(g.value),v=new Date;v.setHours(0,0,0,0);const S=v.getTime()-c.getTime(),D=Math.floor(S/(1e3*60*60*24));w=Math.max(0,Math.floor(D/7)),F()})}if(T==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("new-type-name");a.value&&(_?(await r.updateWorkoutType(_,a.value),_=null):await r.addWorkoutType(a.value),f())});const t=document.getElementById("cancel-edit-type-btn");t==null||t.addEventListener("click",()=>{_=null,f()}),document.querySelectorAll(".type-item__edit").forEach(e=>{e.addEventListener("click",()=>{_=e.getAttribute("data-id"),f();const a=document.getElementById("new-type-name");a==null||a.focus()})}),document.querySelectorAll(".type-item__delete").forEach(e=>{e.addEventListener("click",async()=>{const a=e.getAttribute("data-id");a&&confirm("Удалить этот тип тренировки?")&&(_===a&&(_=null),await r.deleteWorkoutType(a),f())})})}if(T==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{C=s.value,f()})}if(T==="profile-settings"){const s=document.getElementById("save-profile-btn");s==null||s.addEventListener("click",async()=>{const a=document.getElementById("profile-public-toggle"),i=document.getElementById("profile-history-toggle"),n=document.getElementById("profile-display-name");await r.updateProfileSettings({isPublic:(a==null?void 0:a.checked)??!1,showFullHistory:(i==null?void 0:i.checked)??!1,displayName:(n==null?void 0:n.value)||void 0}),f()});const t=document.getElementById("copy-profile-link");t==null||t.addEventListener("click",()=>{const i=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;navigator.clipboard.writeText(i).then(()=>{K("Ссылка скопирована")})});const e=document.getElementById("share-profile-link");e==null||e.addEventListener("click",()=>{const i=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;if(h!=null&&h.openTelegramLink){const n=`https://t.me/share/url?url=${encodeURIComponent(i)}&text=${encodeURIComponent("Мой профиль тренировок 💪")}`;h.openTelegramLink(n)}else navigator.clipboard.writeText(i).then(()=>{K("Ссылка скопирована")})})}}const L=document.createElement("div");L.className="sync-status";document.body.appendChild(L);function ft(s){switch(L.className="sync-status visible "+s,s){case"saving":L.textContent="Сохранение...";break;case"success":L.textContent="Сохранено";break;case"error":L.textContent="Ошибка сохранения";break;default:L.className="sync-status"}}r.onUpdate(()=>f());r.onSyncStatusChange(ft);async function mt(){var e;const t=new URLSearchParams(window.location.search).get("startapp")||((e=h==null?void 0:h.initDataUnsafe)==null?void 0:e.start_param);if(t&&t.startsWith("profile_")){const a=t.replace("profile_","");X=a,T="public-profile",H=!1,f(),N=await r.getPublicProfile(a),N||(H=!0),f()}else f();await r.init()}mt();
