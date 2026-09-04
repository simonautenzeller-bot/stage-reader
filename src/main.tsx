import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { Reader } from './components/Reader';
import './styles.css';

let reloadingForUpdate = false;

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (reloadingForUpdate) return;
		reloadingForUpdate = true;
		window.location.reload();
	});
}

registerSW({
	immediate: true,
	onRegisteredSW(_swScriptUrl, registration) {
		void registration?.update();
		window.setInterval(() => {
			if (!document.hidden) void registration?.update();
		}, 30 * 60 * 1000);
	},
	onRegisterError(error) {
		console.error(error);
	}
});
createRoot(document.getElementById('root')!).render(<StrictMode><HashRouter><Routes><Route path="/" element={<App />} /><Route path="/reader/:id" element={<Reader />} /></Routes></HashRouter></StrictMode>);
