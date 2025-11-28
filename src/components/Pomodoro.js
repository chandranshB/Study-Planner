import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Settings, Coffee, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import { useStudyContext } from '../context/StudyContext';

export default function Pomodoro() {
    const { checklist, addSession } = useStudyContext();

    // Settings State
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('study-flow-pomodoro-settings');
        return saved ? JSON.parse(saved) : { focus: 25, shortBreak: 5, longBreak: 15 };
    });

    const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
    const [minutes, setMinutes] = useState(settings.focus);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [showSessionEnd, setShowSessionEnd] = useState(false);
    const [topicsCovered, setTopicsCovered] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const timerRef = useRef(null);

    // Save settings whenever they change
    useEffect(() => {
        localStorage.setItem('study-flow-pomodoro-settings', JSON.stringify(settings));
    }, [settings]);

    // Timer Logic
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setSeconds(prev => {
                    if (prev === 0) {
                        if (minutes === 0) {
                            setIsRunning(false);
                            if (mode === 'focus') {
                                setShowSessionEnd(true);
                            } else {
                                // Auto-switch back to focus or just stop for breaks
                                new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => { });
                                alert('Break is over! Time to focus.');
                                switchMode('focus');
                            }
                            return 0;
                        }
                        setMinutes(m => m - 1);
                        return 59;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning, minutes, mode]);

    const switchMode = (newMode) => {
        setMode(newMode);
        setMinutes(settings[newMode]);
        setSeconds(0);
        setIsRunning(false);
    };

    const startTimer = () => {
        if (mode === 'focus' && selectedTopics.length === 0) {
            alert('Please select at least one topic to study!');
            return;
        }
        setIsRunning(true);
    };

    const handleComplete = () => {
        addSession({
            topics: selectedTopics,
            covered: topicsCovered,
            duration: settings.focus - minutes // Approximate duration
        });
        setShowSessionEnd(false);
        setSelectedTopics([]);
        setTopicsCovered('');
        switchMode('shortBreak'); // Auto-suggest short break
    };

    const totalSeconds = settings[mode] * 60;
    const currentSeconds = minutes * 60 + seconds;
    const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

    const getModeColor = () => {
        switch (mode) {
            case 'focus': return 'bg-primary-600';
            case 'shortBreak': return 'bg-teal-500';
            case 'longBreak': return 'bg-indigo-500';
            default: return 'bg-primary-600';
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Focus Timer</h2>
                    <p className="text-slate-500 dark:text-slate-400">Select topics and start your session</p>
                </div>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                    <Settings className="w-6 h-6" />
                </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                {[
                    { id: 'focus', label: 'Focus', icon: Brain },
                    { id: 'shortBreak', label: 'Short Break', icon: Coffee },
                    { id: 'longBreak', label: 'Long Break', icon: Coffee },
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => switchMode(m.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-medium transition-all ${mode === m.id
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <m.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{m.label}</span>
                    </button>
                ))}
            </div>

            <div className="glass-card p-8 rounded-3xl relative overflow-hidden dark:bg-slate-800/50 dark:border-slate-700">
                {/* Progress Circle Background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-700">
                    <motion.div
                        className={`h-full ${getModeColor()}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>

                <div className="text-center py-8">
                    <div className="text-8xl font-bold text-slate-900 dark:text-white mb-8 font-mono tracking-tighter">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>

                    <div className="flex justify-center space-x-4">
                        {!isRunning ? (
                            <button
                                onClick={startTimer}
                                className={`flex items-center space-x-2 px-8 py-4 text-white rounded-2xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-1 ${getModeColor()}`}
                            >
                                <Play className="w-5 h-5 fill-current" />
                                <span>Start {mode === 'focus' ? 'Focus' : 'Break'}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsRunning(false)}
                                className="flex items-center space-x-2 px-8 py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-semibold hover:bg-slate-900 dark:hover:bg-slate-600 hover:shadow-lg transition-all"
                            >
                                <Pause className="w-5 h-5 fill-current" />
                                <span>Pause</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setIsRunning(false);
                                setMinutes(settings[mode]);
                                setSeconds(0);
                            }}
                            className="flex items-center space-x-2 px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {mode === 'focus' && !isRunning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-slate-100 dark:border-slate-700 pt-6 mt-6"
                    >
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                            Select Topics
                        </h3>
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {checklist.filter(c => !c.completed).length === 0 ? (
                                <p className="text-slate-500 dark:text-slate-400 text-sm italic">No pending tasks. Add some in the Checklist tab!</p>
                            ) : (
                                Object.entries(checklist.reduce((acc, topic) => {
                                    const subject = topic.subject || 'General';
                                    if (!acc[subject]) acc[subject] = [];
                                    acc[subject].push(topic);
                                    return acc;
                                }, {})).map(([subject, topics]) => (
                                    <div key={subject}>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-white dark:bg-slate-800/95 backdrop-blur-sm py-1 z-10">
                                            {subject}
                                        </h4>
                                        <div className="space-y-2">
                                            {topics.map(item => (
                                                <label key={item.id} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors group">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedTopics.includes(item.title)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedTopics([...selectedTopics, item.title]);
                                                                } else {
                                                                    setSelectedTopics(selectedTopics.filter(t => t !== item.title));
                                                                }
                                                            }}
                                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 dark:border-slate-600 transition-all checked:border-primary-600 checked:bg-primary-600 hover:border-primary-500"
                                                        />
                                                        <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Settings Modal */}
            <Modal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Timer Settings"
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Focus Duration (minutes)
                        </label>
                        <input
                            type="number"
                            value={settings.focus}
                            onChange={(e) => setSettings({ ...settings, focus: parseInt(e.target.value) || 25 })}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Short Break (minutes)
                        </label>
                        <input
                            type="number"
                            value={settings.shortBreak}
                            onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) || 5 })}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Long Break (minutes)
                        </label>
                        <input
                            type="number"
                            value={settings.longBreak}
                            onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) || 15 })}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                setIsSettingsOpen(false);
                                setMinutes(settings[mode]);
                                setSeconds(0);
                                setIsRunning(false);
                            }}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </Modal>

            <AnimatePresence>
                {showSessionEnd && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-700"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Session Complete! 🎉</h3>
                                <p className="text-slate-500 dark:text-slate-400">Great job staying focused.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">What did you cover?</label>
                                    <textarea
                                        value={topicsCovered}
                                        onChange={(e) => setTopicsCovered(e.target.value)}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-slate-900 dark:text-white"
                                        rows="4"
                                        placeholder="Brief summary of your study session..."
                                    />
                                </div>
                                <button
                                    onClick={handleComplete}
                                    className="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 hover:shadow-lg transition-all"
                                >
                                    Save Session
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
