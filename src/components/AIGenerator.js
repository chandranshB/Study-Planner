import React, { useState } from 'react';
import { Sparkles, Upload, FileText, Loader2 } from 'lucide-react';
import { useStudyContext } from '../context/StudyContext';

export default function AIGenerator({ setActiveTab }) {
    const { ollamaModels, selectedModel, setSelectedModel, updateChecklist, checklist, exams, API_URL } = useStudyContext();
    const [subject, setSubject] = useState('');
    const [year, setYear] = useState('');
    const [syllabus, setSyllabus] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Get unique subjects from exams for suggestions
    const examSubjects = [...new Set(exams.map(e => e.subject).filter(Boolean))];

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`${API_URL}/api/upload-pdf`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setSyllabus(data.text);
        } catch (err) {
            alert('Failed to process PDF');
        }
    };

    const generateChecklist = async () => {
        if (!syllabus || !subject || !selectedModel) {
            alert('Please fill all fields and select a model');
            return;
        }
        setIsGenerating(true);
        try {
            const res = await fetch(`${API_URL}/api/generate-checklist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ syllabus, course: subject, year, model: selectedModel })
            });
            const data = await res.json();

            const newTopics = data.checklist.map(topic => {
                const items = Array.isArray(topic.items) ? topic.items : [];
                return {
                    id: Date.now() + Math.random(),
                    title: topic.title || topic,
                    color: '#3b82f6',
                    subject: subject, // Use the subject name
                    items: items.map(text => ({
                        id: Date.now() + Math.random(),
                        text: typeof text === 'string' ? text : text.text,
                        completed: false
                    }))
                };
            });

            const newChecklist = [...checklist, ...newTopics];
            updateChecklist(newChecklist);
            setSyllabus('');
            setActiveTab('checklist');
        } catch (err) {
            alert('Failed to generate checklist');
            console.error(err);
        }
        setIsGenerating(false);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl mb-4">
                    <Sparkles className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">AI Study Assistant</h2>
                <p className="text-slate-500 dark:text-slate-400">Generate a personalized study plan from your syllabus</p>
            </div>

            <div className="glass-card p-8 rounded-3xl space-y-8 dark:bg-slate-800/50 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Ollama Model</label>
                        <div className="relative">
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl appearance-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                            >
                                {ollamaModels.length === 0 && <option>Loading models...</option>}
                                {ollamaModels.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                        <input
                            type="text"
                            list="course-subjects-list"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Select or type new subject..."
                            className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                        />
                        <datalist id="course-subjects-list">
                            {examSubjects.map(s => (
                                <option key={s} value={s} />
                            ))}
                        </datalist>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Year</label>
                        <div className="relative">
                            <select
                                value={year.split(', ')[0] || ''}
                                onChange={(e) => {
                                    const currentSem = year.split(', ')[1] || '';
                                    setYear(`${e.target.value}${currentSem ? ', ' + currentSem : ''}`);
                                }}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl appearance-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                            >
                                <option value="">Select Year</option>
                                {[1, 2, 3, 4].map(y => (
                                    <option key={y} value={`Year ${y}`}>Year {y}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Semester</label>
                        <div className="relative">
                            <select
                                value={year.split(', ')[1] || ''}
                                onChange={(e) => {
                                    const currentYear = year.split(', ')[0] || '';
                                    setYear(`${currentYear}${currentYear ? ', ' : ''}${e.target.value}`);
                                }}
                                className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl appearance-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                            >
                                <option value="">Select Semester</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                    <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Syllabus Content</label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all group">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Upload PDF Syllabus</span>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>

                        <div className="relative">
                            <textarea
                                value={syllabus}
                                onChange={(e) => setSyllabus(e.target.value)}
                                placeholder="Or paste your syllabus text here..."
                                className="w-full h-full min-h-[120px] p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                            />
                            <FileText className="absolute right-4 top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        </div>
                    </div>
                </div>

                <button
                    onClick={generateChecklist}
                    disabled={isGenerating}
                    className="w-full py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Analyzing Syllabus...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6" />
                            <span>Generate Study Plan</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
