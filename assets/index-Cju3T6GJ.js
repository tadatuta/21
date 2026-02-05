var O=Object.defineProperty;var M=(s,t,e)=>t in s?O(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var _=(s,t,e)=>M(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const l of n.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();const x="gym_twa_data",S="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var U;const b=(U=window.Telegram)==null?void 0:U.WebApp,D={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class R{constructor(){_(this,"data");_(this,"onUpdateCallback");_(this,"onSyncStatusChangeCallback");_(this,"status","idle");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return b!=null&&b.initData&&(t["X-Telegram-Init-Data"]=b.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(x);if(!t)return D;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),D}}saveLocal(){localStorage.setItem(x,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(S,{headers:this.getHeaders()});if(e.ok){const a=await e.json();a&&(a.workoutTypes||a.logs)&&(this.data=a,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(S,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}async updateLog(t){const e=this.data.logs.findIndex(a=>a.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}getProfile(){return this.data.profile}getProfileIdentifier(){var a,i;const t=this.data.profile;if(t!=null&&t.telegramUsername)return t.telegramUsername;if(t!=null&&t.telegramUserId)return`id_${t.telegramUserId}`;const e=(i=(a=b==null?void 0:b.initDataUnsafe)==null?void 0:a.user)==null?void 0:i.id;return e?`id_${e}`:""}async updateProfileSettings(t){var l,o;const e=(l=b==null?void 0:b.initDataUnsafe)==null?void 0:l.user,a=e==null?void 0:e.id,i=e==null?void 0:e.username,n=e==null?void 0:e.photo_url;this.data.profile?n&&(this.data.profile.photoUrl=n):this.data.profile={isPublic:!1,showFullHistory:!1,telegramUserId:a||0,telegramUsername:i,photoUrl:n,createdAt:new Date().toISOString()},this.data.profile={...this.data.profile,...t},await this.persist(),(o=this.onUpdateCallback)==null||o.call(this)}async getPublicProfile(t){try{const e=await fetch(`${S}?profile=${encodeURIComponent(t)}`);return e.ok?await e.json():null}catch(e){return console.error("Failed to fetch public profile",e),null}}}const c=new R;var C;const f=(C=window.Telegram)==null?void 0:C.WebApp;f&&(f.ready(),f.expand());let y="main",k="all",v=null,j=null,L=null,I=!1;function q(s){y=s,g()}let T=null;function E(s){let t=document.querySelector(".toast");t||(t=document.createElement("div"),t.className="toast",document.body.appendChild(t)),t.textContent=s,t.classList.add("visible"),T&&clearTimeout(T),T=setTimeout(()=>{t==null||t.classList.remove("visible")},2e3)}function g(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${F()}
    </main>
    <nav class="navigation">
      <button class="navigation__item ${y==="main"?"navigation__item_active":""}" data-page="main">
        <span class="navigation__icon">🏋️</span>
        <span class="navigation__label">Тренировка</span>
      </button>
      <button class="navigation__item ${y==="stats"?"navigation__item_active":""}" data-page="stats">
        <span class="navigation__icon">📊</span>
        <span class="navigation__label">Статистика</span>
      </button>
      <button class="navigation__item ${y==="profile-settings"?"navigation__item_active":""}" data-page="profile-settings">
        <span class="navigation__icon">👤</span>
        <span class="navigation__label">Профиль</span>
      </button>
      <button class="navigation__item ${y==="settings"?"navigation__item_active":""}" data-page="settings">
        <span class="navigation__icon">⚙️</span>
        <span class="navigation__label">Настройки</span>
      </button>
    </nav>
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");q(e)})}),Y())}function F(){switch(y){case"main":return H();case"stats":return G();case"settings":return W();case"profile-settings":return V();case"public-profile":return z();default:return""}}let w=0;function P(s){const t=new Date;t.setHours(0,0,0,0);const e=new Date(t);e.setDate(t.getDate()-s*7),e.setHours(23,59,59,999);const a=new Date(e);return a.setDate(e.getDate()-6),a.setHours(0,0,0,0),{start:a,end:e,label:`${a.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})} - ${e.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}`}}function H(){var l;const s=c.getWorkoutTypes(),t=c.getLogs(),e=t[t.length-1],a=e==null?void 0:e.workoutTypeId,i=v?t.find(o=>o.id===v):null,{label:n}=P(w);return`
    <div class="page-content" id="main-content">
      <h1 class="title">${v?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(o=>`<option value="${o.id}" ${(v?i&&o.id===i.workoutTypeId:o.id===a)?"selected":""}>${o.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${v&&i?i.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${v&&i?i.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${v?"Сохранить изменения":"Зафиксировать"}</button>
        ${v?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!v&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(l=s.find(o=>o.id===e.workoutTypeId))==null?void 0:l.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <div class="recent-logs__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
           <button class="icon-btn" id="prev-week-btn">◀️</button>
           <div id="week-label-container" style="display: flex; align-items: center; gap: 8px; cursor: pointer; position: relative;">
             <h2 class="subtitle" style="margin: 0;">${w===0?"Последние 7 дней":n}</h2>
             <span style="font-size: 18px;">📅</span>
             <input type="date" id="calendar-input" style="position: absolute; opacity: 0; pointer-events: none; width: 1px; height: 1px;">
           </div>
           <button class="icon-btn" id="next-week-btn" ${w===0?"disabled":""} style="${w===0?"opacity: 0.3; cursor: default;":""}">▶️</button>
        </div>
        <div id="logs-list">
          ${A()}
        </div>
      </div>
    </div>
  `}function A(){const s=c.getLogs(),t=c.getWorkoutTypes(),{start:e,end:a}=P(w),i=s.filter(n=>{const l=new Date(n.date);return l>=e&&l<=a});return N(i,t,!0)}function N(s,t,e){if(s.length===0)return'<p class="hint">Нет записей за этот период</p>';const a=new Map;[...s].sort((n,l)=>new Date(l.date).getTime()-new Date(n.date).getTime()).forEach(n=>{const o=new Date(n.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});a.has(o)||a.set(o,[]),a.get(o).push(n)});let i="";return a.forEach((n,l)=>{var p;const o=((p=n[0])==null?void 0:p.date.split("T")[0])||"";i+='<div class="log-day">',i+=`<div class="log-day__header">
      <span>${l}</span>
      ${e?`<button class="share-btn" data-date="${o}" title="Поделиться">📤</button>`:""}
    </div>`;const r=new Map;n.forEach(d=>{r.has(d.workoutTypeId)||r.set(d.workoutTypeId,[]),r.get(d.workoutTypeId).push(d)}),r.forEach((d,u)=>{const h=t.find(m=>m.id===u);i+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${(h==null?void 0:h.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${d.map(m=>`
              <div class="log-set ${m.id===v?"log-set_active-edit":""}">
                <div class="log-set__info">
                  <span class="log-set__weight">${m.weight} кг</span>
                  <span class="log-set__times">×</span>
                  <span class="log-set__reps">${m.reps}</span>
                </div>
                ${e?`
                <div class="log-set__actions">
                  <button class="log-set__edit" data-id="${m.id}">✏️</button>
                  <button class="log-set__delete" data-id="${m.id}">×</button>
                </div>
                `:""}
              </div>
            `).join("")}
          </div>
        </div>
      `}),i+="</div>"}),i}function W(){return`
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
  `}function V(){var r,p;const s=c.getProfile(),t=(s==null?void 0:s.isPublic)??!1,e=(s==null?void 0:s.displayName)||((p=(r=f==null?void 0:f.initDataUnsafe)==null?void 0:r.user)==null?void 0:p.first_name)||"",a=c.getProfileIdentifier(),i=a?`https://t.me/gymgym21bot/app?startapp=profile_${a}`:"",n=c.getLogs(),l=n.reduce((d,u)=>d+u.weight*u.reps,0),o=new Set(n.map(d=>d.date.split("T")[0])).size;return`
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
  `}function z(){if(!j)return`
      <div class="page-content">
        <div class="profile-not-found">
          <div class="profile-not-found-icon">🔍</div>
          <div class="profile-not-found-text">Профиль не найден</div>
        </div>
      </div>
    `;if(!L)return I?`
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
            ${N(s.logs,s.workoutTypes,!1)}
          </div>
        </div>
      `:""}
    </div>
  `}function G(){const s=c.getLogs(),t=c.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=k==="all"?s:s.filter(n=>n.workoutTypeId===k),a=e.reduce((n,l)=>n+l.weight*l.reps,0),i=e.reduce((n,l)=>n+l.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(n=>`<option value="${n.id}" ${k===n.id?"selected":""}>${n.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${k==="all"?"все":"тип"})</div>
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
           ${J(e)}
        </div>
      </div>
    </div>
  `}function J(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((d,u)=>new Date(d.date).getTime()-new Date(u.date).getTime()).map(d=>d.weight),a=Math.min(...e),i=Math.max(...e),n=i-a||1,l=400,o=150,r=20,p=e.map((d,u)=>{const h=r+u/(e.length-1)*(l-2*r),m=o-r-(d-a)/n*(o-2*r);return`${h},${m}`}).join(" ");return`
    <svg viewBox="0 0 ${l} ${o}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${p}"
      />
      ${e.map((d,u)=>{const h=r+u/(e.length-1)*(l-2*r),m=o-r-(d-a)/n*(o-2*r);return`<circle cx="${h}" cy="${m}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${a}кг</span>
      <span class="hint">${i}кг</span>
    </div>
  `}function K(s){const t=c.getLogs(),e=c.getWorkoutTypes(),a=t.filter(p=>p.date.startsWith(s));if(a.length===0)return"";const n=new Date(a[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),l=new Map;a.forEach(p=>{l.has(p.workoutTypeId)||l.set(p.workoutTypeId,[]),l.get(p.workoutTypeId).push(p)});let o=`🏋️ Тренировка ${n}

`;l.forEach((p,d)=>{const u=e.find(h=>h.id===d);o+=`${(u==null?void 0:u.name)||"Упражнение"}:
`,p.forEach(h=>{o+=`  ${h.weight} кг × ${h.reps}
`}),o+=`
`});const r=a.reduce((p,d)=>p+d.weight*d.reps,0);return o+=`💪 Общий объём: ${Math.round(r)} кг`,o}function X(s){const t=K(s);if(t)if(f!=null&&f.openTelegramLink){const e=`https://t.me/share/url?url=${encodeURIComponent("https://t.me/gymgym21bot")}&text=${encodeURIComponent(t)}`;f.openTelegramLink(e)}else navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")})}function Y(){if(y==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",async o=>{o.preventDefault();const r=new FormData(s),p={workoutTypeId:r.get("typeId"),weight:parseFloat(r.get("weight")),reps:parseInt(r.get("reps"),10)};if(v){const u=c.getLogs().find(h=>h.id===v);u&&(await c.updateLog({...u,...p}),v=null)}else await c.addLog(p);g()});const t=document.getElementById("duplicate-last-btn");t==null||t.addEventListener("click",async()=>{const o=c.getLogs(),r=o[o.length-1];r&&(await c.addLog({workoutTypeId:r.workoutTypeId,weight:r.weight,reps:r.reps}),g())});const e=document.getElementById("cancel-edit-btn");e==null||e.addEventListener("click",()=>{v=null,g()}),document.querySelectorAll(".log-set__delete").forEach(o=>{o.addEventListener("click",async()=>{const r=o.getAttribute("data-id");r&&(v===r&&(v=null),await c.deleteLog(r),g())})}),document.querySelectorAll(".log-set__edit").forEach(o=>{o.addEventListener("click",()=>{v=o.getAttribute("data-id"),g(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(o=>{o.addEventListener("click",()=>{const r=o.getAttribute("data-date");r&&X(r)})});const a=document.getElementById("prev-week-btn");a==null||a.addEventListener("click",()=>{w++,g()});const i=document.getElementById("next-week-btn");i==null||i.addEventListener("click",()=>{w>0&&(w--,g())});const n=document.getElementById("week-label-container"),l=document.getElementById("calendar-input");n==null||n.addEventListener("click",o=>{o.stopPropagation(),l&&l.showPicker()}),l==null||l.addEventListener("change",()=>{const o=new Date(l.value),r=new Date;r.setHours(0,0,0,0);const p=r.getTime()-o.getTime(),d=Math.floor(p/(1e3*60*60*24));w=Math.max(0,Math.floor(d/7)),g()})}if(y==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await c.addWorkoutType(e.value),g())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await c.deleteWorkoutType(e),g())})})}if(y==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{k=s.value,g()})}if(y==="profile-settings"){const s=document.getElementById("save-profile-btn");s==null||s.addEventListener("click",async()=>{const a=document.getElementById("profile-public-toggle"),i=document.getElementById("profile-history-toggle"),n=document.getElementById("profile-display-name");await c.updateProfileSettings({isPublic:(a==null?void 0:a.checked)??!1,showFullHistory:(i==null?void 0:i.checked)??!1,displayName:(n==null?void 0:n.value)||void 0}),g()});const t=document.getElementById("copy-profile-link");t==null||t.addEventListener("click",()=>{const i=`https://t.me/gymgym21bot/app?startapp=profile_${c.getProfileIdentifier()}`;navigator.clipboard.writeText(i).then(()=>{E("Ссылка скопирована")})});const e=document.getElementById("share-profile-link");e==null||e.addEventListener("click",()=>{const i=`https://t.me/gymgym21bot/app?startapp=profile_${c.getProfileIdentifier()}`;if(f!=null&&f.openTelegramLink){const n=`https://t.me/share/url?url=${encodeURIComponent(i)}&text=${encodeURIComponent("Мой профиль тренировок 💪")}`;f.openTelegramLink(n)}else navigator.clipboard.writeText(i).then(()=>{E("Ссылка скопирована")})})}}const $=document.createElement("div");$.className="sync-status";document.body.appendChild($);function B(s){switch($.className="sync-status visible "+s,s){case"saving":$.textContent="Сохранение...";break;case"success":$.textContent="Сохранено";break;case"error":$.textContent="Ошибка сохранения";break;default:$.className="sync-status"}}c.onUpdate(()=>g());c.onSyncStatusChange(B);async function Q(){var e;const t=new URLSearchParams(window.location.search).get("startapp")||((e=f==null?void 0:f.initDataUnsafe)==null?void 0:e.start_param);if(t&&t.startsWith("profile_")){const a=t.replace("profile_","");j=a,y="public-profile",I=!1,g(),L=await c.getPublicProfile(a),L||(I=!0),g()}else g();await c.init()}Q();
