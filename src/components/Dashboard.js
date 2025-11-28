import React from 'react';
import { Calendar, CheckCircle2, Clock, TrendingUp, Activity, Play, ArrowRight, AlertCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudyContext } from '../context/StudyContext';

export default function Dashboard({ onStartFocus, onAddExam, onAddTask }) {
    const { exams, checklist, studySessions } = useStudyContext();

    // Calculate Stats
    const totalStudyMinutes = studySessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalStudyHours = Math.floor(totalStudyMinutes / 60);

    const allItems = checklist.flatMap(topic => topic.items || []);
    const totalTasks = allItems.length;
    const completedTasks = allItems.filter(i => i.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const upcomingExams = exams.filter(e => new Date(e.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    const nextExam = upcomingExams[0];

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    const getDaysUntil = (dateString) => {
        const days = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `in ${days} days`;
    };

    const stats = [
        {
            label: 'Next Exam',
            value: nextExam ? getDaysUntil(nextExam.date) : 'No exams',
            subtext: nextExam ? nextExam.name : 'Relax!',
            icon: Calendar,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            label: 'Tasks Done',
            value: `${completedTasks}/${totalTasks}`,
            subtext: `${completionRate}% Complete`,
            icon: CheckCircle2,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'Study Time',
            value: `${totalStudyHours}h`,
            subtext: `${studySessions.length} Sessions`,
            icon: Clock,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
        }
    ];

    return (
        <div className="space-y-6 md:space-y-8 pb-20 md:pb-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{greeting}! 👋</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-base md:text-lg font-medium">Ready to be productive today?</p>
                </div>
                <div className="hidden md:flex items-center space-x-2 text-sm font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-5 rounded-2xl dark:bg-slate-800/50 dark:border-slate-700 hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.bg} flex-shrink-0`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{stat.value}</h3>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{stat.subtext}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main Content Area - 2/3 width */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    {/* Quick Actions */}
                    <div className="glass-card p-5 md:p-6 rounded-2xl dark:bg-slate-800/50 dark:border-slate-700">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-4 md:mb-6 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                            <button
                                onClick={onStartFocus}
                                className="group p-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all transform active:scale-[0.98] text-left relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Play className="w-6 h-6 fill-current" />
                                </div>
                                <div className="font-bold text-lg">Start Focus</div>
                                <div className="text-primary-100 text-sm font-medium">Launch Pomodoro</div>
                            </button>

                            <button
                                onClick={onAddTask}
                                className="group p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all active:scale-[0.98] text-left"
                            >
                                <div className="bg-slate-100 dark:bg-slate-600 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                                    <CheckCircle2 className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white">Manage Tasks</div>
                                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">Update checklist</div>
                            </button>

                            <button
                                onClick={onAddExam}
                                className="group p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all active:scale-[0.98] text-left"
                            >
                                <div className="bg-slate-100 dark:bg-slate-600 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                                    <Calendar className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white">Add Exam</div>
                                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">Schedule new test</div>
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-card p-5 md:p-6 rounded-2xl dark:bg-slate-800/50 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">Recent Sessions</h3>
                            <button onClick={onStartFocus} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center p-2 -mr-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                                View all <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>

                        {studySessions.length === 0 ? (
                            <div className="text-center py-8 md:py-12 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">No sessions yet. Start focusing!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {studySessions.slice(-3).reverse().map(session => (
                                    <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-primary-200 dark:hover:border-primary-700/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shadow-sm">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{session.covered || 'Focus Session'}</p>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{new Date(session.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                                            <Clock className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
                                            {session.duration}m
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Area - 1/3 width */}
                <div className="space-y-6">
                    {/* Progress Card */}
                    <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Overall Progress</h3>
                                <TrendingUp className="w-5 h-5 text-primary-400" />
                            </div>

                            <div className="flex items-end justify-between mb-2">
                                <span className="text-5xl font-bold tracking-tight">{completionRate}%</span>
                                <span className="text-slate-400 text-sm font-medium mb-1.5">Done</span>
                            </div>

                            <div className="w-full bg-slate-700/50 rounded-full h-3 mb-4 backdrop-blur-sm">
                                <div
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    style={{ width: `${completionRate}%` }}
                                ></div>
                            </div>

                            <p className="text-sm text-slate-300 font-medium">
                                {completedTasks} of {totalTasks} tasks completed.
                                {completionRate >= 100 ? " Amazing job! 🎉" : " Keep it up!"}
                            </p>
                        </div>
                    </div>

                    {/* Upcoming Exams List */}
                    <div className="glass-card p-5 md:p-6 rounded-2xl dark:bg-slate-800/50 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Upcoming Exams</h3>
                            <button onClick={onAddExam} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-primary-600">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {upcomingExams.length === 0 ? (
                            <div className="text-center py-6">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 mb-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">All caught up!</p>
                                <p className="text-xs text-slate-400">No upcoming exams scheduled.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingExams.slice(0, 3).map(exam => (
                                    <div key={exam.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                        <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: exam.color }}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{exam.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                <span>{new Date(exam.date).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                <span className={getDaysUntil(exam.date) === 'Today' ? 'text-red-500 font-bold' : ''}>
                                                    {getDaysUntil(exam.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {upcomingExams.length > 3 && (
                                    <button onClick={onAddExam} className="w-full py-2 text-xs font-medium text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                                        +{upcomingExams.length - 3} more exams
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
