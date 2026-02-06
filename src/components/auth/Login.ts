import { saveAuthData, TelegramLoginData } from '../../auth';

export function renderLogin(container: HTMLElement, onLoginSuccess: () => void) {
    container.innerHTML = `
        <div class="page-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 24px;">🏋️</div>
            <h1 class="title" style="margin-bottom: 12px;">Жим-жим 21</h1>
            <p class="subtitle" style="margin-bottom: 32px; opacity: 0.7;">Войдите через Telegram, чтобы синхронизировать тренировки</p>
            <div id="telegram-login-container"></div>
        </div>
    `;

    // Define global callback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).onTelegramAuth = (user: TelegramLoginData) => {
        saveAuthData(user);
        onLoginSuccess();
    };

    // Inject script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'gymgym21bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-onauth', 'onTelegramAuth');
    script.setAttribute('data-request-access', 'write');

    document.getElementById('telegram-login-container')?.appendChild(script);
}
