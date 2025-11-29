import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Pomodoro from './components/Pomodoro';
import Exams from './components/Exams';
import Checklist from './components/Checklist';
import AIGenerator from './components/AIGenerator';
import Settings from './components/Settings';
import Modal from './components/Modal';
import { ThemeProvider } from './context/ThemeContext';
import { StudyProvider, useStudyContext } from './context/StudyContext';

function StudyFlowContent() {
  const navigate = useNavigate();
  const {
    checklist,
    exams,
    addExam,
    addTopic,
    editTopic,
    addItem,
    editItem
  } = useStudyContext();

  // Modal States
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const [newExamData, setNewExamData] = useState({ name: '', date: '', color: '#3b82f6', subject: '' });
  const [newTopicData, setNewTopicData] = useState({ title: '', color: '#3b82f6', subject: '' });
  const [newItemData, setNewItemData] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // Edit States
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Add exam
  const handleAddExam = () => {
    if (newExamData.name && newExamData.date) {
      addExam(newExamData);
      setIsExamModalOpen(false);
      setNewExamData({ name: '', date: '', color: '#3b82f6', subject: '' });
    }
  };

  // Add/Edit Topic
  const handleSaveTopic = () => {
    if (newTopicData.title) {
      if (editingTopic) {
        editTopic(editingTopic.id, newTopicData);
      } else {
        addTopic(newTopicData);
      }
      setIsTopicModalOpen(false);
      setNewTopicData({ title: '', color: '#3b82f6', subject: '' });
      setEditingTopic(null);
    }
  };

  const openEditTopicModal = (topic) => {
    setEditingTopic(topic);
    setNewTopicData({ title: topic.title, color: topic.color, subject: topic.subject });
    setIsTopicModalOpen(true);
  };

  // Add/Edit Item
  const handleSaveItem = () => {
    if (newItemData && selectedTopicId) {
      if (editingItem) {
        editItem(selectedTopicId, editingItem.id, newItemData);
      } else {
        addItem(selectedTopicId, newItemData);
      }
      setIsItemModalOpen(false);
      setNewItemData('');
      setEditingItem(null);
    }
  };

  const openAddItemModal = (topicId) => {
    setSelectedTopicId(topicId);
    setEditingItem(null);
    setNewItemData('');
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (topicId, item) => {
    setSelectedTopicId(topicId);
    setEditingItem(item);
    setNewItemData(item.text);
    setIsItemModalOpen(true);
  };

  // Handle Exam Click
  const handleExamClick = (exam) => {
    // Navigate to checklist with filter
    if (exam.subject) {
      navigate(`/checklist?subject=${encodeURIComponent(exam.subject)}`);
    } else {
      navigate('/checklist');
    }
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={
          <Dashboard
            onAddExam={() => setIsExamModalOpen(true)}
          />
        } />

        <Route path="/pomodoro" element={<Pomodoro />} />

        <Route path="/exams" element={
          <Exams
            addExam={() => setIsExamModalOpen(true)}
            onExamClick={handleExamClick}
          />
        } />

        <Route path="/checklist" element={
          <Checklist
            onAddTopic={() => {
              setEditingTopic(null);
              setNewTopicData({ title: '', color: '#3b82f6', subject: '' });
              setIsTopicModalOpen(true);
            }}
            onAddItem={openAddItemModal}
            onEditTopic={openEditTopicModal}
            onEditItem={openEditItemModal}
          />
        } />

        <Route path="/ai-generator" element={<AIGenerator />} />

        <Route path="/settings" element={<Settings />} />
      </Routes>

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
              Subject (Optional)
            </label>
            <input
              type="text"
              list="exam-subjects-list"
              value={newExamData.subject || ''}
              onChange={(e) => setNewExamData({ ...newExamData, subject: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="e.g. Math"
            />
            <datalist id="exam-subjects-list">
              {[...new Set(checklist.map(t => t.subject))].filter(Boolean).map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>
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
        title={editingTopic ? "Edit Topic" : "Add New Topic"}
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
              Subject (Optional)
            </label>
            <input
              type="text"
              list="subjects-list"
              value={newTopicData.subject}
              onChange={(e) => setNewTopicData({ ...newTopicData, subject: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="e.g. Math"
            />
            <datalist id="subjects-list">
              {[...new Set(exams.map(e => e.subject))].filter(Boolean).map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>
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
              onClick={handleSaveTopic}
              disabled={!newTopicData.title}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingTopic ? "Save Changes" : "Add Topic"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? "Edit Task" : "Add Task to Topic"}
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
              onClick={handleSaveItem}
              disabled={!newItemData}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingItem ? "Save Changes" : "Add Task"}
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
      <StudyProvider>
        <StudyFlowContent />
      </StudyProvider>
    </ThemeProvider>
  );
}