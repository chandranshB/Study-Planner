import React from 'react';
import { Calendar, CheckCircle2, Clock, TrendingUp, Activity, Play, ArrowRight, AlertCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudyContext } from '../context/StudyContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ onAddExam }) {
    const { exams, checklist, studySessions, addItem, addTopic } = useStudyContext();
    const [quickTaskText, setQuickTaskText] = React.useState('');
    const navigate = useNavigate();

    const onStartFocus = () => navigate('/pomodoro');
    const onAddTask = () => navigate('/checklist');

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

    // Today's Focus Logic
    const today = new Date().toDateString();
    const urgentExams = upcomingExams.filter(e => {
        const diffTime = new Date(e.date) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3; // Exams in next 3 days
    });

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    const getDaysUntil = (dateString) => {
        const days = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `in ${days} days`;
    };

    const handleQuickAdd = (e) => {
        e.preventDefault();
        if (!quickTaskText.trim()) return;

        // Find a default topic or create one
        let targetTopic = checklist.find(t => t.title === "General" || t.title === "Inbox") || checklist[0];

        if (!targetTopic) {
            // If absolutely no topics, we might need to create one (if addTopic is available and we want to handle that complexity here)
            // For now, let's assume at least one topic exists or we can't add.
            // Ideally, we should call addTopic({ title: "Inbox", ... }) then add item.
            // But to keep it simple and safe:
            alert("Please create a Topic in Checklist first!");
            return;
        }

        addItem(targetTopic.id, quickTaskText);
        setQuickTaskText('');
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
        <div className="space-y-8 pb-24 md:pb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{greeting}! 👋</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-medium">Ready to crush your goals today?</p>
                </div>
                <div className="hidden md:flex items-center space-x-2 text-sm font-semibold bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
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
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight mt-1">{stat.value}</h3>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.subtext}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area - 2/3 width */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Today's Focus Section */}
                    <div className="glass-card p-6 rounded-2xl dark:bg-slate-800/50 dark:border-slate-700 border-l-4 border-l-primary-500">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-primary-500" />
                                Today's Focus
                            </h3>
                            <span className="text-xs font-bold px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg uppercase tracking-wider">
                                Priority
                            </span>
                        </div>

                        <div className="space-y-4">
                            {/* Urgent Exams */}
                            {urgentExams.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upcoming Exams</h4>
                                    {urgentExams.map(exam => (
                                        <div key={exam.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-8 rounded-full bg-red-500"></div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{exam.name}</p>
                                                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">{getDaysUntil(exam.date)}</p>
                                                </div>
                                            </div>
                                            <button onClick={onStartFocus} className="text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                                                Study Now
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quick Add Task */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Add Task</h4>
                                <form onSubmit={handleQuickAdd} className="relative">
                                    <input
                                        type="text"
                                        value={quickTaskText}
                                        onChange={(e) => setQuickTaskText(e.target.value)}
                                        placeholder="What needs to be done? Press Enter..."
                                        className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!quickTaskText.trim()}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <button
                                onClick={onStartFocus}
                                className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all text-left flex flex-col justify-between h-32"
                            >
                                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 fill-current" />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-900 dark:text-white">Focus</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Start Timer</span>
                                </div>
                            </button>

                            <button
                                onClick={onAddTask}
                                className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all text-left flex flex-col justify-between h-32"
                            >
                                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-900 dark:text-white">Tasks</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage List</span>
                                </div>
                            </button>

                            <button
                                onClick={onAddExam}
                                className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all text-left flex flex-col justify-between h-32"
                            >
                                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-900 dark:text-white">Exams</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Add New</span>
                                </div>
                            </button>

                            <button
                                className="group p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all text-left flex flex-col justify-between h-32 opacity-60 cursor-not-allowed"
                            >
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block font-bold text-slate-900 dark:text-white">Stats</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Coming Soon</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Area - 1/3 width */}
                <div className="space-y-8">
                    {/* Progress Card */}
                    <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-primary-900 text-white border-none relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold">Overall Progress</h3>
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <TrendingUp className="w-5 h-5 text-primary-300" />
                                </div>
                            </div>

                            <div className="flex items-end justify-between mb-3">
                                <span className="text-5xl font-black tracking-tighter">{completionRate}%</span>
                                <span className="text-slate-300 text-sm font-medium mb-1.5">Completed</span>
                            </div>

                            <div className="w-full bg-slate-700/50 rounded-full h-3 mb-4 backdrop-blur-sm overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionRate}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                                ></motion.div>
                            </div>

                            <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                You've completed <span className="text-white font-bold">{completedTasks}</span> out of <span className="text-white font-bold">{totalTasks}</span> tasks.
                                {completionRate >= 100 ? " Incredible work! 🎉" : " Keep pushing!"}
                            </p>
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="hidden md:block glass-card p-6 rounded-2xl dark:bg-slate-800/50 dark:border-slate-700">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Sessions</h3>
                        {studySessions.length === 0 ? (
                            <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No sessions yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {studySessions.slice(-3).reverse().map(session => (
                                    <div key={session.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{session.covered || 'Focus Session'}</p>
                                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{new Date(session.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                                            {session.duration}m
                                        </span>
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
