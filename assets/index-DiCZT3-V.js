var it=Object.defineProperty;var ot=(s,t,e)=>t in s?it(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var U=(s,t,e)=>ot(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(n){if(n.ep)return;n.ep=!0;const i=e(n);fetch(n.href,i)}})();const Q="gym_web_auth";function Z(){const s=localStorage.getItem(Q);try{return s?JSON.parse(s):null}catch{return null}}function rt(s){localStorage.setItem(Q,JSON.stringify(s))}function lt(){const s=Z();if(!s)return null;const t=new URLSearchParams;return Object.entries(s).forEach(([e,a])=>{a!=null&&t.append(e,String(a))}),t.toString()}const J="gym_twa_data",q="https://functions.yandexcloud.net/d4ehnqvq3a8fo55t7tj4";var X;const S=(X=window.Telegram)==null?void 0:X.WebApp,P={workoutTypes:[{id:"1",name:"Жим лежа"},{id:"2",name:"Приседания"},{id:"3",name:"Становая тяга"}],logs:[],workouts:[]};class ct{constructor(){U(this,"data");U(this,"onUpdateCallback");U(this,"onSyncStatusChangeCallback");U(this,"status","idle");this.data=this.loadLocal(),this.migrateData()}getHeaders(){const t={"Content-Type":"application/json"};if(S!=null&&S.initData)t["X-Telegram-Init-Data"]=S.initData;else{const e=lt();e&&(t["X-Telegram-Init-Data"]=e)}return t}async init(){await this.syncFromServer()}onUpdate(t){this.onUpdateCallback=t}onSyncStatusChange(t){this.onSyncStatusChangeCallback=t}setStatus(t){var e;this.status=t,(e=this.onSyncStatusChangeCallback)==null||e.call(this,t),t==="success"&&setTimeout(()=>{this.status==="success"&&this.setStatus("idle")},2e3)}loadLocal(){const t=localStorage.getItem(J);if(!t)return P;try{const e=JSON.parse(t);return{...P,...e,workouts:e.workouts||[]}}catch(e){return console.error("Failed to parse storage data",e),P}}migrateData(){let t=!1;const e=this.data.logs.filter(a=>!a.workoutId);if(e.length>0){t=!0;const a=new Map;e.forEach(n=>{const i=n.date.split("T")[0];a.has(i)||a.set(i,[]),a.get(i).push(n)}),a.forEach((n,i)=>{const o=n.sort((v,p)=>new Date(v.date).getTime()-new Date(p.date).getTime()),r=o[0].date,l=o[o.length-1].date,c=`implicit_${i}_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,g={id:c,startTime:r,endTime:l,status:"finished",isManual:!1,pauseIntervals:[]};this.data.workouts.push(g),n.forEach(v=>{v.workoutId=c})})}t&&this.saveLocal()}saveLocal(){localStorage.setItem(J,JSON.stringify(this.data))}async syncFromServer(){var t;this.setStatus("saving");try{const e=await fetch(q,{headers:this.getHeaders()});if(e.ok){const a=await e.json();a&&(a.workoutTypes||a.logs)&&(this.data={...this.data,...a,workouts:a.workouts||this.data.workouts},this.migrateData(),this.saveLocal(),(t=this.onUpdateCallback)==null||t.call(this)),this.setStatus("success")}else this.setStatus("error")}catch(e){console.error("Failed to sync from server",e),this.setStatus("error")}}async saveToServer(){this.setStatus("saving");try{await fetch(q,{method:"POST",headers:this.getHeaders(),body:JSON.stringify(this.data)}),this.setStatus("success")}catch(t){console.error("Failed to save to server",t),this.setStatus("error")}}async persist(){this.saveLocal(),await this.saveToServer()}getWorkoutTypes(){return this.data.workoutTypes}async addWorkoutType(t){const e={id:Date.now().toString(),name:t};return this.data.workoutTypes.push(e),await this.persist(),e}async deleteWorkoutType(t){this.data.workoutTypes=this.data.workoutTypes.filter(e=>e.id!==t),await this.persist()}async updateWorkoutType(t,e){const a=this.data.workoutTypes.find(n=>n.id===t);a&&(a.name=e,await this.persist())}getLogs(){return this.data.logs}getWorkouts(){return this.data.workouts}getActiveWorkout(){return this.data.workouts.find(t=>t.status==="active"||t.status==="paused")}async startWorkout(t){this.getActiveWorkout()&&await this.finishWorkout();const a={id:Date.now().toString(),startTime:new Date().toISOString(),status:"active",name:t,isManual:!0,pauseIntervals:[]};return this.data.workouts.push(a),await this.persist(),a}async pauseWorkout(){const t=this.getActiveWorkout();t&&t.status==="active"&&(t.status="paused",t.pauseIntervals.push({start:new Date().toISOString()}),await this.persist())}async resumeWorkout(){const t=this.getActiveWorkout();if(t&&t.status==="paused"){t.status="active";const e=t.pauseIntervals[t.pauseIntervals.length-1];e&&!e.end&&(e.end=new Date().toISOString()),await this.persist()}}async finishWorkout(){const t=this.getActiveWorkout();if(t){t.status="finished",t.endTime=new Date().toISOString();const e=t.pauseIntervals[t.pauseIntervals.length-1];e&&!e.end&&(e.end=t.endTime),await this.persist()}}getWorkoutDuration(t){const e=new Date(t.startTime).getTime(),a=t.endTime?new Date(t.endTime).getTime():Date.now();let n=a-e;return t.pauseIntervals.forEach(o=>{const r=new Date(o.start).getTime(),l=o.end?new Date(o.end).getTime():t.status==="paused"?Date.now():a;l>r&&(n-=l-r)}),Math.floor(Math.max(0,n)/6e4)}ensureActiveWorkout(){const t=this.getActiveWorkout();if(t)return t.id;const e=new Date().toISOString().split("T")[0],i=this.data.workouts.filter(l=>l.startTime.startsWith(e)).sort((l,c)=>new Date(c.startTime).getTime()-new Date(l.startTime).getTime())[0];if(i&&!i.isManual&&i.status==="finished")return i.endTime=new Date().toISOString(),this.saveLocal(),i.id;const o=`implicit_${e}_${Date.now()}`,r={id:o,startTime:new Date().toISOString(),endTime:new Date().toISOString(),status:"finished",isManual:!1,pauseIntervals:[]};return this.data.workouts.push(r),o}updateImplicitWorkoutBounds(t){const e=this.data.workouts.find(i=>i.id===t);if(!e||e.isManual)return;const a=this.data.logs.filter(i=>i.workoutId===t);if(a.length===0)return;const n=[...a].sort((i,o)=>new Date(i.date).getTime()-new Date(o.date).getTime());e.startTime=n[0].date,e.endTime=n[n.length-1].date,e.status!=="finished"&&(e.status="finished")}async addLog(t){const e=this.ensureActiveWorkout(),a={...t,id:Date.now().toString(),date:new Date().toISOString(),workoutId:e};return this.data.logs.push(a),this.updateImplicitWorkoutBounds(e),await this.persist(),a}async deleteLog(t){const e=this.data.logs.find(a=>a.id===t);if(e){const a=e.workoutId;this.data.logs=this.data.logs.filter(n=>n.id!==t),a&&this.updateImplicitWorkoutBounds(a),await this.persist()}}async updateLog(t){const e=this.data.logs.findIndex(a=>a.id===t.id);e!==-1&&(this.data.logs[e]=t,await this.persist())}getProfile(){return this.data.profile}getProfileIdentifier(){var a,n;const t=this.data.profile;if(t!=null&&t.telegramUsername)return t.telegramUsername;if(t!=null&&t.telegramUserId)return`id_${t.telegramUserId}`;const e=(n=(a=S==null?void 0:S.initDataUnsafe)==null?void 0:a.user)==null?void 0:n.id;return e?`id_${e}`:""}async updateProfileSettings(t){var o,r;const e=(o=S==null?void 0:S.initDataUnsafe)==null?void 0:o.user,a=e==null?void 0:e.id,n=e==null?void 0:e.username,i=e==null?void 0:e.photo_url;this.data.profile?i&&(this.data.profile.photoUrl=i):this.data.profile={isPublic:!1,showFullHistory:!1,telegramUserId:a||0,telegramUsername:n,photoUrl:i,createdAt:new Date().toISOString()},this.data.profile={...this.data.profile,...t},await this.persist(),(r=this.onUpdateCallback)==null||r.call(this)}async getPublicProfile(t){try{const e=await fetch(`${q}?profile=${encodeURIComponent(t)}`);return e.ok?await e.json():null}catch(e){return console.error("Failed to fetch public profile",e),null}}}const d=new ct;function dt(s,t){return t===1?s:Math.round(s*(1+t/30))}function ut(s,t){const e=new Map;return s.filter(n=>n.workoutTypeId===t).forEach(n=>{const i=n.date.split("T")[0],o=dt(n.weight,n.reps),r=e.get(i)||0;o>r&&e.set(i,o)}),e}function pt(s,t){const e=new Set;return s.forEach(a=>e.add(a.startTime.split("T")[0])),t.forEach(a=>e.add(a.date.split("T")[0])),e}function gt(s){const t=s.filter(i=>i.endTime&&i.status==="finished");if(t.length===0)return{averageMinutes:0,totalMinutes:0,count:0};let e=0;t.forEach(i=>{const o=new Date(i.startTime).getTime(),r=new Date(i.endTime).getTime();let l=r-o;i.pauseIntervals&&i.pauseIntervals.forEach(c=>{const g=new Date(c.start).getTime(),v=c.end?new Date(c.end).getTime():r;l-=v-g}),e+=l});const a=Math.round(e/1e3/60);return{averageMinutes:Math.round(a/t.length),totalMinutes:a,count:t.length}}function vt(s,t=6){const e=new Date,a=new Date(e);a.setMonth(e.getMonth()-t),a.setDate(a.getDate()-a.getDay());let n='<div class="heatmap-container"><div class="heatmap-grid">';const i=new Date(a),o=new Date(e);for(;i<=o;){const r=i.toISOString().split("T")[0],l=s.has(r),g=`heatmap-cell level-${l?4:0}`,v=`${r}: ${l?"Workout":"No workout"}`;n+=`<div class="${g}" title="${v}"></div>`,i.setDate(i.getDate()+1)}return n+="</div>",n+=`
        <div class="heatmap-legend">
            Less <div class="heatmap-cell level-0"></div>
            <div class="heatmap-cell level-4"></div> More
        </div>
    `,n+="</div>",n}function K(s){const t=new Map;s.forEach(n=>{const i=n.date.split("T")[0],o=n.weight*n.reps;t.set(i,(t.get(i)||0)+o)});const e=Array.from(t.keys()).sort().slice(-10);if(e.length<2)return'<p class="hint">Недостаточно данных для графика объема</p>';const a=e.map(n=>({label:new Date(n).toLocaleDateString(void 0,{day:"numeric",month:"short"}),value:t.get(n)}));return ft(a,"кг")}function ht(s){const t=Array.from(s.keys()).sort();if(t.length<2)return'<p class="hint">Недостаточно данных для графика 1RM</p>';const e=t.map(a=>({label:new Date(a).toLocaleDateString(void 0,{day:"numeric",month:"short"}),value:s.get(a)}));return tt(e,"кг")}function mt(s){const t=s.filter(a=>a.status==="finished"&&a.endTime).sort((a,n)=>new Date(a.startTime).getTime()-new Date(n.startTime).getTime()).slice(-10);if(t.length<2)return'<p class="hint">Недостаточно данных для графика продолжительности</p>';const e=t.map(a=>{const n=new Date(a.startTime).getTime(),i=new Date(a.endTime).getTime();let o=(i-n)/1e3/60;return a.pauseIntervals&&a.pauseIntervals.forEach(r=>{const l=new Date(r.start).getTime(),c=r.end?new Date(r.end).getTime():i;o-=(c-l)/1e3/60}),{label:new Date(a.startTime).toLocaleDateString(void 0,{day:"numeric",month:"short"}),value:Math.round(o)}});return tt(e,"мин")}function ft(s,t){const n=Math.max(...s.map(o=>o.value))*1.1;return`
        <svg width="100%" height="150" preserveAspectRatio="none">
            ${s.map((o,r)=>{const l=o.value/n*100,c=r/s.length*100,g=1/s.length*80;return`
            <rect x="${c+5}%" y="${100-l}%" width="${g}%" height="${l}%" fill="var(--color-button)" rx="2" opacity="0.8">
               <title>${o.label}: ${o.value}${t}</title>
            </rect>
            <text x="${c+5+g/2}%" y="95%" font-size="10" text-anchor="middle" fill="var(--color-text)" style="pointer-events: none;">
                ${o.label}
            </text>
        `}).join("")}
        </svg>
    `}function tt(s,t){const i=s.map(u=>u.value),o=Math.min(...i),r=Math.max(...i),l=r-o||1,c=u=>20+u/(s.length-1)*(400-2*20),g=u=>130-(u-o)/l*(150-2*20),v=s.map((u,k)=>`${c(k)},${g(u.value)}`).join(" "),p=s.map((u,k)=>`
        <circle cx="${c(k)}" cy="${g(u.value)}" r="4" fill="var(--color-bg)" stroke="var(--color-button)" stroke-width="2">
            <title>${u.label}: ${u.value}${t}</title>
        </circle>
    `).join("");return`
        <svg viewBox="0 0 400 150" class="chart">
             <polyline
                fill="none"
                stroke="var(--color-button)"
                stroke-width="3"
                stroke-linejoin="round"
                stroke-linecap="round"
                points="${v}"
            />
            ${p}
        </svg>
        <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 12px; color: var(--color-hint);">
            <span>${Math.round(o)}${t}</span>
            <span>${Math.round(r)}${t}</span>
        </div>
    `}function yt(s,t){s.innerHTML=`
        <div class="page-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 24px;">🏋️</div>
            <h1 class="title" style="margin-bottom: 12px;">Жим-жим 21</h1>
            <p class="subtitle" style="margin-bottom: 32px; opacity: 0.7;">Войдите через Telegram, чтобы синхронизировать тренировки</p>
            <div id="telegram-login-container"></div>
        </div>
    `;const e=document.createElement("script");e.src="https://telegram.org/js/telegram-widget.js?22",e.async=!0,e.setAttribute("data-telegram-login","gymgym21bot"),e.setAttribute("data-size","large"),e.setAttribute("data-radius","12"),e.setAttribute("data-auth-url",window.location.href),e.setAttribute("data-request-access","write");const a=document.getElementById("telegram-login-container");a&&a.appendChild(e)}var Y;const f=(Y=window.Telegram)==null?void 0:Y.WebApp;f&&(f.ready(),f.expand());let D="main",M="all",m=null,et=null,N=null,B=!1,A=null,T=null,R="overview",j=!1;function bt(s){D=s,h()}let H=null;function G(s){let t=document.querySelector(".toast");t||(t=document.createElement("div"),t.className="toast",document.body.appendChild(t)),t.textContent=s,t.classList.add("visible"),H&&clearTimeout(H),H=setTimeout(()=>{t==null||t.classList.remove("visible")},2e3)}function h(){const s=document.getElementById("app");s&&(s.innerHTML=`
    <main class="content">
      ${wt()}
    </main>
    <nav class="navigation">
      <button class="navigation__item ${D==="main"?"navigation__item_active":""}" data-page="main">
        <span class="navigation__icon">🏋️</span>
        <span class="navigation__label">Тренировка</span>
      </button>
      <button class="navigation__item ${D==="stats"?"navigation__item_active":""}" data-page="stats">
        <span class="navigation__icon">📊</span>
        <span class="navigation__label">Статистика</span>
      </button>
      <button class="navigation__item ${D==="profile-settings"?"navigation__item_active":""}" data-page="profile-settings">
        <span class="navigation__icon">👤</span>
        <span class="navigation__label">Профиль</span>
      </button>
      <button class="navigation__item ${D==="settings"?"navigation__item_active":""}" data-page="settings">
        <span class="navigation__icon">⚙️</span>
        <span class="navigation__label">Настройки</span>
      </button>
    </nav>
  `,s.querySelectorAll(".navigation__item").forEach(t=>{t.addEventListener("click",()=>{const e=t.getAttribute("data-page");bt(e)})}),xt())}function wt(){switch(D){case"main":return $t();case"stats":return It();case"settings":return Tt();case"profile-settings":return Dt();case"public-profile":return St();default:return""}}function kt(){const s=d.getActiveWorkout();if(s){const t=s.status==="paused";return`
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
    `}return j?`
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
  `}let w=0,z="";function V(s){const t=new Date;t.setHours(0,0,0,0);const e=new Date(t);e.setDate(t.getDate()-s*7),e.setHours(23,59,59,999);const a=new Date(e);return a.setDate(e.getDate()-6),a.setHours(0,0,0,0),{start:a,end:e,label:`${a.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})} - ${e.toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}`}}function $t(){var o;const s=d.getWorkoutTypes(),t=d.getLogs(),e=t[t.length-1],a=e==null?void 0:e.workoutTypeId,n=m?t.find(r=>r.id===m):null,{label:i}=V(w);return`
    <div class="page-content" id="main-content">
      ${kt()}
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
             <h2 class="subtitle" style="margin: 0;">${w===0?"Последние 7 дней":i}</h2>
             <span style="font-size: 18px; position: relative; display: inline-block;">
               📅
               <input type="date" id="calendar-input" value="${z}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
             </span>
           </div>
           <button class="icon-btn" id="next-week-btn" ${w===0?"disabled":""} style="${w===0?"opacity: 0.3; cursor: default;":""}">▶️</button>
        </div>
        <div id="logs-list">
          ${st()}
        </div>
      </div>
    </div>
  `}function st(){const s=d.getLogs(),t=d.getWorkoutTypes(),{start:e,end:a}=V(w),n=s.filter(i=>{const o=new Date(i.date);return o>=e&&o<=a});return at(n,t,!0)}function F(){const s=document.getElementById("logs-list"),t=document.querySelector("#week-label-container .subtitle");if(s&&(s.innerHTML=st(),_t()),t){const{label:a}=V(w);t.textContent=w===0?"Последние 7 дней":a}const e=document.getElementById("next-week-btn");e&&(e.disabled=w===0,e.style.opacity=w===0?"0.3":"",e.style.cursor=w===0?"default":"")}function _t(){document.querySelectorAll(".log-set__delete").forEach(s=>{s.addEventListener("click",async()=>{const t=s.getAttribute("data-id");t&&(m===t&&(m=null),await d.deleteLog(t),h())})}),document.querySelectorAll(".log-set__edit").forEach(s=>{s.addEventListener("click",()=>{m=s.getAttribute("data-id"),h(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(s=>{s.addEventListener("click",()=>{const t=s.getAttribute("data-date");t&&nt(t)})})}function at(s,t,e){if(s.length===0)return'<p class="hint">Нет записей за этот период</p>';const a=new Map;[...s].sort((o,r)=>new Date(r.date).getTime()-new Date(o.date).getTime()).forEach(o=>{const l=new Date(o.date).toLocaleDateString(void 0,{weekday:"long",day:"numeric",month:"long"});a.has(l)||a.set(l,[]),a.get(l).push(o)});const n=d.getWorkouts();let i="";return a.forEach((o,r)=>{var L;const l=((L=o[0])==null?void 0:L.date.split("T")[0])||"",c=new Set;o.forEach($=>{$.workoutId&&c.add($.workoutId)});const g=Array.from(c).sort(($,_)=>{var O,E;const W=n.find(y=>y.id===$),C=n.find(y=>y.id===_),x=(W==null?void 0:W.startTime)||((O=o.find(y=>y.workoutId===$))==null?void 0:O.date)||"",b=(C==null?void 0:C.startTime)||((E=o.find(y=>y.workoutId===_))==null?void 0:E.date)||"";return new Date(b).getTime()-new Date(x).getTime()}),v=g.length===1?g[0]:null,p=v?n.find($=>$.id===v):null,u=p&&p.name,k=p?Math.round(d.getWorkoutDuration(p)):0;i+='<div class="log-day">',i+=`<div class="log-day__header">
      <span>${r}${u?` • ${p.name}`:""}${p?` • ${k} мин`:""}</span>
      ${e?`<button class="share-btn" data-date="${l}" title="Поделиться">📤</button>`:""}
    </div>`,g.forEach($=>{const _=n.find(b=>b.id===$),W=o.filter(b=>b.workoutId===$);if(!(g.length===1&&(u||!(_!=null&&_.name)))){const b=_?Math.round(d.getWorkoutDuration(_)):0;i+=`<h3 class="workout-subheader">
                ${(_==null?void 0:_.name)||"Тренировка"} 
                <span class="workout-subheader__time">${b} мин</span>
            </h3>`}const x=new Map;W.forEach(b=>{x.has(b.workoutTypeId)||x.set(b.workoutTypeId,[]),x.get(b.workoutTypeId).push(b)}),x.forEach((b,O)=>{const E=t.find(y=>y.id===O);i+=`
            <div class="log-exercise">
              <div class="log-exercise__name">${(E==null?void 0:E.name)||"Удалено"}</div>
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
          `})}),i+="</div>"}),i}function Tt(){const s=d.getWorkoutTypes(),t=T?s.find(e=>e.id===T):null;return`
    <div class="page-content">
      <h1 class="title">Настройки</h1>
      <div class="settings-section">
        <h2 class="subtitle">${T?"Редактирование типа":"Добавить тип тренировки"}</h2>
        <form class="add-type-form" id="add-type-form" style="margin-bottom: 24px;">
          <div style="display: flex; gap: 8px;">
            <input class="input" type="text" id="new-type-name" placeholder="Название (напр. Жим гантелей)" required value="${t?t.name:""}">
            <button class="button" type="submit">${T?"Сохранить":"Добавить"}</button>
          </div>
          ${T?'<button class="button button_secondary" type="button" id="cancel-edit-type-btn" style="margin-top: 8px; width: 100%;">Отмена</button>':""}
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
  `}function Dt(){var l,c;const s=d.getProfile(),t=(s==null?void 0:s.isPublic)??!1,e=(s==null?void 0:s.displayName)||((c=(l=f==null?void 0:f.initDataUnsafe)==null?void 0:l.user)==null?void 0:c.first_name)||"",a=d.getProfileIdentifier(),n=a?`https://t.me/gymgym21bot/app?startapp=profile_${a}`:"",i=d.getLogs(),o=i.reduce((g,v)=>g+v.weight*v.reps,0),r=new Set(i.map(g=>g.date.split("T")[0])).size;return`
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
  `}function St(){if(!et)return`
      <div class="page-content">
        <div class="profile-not-found">
          <div class="profile-not-found-icon">🔍</div>
          <div class="profile-not-found-text">Профиль не найден</div>
        </div>
      </div>
    `;if(!N)return B?`
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
            ${at(s.logs,s.workoutTypes,!1)}
          </div>
        </div>
      `:""}
    </div>
  `}function It(){const s=d.getLogs(),t=d.getWorkouts(),e=d.getWorkoutTypes();if(s.length===0)return`
      <div class="page-content">
        <h1 class="title">Статистика</h1>
        <p class="hint">Недостаточно данных для статистики</p>
      </div>
    `;const a=s.reduce((r,l)=>r+l.weight*l.reps,0),n=s.reduce((r,l)=>r+l.reps,0),i=gt(t);let o=`
    <div class="page-content">
      <h1 class="title">Статистика</h1>
      <div class="stats-tabs">
        <button class="stats-tab ${R==="overview"?"active":""}" data-tab="overview">Обзор</button>
        <button class="stats-tab ${R==="progress"?"active":""}" data-tab="progress">Прогресс</button>
      </div>
  `;if(R==="overview"){const r=pt(t,s);o+=`
        <div class="stats-section">
            <h2 class="subtitle">Активность</h2>
            ${vt(r)}
        </div>

        <div class="stats-summary">
            <div class="stat-metric">
                <div class="stat-metric__label">Всего тренировок</div>
                <div class="stat-metric__value">${r.size}</div>
            </div>
            <div class="stat-metric">
                <div class="stat-metric__label">Сред. длительность</div>
                <div class="stat-metric__value">${i.averageMinutes}<span class="stat-metric__unit">мин</span></div>
            </div>
             <div class="stat-metric">
                <div class="stat-metric__label">Общий объем</div>
                <div class="stat-metric__value">${Math.round(a/1e3)}<span class="stat-metric__unit">т</span></div>
            </div>
            <div class="stat-metric">
                <div class="stat-metric__label">Всего повторений</div>
                <div class="stat-metric__value">${n}</div>
            </div>
        </div>

        <div class="charts-section">
            <h2 class="subtitle">Длительность тренировок</h2>
            <div class="chart-container">
                ${mt(t)}
            </div>
        </div>
     `}else if(o+=`
        <div class="form-group">
            <label class="label">Упражнение</label>
            <select class="select" id="stat-type-select">
                <option value="all">Все упражнения (Объем)</option>
                ${e.map(r=>`<option value="${r.id}" ${M===r.id?"selected":""}>${r.name}</option>`).join("")}
            </select>
        </div>
    `,M==="all")o+=`
            <div class="charts-section">
                <h2 class="subtitle">Общий объем по дням</h2>
                <div class="chart-container">
                    ${K(s)}
                </div>
            </div>
        `;else{const r=s.filter(c=>c.workoutTypeId===M),l=ut(r,M);o+=`
             <div class="charts-section">
                <h2 class="subtitle">Прогресс силовых (1RM)</h2>
                <div class="chart-container">
                    ${ht(l)}
                </div>
            </div>
            
            <div class="charts-section" style="margin-top: 24px;">
                <h2 class="subtitle">Объем нагрузки</h2>
                 <div class="chart-container">
                    ${K(r)}
                </div>
            </div>
        `}return o+="</div>",o}function Lt(s){const t=d.getLogs(),e=d.getWorkoutTypes(),a=t.filter(c=>c.date.startsWith(s));if(a.length===0)return"";const i=new Date(a[0].date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),o=new Map;a.forEach(c=>{o.has(c.workoutTypeId)||o.set(c.workoutTypeId,[]),o.get(c.workoutTypeId).push(c)});let r=`🏋️ Тренировка ${i}

`;o.forEach((c,g)=>{const v=e.find(p=>p.id===g);r+=`${(v==null?void 0:v.name)||"Упражнение"}:
`,c.forEach(p=>{r+=`  ${p.weight} кг × ${p.reps}
`}),r+=`
`});const l=a.reduce((c,g)=>c+g.weight*g.reps,0);return r+=`💪 Общий объём: ${Math.round(l)} кг`,r}function nt(s){const t=Lt(s);if(t)if(f!=null&&f.openTelegramLink){const e=`https://t.me/share/url?url=${encodeURIComponent("https://t.me/gymgym21bot")}&text=${encodeURIComponent(t)}`;f.openTelegramLink(e)}else navigator.clipboard.writeText(t).then(()=>{alert("Текст скопирован в буфер обмена")})}function xt(){if(D==="main"){const s=document.getElementById("start-workout-btn");s==null||s.addEventListener("click",()=>{j=!0,h()});const t=document.getElementById("cancel-start-workout-btn");t==null||t.addEventListener("click",()=>{j=!1,h()});const e=document.getElementById("start-workout-form");e==null||e.addEventListener("submit",async p=>{p.preventDefault();const k=new FormData(e).get("workoutName");await d.startWorkout(k),j=!1,h()});const a=document.getElementById("pause-workout-btn");a==null||a.addEventListener("click",async()=>{await d.pauseWorkout(),h()});const n=document.getElementById("resume-workout-btn");n==null||n.addEventListener("click",async()=>{await d.resumeWorkout(),h()});const i=document.getElementById("finish-workout-btn");i==null||i.addEventListener("click",async()=>{confirm("Завершить тренировку?")&&(await d.finishWorkout(),h())});const o=document.getElementById("log-form");o==null||o.addEventListener("submit",async p=>{p.preventDefault();const u=new FormData(o),k={workoutTypeId:u.get("typeId"),weight:parseFloat(u.get("weight")),reps:parseInt(u.get("reps"),10)};if(m){const $=d.getLogs().find(_=>_.id===m);$&&(await d.updateLog({...$,...k}),m=null)}else A=(await d.addLog(k)).id;h(),A=null});const r=document.getElementById("duplicate-last-btn");r==null||r.addEventListener("click",async()=>{const p=d.getLogs(),u=p[p.length-1];u&&(A=(await d.addLog({workoutTypeId:u.workoutTypeId,weight:u.weight,reps:u.reps})).id,h(),A=null)});const l=document.getElementById("cancel-edit-btn");l==null||l.addEventListener("click",()=>{m=null,h()}),document.querySelectorAll(".log-set__delete").forEach(p=>{p.addEventListener("click",async()=>{const u=p.getAttribute("data-id");u&&(m===u&&(m=null),await d.deleteLog(u),h())})}),document.querySelectorAll(".log-set__edit").forEach(p=>{p.addEventListener("click",()=>{m=p.getAttribute("data-id"),h(),window.scrollTo({top:0,behavior:"smooth"})})}),document.querySelectorAll(".share-btn").forEach(p=>{p.addEventListener("click",()=>{const u=p.getAttribute("data-date");u&&nt(u)})});const c=document.getElementById("prev-week-btn");c==null||c.addEventListener("click",()=>{w++,F()});const g=document.getElementById("next-week-btn");g==null||g.addEventListener("click",()=>{w>0&&(w--,F())});const v=document.getElementById("calendar-input");v==null||v.addEventListener("change",()=>{if(!v.value||v.value===z)return;z=v.value;const p=new Date(v.value),u=new Date;u.setHours(0,0,0,0);const k=u.getTime()-p.getTime(),L=Math.floor(k/(1e3*60*60*24));w=Math.max(0,Math.floor(L/7)),F()})}if(D==="settings"){const s=document.getElementById("add-type-form");s==null||s.addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("new-type-name");a.value&&(T?(await d.updateWorkoutType(T,a.value),T=null):await d.addWorkoutType(a.value),h())});const t=document.getElementById("cancel-edit-type-btn");t==null||t.addEventListener("click",()=>{T=null,h()}),document.querySelectorAll(".type-item__edit").forEach(e=>{e.addEventListener("click",()=>{T=e.getAttribute("data-id"),h();const a=document.getElementById("new-type-name");a==null||a.focus()})}),document.querySelectorAll(".type-item__delete").forEach(e=>{e.addEventListener("click",async()=>{const a=e.getAttribute("data-id");a&&confirm("Удалить этот тип тренировки?")&&(T===a&&(T=null),await d.deleteWorkoutType(a),h())})})}if(D==="stats"){const s=document.getElementById("stat-type-select");s==null||s.addEventListener("change",()=>{M=s.value,h()})}if(D==="profile-settings"){const s=document.getElementById("save-profile-btn");s==null||s.addEventListener("click",async()=>{const a=document.getElementById("profile-public-toggle"),n=document.getElementById("profile-history-toggle"),i=document.getElementById("profile-display-name");await d.updateProfileSettings({isPublic:(a==null?void 0:a.checked)??!1,showFullHistory:(n==null?void 0:n.checked)??!1,displayName:(i==null?void 0:i.value)||void 0}),h()});const t=document.getElementById("copy-profile-link");t==null||t.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${d.getProfileIdentifier()}`;navigator.clipboard.writeText(n).then(()=>{G("Ссылка скопирована")})});const e=document.getElementById("share-profile-link");e==null||e.addEventListener("click",()=>{const n=`https://t.me/gymgym21bot/app?startapp=profile_${d.getProfileIdentifier()}`;if(f!=null&&f.openTelegramLink){const i=`https://t.me/share/url?url=${encodeURIComponent(n)}&text=${encodeURIComponent("Мой профиль тренировок 💪")}`;f.openTelegramLink(i)}else navigator.clipboard.writeText(n).then(()=>{G("Ссылка скопирована")})})}if(D==="stats"){document.querySelectorAll(".stats-tab").forEach(e=>{e.addEventListener("click",()=>{const a=e.getAttribute("data-tab");(a==="overview"||a==="progress")&&(R=a,h())})});const t=document.getElementById("stat-type-select");t==null||t.addEventListener("change",e=>{M=e.target.value,h()})}}const I=document.createElement("div");I.className="sync-status";document.body.appendChild(I);function Et(s){switch(I.className="sync-status visible "+s,s){case"saving":I.textContent="Сохранение...";break;case"success":I.textContent="Сохранено";break;case"error":I.textContent="Ошибка сохранения";break;default:I.className="sync-status"}}d.onUpdate(()=>h());d.onSyncStatusChange(Et);async function Mt(){var o;const s=new URLSearchParams(window.location.search);if(s.has("hash")&&s.has("id")){const r={id:parseInt(s.get("id")||"0",10),first_name:s.get("first_name")||"",last_name:s.get("last_name")||void 0,username:s.get("username")||void 0,photo_url:s.get("photo_url")||void 0,auth_date:parseInt(s.get("auth_date")||"0",10),hash:s.get("hash")||""};rt(r),s.delete("hash"),s.delete("id"),s.delete("first_name"),s.delete("last_name"),s.delete("username"),s.delete("photo_url"),s.delete("auth_date"),s.delete("auth");const l=s.toString(),c=window.location.pathname+(l?"?"+l:"");window.history.replaceState({},document.title,c),location.reload();return}const t=!!(f!=null&&f.initData),a=!!Z();if(!t&&!a){yt(document.getElementById("app"));return}const i=new URLSearchParams(window.location.search).get("startapp")||((o=f==null?void 0:f.initDataUnsafe)==null?void 0:o.start_param);if(i&&i.startsWith("profile_")){const r=i.replace("profile_","");et=r,D="public-profile",B=!1,h(),N=await d.getPublicProfile(r),N||(B=!0),h()}else h();await d.init()}Mt();
