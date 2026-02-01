var C=Object.defineProperty;var j=(s,t,e)=>t in s?C(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var $=(s,t,e)=>j(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function e(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(a){if(a.ep)return;a.ep=!0;const n=e(a);fetch(a.href,n)}})();const I="gym_twa_data",L="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var D;const m=(D=window.Telegram)==null?void 0:D.WebApp,x={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[]};class O{constructor(){$(this,"data");$(this,"onUpdateCallback");$(this,"onSyncStatusChangeCallback");$(this,"status","idle");this.data=this.loadLocal()}getHeaders(){const t={"Content-Type":"application/json"};return m!=null&&m.initData&&(t["X-Telegram-Init-Data"]=m.initData),t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(I);if(!t)return x;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse storage data",e),x}}saveLocal(){localStorage.setItem(I,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(L,{headers:this.getHeaders()});if(e.ok){const i=await e.json();i&&(i.workoutTypes||i.logs)&&(this.data=i,this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(L,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}getLogs(){return this.data.logs}async addLog(t){const e={...t,id:Date.now().toString(),date:new Date().toISOString()};return this.data.logs.push(e),await this.persist(),e}async deleteLog(t){this.data.logs=this.data.logs.filter(e=>e.id!==t),await this.persist()}async updateLog(t){const e=this.data.logs.findIndex(i=>i.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}getProfile(){return this.data.profile}getProfileIdentifier(){var i,a;const t=this.data.profile;if(t!=null&&t.telegramUsername)return t.telegramUsername;if(t!=null&&t.telegramUserId)return`id_${t.telegramUserId}`;const e=(a=(i=m==null?void 0:m.initDataUnsafe)==null?void 0:i.user)==null?void 0:a.id;return e?`id_${e}`:""}async updateProfileSettings(t){var a,n,o,l,c;const e=(n=(a=m==null?void 0:m.initDataUnsafe)==null?void 0:a.user)==null?void 0:n.id,i=(l=(o=m==null?void 0:m.initDataUnsafe)==null?void 0:o.user)==null?void 0:l.username;this.data.profile||(this.data.profile={isPublic:!1,telegramUserId:e||0,telegramUsername:i,createdAt:new Date().toISOString()}),this.data.profile={...this.data.profile,...t},await this.persist(),(c=this.onUpdateCallback)==null||c.call(this)}async getPublicProfile(t){try{const e=await fetch(`${L}?profile=${encodeURIComponent(t)}`);return e.ok?await e.json():null}catch(e){return console.error("Failed to fetch public profile",e),null}}}const r=new O;var E;const g=(E=window.Telegram)==null?void 0:E.WebApp;g&&(g.ready(),g.expand());let y="main",k="all",u=null,U=null,T=null;function N(s){y=s,h()}function h(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${q()}
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
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");N(e)})}),G())}function q(){switch(y){case"main":return M();case"stats":return H();case"settings":return P();case"profile-settings":return F();case"public-profile":return A();default:return""}}function M(){var n;const s=r.getWorkoutTypes(),t=r.getLogs(),e=t[t.length-1],i=e==null?void 0:e.workoutTypeId,a=u?t.find(o=>o.id===u):null;return`
    <div class="page-content" id="main-content">
      <h1 class="title">${u?"Редактирование подхода":"Новый подход"}</h1>
      <form class="workout-form" id="log-form">
        <div class="form-group">
          <label class="label">Тип тренировки</label>
          <select class="select" name="typeId" required>
            ${s.map(o=>`<option value="${o.id}" ${(u?a&&o.id===a.workoutTypeId:o.id===i)?"selected":""}>${o.name}</option>`).join("")}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="label">Вес (кг)</label>
            <input class="input" type="number" name="weight" step="0.5" required placeholder="0" value="${u&&a?a.weight:""}">
          </div>
          <div class="form-group">
            <label class="label">Повторений</label>
            <input class="input" type="number" name="reps" required placeholder="0" value="${u&&a?a.reps:""}">
          </div>
        </div>
        <button class="button" type="submit">${u?"Сохранить изменения":"Зафиксировать"}</button>
        ${u?'<button class="button button_secondary" type="button" id="cancel-edit-btn" style="margin-top: 12px;">Отмена</button>':""}
        ${!u&&e?`<button class="button button_secondary" type="button" id="duplicate-last-btn" style="margin-top: 12px;">Повторить: ${(n=s.find(o=>o.id===e.workoutTypeId))==null?void 0:n.name} ${e.weight}кг × ${e.reps}</button>`:""}
      </form>
      <div class="recent-logs">
        <h2 class="subtitle">Последние записи</h2>
        <div id="logs-list">
          ${R()}
        </div>
      </div>
    </div>
  `}function R(){const s=r.getLogs(),t=r.getWorkoutTypes();if(s.length===0)return'<p class="hint">Пока нет записей</p>';const e=new Date,i=new Date(e.getTime()-7*24*60*60*1e3);i.setHours(0,0,0,0);const a=s.filter(l=>new Date(l.date)>=i);if(a.length===0)return'<p class="hint">За последнюю неделю записей нет</p>';const n=new Map;[...a].sort((l,c)=>new Date(c.date).getTime()-new Date(l.date).getTime()).forEach(l=>{const d=new Date(l.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});n.has(d)||n.set(d,[]),n.get(d).push(l)});let o="";return n.forEach((l,c)=>{var v;const d=((v=l[0])==null?void 0:v.date.split("T")[0])||"";o+='<div class="log-day">',o+=`<div class="log-day__header">
      <span>${c}</span>
      <button class="share-btn" data-date="${d}" title="Поделиться">📤</button>
    </div>`;const p=new Map;l.forEach(f=>{p.has(f.workoutTypeId)||p.set(f.workoutTypeId,[]),p.get(f.workoutTypeId).push(f)}),p.forEach((f,_)=>{const S=t.find(b=>b.id===_);o+=`
        <div class="log-exercise">
          <div class="log-exercise__name">${(S==null?void 0:S.name)||"Удалено"}</div>
          <div class="log-exercise__sets">
            ${f.map(b=>`
              <div class="log-set ${b.id===u?"log-set_active-edit":""}">
                <div class="log-set__info">
                  <span class="log-set__weight">${b.weight} кг</span>
                  <span class="log-set__times">×</span>
                  <span class="log-set__reps">${b.reps}</span>
                </div>
                <div class="log-set__actions">
                  <button class="log-set__edit" data-id="${b.id}">✏️</button>
                  <button class="log-set__delete" data-id="${b.id}">×</button>
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
  `}function F(){var c,d;const s=r.getProfile(),t=(s==null?void 0:s.isPublic)??!1,e=(s==null?void 0:s.displayName)||((d=(c=g==null?void 0:g.initDataUnsafe)==null?void 0:c.user)==null?void 0:d.first_name)||"",i=r.getProfileIdentifier(),a=i?`https://t.me/gymgym21bot/app?startapp=profile_${i}`:"",n=r.getLogs(),o=n.reduce((p,v)=>p+v.weight*v.reps,0),l=new Set(n.map(p=>p.date.split("T")[0])).size;return`
    <div class="page-content">
      <h1 class="title">Профиль</h1>
      
      <div class="profile-header">
        <div class="profile-avatar">${e.charAt(0).toUpperCase()}</div>
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
        </div>

        <div class="settings-section">
          <div class="settings-section-title">Имя</div>
          <input class="input" type="text" id="profile-display-name" value="${e}" placeholder="Ваше имя">
        </div>

        ${t&&i?`
          <div class="settings-section">
            <div class="settings-section-title">Ссылка на профиль</div>
            <div class="profile-link-section">
              <div class="profile-link-url">${a}</div>
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

        <button class="button" id="save-profile-btn" style="margin-top: 16px;">Сохранить</button>
      </div>
    </div>
  `}function A(){if(!U)return`
      <div class="page-content">
        <div class="profile-not-found">
          <div class="profile-not-found-icon">🔍</div>
          <div class="profile-not-found-text">Профиль не найден</div>
        </div>
      </div>
    `;if(!T)return`
      <div class="page-content">
        <div class="profile-loading">Загрузка профиля...</div>
      </div>
    `;const s=T;return`
    <div class="page-content">
      <div class="profile-header">
        <div class="profile-avatar">${s.displayName.charAt(0).toUpperCase()}</div>
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
    </div>
  `}function H(){const s=r.getLogs(),t=r.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const e=k==="all"?s:s.filter(n=>n.workoutTypeId===k),i=e.reduce((n,o)=>n+o.weight*o.reps,0),a=e.reduce((n,o)=>n+o.reps,0);return`
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
          <div class="stat-card__value">${Math.round(i)} кг</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Повторений</div>
          <div class="stat-card__value">${a}</div>
        </div>
      </div>

      <div class="charts-section">
        <h2 class="subtitle">Прогресс (макс. вес)</h2>
        <div class="chart-container">
           ${V(e)}
        </div>
      </div>
    </div>
  `}function V(s){if(s.length<2)return'<p class="hint" style="text-align: center">Мало данных для графика</p>';const e=[...s].sort((p,v)=>new Date(p.date).getTime()-new Date(v.date).getTime()).map(p=>p.weight),i=Math.min(...e),a=Math.max(...e),n=a-i||1,o=400,l=150,c=20,d=e.map((p,v)=>{const f=c+v/(e.length-1)*(o-2*c),_=l-c-(p-i)/n*(l-2*c);return`${f},${_}`}).join(" ");return`
    <svg viewBox="0 0 ${o} ${l}" class="chart">
      <polyline
        fill="none"
        stroke="var(--color-link)"
        stroke-width="3"
        stroke-linejoin="round"
        stroke-linecap="round"
        points="${d}"
      />
      ${e.map((p,v)=>{const f=c+v/(e.length-1)*(o-2*c),_=l-c-(p-i)/n*(l-2*c);return`<circle cx="${f}" cy="${_}" r="4" fill="var(--color-bg)" stroke="var(--color-link)" stroke-width="2" />`}).join("")}
    </svg>
    <div style="display: flex; justify-content: space-between; margin-top: 8px;">
      <span class="hint">${i}кг</span>
      <span class="hint">${a}кг</span>
    </div>
  `}function W(s){const t=r.getLogs(),e=r.getWorkoutTypes(),i=t.filter(d=>d.date.startsWith(s));if(i.length===0)return"";const n=new Date(i[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),o=new Map;i.forEach(d=>{o.has(d.workoutTypeId)||o.set(d.workoutTypeId,[]),o.get(d.workoutTypeId).push(d)});let l=`🏋️ Тренировка ${n}

`;o.forEach((d,p)=>{const v=e.find(f=>f.id===p);l+=`${(v==null?void 0:v.name)||"Упражнение"}:
`,d.forEach(f=>{l+=`  ${f.weight} кг × ${f.reps}
`}),l+=`
`});const c=i.reduce((d,p)=>d+p.weight*p.reps,0);return l+=`💪 Общий объём: ${Math.round(c)} кг`,l}function z(s){const t=W(s);if(t)if(g!=null&&g.openTelegramLink){const e=`https://t.me/share/url?url=${encodeURIComponent("https://t.me/gymgym21bot")}&text=${encodeURIComponent(t)}`;g.openTelegramLink(e)}else navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")})}function G(){if(y==="main"){const s=document.getElementById("log-form");s==null||s.addEventListener("submit",async i=>{i.preventDefault();const a=new FormData(s),n={workoutTypeId:a.get("typeId"),weight:parseFloat(a.get("weight")),reps:parseInt(a.get("reps"),10)};if(u){const l=r.getLogs().find(c=>c.id===u);l&&(await r.updateLog({...l,...n}),u=null)}else await r.addLog(n);h()});const t=document.getElementById("duplicate-last-btn");t==null||t.addEventListener("click",async()=>{const i=r.getLogs(),a=i[i.length-1];a&&(await r.addLog({workoutTypeId:a.workoutTypeId,weight:a.weight,reps:a.reps}),h())});const e=document.getElementById("cancel-edit-btn");e==null||e.addEventListener("click",()=>{u=null,h()}),document.querySelectorAll(".log-set__delete").forEach(i=>{i.addEventListener("click",async()=>{const a=i.getAttribute("data-id");a&&(u===a&&(u=null),await r.deleteLog(a),h())})}),document.querySelectorAll(".log-set__edit").forEach(i=>{i.addEventListener("click",()=>{u=i.getAttribute("data-id"),h(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(i=>{i.addEventListener("click",()=>{const a=i.getAttribute("data-date");a&&z(a)})})}if(y==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("new-type-name");e.value&&(await r.addWorkoutType(e.value),h())}),document.querySelectorAll(".type-item__delete").forEach(t=>{t.addEventListener("click",async()=>{const e=t.getAttribute("data-id");e&&confirm("Удалить этот тип тренировки?")&&(await r.deleteWorkoutType(e),h())})})}if(y==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{k=s.value,h()})}if(y==="profile-settings"){const s=document.getElementById("save-profile-btn");s==null||s.addEventListener("click",async()=>{const i=document.getElementById("profile-public-toggle"),a=document.getElementById("profile-display-name");await r.updateProfileSettings({isPublic:(i==null?void 0:i.checked)??!1,displayName:(a==null?void 0:a.value)||void 0}),h()});const t=document.getElementById("copy-profile-link");t==null||t.addEventListener("click",()=>{const a=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;navigator.clipboard.writeText(a).then(()=>{alert("Ссылка скопирована")})});const e=document.getElementById("share-profile-link");e==null||e.addEventListener("click",()=>{const a=`https://t.me/gymgym21bot/app?startapp=profile_${r.getProfileIdentifier()}`;if(g!=null&&g.openTelegramLink){const n=`https://t.me/share/url?url=${encodeURIComponent(a)}&text=${encodeURIComponent("Мой профиль тренировок 💪")}`;g.openTelegramLink(n)}else navigator.clipboard.writeText(a).then(()=>{alert("Ссылка скопирована")})})}}const w=document.createElement("div");w.className="sync-status";document.body.appendChild(w);function J(s){switch(w.className="sync-status visible "+s,s){case"saving":w.textContent="Сохранение...";break;case"success":w.textContent="Сохранено";break;case"error":w.textContent="Ошибка сохранения";break;default:w.className="sync-status"}}r.onUpdate(()=>h());r.onSyncStatusChange(J);async function K(){var e;const t=new URLSearchParams(window.location.search).get("startapp")||((e=g==null?void 0:g.initDataUnsafe)==null?void 0:e.start_param);if(t&&t.startsWith("profile_")){const i=t.replace("profile_","");U=i,y="public-profile",h(),T=await r.getPublicProfile(i),h()}else h();await r.init()}K();
