var R=Object.defineProperty;var q=(s,t,e)=>t in s?R(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var _=(s,t,e)=>q(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();const x="gym_twa_data",S="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var U;const b=(U=window.Telegram)==null?void 0:U.WebApp,D={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class F{constructor(){_(this,"data");_(this,"onUpdateCallback");_(this,"onSyncStatusChangeCallback");_(this,"status","idle");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return b!=null&&b.initData&&(t["X-Telegram-Init-Data"]=b.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(x);if(!t)return D;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),D}}saveLocal(){localStorage.setItem(x,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(S,{headers:this.getHeaders()});if(e.ok){const a=await e.json();a&&(a.workoutTypes||a.logs)&&(this.data=a,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(S,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}async updateLog(t){const e=this.data.logs.findIndex(a=>a.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}getProfile(){return this.data.profile}getProfileIdentifier(){var a,i;const t=this.data.profile;if(t!=null&&t.telegramUsername)return t.telegramUsername;if(t!=null&&t.telegramUserId)return`id_${t.telegramUserId}`;const e=(i=(a=b==null?void 0:b.initDataUnsafe)==null?void 0:a.user)==null?void 0:i.id;return e?`id_${e}`:""}async updateProfileSettings(t){var o,l;const e=(o=b==null?void 0:b.initDataUnsafe)==null?void 0:o.user,a=e==null?void 0:e.id,i=e==null?void 0:e.username,n=e==null?void 0:e.photo_url;this.data.profile?n&&(this.data.profile.photoUrl=n):this.data.profile={isPublic:!1,showFullHistory:!1,telegramUserId:a||0,telegramUsername:i,photoUrl:n,createdAt:new Date().toISOString()},this.data.profile={...this.data.profile,...t},await this.persist(),(l=this.onUpdateCallback)==null||l.call(this)}async getPublicProfile(t){try{const e=await fetch(`${S}?profile=${encodeURIComponent(t)}`);return e.ok?await e.json():null}catch(e){return console.error("Failed to fetch public profile",e),null}}}const r=new F;var C;const v=(C=window.Telegram)==null?void 0:C.WebApp;v&&(v.ready(),v.expand());let y="main",k="all",g=null,j=null,L=null,I=!1;function M(s){y=s,u()}let T=null;function E(s){let t=document.querySelector(".toast");t||(t=document.createElement("div"),t.className="toast",document.body.appendChild(t)),t.textContent=s,t.classList.add("visible"),T&&clearTimeout(T),T=setTimeout(()=>{t==null||t.classList.remove("visible")},2e3)}function u(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${P()}
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
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");M(e)})}),Y())}function P(){switch(y){case"main":return H();case"stats":return G();case"settings":return W();case"profile-settings":return z();case"public-profile":return V();default:return""}}let w=0;function O(s){const t=new Date;t.setHours(0,0,0,0);const e=new Date(t);e.setDate(t.getDate()-s*7),e.setHours(23,59,59,999);const a=new Date(e);return a.setDate(e.getDate()-6),a.setHours(0,0,0,0),{start:a,end:e,label:`${a.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})} - ${e.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}`}}function H(){var o;const s=r.getWorkoutTypes(),t=r.getLogs(),e=t[t.length-1],a=e==null?void 0:e.workoutTypeId,i=g?t.find(l=>l.id===g):null,{label:n}=O(w);return`
    <div class="page-content" id="main-content">
      <h1 class="title">${g?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(l=>`<option value="${l.id}" ${(g?i&&l.id===i.workoutTypeId:l.id===a)?"selected":""}>${l.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${g&&i?i.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${g&&i?i.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${g?"Сохранить изменения":"Зафиксировать"}</button>
        ${g?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!g&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(o=s.find(l=>l.id===e.workoutTypeId))==null?void 0:o.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <div class="recent-logs__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
           <button class="icon-btn" id="prev-week-btn">◀️</button>
           <div style="position: relative; display: flex; align-items: center; justify-content: center;">
             <h2 class="subtitle" style="margin: 0; display: flex; align-items: center; gap: 8px;" id="calendar-trigger">
               ${w===0?"Последние 7 дней":n}
               <span style="font-size: 1rem;">📅</span>
             </h2>
             <input type="date" id="week-date-picker" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; z-index: 10; cursor: pointer;" max="${new Date().toISOString().split("T")[0]}">
           </div>
           <button class="icon-btn" id="next-week-btn" ${w===0?"disabled":""} style="${w===0?"opacity: 0.3; cursor: default;":""}">▶️</button>
        </div>
        <div id="logs-list">
          ${A()}
        </div>
      </div>
    </div>
  `}function A(){const s=r.getLogs(),t=r.getWorkoutTypes(),{start:e,end:a}=O(w),i=s.filter(n=>{const o=new Date(n.date);return o>=e&&o<=a});return N(i,t,!0)}function N(s,t,e){if(s.length===0)return'<p class="hint">Нет записей за этот период</p>';const a=new Map;[...s].sort((n,o)=>new Date(o.date).getTime()-new Date(n.date).getTime()).forEach(n=>{const l=new Date(n.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});a.has(l)||a.set(l,[]),a.get(l).push(n)});let i="";return a.forEach((n,o)=>{var p;const l=((p=n[0])==null?void 0:p.date.split("T")[0])||"";i+='<div class="log-day">',i+=`<div class="log-day__header">
      <span>${o}</span>
      ${e?`<button class="share-btn" data-date="${l}" title="Поделиться">📤</button>`:""}
    </div>`;const d=new Map;n.forEach(c=>{d.has(c.workoutTypeId)||d.set(c.workoutTypeId,[]),d.get(c.workoutTypeId).push(c)}),d.forEach((c,f)=>{const m=t.find(h=>h.id===f);i+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${(m==null?void 0:m.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${c.map(h=>`
              <div class="log-set ${h.id===g?"log-set_active-edit":""}">
                <div class="log-set__info">
                  <span class="log-set__weight">${h.weight} кг</span>
                  <span class="log-set__times">×</span>
                  <span class="log-set__reps">${h.reps}</span>
                </div>
                ${e?`
                <div class="log-set__actions">
                  <button class="log-set__edit" data-id="${h.id}">✏️</button>
                  <button class="log-set__delete" data-id="${h.id}">×</button>
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
  `}function z(){var d,p;const s=r.getProfile(),t=(s==null?void 0:s.isPublic)??!1,e=(s==null?void 0:s.displayName)||((p=(d=v==null?void 0:v.initDataUnsafe)==null?void 0:d.user)==null?void 0:p.first_name)||"",a=r.getProfileIdentifier(),i=a?`https://t.me/gymgym21bot/app?startapp=profile_${a}`:"",n=r.getLogs(),o=n.reduce((c,f)=>c+f.weight*f.reps,0),l=new Set(n.map(c=>c.date.split("T")[0])).size;return`
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
  `}function V(){if(!j)return`
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
  `}function G(){const s=r.getLogs(),t=r.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=k==="all"?s:s.filter(n=>n.workoutTypeId===k),a=e.reduce((n,o)=>n+o.weight*o.reps,0),i=e.reduce((n,o)=>n+o.reps,0);return`
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
  `}function J(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((c,f)=>new Date(c.date).getTime()-new Date(f.date).getTime()).map(c=>c.weight),a=Math.min(...e),i=Math.max(...e),n=i-a||1,o=400,l=150,d=20,p=e.map((c,f)=>{const m=d+f/(e.length-1)*(o-2*d),h=l-d-(c-a)/n*(l-2*d);return`${m},${h}`}).join(" ");return`
    <svg viewBox="0 0 ${o} ${l}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${p}"
      />
      ${e.map((c,f)=>{const m=d+f/(e.length-1)*(o-2*d),h=l-d-(c-a)/n*(l-2*d);return`<circle cx="${m}" cy="${h}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${a}кг</span>
      <span class="hint">${i}кг</span>
    </div>
  `}function K(s){const t=r.getLogs(),e=r.getWorkoutTypes(),a=t.filter(p=>p.date.startsWith(s));if(a.length===0)return"";const n=new Date(a[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),o=new Map;a.forEach(p=>{o.has(p.workoutTypeId)||o.set(p.workoutTypeId,[]),o.get(p.workoutTypeId).push(p)});let l=`🏋️ Тренировка ${n}

`;o.forEach((p,c)=>{const f=e.find(m=>m.id===c);l+=`${(f==null?void 0:f.name)||"Упражнение"}:
`,p.forEach(m=>{l+=`  ${m.weight} кг × ${m.reps}
`}),l+=`
`});const d=a.reduce((p,c)=>p+c.weight*c.reps,0);return l+=`💪 Общий объём: ${Math.round(d)} кг`,l}function X(s){const t=K(s);if(t)if(v!=null&&v.openTelegramLink){const e=`https://t.me/share/url?url=${encodeURIComponent("https://t.me/gymgym21bot")}&text=${encodeURIComponent(t)}`;v.openTelegramLink(e)}else navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")})}function Y(){if(y==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",async o=>{o.preventDefault();const l=new FormData(s),d={workoutTypeId:l.get("typeId"),weight:parseFloat(l.get("weight")),reps:parseInt(l.get("reps"),10)};if(g){const c=r.getLogs().find(f=>f.id===g);c&&(await r.updateLog({...c,...d}),g=null)}else await r.addLog(d);u()});const t=document.getElementById("duplicate-last-btn");t==null||t.addEventListener("click",async()=>{const o=r.getLogs(),l=o[o.length-1];l&&(await r.addLog({workoutTypeId:l.workoutTypeId,weight:l.weight,reps:l.reps}),u())});const e=document.getElementById("cancel-edit-btn");e==null||e.addEventListener("click",()=>{g=null,u()}),document.querySelectorAll(".log-set__delete").forEach(o=>{o.addEventListener("click",async()=>{const l=o.getAttribute("data-id");l&&(g===l&&(g=null),await r.deleteLog(l),u())})}),document.querySelectorAll(".log-set__edit").forEach(o=>{o.addEventListener("click",()=>{g=o.getAttribute("data-id"),u(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(o=>{o.addEventListener("click",()=>{const l=o.getAttribute("data-date");l&&X(l)})});const a=document.getElementById("prev-week-btn");a==null||a.addEventListener("click",()=>{w++,u()});const i=document.getElementById("next-week-btn");i==null||i.addEventListener("click",()=>{w>0&&(w--,u())});const n=document.getElementById("week-date-picker");n==null||n.addEventListener("change",()=>{if(n.value){const o=new Date(n.value),l=new Date;l.setHours(0,0,0,0),o.setHours(0,0,0,0);const d=l.getTime()-o.getTime(),p=Math.floor(d/(1e3*60*60*24));p<0?w=0:w=Math.floor(p/7),u()}})}if(y==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await r.addWorkoutType(e.value),u())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await r.deleteWorkoutType(e),u())})})}if(y==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{k=s.value,u()})}if(y==="profile-settings"){const s=document.getElementById("save-profile-btn");s==null||s.addEventListener("click",async()=>{const a=document.getElementById("profile-public-toggle"),i=document.getElementById("profile-history-toggle"),n=document.getElementById("profile-display-name");await r.updateProfileSettings({isPublic:(a==null?void 0:a.checked)??!1,showFullHistory:(i==null?void 0:i.checked)??!1,displayName:(n==null?void 0:n.value)||void 0}),u()});const t=document.getElementById("copy-profile-link");t==null||t.addEventListener("click",()=>{const i=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;navigator.clipboard.writeText(i).then(()=>{E("Ссылка скопирована")})});const e=document.getElementById("share-profile-link");e==null||e.addEventListener("click",()=>{const i=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;if(v!=null&&v.openTelegramLink){const n=`https://t.me/share/url?url=${encodeURIComponent(i)}&text=${encodeURIComponent("Мой профиль тренировок 💪")}`;v.openTelegramLink(n)}else navigator.clipboard.writeText(i).then(()=>{E("Ссылка скопирована")})})}}const $=document.createElement("div");$.className="sync-status";document.body.appendChild($);function Q(s){switch($.className="sync-status visible "+s,s){case"saving":$.textContent="Сохранение...";break;case"success":$.textContent="Сохранено";break;case"error":$.textContent="Ошибка сохранения";break;default:$.className="sync-status"}}r.onUpdate(()=>u());r.onSyncStatusChange(Q);async function Z(){var e;const t=new URLSearchParams(window.location.search).get("startapp")||((e=v==null?void 0:v.initDataUnsafe)==null?void 0:e.start_param);if(t&&t.startsWith("profile_")){const a=t.replace("profile_","");j=a,y="public-profile",I=!1,u(),L=await r.getPublicProfile(a),L||(I=!0),u()}else u();await r.init()}Z();
