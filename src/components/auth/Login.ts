import { saveAuthData, TelegramLoginData } from '../../auth';

let successCallback: (() => void) | null = null;

// Define global callback immediately when module is loaded
window.onTelegramAuth = (user: TelegramLoginData) => {
    console.log('[Debug] Global onTelegramAuth triggered with user:', user);
    saveAuthData(user);
    if (successCallback) {
        successCallback();
    } else {
        console.warn('[Debug] No success callback registered for login');
    }
};

// Add type definition to Window interface to make TS happy
declare global {
    interface Window {
        onTelegramAuth: (user: TelegramLoginData) => void;
    }
}

export function renderLogin(container: HTMLElement, onLoginSuccess: () => void) {
    console.log('[Debug] Rendering Login widget');
    successCallback = onLoginSuccess;

    container.innerHTML = `
        <div class="page-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 24px;">🏋️</div>
            <h1 class="title" style="margin-bottom: 12px;">Жим-жим 21</h1>
            <p class="subtitle" style="margin-bottom: 32px; opacity: 0.7;">Войдите через Telegram, чтобы синхронизировать тренировки</p>
            <div id="telegram-login-container"></div>
        </div>
    `;

    // Inject script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'gymgym21bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    // Use Redirect mode instead of Callback mode
    script.setAttribute('data-auth-url', window.location.href);
    script.setAttribute('data-request-access', 'write');

    const loginContainer = document.getElementById('telegram-login-container');
    if (loginContainer) {
        loginContainer.appendChild(script);
        console.log('[Debug] Widget script injected');
    } else {
        console.error('[Debug] Login container not found');
    }

    // DEV MODE: Add explicit login button for testing
    if (import.meta.env.DEV) {
        const devBtn = document.createElement('button');
        devBtn.textContent = '🔓 DEV LOGIN (Bypass Widget)';
        devBtn.className = 'button';
        devBtn.style.marginTop = '20px';
        devBtn.style.backgroundColor = '#333';
        devBtn.onclick = () => {
            const mockUser: TelegramLoginData = {
                id: 123456789,
                first_name: 'Dev',
                last_name: 'User',
                username: 'dev_user',
                photo_url: '',
                auth_date: Math.floor(Date.now() / 1000),
                hash: 'mock_hash_for_dev'
            };
            (window as any).onTelegramAuth(mockUser);
        };
        container.appendChild(devBtn);
    }
}
