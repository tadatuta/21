var R=Object.defineProperty;var F=(s,t,e)=>t in s?R(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var k=(s,t,e)=>F(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function e(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=e(n);fetch(n.href,i)}})();const U="gym_twa_data",S="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var j;const w=(j=window.Telegram)==null?void 0:j.WebApp,C={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class H{constructor(){k(this,"data");k(this,"onUpdateCallback");k(this,"onSyncStatusChangeCallback");k(this,"status","idle");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return w!=null&&w.initData&&(t["X-Telegram-Init-Data"]=w.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(U);if(!t)return C;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),C}}saveLocal(){localStorage.setItem(U,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(S,{headers:this.getHeaders()});if(e.ok){const a=await e.json();a&&(a.workoutTypes||a.logs)&&(this.data=a,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(S,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}async updateLog(t){const e=this.data.logs.findIndex(a=>a.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}getProfile(){return this.data.profile}getProfileIdentifier(){var a,n;const t=this.data.profile;if(t!=null&&t.telegramUsername)return t.telegramUsername;if(t!=null&&t.telegramUserId)return`id_${t.telegramUserId}`;const e=(n=(a=w==null?void 0:w.initDataUnsafe)==null?void 0:a.user)==null?void 0:n.id;return e?`id_${e}`:""}async updateProfileSettings(t){var l,o;const e=(l=w==null?void 0:w.initDataUnsafe)==null?void 0:l.user,a=e==null?void 0:e.id,n=e==null?void 0:e.username,i=e==null?void 0:e.photo_url;this.data.profile?i&&(this.data.profile.photoUrl=i):this.data.profile={isPublic:!1,showFullHistory:!1,telegramUserId:a||0,telegramUsername:n,photoUrl:i,createdAt:new Date().toISOString()},this.data.profile={...this.data.profile,...t},await this.persist(),(o=this.onUpdateCallback)==null||o.call(this)}async getPublicProfile(t){try{const e=await fetch(`${S}?profile=${encodeURIComponent(t)}`);return e.ok?await e.json():null}catch(e){return console.error("Failed to fetch public profile",e),null}}}const r=new H;var M;const g=(M=window.Telegram)==null?void 0:M.WebApp;g&&(g.ready(),g.expand());let b="main",$="all",p=null,N=null,L=null,x=!1;function W(s){b=s,f()}let T=null;function q(s){let t=document.querySelector(".toast");t||(t=document.createElement("div"),t.className="toast",document.body.appendChild(t)),t.textContent=s,t.classList.add("visible"),T&&clearTimeout(T),T=setTimeout(()=>{t==null||t.classList.remove("visible")},2e3)}function f(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${V()}
    </main>
    <nav class="navigation">
      <button class="navigation__item ${b==="main"?"navigation__item_active":""}" data-page="main">
        <span class="navigation__icon">🏋️</span>
        <span class="navigation__label">Тренировка</span>
      </button>
      <button class="navigation__item ${b==="stats"?"navigation__item_active":""}" data-page="stats">
        <span class="navigation__icon">📊</span>
        <span class="navigation__label">Статистика</span>
      </button>
      <button class="navigation__item ${b==="profile-settings"?"navigation__item_active":""}" data-page="profile-settings">
        <span class="navigation__icon">👤</span>
        <span class="navigation__label">Профиль</span>
      </button>
      <button class="navigation__item ${b==="settings"?"navigation__item_active":""}" data-page="settings">
        <span class="navigation__icon">⚙️</span>
        <span class="navigation__label">Настройки</span>
      </button>
    </nav>
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");W(e)})}),Z())}function V(){switch(b){case"main":return z();case"stats":return X();case"settings":return J();case"profile-settings":return K();case"public-profile":return B();default:return""}}let m=0,E="";function D(s){const t=new Date;t.setHours(0,0,0,0);const e=new Date(t);e.setDate(t.getDate()-s*7),e.setHours(23,59,59,999);const a=new Date(e);return a.setDate(e.getDate()-6),a.setHours(0,0,0,0),{start:a,end:e,label:`${a.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})} - ${e.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}`}}function z(){var l;const s=r.getWorkoutTypes(),t=r.getLogs(),e=t[t.length-1],a=e==null?void 0:e.workoutTypeId,n=p?t.find(o=>o.id===p):null,{label:i}=D(m);return`
    <div class="page-content" id="main-content">
      <h1 class="title">${p?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(o=>`<option value="${o.id}" ${(p?n&&o.id===n.workoutTypeId:o.id===a)?"selected":""}>${o.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${p&&n?n.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${p&&n?n.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${p?"Сохранить изменения":"Зафиксировать"}</button>
        ${p?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!p&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(l=s.find(o=>o.id===e.workoutTypeId))==null?void 0:l.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <div class="recent-logs__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
           <button class="icon-btn" id="prev-week-btn">◀️</button>
           <div id="week-label-container" style="display: flex; align-items: center; gap: 8px; position: relative;">
             <h2 class="subtitle" style="margin: 0;">${m===0?"Последние 7 дней":i}</h2>
             <span style="font-size: 18px; position: relative; display: inline-block;">
               📅
               <input type="date" id="calendar-input" value="${E}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
             </span>
           </div>
           <button class="icon-btn" id="next-week-btn" ${m===0?"disabled":""} style="${m===0?"opacity: 0.3; cursor: default;":""}">▶️</button>
        </div>
        <div id="logs-list">
          ${O()}
        </div>
      </div>
    </div>
  `}function O(){const s=r.getLogs(),t=r.getWorkoutTypes(),{start:e,end:a}=D(m),n=s.filter(i=>{const l=new Date(i.date);return l>=e&&l<=a});return A(n,t,!0)}function I(){const s=document.getElementById("logs-list"),t=document.querySelector("#week-label-container .subtitle");if(s&&(s.innerHTML=O(),G()),t){const{label:a}=D(m);t.textContent=m===0?"Последние 7 дней":a}const e=document.getElementById("next-week-btn");e&&(e.disabled=m===0,e.style.opacity=m===0?"0.3":"",e.style.cursor=m===0?"default":"")}function G(){document.querySelectorAll(".log-set__delete").forEach(s=>{s.addEventListener("click",async()=>{const t=s.getAttribute("data-id");t&&(p===t&&(p=null),await r.deleteLog(t),f())})}),document.querySelectorAll(".log-set__edit").forEach(s=>{s.addEventListener("click",()=>{p=s.getAttribute("data-id"),f(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(s=>{s.addEventListener("click",()=>{const t=s.getAttribute("data-date");t&&P(t)})})}function A(s,t,e){if(s.length===0)return'<p class="hint">Нет записей за этот период</p>';const a=new Map;[...s].sort((i,l)=>new Date(l.date).getTime()-new Date(i.date).getTime()).forEach(i=>{const o=new Date(i.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});a.has(o)||a.set(o,[]),a.get(o).push(i)});let n="";return a.forEach((i,l)=>{var u;const o=((u=i[0])==null?void 0:u.date.split("T")[0])||"";n+='<div class="log-day">',n+=`<div class="log-day__header">
      <span>${l}</span>
      ${e?`<button class="share-btn" data-date="${o}" title="Поделиться">📤</button>`:""}
    </div>`;const d=new Map;i.forEach(c=>{d.has(c.workoutTypeId)||d.set(c.workoutTypeId,[]),d.get(c.workoutTypeId).push(c)}),d.forEach((c,v)=>{const h=t.find(y=>y.id===v);n+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${(h==null?void 0:h.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${c.map(y=>`
              <div class="log-set ${y.id===p?"log-set_active-edit":""}">
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
      `}),n+="</div>"}),n}function J(){return`
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
  `}function K(){var d,u;const s=r.getProfile(),t=(s==null?void 0:s.isPublic)??!1,e=(s==null?void 0:s.displayName)||((u=(d=g==null?void 0:g.initDataUnsafe)==null?void 0:d.user)==null?void 0:u.first_name)||"",a=r.getProfileIdentifier(),n=a?`https://t.me/gymgym21bot/app?startapp=profile_${a}`:"",i=r.getLogs(),l=i.reduce((c,v)=>c+v.weight*v.reps,0),o=new Set(i.map(c=>c.date.split("T")[0])).size;return`
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
              <div class="stat-value">${o}</div>
              <div class="stat-label">Тренировок</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${Math.round(l/1e3)}т</div>
              <div class="stat-label">Общий объём</div>
            </div>
          </div>
        </div>

        <button class="button" id="save-profile-btn">Сохранить</button>
      </div>
    </div>
  `}function B(){if(!N)return`
      <div class="page-content">
        <div class="profile-not-found">
          <div class="profile-not-found-icon">🔍</div>
          <div class="profile-not-found-text">Профиль не найден</div>
        </div>
      </div>
    `;if(!L)return x?`
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
    `;const s=L;return`
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
            ${A(s.logs,s.workoutTypes,!1)}
          </div>
        </div>
      `:""}
    </div>
  `}function X(){const s=r.getLogs(),t=r.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=$==="all"?s:s.filter(i=>i.workoutTypeId===$),a=e.reduce((i,l)=>i+l.weight*l.reps,0),n=e.reduce((i,l)=>i+l.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(i=>`<option value="${i.id}" ${$===i.id?"selected":""}>${i.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${$==="all"?"все":"тип"})</div>
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
           ${Y(e)}
        </div>
      </div>
    </div>
  `}function Y(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((c,v)=>new Date(c.date).getTime()-new Date(v.date).getTime()).map(c=>c.weight),a=Math.min(...e),n=Math.max(...e),i=n-a||1,l=400,o=150,d=20,u=e.map((c,v)=>{const h=d+v/(e.length-1)*(l-2*d),y=o-d-(c-a)/i*(o-2*d);return`${h},${y}`}).join(" ");return`
    <svg viewBox="0 0 ${l} ${o}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${u}"
      />
      ${e.map((c,v)=>{const h=d+v/(e.length-1)*(l-2*d),y=o-d-(c-a)/i*(o-2*d);return`<circle cx="${h}" cy="${y}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${a}кг</span>
      <span class="hint">${n}кг</span>
    </div>
  `}function Q(s){const t=r.getLogs(),e=r.getWorkoutTypes(),a=t.filter(u=>u.date.startsWith(s));if(a.length===0)return"";const i=new Date(a[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),l=new Map;a.forEach(u=>{l.has(u.workoutTypeId)||l.set(u.workoutTypeId,[]),l.get(u.workoutTypeId).push(u)});let o=`🏋️ Тренировка ${i}

`;l.forEach((u,c)=>{const v=e.find(h=>h.id===c);o+=`${(v==null?void 0:v.name)||"Упражнение"}:
`,u.forEach(h=>{o+=`  ${h.weight} кг × ${h.reps}
`}),o+=`
`});const d=a.reduce((u,c)=>u+c.weight*c.reps,0);return o+=`💪 Общий объём: ${Math.round(d)} кг`,o}function P(s){const t=Q(s);if(t)if(g!=null&&g.openTelegramLink){const e=`https://t.me/share/url?url=${encodeURIComponent("https://t.me/gymgym21bot")}&text=${encodeURIComponent(t)}`;g.openTelegramLink(e)}else navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")})}function Z(){if(b==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",async l=>{l.preventDefault();const o=new FormData(s),d={workoutTypeId:o.get("typeId"),weight:parseFloat(o.get("weight")),reps:parseInt(o.get("reps"),10)};if(p){const c=r.getLogs().find(v=>v.id===p);c&&(await r.updateLog({...c,...d}),p=null)}else await r.addLog(d);f()});const t=document.getElementById("duplicate-last-btn");t==null||t.addEventListener("click",async()=>{const l=r.getLogs(),o=l[l.length-1];o&&(await r.addLog({workoutTypeId:o.workoutTypeId,weight:o.weight,reps:o.reps}),f())});const e=document.getElementById("cancel-edit-btn");e==null||e.addEventListener("click",()=>{p=null,f()}),document.querySelectorAll(".log-set__delete").forEach(l=>{l.addEventListener("click",async()=>{const o=l.getAttribute("data-id");o&&(p===o&&(p=null),await r.deleteLog(o),f())})}),document.querySelectorAll(".log-set__edit").forEach(l=>{l.addEventListener("click",()=>{p=l.getAttribute("data-id"),f(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(l=>{l.addEventListener("click",()=>{const o=l.getAttribute("data-date");o&&P(o)})});const a=document.getElementById("prev-week-btn");a==null||a.addEventListener("click",()=>{m++,I()});const n=document.getElementById("next-week-btn");n==null||n.addEventListener("click",()=>{m>0&&(m--,I())});const i=document.getElementById("calendar-input");i==null||i.addEventListener("change",()=>{if(!i.value||i.value===E)return;E=i.value;const l=new Date(i.value),o=new Date;o.setHours(0,0,0,0);const d=o.getTime()-l.getTime(),u=Math.floor(d/(1e3*60*60*24));m=Math.max(0,Math.floor(u/7)),I()})}if(b==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await r.addWorkoutType(e.value),f())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await r.deleteWorkoutType(e),f())})})}if(b==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{$=s.value,f()})}if(b==="profile-settings"){const s=document.getElementById("save-profile-btn");s==null||s.addEventListener("click",async()=>{const a=document.getElementById("profile-public-toggle"),n=document.getElementById("profile-history-toggle"),i=document.getElementById("profile-display-name");await r.updateProfileSettings({isPublic:(a==null?void 0:a.checked)??!1,showFullHistory:(n==null?void 0:n.checked)??!1,displayName:(i==null?void 0:i.value)||void 0}),f()});const t=document.getElementById("copy-profile-link");t==null||t.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;navigator.clipboard.writeText(n).then(()=>{q("Ссылка скопирована")})});const e=document.getElementById("share-profile-link");e==null||e.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;if(g!=null&&g.openTelegramLink){const i=`https://t.me/share/url?url=${encodeURIComponent(n)}&text=${encodeURIComponent("Мой профиль тренировок 💪")}`;g.openTelegramLink(i)}else navigator.clipboard.writeText(n).then(()=>{q("Ссылка скопирована")})})}}const _=document.createElement("div");_.className="sync-status";document.body.appendChild(_);function tt(s){switch(_.className="sync-status visible "+s,s){case"saving":_.textContent="Сохранение...";break;case"success":_.textContent="Сохранено";break;case"error":_.textContent="Ошибка сохранения";break;default:_.className="sync-status"}}r.onUpdate(()=>f());r.onSyncStatusChange(tt);async function et(){var e;const t=new URLSearchParams(window.location.search).get("startapp")||((e=g==null?void 0:g.initDataUnsafe)==null?void 0:e.start_param);if(t&&t.startsWith("profile_")){const a=t.replace("profile_","");N=a,b="public-profile",x=!1,f(),L=await r.getPublicProfile(a),L||(x=!0),f()}else f();await r.init()}et();
