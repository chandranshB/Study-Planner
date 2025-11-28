import React from 'react';
import { Calendar, CheckCircle2, Clock, TrendingUp, Activity, Plus, Play, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard({ exams, checklist, studySessions, onStartFocus, onAddExam, onAddTask }) {
    // Calculate Stats
    const totalStudyMinutes = studySessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalStudyHours = Math.floor(totalStudyMinutes / 60);

    const allItems = checklist.flatMap(topic => topic.items || []);
    const totalTasks = allItems.length;
    const completedTasks = allItems.filter(i => i.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const upcomingExams = exams.filter(e => new Date(e.date) >= new Date()).length;

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    const stats = [
        {
            label: 'Upcoming Exams',
            value: upcomingExams,
            icon: Calendar,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            trend: 'Stay prepared!'
        },
        {
            label: 'Tasks Completed',
            value: `${completedTasks}/${totalTasks}`,
            icon: CheckCircle2,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
            trend: `${completionRate}% done`
        },
        {
            label: 'Study Hours',
            value: `${totalStudyHours}h`,
            icon: Clock,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            trend: `${studySessions.length} sessions`
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{greeting}! 👋</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Ready to be productive today?</p>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 rounded-2xl dark:bg-slate-800/50 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area - 2/3 width */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Actions */}
                    <div className="glass-card p-6 rounded-2xl dark:bg-slate-800/50 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={onStartFocus}
                                className="group p-4 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all transform hover:-translate-y-1 text-left"
                            >
                                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Play className="w-6 h-6 fill-current" />
                                </div>
                                <div className="font-bold text-lg">Start Focus</div>
                                <div className="text-primary-100 text-sm">Launch Pomodoro</div>
                            </button>

                            <button
                                onClick={onAddTask}
                                className="group p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all text-left"
                            >
                                <div className="bg-slate-100 dark:bg-slate-600 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                                    <CheckCircle2 className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white">Manage Tasks</div>
                                <div className="text-slate-500 dark:text-slate-400 text-sm">Update checklist</div>
                            </button>

                            <button
                                onClick={onAddExam}
                                className="group p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all text-left"
                            >
                                <div className="bg-slate-100 dark:bg-slate-600 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                                    <Calendar className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                </div>
                                <div className="font-bold text-slate-900 dark:text-white">Add Exam</div>
                                <div className="text-slate-500 dark:text-slate-400 text-sm">Schedule new test</div>
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-card p-6 rounded-2xl dark:bg-slate-800/50 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Sessions</h3>
                            <button onClick={onStartFocus} className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center">
                                View all <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>

                        {studySessions.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400">No sessions yet. Start focusing!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {studySessions.slice(-3).reverse().map(session => (
                                    <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{session.covered || 'Focus Session'}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(session.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 px-3 py-1 rounded-lg shadow-sm">
                                            <Clock className="w-3 h-3 mr-1.5 text-primary-500" />
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
                    <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-lg font-bold mb-2 relative z-10">Overall Progress</h3>
                        <div className="flex items-end justify-between mb-4 relative z-10">
                            <span className="text-4xl font-bold">{completionRate}%</span>
                            <span className="text-slate-400 text-sm mb-1">of all tasks</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mb-4 relative z-10">
                            <div
                                className="bg-primary-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${completionRate}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-slate-400 relative z-10">
                            {completedTasks} of {totalTasks} tasks completed. Keep it up!
                        </p>
                    </div>

                    {/* Upcoming Exams Mini-List */}
                    <div className="glass-card p-6 rounded-2xl dark:bg-slate-800/50 dark:border-slate-700">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Next Exams</h3>
                        {exams.filter(e => new Date(e.date) >= new Date()).length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming exams.</p>
                        ) : (
                            <div className="space-y-3">
                                {exams
                                    .filter(e => new Date(e.date) >= new Date())
                                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                                    .slice(0, 3)
                                    .map(exam => (
                                        <div key={exam.id} className="flex items-center space-x-3">
                                            <div className="w-1 h-8 rounded-full" style={{ backgroundColor: exam.color }}></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{exam.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(exam.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
