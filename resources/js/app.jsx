import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'RoyalPlay Social Casino';

const appEl = document.getElementById('app');
const initialPage = appEl?.dataset?.page ? JSON.parse(appEl.dataset.page) : undefined;

createInertiaApp({
    page: initialPage,
    title: (title) => title ? `${title} — ${appName}` : appName,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#f59e0b',
        showSpinner: true,
    },
});
