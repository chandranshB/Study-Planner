import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Pomodoro from './components/Pomodoro';
import Exams from './components/Exams';
import Checklist from './components/Checklist';
import AIGenerator from './components/AIGenerator';
import Settings from './components/Settings';
import Modal from './components/Modal';
import { ThemeProvider } from './context/ThemeContext';

const API_URL = 'http://localhost:5000';

function StudyFlowContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exams, setExams] = useState([]);
  const [checklist, setChecklist] = useState([]); // Now array of Topics
  const [studySessions, setStudySessions] = useState([]);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal States
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const [newExamData, setNewExamData] = useState({ name: '', date: '', color: '#3b82f6' });
  const [newTopicData, setNewTopicData] = useState({ title: '', color: '#3b82f6' });
  const [newItemData, setNewItemData] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/data`);
        const data = await res.json();
        setExams(data.exams || []);

        // Migrate old flat checklist to "Uncategorized" topic if needed
        let loadedChecklist = data.checklist || [];
        if (loadedChecklist.length > 0 && !loadedChecklist[0].items) {
          loadedChecklist = [{
            id: 'uncategorized',
            title: 'Uncategorized',
            color: '#94a3b8',
            items: loadedChecklist
          }];
        }
        setChecklist(loadedChecklist);

        setStudySessions(data.study_sessions || []);
      } catch (err) {
        console.log('Using local storage or fresh start');
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

  // Add exam
  const handleAddExam = () => {
    if (newExamData.name && newExamData.date) {
      const newExams = [...exams, { id: Date.now(), ...newExamData }];
      setExams(newExams);
      saveData('exams', newExams);
      setIsExamModalOpen(false);
      setNewExamData({ name: '', date: '', color: '#3b82f6' });
    }
  };

  // Add Topic
  const handleAddTopic = () => {
    if (newTopicData.title) {
      const newChecklist = [...checklist, {
        id: Date.now().toString(),
        title: newTopicData.title,
        color: newTopicData.color,
        items: []
      }];
      setChecklist(newChecklist);
      saveData('checklist', newChecklist);
      setIsTopicModalOpen(false);
      setNewTopicData({ title: '', color: '#3b82f6' });
    }
  };

  // Add Item to Topic
  const handleAddItem = () => {
    if (newItemData && selectedTopicId) {
      const newChecklist = checklist.map(topic => {
        if (topic.id === selectedTopicId) {
          return {
            ...topic,
            items: [...topic.items, { id: Date.now(), text: newItemData, completed: false }]
          };
        }
        return topic;
      });
      setChecklist(newChecklist);
      saveData('checklist', newChecklist);
      setIsItemModalOpen(false);
      setNewItemData('');
    }
  };

  const openAddItemModal = (topicId) => {
    setSelectedTopicId(topicId);
    setIsItemModalOpen(true);
  };

  // Toggle Item
  const toggleItem = (topicId, itemId) => {
    const newChecklist = checklist.map(topic => {
      if (topic.id === topicId) {
        return {
          ...topic,
          items: topic.items.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return topic;
    });
    setChecklist(newChecklist);
    saveData('checklist', newChecklist);
  };

  // Delete Item
  const deleteChecklistItem = (topicId, itemId) => {
    const newChecklist = checklist.map(topic => {
      if (topic.id === topicId) {
        return {
          ...topic,
          items: topic.items.filter(item => item.id !== itemId)
        };
      }
      return topic;
    });
    setChecklist(newChecklist);
    saveData('checklist', newChecklist);
  };

  // Delete Topic
  const deleteTopic = (topicId) => {
    if (window.confirm('Delete this topic and all its items?')) {
      const newChecklist = checklist.filter(t => t.id !== topicId);
      setChecklist(newChecklist);
      saveData('checklist', newChecklist);
    }
  };

  // Delete Exam
  const deleteExam = (id) => {
    const newExams = exams.filter(e => e.id !== id);
    setExams(newExams);
    saveData('exams', newExams);
  };

  // Generate checklist from syllabus (Updated for nested structure)
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

      // Assume API now returns { checklist: [ { title: "Topic", items: ["Item 1"] } ] }
      // Or we adapt the flat list if API isn't updated yet.
      // For now, let's assume we might need to handle both or update API next.
      // Let's assume the API returns a flat list for now and we put it in a "Generated" topic
      // UNLESS we update the API first. I will update the API in the next step.

      let newTopics = [];
      if (data.checklist && data.checklist.length > 0 && typeof data.checklist[0] === 'object') {
        // Nested structure
        newTopics = data.checklist.map(topic => ({
          id: Date.now() + Math.random(),
          title: topic.title,
          color: '#3b82f6',
          items: topic.items.map(text => ({
            id: Date.now() + Math.random(),
            text,
            completed: false
          }))
        }));
      } else {
        // Flat structure fallback
        newTopics = [{
          id: Date.now(),
          title: `${course} - Generated`,
          color: '#8b5cf6',
          items: data.checklist.map(text => ({
            id: Date.now() + Math.random(),
            text,
            completed: false
          }))
        }];
      }

      const newChecklist = [...checklist, ...newTopics];
      setChecklist(newChecklist);
      saveData('checklist', newChecklist);
      setSyllabus('');
      setActiveTab('checklist');
    } catch (err) {
      alert('Failed to generate checklist');
    }
    setIsGenerating(false);
  };

  // Complete session
  const handleSessionComplete = (sessionData) => {
    const session = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...sessionData
    };
    const newSessions = [...studySessions, session];
    setStudySessions(newSessions);
    saveData('study_sessions', newSessions);
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
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard
          exams={exams}
          checklist={checklist} // Dashboard might need update to handle nested checklist for stats
          studySessions={studySessions}
          onStartFocus={() => setActiveTab('pomodoro')}
          onAddExam={() => setIsExamModalOpen(true)}
          onAddTask={() => setActiveTab('checklist')}
        />
      )}

      {activeTab === 'pomodoro' && (
        <Pomodoro
          checklist={checklist} // Pomodoro might need update to select tasks from nested list
          onSessionComplete={handleSessionComplete}
        />
      )}

      {activeTab === 'exams' && (
        <Exams
          exams={exams}
          addExam={() => setIsExamModalOpen(true)}
          deleteExam={deleteExam}
        />
      )}

      {activeTab === 'checklist' && (
        <Checklist
          checklist={checklist}
          addTopic={() => setIsTopicModalOpen(true)}
          addItem={openAddItemModal}
          toggleItem={toggleItem}
          deleteItem={deleteChecklistItem}
          deleteTopic={deleteTopic}
        />
      )}

      {activeTab === 'ai-generator' && (
        <AIGenerator
          ollamaModels={ollamaModels}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          course={course}
          setCourse={setCourse}
          year={year}
          setYear={setYear}
          syllabus={syllabus}
          setSyllabus={setSyllabus}
          generateChecklist={generateChecklist}
          isGenerating={isGenerating}
          handleFileUpload={handleFileUpload}
        />
      )}

      {activeTab === 'settings' && (
        <Settings />
      )}

      {/* Exam Modal */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Add New Exam"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Exam Name
            </label>
            <input
              type="text"
              value={newExamData.name}
              onChange={(e) => setNewExamData({ ...newExamData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="e.g. Mathematics Final"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={newExamData.date}
              onChange={(e) => setNewExamData({ ...newExamData, date: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Color
            </label>
            <div className="flex space-x-2">
              {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewExamData({ ...newExamData, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${newExamData.color === color ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsExamModalOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExam}
              disabled={!newExamData.name || !newExamData.date}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Exam
            </button>
          </div>
        </div>
      </Modal>

      {/* Topic Modal */}
      <Modal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        title="Add New Topic"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Topic Title
            </label>
            <input
              type="text"
              value={newTopicData.title}
              onChange={(e) => setNewTopicData({ ...newTopicData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="e.g. Algebra"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Color
            </label>
            <div className="flex space-x-2">
              {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewTopicData({ ...newTopicData, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${newTopicData.color === color ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsTopicModalOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTopic}
              disabled={!newTopicData.title}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Topic
            </button>
          </div>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="Add Task to Topic"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Task Description
            </label>
            <input
              type="text"
              value={newItemData}
              onChange={(e) => setNewItemData(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="e.g. Solve 5 problems"
              autoFocus
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsItemModalOpen(false)}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddItem}
              disabled={!newItemData}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StudyFlowContent />
    </ThemeProvider>
  );
}