export interface ThemePalette {
    name: string;
    label: string;
    primary: string;
    secondary: string;
    sidebarBg: string;
    sidebarBorder: string;
    pageBg: string;
    textPrimary: string;
    textSidebar: string;
}

export const THEME_PALETTES: Record<string, ThemePalette> = {
    default: {
        name: 'default',
        label: 'Harmoni Mavi',
        primary: '#3b82f6',
        secondary: '#64748b',
        sidebarBg: '#0f172a',
        sidebarBorder: '#1e293b',
        pageBg: '#f1f5f9',
        textPrimary: '#0f172a',
        textSidebar: '#94a3b8'
    },
    midnight: {
        name: 'midnight',
        label: 'Gece Modu',
        primary: '#6366f1',
        secondary: '#4338ca',
        sidebarBg: '#09090b',
        sidebarBorder: '#27272a',
        pageBg: '#111827',
        textPrimary: '#f9fafb',
        textSidebar: '#9ca3af'
    },
    ocean: {
        name: 'ocean',
        label: 'Okyanus Esintisi',
        primary: '#0ea5e9',
        secondary: '#0284c7',
        sidebarBg: '#0c4a6e',
        sidebarBorder: '#075985',
        pageBg: '#e0f2fe',
        textPrimary: '#075985',
        textSidebar: '#bae6fd'
    },
    forest: {
        name: 'forest',
        label: 'Doğa Yeşil',
        primary: '#10b981',
        secondary: '#059669',
        sidebarBg: '#064e3b',
        sidebarBorder: '#065f46',
        pageBg: '#dcfce7',
        textPrimary: '#064e3b',
        textSidebar: '#ace7bf'
    },
    sunrise: {
        name: 'sunrise',
        label: 'Gün Doğumu',
        primary: '#f59e0b',
        secondary: '#d97706',
        sidebarBg: '#451a03',
        sidebarBorder: '#78350f',
        pageBg: '#fef3c7',
        textPrimary: '#451a03',
        textSidebar: '#fde68a'
    },
    sunset: {
        name: 'sunset',
        label: 'Gün Batımı',
        primary: '#ef4444',
        secondary: '#b91c1c',
        sidebarBg: '#450a0a',
        sidebarBorder: '#7f1d1d',
        pageBg: '#fee2e2',
        textPrimary: '#450a0a',
        textSidebar: '#fecaca'
    },
    coffee: {
        name: 'coffee',
        label: 'Kahve & Krem',
        primary: '#78350f',
        secondary: '#a16207',
        sidebarBg: '#1c1917',
        sidebarBorder: '#44403c',
        pageBg: '#f5f5f4',
        textPrimary: '#1c1917',
        textSidebar: '#d6d3d1'
    }
};
