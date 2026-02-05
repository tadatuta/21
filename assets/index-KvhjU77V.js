var Y=Object.defineProperty;var Q=(s,t,e)=>t in s?Y(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var U=(s,t,e)=>Q(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=e(n);fetch(n.href,i)}})();const H="gym_twa_data",M="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var z;const S=(z=window.Telegram)==null?void 0:z.WebApp,N={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[],workouts:[]};class Z{constructor(){U(this,"data");U(this,"onUpdateCallback");U(this,"onSyncStatusChangeCallback");U(this,"status","idle");this.data=this.loadLocal(),this.migrateData()}getHeaders(){const t={"Content-Type":"application/json"};return S!=null&&S.initData&&(t["X-Telegram-Init-Data"]=S.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(H);if(!t)return N;try{const e=JSON.parse(t);return{...N,...e,workouts:e.workouts||[]}}catch(e){return console.error("Failed to parse storage data",e),N}}migrateData(){let t=!1;const e=this.data.logs.filter(a=>!a.workoutId);if(e.length>0){t=!0;const a=new Map;e.forEach(n=>{const i=n.date.split("T")[0];a.has(i)||a.set(i,[]),a.get(i).push(n)}),a.forEach((n,i)=>{const o=n.sort((g,c)=>new Date(g.date).getTime()-new Date(c.date).getTime()),r=o[0].date,d=o[o.length-1].date,u=`implicit_${i}_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,p={id:u,startTime:r,endTime:d,status:"finished",isManual:!1,pauseIntervals:[]};this.data.workouts.push(p),n.forEach(g=>{g.workoutId=u})})}t&&this.saveLocal()}saveLocal(){localStorage.setItem(H,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(M,{headers:this.getHeaders()});if(e.ok){const a=await e.json();a&&(a.workoutTypes||a.logs)&&(this.data={...this.data,...a,workouts:a.workouts||this.data.workouts},this.migrateData(),this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(M,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}getWorkouts(){return this.data.workouts}getActiveWorkout(){return this.data.workouts.find(t=>t.status==="active"||t.status==="paused")}async startWorkout(t){this.getActiveWorkout()&&await this.finishWorkout();const a={id:Date.now().toString(),startTime:new Date().toISOString(),status:"active",name:t,isManual:!0,pauseIntervals:[]};return this.data.workouts.push(a),await this.persist(),a}async pauseWorkout(){const t=this.getActiveWorkout();t&&t.status==="active"&&(t.status="paused",t.pauseIntervals.push({start:new Date().toISOString()}),await this.persist())}async resumeWorkout(){const t=this.getActiveWorkout();if(t&&t.status==="paused"){t.status="active";const e=t.pauseIntervals[t.pauseIntervals.length-1];e&&!e.end&&(e.end=new Date().toISOString()),await this.persist()}}async finishWorkout(){const t=this.getActiveWorkout();if(t){t.status="finished",t.endTime=new Date().toISOString();const e=t.pauseIntervals[t.pauseIntervals.length-1];e&&!e.end&&(e.end=t.endTime),await this.persist()}}ensureActiveWorkout(){const t=this.getActiveWorkout();if(t)return t.id;const e=new Date().toISOString().split("T")[0],i=this.data.workouts.filter(d=>d.startTime.startsWith(e)).sort((d,u)=>new Date(u.startTime).getTime()-new Date(d.startTime).getTime())[0];if(i&&!i.isManual&&i.status==="finished")return i.endTime=new Date().toISOString(),this.saveLocal(),i.id;const o=`implicit_${e}_${Date.now()}`,r={id:o,startTime:new Date().toISOString(),endTime:new Date().toISOString(),status:"finished",isManual:!1,pauseIntervals:[]};return this.data.workouts.push(r),o}async addLog(t){const e=this.ensureActiveWorkout(),a={...t,id:Date.now().toString(),date:new Date().toISOString(),workoutId:e};this.data.logs.push(a);const n=this.data.workouts.find(i=>i.id===e);return n&&!n.isManual&&(n.endTime=a.date),await this.persist(),a}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}async updateLog(t){const e=this.data.logs.findIndex(a=>a.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}getProfile(){return this.data.profile}getProfileIdentifier(){var a,n;const t=this.data.profile;if(t!=null&&t.telegramUsername)return t.telegramUsername;if(t!=null&&t.telegramUserId)return`id_${t.telegramUserId}`;const e=(n=(a=S==null?void 0:S.initDataUnsafe)==null?void 0:a.user)==null?void 0:n.id;return e?`id_${e}`:""}async updateProfileSettings(t){var o,r;const e=(o=S==null?void 0:S.initDataUnsafe)==null?void 0:o.user,a=e==null?void 0:e.id,n=e==null?void 0:e.username,i=e==null?void 0:e.photo_url;this.data.profile?i&&(this.data.profile.photoUrl=i):this.data.profile={isPublic:!1,showFullHistory:!1,telegramUserId:a||0,telegramUsername:n,photoUrl:i,createdAt:new Date().toISOString()},this.data.profile={...this.data.profile,...t},await this.persist(),(r=this.onUpdateCallback)==null||r.call(this)}async getPublicProfile(t){try{const e=await fetch(`${M}?profile=${encodeURIComponent(t)}`);return e.ok?await e.json():null}catch(e){return console.error("Failed to fetch public profile",e),null}}}const l=new Z;var B;const y=(B=window.Telegram)==null?void 0:B.WebApp;y&&(y.ready(),y.expand());let $="main",W="all",m=null,K=null,O=null,j=!1,A=!1;function tt(s){$=s,f()}let q=null;function V(s){let t=document.querySelector(".toast");t||(t=document.createElement("div"),t.className="toast",document.body.appendChild(t)),t.textContent=s,t.classList.add("visible"),q&&clearTimeout(q),q=setTimeout(()=>{t==null||t.classList.remove("visible")},2e3)}function f(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${et()}
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
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");tt(e)})}),ut())}function et(){switch($){case"main":return at();case"stats":return lt();case"settings":return nt();case"profile-settings":return ot();case"public-profile":return rt();default:return""}}function st(){const s=l.getActiveWorkout();if(s){const t=s.status==="paused";return`
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
    `}return A?`
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
  `}let k=0,R="";function F(s){const t=new Date;t.setHours(0,0,0,0);const e=new Date(t);e.setDate(t.getDate()-s*7),e.setHours(23,59,59,999);const a=new Date(e);return a.setDate(e.getDate()-6),a.setHours(0,0,0,0),{start:a,end:e,label:`${a.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})} - ${e.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}`}}function at(){var o;const s=l.getWorkoutTypes(),t=l.getLogs(),e=t[t.length-1],a=e==null?void 0:e.workoutTypeId,n=m?t.find(r=>r.id===m):null,{label:i}=F(k);return`
    <div class="page-content" id="main-content">
      ${st()}
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
             <h2 class="subtitle" style="margin: 0;">${k===0?"Последние 7 дней":i}</h2>
             <span style="font-size: 18px; position: relative; display: inline-block;">
               📅
               <input type="date" id="calendar-input" value="${R}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
             </span>
           </div>
           <button class="icon-btn" id="next-week-btn" ${k===0?"disabled":""} style="${k===0?"opacity: 0.3; cursor: default;":""}">▶️</button>
        </div>
        <div id="logs-list">
          ${G()}
        </div>
      </div>
    </div>
  `}function G(){const s=l.getLogs(),t=l.getWorkoutTypes(),{start:e,end:a}=F(k),n=s.filter(i=>{const o=new Date(i.date);return o>=e&&o<=a});return J(n,t,!0)}function P(){const s=document.getElementById("logs-list"),t=document.querySelector("#week-label-container .subtitle");if(s&&(s.innerHTML=G(),it()),t){const{label:a}=F(k);t.textContent=k===0?"Последние 7 дней":a}const e=document.getElementById("next-week-btn");e&&(e.disabled=k===0,e.style.opacity=k===0?"0.3":"",e.style.cursor=k===0?"default":"")}function it(){document.querySelectorAll(".log-set__delete").forEach(s=>{s.addEventListener("click",async()=>{const t=s.getAttribute("data-id");t&&(m===t&&(m=null),await l.deleteLog(t),f())})}),document.querySelectorAll(".log-set__edit").forEach(s=>{s.addEventListener("click",()=>{m=s.getAttribute("data-id"),f(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(s=>{s.addEventListener("click",()=>{const t=s.getAttribute("data-date");t&&X(t)})})}function J(s,t,e){if(s.length===0)return'<p class="hint">Нет записей за этот период</p>';const a=new Map;[...s].sort((o,r)=>new Date(r.date).getTime()-new Date(o.date).getTime()).forEach(o=>{const d=new Date(o.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});a.has(d)||a.set(d,[]),a.get(d).push(o)});const n=l.getWorkouts();let i="";return a.forEach((o,r)=>{var T;const d=((T=o[0])==null?void 0:T.date.split("T")[0])||"",u=new Set;o.forEach(_=>{_.workoutId&&u.add(_.workoutId)});const p=Array.from(u).sort((_,h)=>{var D,I;const L=n.find(w=>w.id===_),C=n.find(w=>w.id===h),x=(L==null?void 0:L.startTime)||((D=o.find(w=>w.workoutId===_))==null?void 0:D.date)||"",b=(C==null?void 0:C.startTime)||((I=o.find(w=>w.workoutId===h))==null?void 0:I.date)||"";return new Date(b).getTime()-new Date(x).getTime()}),g=p.length===1?p[0]:null,c=g?n.find(_=>_.id===g):null,v=c&&c.name;i+='<div class="log-day">',i+=`<div class="log-day__header">
      <span>${r}${v?` • ${c.name}`:""}</span>
      ${e?`<button class="share-btn" data-date="${d}" title="Поделиться">📤</button>`:""}
    </div>`,p.forEach(_=>{const h=n.find(b=>b.id===_),L=o.filter(b=>b.workoutId===_);if(!(p.length===1&&(v||!(h!=null&&h.name)))){const b=h?new Date(h.startTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"",D=h&&h.endTime?new Date(h.endTime).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"",I=b&&D?`${b} - ${D}`:b;i+=`<h3 class="workout-subheader">
                ${(h==null?void 0:h.name)||"Тренировка"} 
                <span class="workout-subheader__time">${I}</span>
            </h3>`}const x=new Map;L.forEach(b=>{x.has(b.workoutTypeId)||x.set(b.workoutTypeId,[]),x.get(b.workoutTypeId).push(b)}),x.forEach((b,D)=>{const I=t.find(w=>w.id===D);i+=`
            <div class="log-exercise">
              <div class="log-exercise__name">${(I==null?void 0:I.name)||"Удалено"}</div>
              <div class="log-exercise__sets">
                ${b.map(w=>`
                  <div class="log-set ${w.id===m?"log-set_active-edit":""}">
                    <div class="log-set__info">
                      <span class="log-set__weight">${w.weight} кг</span>
                      <span class="log-set__times">×</span>
                      <span class="log-set__reps">${w.reps}</span>
                    </div>
                    ${e?`
                    <div class="log-set__actions">
                      <button class="log-set__edit" data-id="${w.id}">✏️</button>
                      <button class="log-set__delete" data-id="${w.id}">×</button>
                    </div>
                    `:""}
                  </div>
                `).join("")}
              </div>
            </div>
          `})}),i+="</div>"}),i}function nt(){return`
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
  `}function ot(){var d,u;const s=l.getProfile(),t=(s==null?void 0:s.isPublic)??!1,e=(s==null?void 0:s.displayName)||((u=(d=y==null?void 0:y.initDataUnsafe)==null?void 0:d.user)==null?void 0:u.first_name)||"",a=l.getProfileIdentifier(),n=a?`https://t.me/gymgym21bot/app?startapp=profile_${a}`:"",i=l.getLogs(),o=i.reduce((p,g)=>p+g.weight*g.reps,0),r=new Set(i.map(p=>p.date.split("T")[0])).size;return`
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
  `}function rt(){if(!K)return`
      <div class="page-content">
        <div class="profile-not-found">
          <div class="profile-not-found-icon">🔍</div>
          <div class="profile-not-found-text">Профиль не найден</div>
        </div>
      </div>
    `;if(!O)return j?`
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
    `;const s=O;return`
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
            ${J(s.logs,s.workoutTypes,!1)}
          </div>
        </div>
      `:""}
    </div>
  `}function lt(){const s=l.getLogs(),t=l.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=W==="all"?s:s.filter(i=>i.workoutTypeId===W),a=e.reduce((i,o)=>i+o.weight*o.reps,0),n=e.reduce((i,o)=>i+o.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(i=>`<option value="${i.id}" ${W===i.id?"selected":""}>${i.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${W==="all"?"все":"тип"})</div>
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
           ${ct(e)}
        </div>
      </div>
    </div>
  `}function ct(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((p,g)=>new Date(p.date).getTime()-new Date(g.date).getTime()).map(p=>p.weight),a=Math.min(...e),n=Math.max(...e),i=n-a||1,o=400,r=150,d=20,u=e.map((p,g)=>{const c=d+g/(e.length-1)*(o-2*d),v=r-d-(p-a)/i*(r-2*d);return`${c},${v}`}).join(" ");return`
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
  `}function dt(s){const t=l.getLogs(),e=l.getWorkoutTypes(),a=t.filter(u=>u.date.startsWith(s));if(a.length===0)return"";const i=new Date(a[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),o=new Map;a.forEach(u=>{o.has(u.workoutTypeId)||o.set(u.workoutTypeId,[]),o.get(u.workoutTypeId).push(u)});let r=`🏋️ Тренировка ${i}

`;o.forEach((u,p)=>{const g=e.find(c=>c.id===p);r+=`${(g==null?void 0:g.name)||"Упражнение"}:
`,u.forEach(c=>{r+=`  ${c.weight} кг × ${c.reps}
`}),r+=`
`});const d=a.reduce((u,p)=>u+p.weight*p.reps,0);return r+=`💪 Общий объём: ${Math.round(d)} кг`,r}function X(s){const t=dt(s);if(t)if(y!=null&&y.openTelegramLink){const e=`https://t.me/share/url?url=${encodeURIComponent("https://t.me/gymgym21bot")}&text=${encodeURIComponent(t)}`;y.openTelegramLink(e)}else navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")})}function ut(){if($==="main"){const s=document.getElementById("start-workout-btn");s==null||s.addEventListener("click",()=>{A=!0,f()});const t=document.getElementById("cancel-start-workout-btn");t==null||t.addEventListener("click",()=>{A=!1,f()});const e=document.getElementById("start-workout-form");e==null||e.addEventListener("submit",async c=>{c.preventDefault();const T=new FormData(e).get("workoutName");await l.startWorkout(T),A=!1,f()});const a=document.getElementById("pause-workout-btn");a==null||a.addEventListener("click",async()=>{await l.pauseWorkout(),f()});const n=document.getElementById("resume-workout-btn");n==null||n.addEventListener("click",async()=>{await l.resumeWorkout(),f()});const i=document.getElementById("finish-workout-btn");i==null||i.addEventListener("click",async()=>{confirm("Завершить тренировку?")&&(await l.finishWorkout(),f())});const o=document.getElementById("log-form");o==null||o.addEventListener("submit",async c=>{c.preventDefault();const v=new FormData(o),T={workoutTypeId:v.get("typeId"),weight:parseFloat(v.get("weight")),reps:parseInt(v.get("reps"),10)};if(m){const h=l.getLogs().find(L=>L.id===m);h&&(await l.updateLog({...h,...T}),m=null)}else await l.addLog(T);f()});const r=document.getElementById("duplicate-last-btn");r==null||r.addEventListener("click",async()=>{const c=l.getLogs(),v=c[c.length-1];v&&(await l.addLog({workoutTypeId:v.workoutTypeId,weight:v.weight,reps:v.reps}),f())});const d=document.getElementById("cancel-edit-btn");d==null||d.addEventListener("click",()=>{m=null,f()}),document.querySelectorAll(".log-set__delete").forEach(c=>{c.addEventListener("click",async()=>{const v=c.getAttribute("data-id");v&&(m===v&&(m=null),await l.deleteLog(v),f())})}),document.querySelectorAll(".log-set__edit").forEach(c=>{c.addEventListener("click",()=>{m=c.getAttribute("data-id"),f(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(c=>{c.addEventListener("click",()=>{const v=c.getAttribute("data-date");v&&X(v)})});const u=document.getElementById("prev-week-btn");u==null||u.addEventListener("click",()=>{k++,P()});const p=document.getElementById("next-week-btn");p==null||p.addEventListener("click",()=>{k>0&&(k--,P())});const g=document.getElementById("calendar-input");g==null||g.addEventListener("change",()=>{if(!g.value||g.value===R)return;R=g.value;const c=new Date(g.value),v=new Date;v.setHours(0,0,0,0);const T=v.getTime()-c.getTime(),_=Math.floor(T/(1e3*60*60*24));k=Math.max(0,Math.floor(_/7)),P()})}if($==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await l.addWorkoutType(e.value),f())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await l.deleteWorkoutType(e),f())})})}if($==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{W=s.value,f()})}if($==="profile-settings"){const s=document.getElementById("save-profile-btn");s==null||s.addEventListener("click",async()=>{const a=document.getElementById("profile-public-toggle"),n=document.getElementById("profile-history-toggle"),i=document.getElementById("profile-display-name");await l.updateProfileSettings({isPublic:(a==null?void 0:a.checked)??!1,showFullHistory:(n==null?void 0:n.checked)??!1,displayName:(i==null?void 0:i.value)||void 0}),f()});const t=document.getElementById("copy-profile-link");t==null||t.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${l.getProfileIdentifier()}`;navigator.clipboard.writeText(n).then(()=>{V("Ссылка скопирована")})});const e=document.getElementById("share-profile-link");e==null||e.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${l.getProfileIdentifier()}`;if(y!=null&&y.openTelegramLink){const i=`https://t.me/share/url?url=${encodeURIComponent(n)}&text=${encodeURIComponent("Мой профиль тренировок 💪")}`;y.openTelegramLink(i)}else navigator.clipboard.writeText(n).then(()=>{V("Ссылка скопирована")})})}}const E=document.createElement("div");E.className="sync-status";document.body.appendChild(E);function pt(s){switch(E.className="sync-status visible "+s,s){case"saving":E.textContent="Сохранение...";break;case"success":E.textContent="Сохранено";break;case"error":E.textContent="Ошибка сохранения";break;default:E.className="sync-status"}}l.onUpdate(()=>f());l.onSyncStatusChange(pt);async function gt(){var e;const t=new URLSearchParams(window.location.search).get("startapp")||((e=y==null?void 0:y.initDataUnsafe)==null?void 0:e.start_param);if(t&&t.startsWith("profile_")){const a=t.replace("profile_","");K=a,$="public-profile",j=!1,f(),O=await l.getPublicProfile(a),O||(j=!0),f()}else f();await l.init()}gt();
