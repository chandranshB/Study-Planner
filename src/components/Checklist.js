import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    CheckCircle2,
    Circle,
    Trash2,
    Plus,
    ChevronDown,
    ChevronRight,
    MoreVertical,
    Filter,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyContext } from '../context/StudyContext';

export default function Checklist({
    onAddTopic,
    onAddItem,
    onEditTopic,
    onEditItem
}) {
    const { checklist, toggleItem, deleteItem, deleteTopic } = useStudyContext();
    const [expandedTopics, setExpandedTopics] = useState({});
    const [searchParams, setSearchParams] = useSearchParams();
    const [contextMenu, setContextMenu] = useState(null);

    const selectedSubject = searchParams.get('subject') || 'All';

    const setSelectedSubject = (subject) => {
        if (subject === 'All') {
            setSearchParams({});
        } else {
            setSearchParams({ subject });
        }
    };

    // Extract unique subjects
    const subjects = useMemo(() => {
        const allSubjects = new Set(['All']);
        // Always add the currently selected subject to ensure it's visible
        if (selectedSubject && selectedSubject !== 'All') {
            allSubjects.add(selectedSubject);
        }
        checklist.forEach(topic => {
            if (topic.subject) allSubjects.add(topic.subject);
        });
        return Array.from(allSubjects);
    }, [checklist, selectedSubject]);

    // Filter topics based on subject
    const filteredChecklist = useMemo(() => {
        if (selectedSubject === 'All') return checklist;
        return checklist.filter(topic => topic.subject === selectedSubject);
    }, [checklist, selectedSubject]);

    // Calculate progress for the current view
    const progress = useMemo(() => {
        if (!filteredChecklist.length) return 0;
        let total = 0;
        let completed = 0;
        filteredChecklist.forEach(topic => {
            topic.items.forEach(item => {
                total++;
                if (item.completed) completed++;
            });
        });
        return total === 0 ? 0 : Math.round((completed / total) * 100);
    }, [filteredChecklist]);

    const toggleTopic = (topicId) => {
        setExpandedTopics(prev => ({
            ...prev,
            [topicId]: !prev[topicId]
        }));
    };

    const handleContextMenu = (e, type, id, data, topicId = null) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type,
            id,
            data,
            topicId // Store topicId for items
        });
    };

    const closeContextMenu = () => setContextMenu(null);

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => closeContextMenu();
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="space-y-6 pb-20">
            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Study Checklist</h2>
                    <p className="text-slate-500 dark:text-slate-400">Track your progress topic by topic</p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 no-scrollbar">
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setSelectedSubject(subject)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedSubject === subject
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            {/* ... (Progress Bar remains same) */}

            {/* Topics List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredChecklist.map((topic, index) => (
                        <TopicSection
                            key={topic.id}
                            topic={topic}
                            index={index}
                            isExpanded={expandedTopics[topic.id]}
                            toggleTopic={toggleTopic}
                            toggleItem={toggleItem}
                            onContextMenu={handleContextMenu}
                            onAddItem={onAddItem}
                        />
                    ))}
                </AnimatePresence>

                {filteredChecklist.length === 0 && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <Filter className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No topics found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">
                            {selectedSubject !== 'All'
                                ? `No topics found for "${selectedSubject}".`
                                : 'Start by adding a new topic.'}
                        </p>
                        {selectedSubject !== 'All' && (
                            <button
                                onClick={() => setSelectedSubject('All')}
                                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddTopic}
                className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-slate-900 dark:bg-primary-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:bg-slate-800 dark:hover:bg-primary-500 transition-colors"
            >
                <Plus className="w-6 h-6" />
            </motion.button>

            {/* Context Menu */}
            <AnimatePresence>
                {contextMenu && (
                    <ContextMenu
                        {...contextMenu}
                        close={closeContextMenu}
                        onEdit={(type, id, data, topicId) => {
                            if (type === 'topic') onEditTopic(data);
                            else onEditItem(topicId, data);
                            closeContextMenu();
                        }}
                        onDelete={(type, id, topicId) => {
                            if (type === 'topic') deleteTopic(id);
                            else deleteItem(topicId, id);
                            closeContextMenu();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function TopicSection({ topic, isExpanded, toggleTopic, toggleItem, onContextMenu, onAddItem }) {
    const completedCount = topic.items.filter(i => i.completed).length;
    const totalCount = topic.items.length;
    const isCompleted = totalCount > 0 && completedCount === totalCount;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
            onContextMenu={(e) => onContextMenu(e, 'topic', topic.id, topic)}
        >
            <div
                onClick={() => toggleTopic(topic.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'}`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{topic.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>{completedCount}/{totalCount} tasks</span>
                            {topic.subject && (
                                <>
                                    <span>•</span>
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">{topic.subject}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddItem(topic.id);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-slate-700"
                    >
                        <div className="p-2 space-y-1">
                            {topic.items.map(item => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onContextMenu={(e) => onContextMenu(e, 'item', item.id, item, topic.id)}
                                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <button
                                        onClick={() => toggleItem(topic.id, item.id)}
                                        className={`flex-shrink-0 transition-colors ${item.completed ? 'text-green-500' : 'text-slate-300 hover:text-primary-500'}`}
                                    >
                                        {item.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                    <span className={`flex-grow text-sm transition-all ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {item.text}
                                    </span>
                                </motion.div>
                            ))}
                            {topic.items.length === 0 && (
                                <div className="p-4 text-center text-sm text-slate-400 italic">
                                    No tasks yet. Click + to add one.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function ContextMenu({ x, y, type, id, topicId, close, onEdit, onDelete, data }) {
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={close} />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ top: y, left: x }}
                className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-1 min-w-[150px]"
            >
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 mb-1">
                    {type === 'topic' ? 'Topic Options' : 'Task Options'}
                </div>
                <button
                    onClick={() => onEdit(type, id, data, topicId)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(type, id, topicId)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </motion.div>
        </>
    );
}
