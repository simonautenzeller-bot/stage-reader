import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { Reader } from './components/Reader';
import './styles.css';

const updateServiceWorker = registerSW({
	onNeedRefresh() {
		if (confirm('Eine neue App-Version ist verfügbar. Jetzt laden?')) updateServiceWorker(true);
	}
});
createRoot(document.getElementById('root')!).render(<StrictMode><HashRouter><Routes><Route path="/" element={<App />} /><Route path="/reader/:id" element={<Reader />} /></Routes></HashRouter></StrictMode>);
