import { TelegramLoginData, saveAuthData } from '../../auth';

// Add type definition to Window interface to make TS happy
declare global {
    interface Window {
        onTelegramAuth: (user: TelegramLoginData) => void;
    }
}

export function renderLogin(container: HTMLElement, onLoginSuccess: () => void) {
    container.innerHTML = `
        <div class="page-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 24px;">🏋️</div>
            <h1 class="title" style="margin-bottom: 12px;">Жим-жим 21</h1>
            <p class="subtitle" style="margin-bottom: 32px; opacity: 0.7;">Войдите через Telegram, чтобы синхронизировать тренировки</p>
            <div id="telegram-login-container"></div>
        </div>
    `;

    // Define global callback for Telegram Widget
    window.onTelegramAuth = (user: TelegramLoginData) => {
        console.log('Telegram auth callback received:', user);
        saveAuthData(user);
        // Clear the skip flag since we now have valid auth
        localStorage.removeItem('skip_tma_auth');
        onLoginSuccess();
    };

    // Inject Telegram Widget script with callback mode (data-onauth)
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'gymgym21bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    // Use callback mode instead of redirect
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    const loginContainer = document.getElementById('telegram-login-container');
    if (loginContainer) {
        loginContainer.appendChild(script);
    }
}

