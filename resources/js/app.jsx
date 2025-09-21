import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import AdminPanel from './components/AdminPanel';
import { ThemeProvider } from './components/ui/theme-provider';
import { SettingsProvider } from './contexts/SettingsContext';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(
  <ThemeProvider defaultTheme="light" storageKey="li-council-theme">
    <SettingsProvider>
      <AdminPanel />
    </SettingsProvider>
  </ThemeProvider>
);
