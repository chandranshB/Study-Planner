import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BarChart3, Clock, Calendar, CheckSquare, Brain } from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab }) {
    const navItems = [
        { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
        { id: 'pomodoro', icon: Clock, label: 'Pomodoro' },
        { id: 'exams', icon: Calendar, label: 'Exams' },
        { id: 'checklist', icon: CheckSquare, label: 'Checklist' },
        { id: 'ai', icon: Brain, label: 'AI Generate' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-50 hidden md:flex flex-col"
            >
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">StudyFlow</h1>
                            <p className="text-xs text-slate-500 font-medium">Smart Study Manager</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === item.id
                                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                                }`} />
                            <span className="font-medium">{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 w-1 h-8 bg-primary-600 rounded-r-full"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="bg-gradient-to-br from-primary-900 to-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                        <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-16 h-16 bg-secondary-500/20 rounded-full blur-xl" />
                        <h3 className="font-semibold text-sm mb-1 relative z-10">Pro Tip</h3>
                        <p className="text-xs text-slate-300 relative z-10">Use the Pomodoro timer to stay focused!</p>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-900">StudyFlow</span>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe">
                <div className="flex justify-around p-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center p-2 rounded-lg ${activeTab === item.id ? 'text-primary-600' : 'text-slate-400'
                                }`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
