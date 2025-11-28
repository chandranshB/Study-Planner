import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, ChevronDown, ChevronRight, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checklist({ checklist, addTopic, addItem, toggleItem, deleteItem, deleteTopic }) {
    // Calculate overall progress
    const totalItems = checklist.reduce((acc, topic) => acc + topic.items.length, 0);
    const completedItems = checklist.reduce((acc, topic) => acc + topic.items.filter(i => i.completed).length, 0);
    const overallProgress = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Checklist</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your study tasks by topic</p>
                </div>
                <button
                    onClick={addTopic}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all"
                >
                    <FolderPlus className="w-5 h-5" />
                    <span>Add Topic</span>
                </button>
            </div>

            {/* Overall Progress Bar */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Overall Progress</span>
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{Math.round(overallProgress)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            <div className="space-y-6">
                <AnimatePresence>
                    {checklist.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700"
                        >
                            <p className="text-slate-400 italic">No topics yet. Add a topic to get started!</p>
                        </motion.div>
                    ) : (
                        checklist.map((topic) => (
                            <TopicSection
                                key={topic.id}
                                topic={topic}
                                addItem={addItem}
                                toggleItem={toggleItem}
                                deleteItem={deleteItem}
                                deleteTopic={deleteTopic}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function TopicSection({ topic, addItem, toggleItem, deleteItem, deleteTopic }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const completedCount = topic.items.filter(i => i.completed).length;
    const totalCount = topic.items.length;
    const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
                    </button>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: topic.color || '#3b82f6' }} />
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{topic.title}</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                        {completedCount}/{totalCount}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => addItem(topic.id)}
                        className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        title="Add Item"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => deleteTopic(topic.id)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Topic"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Topic Progress Bar */}
            <div className="h-1 bg-slate-100 dark:bg-slate-700">
                <motion.div
                    className="h-full bg-primary-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 space-y-2">
                            {topic.items.length === 0 ? (
                                <p className="text-sm text-slate-400 italic text-center py-4">No items in this topic.</p>
                            ) : (
                                topic.items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center group"
                                    >
                                        <button
                                            onClick={() => toggleItem(topic.id, item.id)}
                                            className="flex-shrink-0 mr-3 focus:outline-none"
                                        >
                                            {item.completed ? (
                                                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-white">
                                                    <CheckSquare className="w-3.5 h-3.5" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded group-hover:border-primary-500 transition-colors" />
                                            )}
                                        </button>
                                        <span className={`flex-1 text-sm transition-colors ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {item.text}
                                        </span>
                                        <button
                                            onClick={() => deleteItem(topic.id, item.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 rounded transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
