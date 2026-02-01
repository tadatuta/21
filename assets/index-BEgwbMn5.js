var P=Object.defineProperty;var R=(s,t,e)=>t in s?P(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var _=(s,t,e)=>R(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=e(n);fetch(n.href,a)}})();const x="gym_twa_data",S="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var E;const b=(E=window.Telegram)==null?void 0:E.WebApp,D={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class q{constructor(){_(this,"data");_(this,"onUpdateCallback");_(this,"onSyncStatusChangeCallback");_(this,"status","idle");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return b!=null&&b.initData&&(t["X-Telegram-Init-Data"]=b.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(x);if(!t)return D;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),D}}saveLocal(){localStorage.setItem(x,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(S,{headers:this.getHeaders()});if(e.ok){const i=await e.json();i&&(i.workoutTypes||i.logs)&&(this.data=i,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(S,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}async updateLog(t){const e=this.data.logs.findIndex(i=>i.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}getProfile(){return this.data.profile}getProfileIdentifier(){var i,n;const t=this.data.profile;if(t!=null&&t.telegramUsername)return t.telegramUsername;if(t!=null&&t.telegramUserId)return`id_${t.telegramUserId}`;const e=(n=(i=b==null?void 0:b.initDataUnsafe)==null?void 0:i.user)==null?void 0:n.id;return e?`id_${e}`:""}async updateProfileSettings(t){var o,l;const e=(o=b==null?void 0:b.initDataUnsafe)==null?void 0:o.user,i=e==null?void 0:e.id,n=e==null?void 0:e.username,a=e==null?void 0:e.photo_url;this.data.profile?a&&(this.data.profile.photoUrl=a):this.data.profile={isPublic:!1,showFullHistory:!1,telegramUserId:i||0,telegramUsername:n,photoUrl:a,createdAt:new Date().toISOString()},this.data.profile={...this.data.profile,...t},await this.persist(),(l=this.onUpdateCallback)==null||l.call(this)}async getPublicProfile(t){try{const e=await fetch(`${S}?profile=${encodeURIComponent(t)}`);return e.ok?await e.json():null}catch(e){return console.error("Failed to fetch public profile",e),null}}}const r=new q;var C;const g=(C=window.Telegram)==null?void 0:C.WebApp;g&&(g.ready(),g.expand());let y="main",k="all",u=null,j=null,L=null,I=!1;function F(s){y=s,v()}let T=null;function U(s){let t=document.querySelector(".toast");t||(t=document.createElement("div"),t.className="toast",document.body.appendChild(t)),t.textContent=s,t.classList.add("visible"),T&&clearTimeout(T),T=setTimeout(()=>{t==null||t.classList.remove("visible")},2e3)}function v(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${M()}
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
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");F(e)})}),Y())}function M(){switch(y){case"main":return H();case"stats":return G();case"settings":return W();case"profile-settings":return V();case"public-profile":return z();default:return""}}let w=0;function N(s){const t=new Date;t.setHours(0,0,0,0);const e=new Date(t);e.setDate(t.getDate()-s*7),e.setHours(23,59,59,999);const i=new Date(e);return i.setDate(e.getDate()-6),i.setHours(0,0,0,0),{start:i,end:e,label:`${i.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})} - ${e.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}`}}function H(){var o;const s=r.getWorkoutTypes(),t=r.getLogs(),e=t[t.length-1],i=e==null?void 0:e.workoutTypeId,n=u?t.find(l=>l.id===u):null,{label:a}=N(w);return`
    <div class="page-content" id="main-content">
      <h1 class="title">${u?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(l=>`<option value="${l.id}" ${(u?n&&l.id===n.workoutTypeId:l.id===i)?"selected":""}>${l.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${u&&n?n.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${u&&n?n.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${u?"Сохранить изменения":"Зафиксировать"}</button>
        ${u?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!u&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(o=s.find(l=>l.id===e.workoutTypeId))==null?void 0:o.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <div class="recent-logs__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
           <button class="icon-btn" id="prev-week-btn">◀️</button>
           <h2 class="subtitle" style="margin: 0;">${w===0?"Последние 7 дней":a}</h2>
           <button class="icon-btn" id="next-week-btn" ${w===0?"disabled":""} style="${w===0?"opacity: 0.3; cursor: default;":""}">▶️</button>
        </div>
        <div id="logs-list">
          ${A()}
        </div>
      </div>
    </div>
  `}function A(){const s=r.getLogs(),t=r.getWorkoutTypes(),{start:e,end:i}=N(w),n=s.filter(a=>{const o=new Date(a.date);return o>=e&&o<=i});return O(n,t,!0)}function O(s,t,e){if(s.length===0)return'<p class="hint">Нет записей за этот период</p>';const i=new Map;[...s].sort((a,o)=>new Date(o.date).getTime()-new Date(a.date).getTime()).forEach(a=>{const l=new Date(a.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});i.has(l)||i.set(l,[]),i.get(l).push(a)});let n="";return i.forEach((a,o)=>{var d;const l=((d=a[0])==null?void 0:d.date.split("T")[0])||"";n+='<div class="log-day">',n+=`<div class="log-day__header">
      <span>${o}</span>
      ${e?`<button class="share-btn" data-date="${l}" title="Поделиться">📤</button>`:""}
    </div>`;const p=new Map;a.forEach(c=>{p.has(c.workoutTypeId)||p.set(c.workoutTypeId,[]),p.get(c.workoutTypeId).push(c)}),p.forEach((c,f)=>{const h=t.find(m=>m.id===f);n+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${(h==null?void 0:h.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${c.map(m=>`
              <div class="log-set ${m.id===u?"log-set_active-edit":""}">
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
      `}),n+="</div>"}),n}function W(){return`
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
  `}function V(){var p,d;const s=r.getProfile(),t=(s==null?void 0:s.isPublic)??!1,e=(s==null?void 0:s.displayName)||((d=(p=g==null?void 0:g.initDataUnsafe)==null?void 0:p.user)==null?void 0:d.first_name)||"",i=r.getProfileIdentifier(),n=i?`https://t.me/gymgym21bot/app?startapp=profile_${i}`:"",a=r.getLogs(),o=a.reduce((c,f)=>c+f.weight*f.reps,0),l=new Set(a.map(c=>c.date.split("T")[0])).size;return`
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

        ${t&&i?`
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
            ${O(s.logs,s.workoutTypes,!1)}
          </div>
        </div>
      `:""}
    </div>
  `}function G(){const s=r.getLogs(),t=r.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=k==="all"?s:s.filter(a=>a.workoutTypeId===k),i=e.reduce((a,o)=>a+o.weight*o.reps,0),n=e.reduce((a,o)=>a+o.reps,0);return`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      
      <div class="form-group">
        <label class="label">Тип тренировки</label>
        <select class="select" id="stat-type-select">
          <option value="all">Все тренировки</option>
          ${t.map(a=>`<option value="${a.id}" ${k===a.id?"selected":""}>${a.name}</option>`).join("")}
        </select>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__label">Объем (${k==="all"?"все":"тип"})</div>
          <div class="stat-card__value">${Math.round(i)} кг</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Повторений</div>
          <div class="stat-card__value">${n}</div>
        </div>
      </div>

      <div class="charts-section">
        <h2 class="subtitle">Прогресс (макс. вес)</h2>
        <div class="chart-container">
           ${J(e)}
        </div>
      </div>
    </div>
  `}function J(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((c,f)=>new Date(c.date).getTime()-new Date(f.date).getTime()).map(c=>c.weight),i=Math.min(...e),n=Math.max(...e),a=n-i||1,o=400,l=150,p=20,d=e.map((c,f)=>{const h=p+f/(e.length-1)*(o-2*p),m=l-p-(c-i)/a*(l-2*p);return`${h},${m}`}).join(" ");return`
    <svg viewBox="0 0 ${o} ${l}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${d}"
      />
      ${e.map((c,f)=>{const h=p+f/(e.length-1)*(o-2*p),m=l-p-(c-i)/a*(l-2*p);return`<circle cx="${h}" cy="${m}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${i}кг</span>
      <span class="hint">${n}кг</span>
    </div>
  `}function K(s){const t=r.getLogs(),e=r.getWorkoutTypes(),i=t.filter(d=>d.date.startsWith(s));if(i.length===0)return"";const a=new Date(i[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),o=new Map;i.forEach(d=>{o.has(d.workoutTypeId)||o.set(d.workoutTypeId,[]),o.get(d.workoutTypeId).push(d)});let l=`🏋️ Тренировка ${a}

`;o.forEach((d,c)=>{const f=e.find(h=>h.id===c);l+=`${(f==null?void 0:f.name)||"Упражнение"}:
`,d.forEach(h=>{l+=`  ${h.weight} кг × ${h.reps}
`}),l+=`
`});const p=i.reduce((d,c)=>d+c.weight*c.reps,0);return l+=`💪 Общий объём: ${Math.round(p)} кг`,l}function X(s){const t=K(s);if(t)if(g!=null&&g.openTelegramLink){const e=`https://t.me/share/url?url=${encodeURIComponent("https://t.me/gymgym21bot")}&text=${encodeURIComponent(t)}`;g.openTelegramLink(e)}else navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")})}function Y(){if(y==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",async a=>{a.preventDefault();const o=new FormData(s),l={workoutTypeId:o.get("typeId"),weight:parseFloat(o.get("weight")),reps:parseInt(o.get("reps"),10)};if(u){const d=r.getLogs().find(c=>c.id===u);d&&(await r.updateLog({...d,...l}),u=null)}else await r.addLog(l);v()});const t=document.getElementById("duplicate-last-btn");t==null||t.addEventListener("click",async()=>{const a=r.getLogs(),o=a[a.length-1];o&&(await r.addLog({workoutTypeId:o.workoutTypeId,weight:o.weight,reps:o.reps}),v())});const e=document.getElementById("cancel-edit-btn");e==null||e.addEventListener("click",()=>{u=null,v()}),document.querySelectorAll(".log-set__delete").forEach(a=>{a.addEventListener("click",async()=>{const o=a.getAttribute("data-id");o&&(u===o&&(u=null),await r.deleteLog(o),v())})}),document.querySelectorAll(".log-set__edit").forEach(a=>{a.addEventListener("click",()=>{u=a.getAttribute("data-id"),v(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(a=>{a.addEventListener("click",()=>{const o=a.getAttribute("data-date");o&&X(o)})});const i=document.getElementById("prev-week-btn");i==null||i.addEventListener("click",()=>{w++,v()});const n=document.getElementById("next-week-btn");n==null||n.addEventListener("click",()=>{w>0&&(w--,v())})}if(y==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await r.addWorkoutType(e.value),v())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await r.deleteWorkoutType(e),v())})})}if(y==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{k=s.value,v()})}if(y==="profile-settings"){const s=document.getElementById("save-profile-btn");s==null||s.addEventListener("click",async()=>{const i=document.getElementById("profile-public-toggle"),n=document.getElementById("profile-history-toggle"),a=document.getElementById("profile-display-name");await r.updateProfileSettings({isPublic:(i==null?void 0:i.checked)??!1,showFullHistory:(n==null?void 0:n.checked)??!1,displayName:(a==null?void 0:a.value)||void 0}),v()});const t=document.getElementById("copy-profile-link");t==null||t.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;navigator.clipboard.writeText(n).then(()=>{U("Ссылка скопирована")})});const e=document.getElementById("share-profile-link");e==null||e.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;if(g!=null&&g.openTelegramLink){const a=`https://t.me/share/url?url=${encodeURIComponent(n)}&text=${encodeURIComponent("Мой профиль тренировок 💪")}`;g.openTelegramLink(a)}else navigator.clipboard.writeText(n).then(()=>{U("Ссылка скопирована")})})}}const $=document.createElement("div");$.className="sync-status";document.body.appendChild($);function Q(s){switch($.className="sync-status visible "+s,s){case"saving":$.textContent="Сохранение...";break;case"success":$.textContent="Сохранено";break;case"error":$.textContent="Ошибка сохранения";break;default:$.className="sync-status"}}r.onUpdate(()=>v());r.onSyncStatusChange(Q);async function Z(){var e;const t=new URLSearchParams(window.location.search).get("startapp")||((e=g==null?void 0:g.initDataUnsafe)==null?void 0:e.start_param);if(t&&t.startsWith("profile_")){const i=t.replace("profile_","");j=i,y="public-profile",I=!1,v(),L=await r.getPublicProfile(i),L||(I=!0),v()}else v();await r.init()}Z();
