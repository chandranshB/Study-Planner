import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Pomodoro({ checklist, onSessionComplete }) {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [showSessionEnd, setShowSessionEnd] = useState(false);
    const [topicsCovered, setTopicsCovered] = useState('');
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setSeconds(prev => {
                    if (prev === 0) {
                        if (minutes === 0) {
                            setIsRunning(false);
                            setShowSessionEnd(true);
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
    }, [isRunning, minutes]);

    const startTimer = () => {
        if (selectedTopics.length === 0) {
            alert('Please select at least one topic to study!');
            return;
        }
        setIsRunning(true);
    };

    const handleComplete = () => {
        onSessionComplete({
            topics: selectedTopics,
            covered: topicsCovered,
            duration: 25 - minutes // Simplified duration calculation
        });
        setShowSessionEnd(false);
        setSelectedTopics([]);
        setTopicsCovered('');
        setMinutes(25);
        setSeconds(0);
    };

    const progress = ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Focus Timer</h2>
                <p className="text-slate-500">Select topics and start your session</p>
            </div>

            <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                {/* Progress Circle Background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                    <motion.div
                        className="h-full bg-primary-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>

                <div className="text-center py-8">
                    <div className="text-8xl font-bold text-slate-900 mb-8 font-mono tracking-tighter">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </div>

                    <div className="flex justify-center space-x-4">
                        {!isRunning ? (
                            <button
                                onClick={startTimer}
                                className="flex items-center space-x-2 px-8 py-4 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-600/30 transition-all transform hover:-translate-y-1"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                <span>Start Focus</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsRunning(false)}
                                className="flex items-center space-x-2 px-8 py-4 bg-slate-800 text-white rounded-2xl font-semibold hover:bg-slate-900 hover:shadow-lg transition-all"
                            >
                                <Pause className="w-5 h-5 fill-current" />
                                <span>Pause</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setIsRunning(false);
                                setMinutes(25);
                                setSeconds(0);
                            }}
                            className="flex items-center space-x-2 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-semibold hover:bg-slate-200 transition-all"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {!isRunning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-slate-100 pt-6 mt-6"
                    >
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-2 text-primary-600" />
                            Select Topics
                        </h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {checklist.filter(c => !c.completed).length === 0 ? (
                                <p className="text-slate-500 text-sm italic">No pending tasks. Add some in the Checklist tab!</p>
                            ) : (
                                checklist.filter(c => !c.completed).map(item => (
                                    <label key={item.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedTopics.includes(item.text)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedTopics([...selectedTopics, item.text]);
                                                    } else {
                                                        setSelectedTopics(selectedTopics.filter(t => t !== item.text));
                                                    }
                                                }}
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-primary-600 checked:bg-primary-600 hover:border-primary-500"
                                            />
                                            <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-slate-700 group-hover:text-slate-900 transition-colors">{item.text}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {showSessionEnd && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">Session Complete! 🎉</h3>
                                <p className="text-slate-500">Great job staying focused.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">What did you cover?</label>
                                    <textarea
                                        value={topicsCovered}
                                        onChange={(e) => setTopicsCovered(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
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
