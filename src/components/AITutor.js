import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText, Bot, User, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { useStudyContext } from '../context/StudyContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function AITutor() {
    const { API_URL } = useStudyContext();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! Upload a PDF study guide, and I can help you understand it better. Ask me anything about the content!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [pdfContext, setPdfContext] = useState(null); // { filename: '...' }
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/api/upload-pdf`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setPdfContext({ filename: file.name });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `I've read **${file.name}**! I'm ready to answer your questions based on it.`
            }]);
        } catch (err) {
            console.error(err);
            alert('Failed to process PDF: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.filter(m => m.role !== 'system')
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please make sure the backend is running and a PDF is uploaded.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-4">
            {/* Header / Upload Section */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                        <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Tutor</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {pdfContext ? `Studying: ${pdfContext.filename}` : 'Upload a document to start'}
                        </p>
                    </div>
                </div>

                <label className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all ${isUploading
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                    }`}>
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span className="text-sm font-medium">{isUploading ? 'Processing...' : 'Upload PDF'}</span>
                    <input type="file" accept=".pdf" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
                </label>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                    ? 'bg-slate-200 dark:bg-slate-700'
                                    : 'bg-indigo-100 dark:bg-indigo-900/30'
                                }`}>
                                {msg.role === 'user'
                                    ? <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    : <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                }
                            </div>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tr-none'
                                    : 'bg-indigo-50 dark:bg-indigo-900/20 text-slate-800 dark:text-slate-200 rounded-tl-none'
                                }`}>
                                <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about your document..."
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-600/20"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
