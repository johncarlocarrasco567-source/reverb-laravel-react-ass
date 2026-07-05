import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;
window.getEcho = getEcho;

let echoInstance = null;

export function getEcho() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No token found for Echo');
        return null;
    }

    if (!echoInstance) {
        echoInstance = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
            wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
            forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: '/broadcasting/auth',
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });
    } else {
        // Update token on the fly
        echoInstance.options.auth.headers.Authorization = `Bearer ${token}`;
    }
    return echoInstance;
}

// For backward compatibility
export default getEcho();