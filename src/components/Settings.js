import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Trash2, AlertTriangle, Moon, Sun, Type, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useStudyContext } from '../context/StudyContext';

import QRCode from 'react-qr-code';

export default function Settings() {
    const {
        colorTheme, setColorTheme,
        isDarkMode, toggleDarkMode,
        fontTheme, setFontTheme,
        textureTheme, setTextureTheme,
        themes
    } = useTheme();

    const { handleExport, handleImport } = useStudyContext();

    const clearData = () => {
        if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Customize your experience</p>
            </header>

            {/* Appearance Settings */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Palette className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Appearance</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Customize look and feel</p>
                    </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-orange-500 shadow-sm'}`}>
                            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </div>
                        <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">Dark Mode</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Adjust for low light</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-primary-600' : 'bg-slate-300'
                            }`}
                    >
                        <motion.div
                            initial={false}
                            animate={{ x: isDarkMode ? 26 : 2 }}
                            className="w-6 h-6 bg-white rounded-full shadow-md"
                        />
                    </button>
                </div>

                {/* Color Theme Grid */}
                {/* Color Theme Grid */}
                <div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-4">Color Theme</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setColorTheme(t.id)}
                                className={`relative group p-4 rounded-xl border-2 transition-all duration-200 ${colorTheme === t.id
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                                    }`}
                            >
                                <div className="flex flex-col items-center space-y-3">
                                    <div
                                        className="w-12 h-12 rounded-full shadow-lg border-2 border-white dark:border-slate-800"
                                        style={{ background: t.color }}
                                    />
                                    <span className={`font-medium text-sm ${colorTheme === t.id ? 'text-primary-700 dark:text-primary-300' : 'text-slate-600 dark:text-slate-400'
                                        }`}>
                                        {t.label}
                                    </span>
                                </div>
                                {colorTheme === t.id && (
                                    <div className="absolute top-3 right-3 w-2 h-2 bg-primary-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Typography & Texture */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-200 dark:border-slate-700">
                    {/* Typography */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-slate-900 dark:text-white">Typography</h4>
                        <div className="space-y-2">
                            {[
                                { id: 'sans', label: 'Modern (Sans)', font: 'font-sans' },
                                { id: 'serif', label: 'Elegant (Serif)', font: 'font-serif' },
                                { id: 'mono', label: 'Technical (Mono)', font: 'font-mono' },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setFontTheme(f.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${fontTheme === f.id
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    <span className={f.font}>{f.label}</span>
                                    {fontTheme === f.id && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Texture */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-slate-900 dark:text-white">Surface Texture</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'clean', label: 'Clean' },
                                { id: 'dots', label: 'Dots' },
                                { id: 'grid', label: 'Grid' },
                                { id: 'glass', label: 'Glass' },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTextureTheme(t.id)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${textureTheme === t.id
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Management */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Data Management</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Import or export your study data</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Export Data (.chandu)</span>
                    </button>

                    <div className="relative">
                        <input
                            type="file"
                            accept=".chandu"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                if (window.confirm('Do you want to REPLACE all current data? Click Cancel to MERGE instead.')) {
                                    handleImport(file, 'replace');
                                } else {
                                    handleImport(file, 'merge');
                                }
                                e.target.value = null; // Reset
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors font-medium pointer-events-none"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Import Data</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Mobile Sync */}
            <MobileSyncSection />

            {/* Danger Zone */}
            <section className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">Danger Zone</h3>
                        <p className="text-sm text-red-600 dark:text-red-300">Irreversible actions</p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-red-100 dark:border-red-900/30">
                    <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">Clear All Data</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Delete all exams, checklists, and sessions</p>
                    </div>
                    <button
                        onClick={clearData}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear Data</span>
                    </button>
                </div>
            </section>
        </div >
    );
}

function MobileSyncSection() {
    const { API_URL, updateApiUrl } = useStudyContext();
    const [networkInfo, setNetworkInfo] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [customUrl, setCustomUrl] = React.useState(API_URL);
    const [isEditingUrl, setIsEditingUrl] = React.useState(false);

    const fetchNetworkInfo = () => {
        setLoading(true);
        setNetworkInfo(null);
        fetch(`${API_URL}/api/network-info`)
            .then(res => {
                if (!res.ok) throw new Error('Endpoint not found');
                return res.json();
            })
            .then(data => {
                setNetworkInfo(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch network info', err);
                setNetworkInfo(null);
                setLoading(false);
            });
    };

    React.useEffect(() => {
        fetchNetworkInfo();
    }, [API_URL]);

    const handleSaveUrl = () => {
        updateApiUrl(customUrl);
        setIsEditingUrl(false);
    };

    const mobileUrl = networkInfo?.ip ? `http://${networkInfo.ip}:3000` : '';
    const serverUrl = networkInfo?.ip ? `http://${networkInfo.ip}:5000` : '';

    return (
        <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Mobile Sync</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Connect devices or configure server</p>
                </div>
            </div>

            {/* Server Configuration */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">Server Connection</h4>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        disabled={!isEditingUrl}
                        className={`flex-1 px-3 py-2 rounded-lg border ${isEditingUrl ? 'border-primary-500 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-600 text-slate-500'} dark:text-white transition-colors`}
                    />
                    {isEditingUrl ? (
                        <button
                            onClick={handleSaveUrl}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Save
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditingUrl(true)}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Edit
                        </button>
                    )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Current Server: <span className="font-mono">{API_URL}</span>
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="hidden md:block bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    {loading ? (
                        <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-lg">
                            <span className="text-slate-400">Loading...</span>
                        </div>
                    ) : mobileUrl ? (
                        <QRCode value={mobileUrl} size={192} />
                    ) : (
                        <div className="w-48 h-48 flex flex-col items-center justify-center bg-slate-50 rounded-lg p-4 text-center space-y-3">
                            <span className="text-slate-400 text-sm">Server Offline</span>
                            <button
                                onClick={fetchNetworkInfo}
                                className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold hover:bg-primary-200 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <h4 className="font-medium text-slate-900 dark:text-white mb-1">How to connect:</h4>
                        <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                            <li>Ensure your mobile device is on the <strong>same Wi-Fi network</strong>.</li>
                            <li>Open your phone's browser and go to:</li>
                            <code className="block bg-slate-100 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 font-mono text-sm mb-2 select-all">
                                {mobileUrl}
                            </code>
                            <li>Or scan the QR code above.</li>
                        </ol>
                    </div>

                    {serverUrl ? (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <p className="text-xs text-blue-600 dark:text-blue-300 uppercase tracking-wider font-semibold mb-1">
                                Connect from Mobile / Deployed App
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                                <strong>Do not use localhost!</strong> Enter this URL on your other device:
                            </p>
                            <code className="block bg-white dark:bg-slate-800 p-2 rounded border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-mono text-sm break-all select-all">
                                {serverUrl}
                            </code>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                <strong>Not connected to server.</strong><br />
                                If you are on mobile, check your <strong>Desktop App</strong> settings to find the correct Server URL.
                            </p>
                        </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <div className={`w-2 h-2 rounded-full ${networkInfo ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>Server Status: {networkInfo ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
