import React, { useState } from 'react';
import { Sparkles, Upload, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIGenerator({
    ollamaModels,
    selectedModel,
    setSelectedModel,
    course,
    setCourse,
    year,
    setYear,
    syllabus,
    setSyllabus,
    generateChecklist,
    isGenerating,
    handleFileUpload
}) {
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl mb-4">
                    <Sparkles className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">AI Study Assistant</h2>
                <p className="text-slate-500">Generate a personalized study plan from your syllabus</p>
            </div>

            <div className="glass-card p-8 rounded-3xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Ollama Model</label>
                        <div className="relative">
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            >
                                {ollamaModels.length === 0 && <option>Loading models...</option>}
                                {ollamaModels.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Course Name</label>
                        <input
                            type="text"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            placeholder="e.g., Data Structures"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Year / Semester</label>
                    <input
                        type="text"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="e.g., Year 2, Semester 1"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-700">Syllabus Content</label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer transition-all group">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">Upload PDF Syllabus</span>
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
                                className="w-full h-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                            <FileText className="absolute right-4 top-4 w-5 h-5 text-slate-400" />
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
