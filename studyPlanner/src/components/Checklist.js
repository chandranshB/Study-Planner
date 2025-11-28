import React from 'react';
import { Plus, Trash2, CheckSquare, Square, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checklist({ checklist, addChecklistItem, toggleChecklist, deleteItem }) {
    const completedCount = checklist.filter(c => c.completed).length;
    const totalCount = checklist.length;
    const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Checklist</h2>
                    <p className="text-slate-500 mt-1">Manage your study tasks</p>
                </div>
                <button
                    onClick={addChecklistItem}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Task</span>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">Progress</span>
                    <span className="text-sm font-bold text-primary-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2 text-primary-600" />
                        Your Tasks
                    </h3>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3">
                    <AnimatePresence>
                        {checklist.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <p className="text-slate-400 italic">No tasks yet. Add one to get started!</p>
                            </motion.div>
                        ) : (
                            checklist.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    layout
                                    className={`group flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 ${item.completed
                                            ? 'bg-slate-50 border-transparent'
                                            : 'bg-white border-slate-200 hover:border-primary-200 hover:shadow-sm'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleChecklist(item.id)}
                                        className="flex-shrink-0 focus:outline-none"
                                    >
                                        {item.completed ? (
                                            <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white">
                                                <CheckSquare className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="w-6 h-6 border-2 border-slate-300 rounded-lg group-hover:border-primary-500 transition-colors" />
                                        )}
                                    </button>

                                    <span className={`flex-1 font-medium transition-colors ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                                        }`}>
                                        {item.text}
                                    </span>

                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
