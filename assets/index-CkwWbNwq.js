var R=Object.defineProperty;var q=(s,t,e)=>t in s?R(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var _=(s,t,e)=>q(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&i(l)}).observe(document,{childList:!0,subtree:!0});function e(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function i(n){if(n.ep)return;n.ep=!0;const a=e(n);fetch(n.href,a)}})();const E="gym_twa_data",T="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var j;const b=(j=window.Telegram)==null?void 0:j.WebApp,U={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class F{constructor(){_(this,"data");_(this,"onUpdateCallback");_(this,"onSyncStatusChangeCallback");_(this,"status","idle");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return b!=null&&b.initData&&(t["X-Telegram-Init-Data"]=b.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(E);if(!t)return U;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),U}}saveLocal(){localStorage.setItem(E,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(T,{headers:this.getHeaders()});if(e.ok){const i=await e.json();i&&(i.workoutTypes||i.logs)&&(this.data=i,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(T,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}async updateLog(t){const e=this.data.logs.findIndex(i=>i.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}getProfile(){return this.data.profile}getProfileIdentifier(){var i,n;const t=this.data.profile;if(t!=null&&t.telegramUsername)return t.telegramUsername;if(t!=null&&t.telegramUserId)return`id_${t.telegramUserId}`;const e=(n=(i=b==null?void 0:b.initDataUnsafe)==null?void 0:i.user)==null?void 0:n.id;return e?`id_${e}`:""}async updateProfileSettings(t){var l,o;const e=(l=b==null?void 0:b.initDataUnsafe)==null?void 0:l.user,i=e==null?void 0:e.id,n=e==null?void 0:e.username,a=e==null?void 0:e.photo_url;this.data.profile?a&&(this.data.profile.photoUrl=a):this.data.profile={isPublic:!1,showFullHistory:!1,telegramUserId:i||0,telegramUsername:n,photoUrl:a,createdAt:new Date().toISOString()},this.data.profile={...this.data.profile,...t},await this.persist(),(o=this.onUpdateCallback)==null||o.call(this)}async getPublicProfile(t){try{const e=await fetch(`${T}?profile=${encodeURIComponent(t)}`);return e.ok?await e.json():null}catch(e){return console.error("Failed to fetch public profile",e),null}}}const r=new F;var O;const v=(O=window.Telegram)==null?void 0:O.WebApp;v&&(v.ready(),v.expand());let y="main",k="all",g=null,N=null,S=null,I=!1;function H(s){y=s,u()}let x=null;function C(s){let t=document.querySelector(".toast");t||(t=document.createElement("div"),t.className="toast",document.body.appendChild(t)),t.textContent=s,t.classList.add("visible"),x&&clearTimeout(x),x=setTimeout(()=>{t==null||t.classList.remove("visible")},2e3)}function u(){if(L)return;const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${A()}
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
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");H(e)})}),Z())}function A(){switch(y){case"main":return W();case"stats":return K();case"settings":return z();case"profile-settings":return G();case"public-profile":return J();default:return""}}let w=0,D="",L=!1;function M(s){const t=new Date;t.setHours(0,0,0,0);const e=new Date(t);e.setDate(t.getDate()-s*7),e.setHours(23,59,59,999);const i=new Date(e);return i.setDate(e.getDate()-6),i.setHours(0,0,0,0),{start:i,end:e,label:`${i.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})} - ${e.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}`}}function W(){var l;const s=r.getWorkoutTypes(),t=r.getLogs(),e=t[t.length-1],i=e==null?void 0:e.workoutTypeId,n=g?t.find(o=>o.id===g):null,{label:a}=M(w);return`
    <div class="page-content" id="main-content">
      <h1 class="title">${g?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(o=>`<option value="${o.id}" ${(g?n&&o.id===n.workoutTypeId:o.id===i)?"selected":""}>${o.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${g&&n?n.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${g&&n?n.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${g?"Сохранить изменения":"Зафиксировать"}</button>
        ${g?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!g&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(l=s.find(o=>o.id===e.workoutTypeId))==null?void 0:l.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <div class="recent-logs__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
           <button class="icon-btn" id="prev-week-btn">◀️</button>
           <div id="week-label-container" style="display: flex; align-items: center; gap: 8px; position: relative;">
             <h2 class="subtitle" style="margin: 0;">${w===0?"Последние 7 дней":a}</h2>
             <span style="font-size: 18px; position: relative; display: inline-block;">
               📅
               <input type="date" id="calendar-input" value="${D}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
             </span>
           </div>
           <button class="icon-btn" id="next-week-btn" ${w===0?"disabled":""} style="${w===0?"opacity: 0.3; cursor: default;":""}">▶️</button>
        </div>
        <div id="logs-list">
          ${V()}
        </div>
      </div>
    </div>
  `}function V(){const s=r.getLogs(),t=r.getWorkoutTypes(),{start:e,end:i}=M(w),n=s.filter(a=>{const l=new Date(a.date);return l>=e&&l<=i});return P(n,t,!0)}function P(s,t,e){if(s.length===0)return'<p class="hint">Нет записей за этот период</p>';const i=new Map;[...s].sort((a,l)=>new Date(l.date).getTime()-new Date(a.date).getTime()).forEach(a=>{const o=new Date(a.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});i.has(o)||i.set(o,[]),i.get(o).push(a)});let n="";return i.forEach((a,l)=>{var p;const o=((p=a[0])==null?void 0:p.date.split("T")[0])||"";n+='<div class="log-day">',n+=`<div class="log-day__header">
      <span>${l}</span>
      ${e?`<button class="share-btn" data-date="${o}" title="Поделиться">📤</button>`:""}
    </div>`;const d=new Map;a.forEach(c=>{d.has(c.workoutTypeId)||d.set(c.workoutTypeId,[]),d.get(c.workoutTypeId).push(c)}),d.forEach((c,f)=>{const h=t.find(m=>m.id===f);n+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${(h==null?void 0:h.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${c.map(m=>`
              <div class="log-set ${m.id===g?"log-set_active-edit":""}">
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
      `}),n+="</div>"}),n}function z(){return`
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
  `}function G(){var d,p;const s=r.getProfile(),t=(s==null?void 0:s.isPublic)??!1,e=(s==null?void 0:s.displayName)||((p=(d=v==null?void 0:v.initDataUnsafe)==null?void 0:d.user)==null?void 0:p.first_name)||"",i=r.getProfileIdentifier(),n=i?`https://t.me/gymgym21bot/app?startapp=profile_${i}`:"",a=r.getLogs(),l=a.reduce((c,f)=>c+f.weight*f.reps,0),o=new Set(a.map(c=>c.date.split("T")[0])).size;return`
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
  `}function J(){if(!N)return`
      <div class="page-content">
        <div class="profile-not-found">
          <div class="profile-not-found-icon">🔍</div>
          <div class="profile-not-found-text">Профиль не найден</div>
        </div>
      </div>
    `;if(!S)return I?`
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
    `;const s=S;return`
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
            ${P(s.logs,s.workoutTypes,!1)}
          </div>
        </div>
      `:""}
    </div>
  `}function K(){const s=r.getLogs(),t=r.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=k==="all"?s:s.filter(a=>a.workoutTypeId===k),i=e.reduce((a,l)=>a+l.weight*l.reps,0),n=e.reduce((a,l)=>a+l.reps,0);return`
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
           ${X(e)}
        </div>
      </div>
    </div>
  `}function X(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((c,f)=>new Date(c.date).getTime()-new Date(f.date).getTime()).map(c=>c.weight),i=Math.min(...e),n=Math.max(...e),a=n-i||1,l=400,o=150,d=20,p=e.map((c,f)=>{const h=d+f/(e.length-1)*(l-2*d),m=o-d-(c-i)/a*(o-2*d);return`${h},${m}`}).join(" ");return`
    <svg viewBox="0 0 ${l} ${o}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${p}"
      />
      ${e.map((c,f)=>{const h=d+f/(e.length-1)*(l-2*d),m=o-d-(c-i)/a*(o-2*d);return`<circle cx="${h}" cy="${m}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${i}кг</span>
      <span class="hint">${n}кг</span>
    </div>
  `}function Y(s){const t=r.getLogs(),e=r.getWorkoutTypes(),i=t.filter(p=>p.date.startsWith(s));if(i.length===0)return"";const a=new Date(i[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),l=new Map;i.forEach(p=>{l.has(p.workoutTypeId)||l.set(p.workoutTypeId,[]),l.get(p.workoutTypeId).push(p)});let o=`🏋️ Тренировка ${a}

`;l.forEach((p,c)=>{const f=e.find(h=>h.id===c);o+=`${(f==null?void 0:f.name)||"Упражнение"}:
`,p.forEach(h=>{o+=`  ${h.weight} кг × ${h.reps}
`}),o+=`
`});const d=i.reduce((p,c)=>p+c.weight*c.reps,0);return o+=`💪 Общий объём: ${Math.round(d)} кг`,o}function Q(s){const t=Y(s);if(t)if(v!=null&&v.openTelegramLink){const e=`https://t.me/share/url?url=${encodeURIComponent("https://t.me/gymgym21bot")}&text=${encodeURIComponent(t)}`;v.openTelegramLink(e)}else navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")})}function Z(){if(y==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",async l=>{l.preventDefault();const o=new FormData(s),d={workoutTypeId:o.get("typeId"),weight:parseFloat(o.get("weight")),reps:parseInt(o.get("reps"),10)};if(g){const c=r.getLogs().find(f=>f.id===g);c&&(await r.updateLog({...c,...d}),g=null)}else await r.addLog(d);u()});const t=document.getElementById("duplicate-last-btn");t==null||t.addEventListener("click",async()=>{const l=r.getLogs(),o=l[l.length-1];o&&(await r.addLog({workoutTypeId:o.workoutTypeId,weight:o.weight,reps:o.reps}),u())});const e=document.getElementById("cancel-edit-btn");e==null||e.addEventListener("click",()=>{g=null,u()}),document.querySelectorAll(".log-set__delete").forEach(l=>{l.addEventListener("click",async()=>{const o=l.getAttribute("data-id");o&&(g===o&&(g=null),await r.deleteLog(o),u())})}),document.querySelectorAll(".log-set__edit").forEach(l=>{l.addEventListener("click",()=>{g=l.getAttribute("data-id"),u(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(l=>{l.addEventListener("click",()=>{const o=l.getAttribute("data-date");o&&Q(o)})});const i=document.getElementById("prev-week-btn");i==null||i.addEventListener("click",()=>{w++,u()});const n=document.getElementById("next-week-btn");n==null||n.addEventListener("click",()=>{w>0&&(w--,u())});const a=document.getElementById("calendar-input");a==null||a.addEventListener("focus",()=>{L=!0}),a==null||a.addEventListener("blur",()=>{setTimeout(()=>{L=!1},100)}),a==null||a.addEventListener("change",()=>{if(!a.value||a.value===D)return;D=a.value,L=!1;const l=new Date(a.value),o=new Date;o.setHours(0,0,0,0);const d=o.getTime()-l.getTime(),p=Math.floor(d/(1e3*60*60*24));w=Math.max(0,Math.floor(p/7)),u()})}if(y==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await r.addWorkoutType(e.value),u())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await r.deleteWorkoutType(e),u())})})}if(y==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{k=s.value,u()})}if(y==="profile-settings"){const s=document.getElementById("save-profile-btn");s==null||s.addEventListener("click",async()=>{const i=document.getElementById("profile-public-toggle"),n=document.getElementById("profile-history-toggle"),a=document.getElementById("profile-display-name");await r.updateProfileSettings({isPublic:(i==null?void 0:i.checked)??!1,showFullHistory:(n==null?void 0:n.checked)??!1,displayName:(a==null?void 0:a.value)||void 0}),u()});const t=document.getElementById("copy-profile-link");t==null||t.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;navigator.clipboard.writeText(n).then(()=>{C("Ссылка скопирована")})});const e=document.getElementById("share-profile-link");e==null||e.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;if(v!=null&&v.openTelegramLink){const a=`https://t.me/share/url?url=${encodeURIComponent(n)}&text=${encodeURIComponent("Мой профиль тренировок 💪")}`;v.openTelegramLink(a)}else navigator.clipboard.writeText(n).then(()=>{C("Ссылка скопирована")})})}}const $=document.createElement("div");$.className="sync-status";document.body.appendChild($);function B(s){switch($.className="sync-status visible "+s,s){case"saving":$.textContent="Сохранение...";break;case"success":$.textContent="Сохранено";break;case"error":$.textContent="Ошибка сохранения";break;default:$.className="sync-status"}}r.onUpdate(()=>u());r.onSyncStatusChange(B);async function tt(){var e;const t=new URLSearchParams(window.location.search).get("startapp")||((e=v==null?void 0:v.initDataUnsafe)==null?void 0:e.start_param);if(t&&t.startsWith("profile_")){const i=t.replace("profile_","");N=i,y="public-profile",I=!1,u(),S=await r.getPublicProfile(i),S||(I=!0),u()}else u();await r.init()}tt();
