import React, { useState } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon, AlertCircle, ArrowUpDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyContext } from '../context/StudyContext';

export default function Exams({ addExam, onExamClick }) {
    const { exams, deleteExam } = useStudyContext();
    const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'urgency'

    const daysUntil = (dateStr) => {
        const examDate = new Date(dateStr);
        const today = new Date();
        const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const sortedExams = [...exams].sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(a.date) - new Date(b.date);
        } else if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'urgency') {
            return daysUntil(a.date) - daysUntil(b.date);
        }
        return 0;
    });

    return (
        <div className="space-y-6 md:space-y-8 pb-20 md:pb-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Exams</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track your upcoming assessments</p>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                    {/* Sort Dropdown */}
                    <div className="relative flex-1 md:flex-none">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full md:w-48 appearance-none pl-10 pr-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="name">Sort by Name</option>
                            <option value="urgency">Sort by Urgency</option>
                        </select>
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    <button
                        onClick={addExam}
                        className="flex-none flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add Exam</span>
                    </button>
                </div>
            </div>

            {/* Exams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                    {sortedExams.map((exam) => {
                        const days = daysUntil(exam.date);
                        const isUrgent = days < 7;
                        const isWarning = days < 14;

                        return (
                            <motion.div
                                key={exam.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                layout
                                onClick={() => onExamClick && onExamClick(exam)}
                                className="glass-card p-5 md:p-6 rounded-2xl group relative overflow-hidden dark:bg-slate-800/50 dark:border-slate-700 active:scale-[0.98] transition-transform duration-200 cursor-pointer hover:ring-2 hover:ring-primary-500/50"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: exam.color || (isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981') }} />

                                <div className="flex justify-between items-start mb-4 pl-3">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                                            {exam.name}
                                        </h3>
                                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
                                            <CalendarIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                            {new Date(exam.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            {exam.subject && (
                                                <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                                                    {exam.subject}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteExam(exam.id);
                                        }}
                                        className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="pl-3 mt-4 md:mt-6">
                                    <div className="flex items-center space-x-2">
                                        {isUrgent && <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />}
                                        <span className={`text-2xl md:text-3xl font-bold tracking-tight ${isUrgent ? 'text-red-600 dark:text-red-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                                            }`}>
                                            {days}
                                        </span>
                                        <span className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                            Days Left
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {sortedExams.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No exams scheduled</h3>
                        <p className="text-slate-500 dark:text-slate-400">Add an exam to start tracking your deadlines.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
