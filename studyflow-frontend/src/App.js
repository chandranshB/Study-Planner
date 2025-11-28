import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, Plus, Trash2, Check, Play, Pause, RotateCcw, BookOpen, Brain, BarChart3, Settings, Upload, CheckSquare, Square } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function StudyFlow() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exams, setExams] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [studySessions, setStudySessions] = useState([]);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Pomodoro state
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showSessionEnd, setShowSessionEnd] = useState(false);
  const [topicsCovered, setTopicsCovered] = useState('');
  const timerRef = useRef(null);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/data`);
        const data = await res.json();
        setExams(data.exams || []);
        setChecklist(data.checklist || []);
        setStudySessions(data.study_sessions || []);
      } catch (err) {
        console.log('Using local storage');
      }
    };
    loadData();
    fetchOllamaModels();
  }, []);

  // Fetch Ollama models
  const fetchOllamaModels = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ollama/models`);
      const data = await res.json();
      setOllamaModels(data.models || []);
      if (data.models?.length > 0) setSelectedModel(data.models[0]);
    } catch (err) {
      console.error('Failed to fetch models');
    }
  };

  // Save data
  const saveData = async (type, data) => {
    try {
      await fetch(`${API_URL}/api/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });
    } catch (err) {
      console.error('Save failed');
    }
  };

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev === 0) {
            if (timerMinutes === 0) {
              setIsRunning(false);
              setShowSessionEnd(true);
              return 0;
            }
            setTimerMinutes(m => m - 1);
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, timerMinutes]);

  // Add exam
  const addExam = () => {
    const name = prompt('Exam name:');
    const date = prompt('Exam date (YYYY-MM-DD):');
    if (name && date) {
      const newExams = [...exams, { id: Date.now(), name, date }];
      setExams(newExams);
      saveData('exams', newExams);
    }
  };

  // Add checklist item
  const addChecklistItem = () => {
    const text = prompt('Topic/Task:');
    if (text) {
      const newChecklist = [...checklist, { id: Date.now(), text, completed: false }];
      setChecklist(newChecklist);
      saveData('checklist', newChecklist);
    }
  };

  // Toggle checklist
  const toggleChecklist = (id) => {
    const newChecklist = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(newChecklist);
    saveData('checklist', newChecklist);
  };

  // Delete item
  const deleteItem = (id, type) => {
    if (type === 'exam') {
      const newExams = exams.filter(e => e.id !== id);
      setExams(newExams);
      saveData('exams', newExams);
    } else {
      const newChecklist = checklist.filter(c => c.id !== id);
      setChecklist(newChecklist);
      saveData('checklist', newChecklist);
    }
  };

  // Generate checklist from syllabus
  const generateChecklist = async () => {
    if (!syllabus || !course || !selectedModel) {
      alert('Please fill all fields and select a model');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/generate-checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syllabus, course, year, model: selectedModel })
      });
      const data = await res.json();
      const newItems = data.checklist.map(text => ({
        id: Date.now() + Math.random(),
        text,
        completed: false
      }));
      const newChecklist = [...checklist, ...newItems];
      setChecklist(newChecklist);
      saveData('checklist', newChecklist);
      setSyllabus('');
      setActiveTab('checklist');
    } catch (err) {
      alert('Failed to generate checklist');
    }
    setIsGenerating(false);
  };

  // Start timer
  const startTimer = () => {
    if (selectedTopics.length === 0) {
      alert('Select at least one topic to study');
      return;
    }
    setIsRunning(true);
  };

  // Complete session
  const completeSession = () => {
    const session = {
      id: Date.now(),
      date: new Date().toISOString(),
      topics: selectedTopics,
      planned: selectedTopics.join(', '),
      covered: topicsCovered,
      duration: 25 - timerMinutes
    };
    const newSessions = [...studySessions, session];
    setStudySessions(newSessions);
    saveData('study_sessions', newSessions);
    setShowSessionEnd(false);
    setSelectedTopics([]);
    setTopicsCovered('');
    setTimerMinutes(25);
    setTimerSeconds(0);
  };

  // Calculate days until exam
  const daysUntil = (dateStr) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Upload PDF
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  StudyFlow
                </h1>
                <p className="text-xs text-gray-500">Smart Study Management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2">
            {[
              { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { id: 'pomodoro', icon: Clock, label: 'Pomodoro' },
              { id: 'exams', icon: Calendar, label: 'Exams' },
              { id: 'checklist', icon: CheckSquare, label: 'Checklist' },
              { id: 'ai', icon: Brain, label: 'AI Generate' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Upcoming Exams</h3>
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{exams.length}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Tasks Completed</h3>
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {checklist.filter(c => c.completed).length}/{checklist.length}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Study Sessions</h3>
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{studySessions.length}</p>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Study Sessions</h3>
              {studySessions.length === 0 ? (
                <p className="text-gray-500">No study sessions yet. Start a Pomodoro timer!</p>
              ) : (
                <div className="space-y-3">
                  {studySessions.slice(-5).reverse().map(session => (
                    <div key={session.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900">{session.planned}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Covered: {session.covered}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pomodoro Timer */}
        {activeTab === 'pomodoro' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Pomodoro Timer</h2>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="text-center mb-8">
                <div className="text-7xl font-bold text-gray-900 mb-4">
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </div>
                <div className="flex justify-center space-x-4">
                  {!isRunning ? (
                    <button
                      onClick={startTimer}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      <Play className="w-5 h-5" />
                      <span>Start</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsRunning(false)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      <Pause className="w-5 h-5" />
                      <span>Pause</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsRunning(false);
                      setTimerMinutes(25);
                      setTimerSeconds(0);
                    }}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {!isRunning && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Select Topics to Study</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {checklist.filter(c => !c.completed).map(item => (
                      <label key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
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
                          className="w-5 h-5 text-indigo-600 rounded"
                        />
                        <span className="text-gray-700">{item.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {showSessionEnd && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-8 rounded-2xl max-w-md w-full">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Session Complete! 🎉</h3>
                  <p className="text-gray-600 mb-4">What topics did you cover?</p>
                  <textarea
                    value={topicsCovered}
                    onChange={(e) => setTopicsCovered(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                    rows="4"
                    placeholder="Describe what you studied..."
                  />
                  <button
                    onClick={completeSession}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Save Session
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Exams */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Upcoming Exams</h2>
              <button
                onClick={addExam}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Add Exam</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map(exam => {
                const days = daysUntil(exam.date);
                return (
                  <div key={exam.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{exam.name}</h3>
                        <p className="text-gray-500">{exam.date}</p>
                      </div>
                      <button onClick={() => deleteItem(exam.id, 'exam')} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className={`text-3xl font-bold ${days < 7 ? 'text-red-600' : days < 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {days} days left
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Checklist */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">Study Checklist</h2>
              <button
                onClick={addChecklistItem}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="space-y-2">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <button onClick={() => toggleChecklist(item.id)}>
                      {item.completed ? (
                        <CheckSquare className="w-6 h-6 text-green-600" />
                      ) : (
                        <Square className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                    <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.text}
                    </span>
                    <button onClick={() => deleteItem(item.id, 'checklist')} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Generate */}
        {activeTab === 'ai' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">AI-Powered Checklist Generator</h2>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ollama Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  {ollamaModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g., Data Structures"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year/Semester</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., Year 2, Semester 1"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Syllabus PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Or Paste Syllabus Text</label>
                <textarea
                  value={syllabus}
                  onChange={(e) => setSyllabus(e.target.value)}
                  placeholder="Paste your syllabus here..."
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows="8"
                />
              </div>

              <button
                onClick={generateChecklist}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Checklist'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}