import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Trash2, AlertTriangle, Moon, Sun, Type, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
    const {
        colorTheme, setColorTheme,
        isDarkMode, toggleDarkMode,
        fontTheme, setFontTheme,
        textureTheme, setTextureTheme,
        themes
    } = useTheme();

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
