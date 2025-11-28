import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Pomodoro from './components/Pomodoro';
import Exams from './components/Exams';
import Checklist from './components/Checklist';
import AIGenerator from './components/AIGenerator';

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
  const addExam = () => {
    const name = prompt('Exam name:');
    if (!name) return;
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
          checklist={checklist}
          studySessions={studySessions}
        />
      )}

      {activeTab === 'pomodoro' && (
        <Pomodoro
          checklist={checklist}
          onSessionComplete={handleSessionComplete}
        />
      )}

      {activeTab === 'exams' && (
        <Exams
          exams={exams}
          addExam={addExam}
          deleteExam={(id) => deleteItem(id, 'exam')}
        />
      )}

      {activeTab === 'checklist' && (
        <Checklist
          checklist={checklist}
          addChecklistItem={addChecklistItem}
          toggleChecklist={toggleChecklist}
          deleteItem={(id) => deleteItem(id, 'checklist')}
        />
      )}

      {activeTab === 'ai' && (
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
    </Layout>
  );
}