import React from 'react';
import { Plus, Trash2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Exams({ exams, addExam, deleteExam }) {
    const daysUntil = (dateStr) => {
        const examDate = new Date(dateStr);
        const today = new Date();
        const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Exams</h2>
                    <p className="text-slate-500 mt-1">Track your upcoming assessments</p>
                </div>
                <button
                    onClick={addExam}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Exam</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {exams.map((exam) => {
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
                                className="glass-card p-6 rounded-2xl group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 left-0 w-1 h-full ${isUrgent ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'
                                    }`} />

                                <div className="flex justify-between items-start mb-4 pl-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
                                            {exam.name}
                                        </h3>
                                        <div className="flex items-center text-slate-500 text-sm mt-1">
                                            <CalendarIcon className="w-4 h-4 mr-1" />
                                            {new Date(exam.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteExam(exam.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="pl-4 mt-6">
                                    <div className="flex items-center space-x-2">
                                        {isUrgent && <AlertCircle className="w-5 h-5 text-red-500" />}
                                        <span className={`text-3xl font-bold tracking-tight ${isUrgent ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-green-600'
                                            }`}>
                                            {days}
                                        </span>
                                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                                            Days Left
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {exams.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalendarIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No exams scheduled</h3>
                        <p className="text-slate-500">Add an exam to start tracking your deadlines.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
