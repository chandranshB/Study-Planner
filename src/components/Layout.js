import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Calendar,
    CheckSquare,
    Timer,
    Sparkles,
    Menu,
    X,
    Settings
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children, activeTab, setActiveTab }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'exams', label: 'Exams', icon: Calendar },
        { id: 'checklist', label: 'Checklist', icon: CheckSquare },
        { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
    ];

    const menuItems = [
        { id: 'ai-generator', label: 'AI Generate', icon: Sparkles },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 z-50 px-4 flex items-center justify-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    StudyFlow
                </h1>
            </div>

            {/* Desktop Sidebar Navigation */}
            <div className="hidden md:block fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        StudyFlow
                    </h1>
                </div>

                <nav className="px-4 space-y-2">
                    {[...navItems, ...menuItems].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}`} />
                                <span>{item.label}</span>
                            </motion.button>
                        );
                    })}
                </nav>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 z-50 pb-safe">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isActive
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </motion.button>
                        );
                    })}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMobileMenuOpen(true)}
                        className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${isMobileMenuOpen
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        <Menu className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Menu</span>
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu Drawer (Bottom Sheet) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-[60] md:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-3xl z-[70] md:hidden overflow-hidden"
                        >
                            <div className="p-4 flex justify-center">
                                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            </div>
                            <div className="px-6 pb-8 space-y-2">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <motion.button
                                            key={item.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setActiveTab(item.id);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all ${isActive
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span className="text-base">{item.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
