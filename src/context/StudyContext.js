import React, { createContext, useContext, useState, useEffect } from 'react';

const StudyContext = createContext();

export const useStudyContext = () => {
    const context = useContext(StudyContext);
    if (!context) {
        throw new Error('useStudyContext must be used within a StudyProvider');
    }
    return context;
};

const API_URL = 'http://localhost:5000';

export const StudyProvider = ({ children }) => {
    const [exams, setExams] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [studySessions, setStudySessions] = useState([]);
    const [ollamaModels, setOllamaModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');

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
                // Fallback to localStorage if API fails? For now just log.
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

    // --- Actions ---

    const addExam = (examData) => {
        const newExams = [...exams, { id: Date.now(), ...examData }];
        setExams(newExams);
        saveData('exams', newExams);
    };

    const deleteExam = (id) => {
        const newExams = exams.filter(e => e.id !== id);
        setExams(newExams);
        saveData('exams', newExams);
    };

    const addTopic = (topicData) => {
        const newChecklist = [...checklist, {
            id: Date.now(),
            title: topicData.title,
            color: topicData.color,
            subject: topicData.subject || 'General',
            items: []
        }];
        setChecklist(newChecklist);
        saveData('checklist', newChecklist);
    };

    const editTopic = (topicId, topicData) => {
        const newChecklist = checklist.map(t => t.id === topicId ? { ...t, ...topicData } : t);
        setChecklist(newChecklist);
        saveData('checklist', newChecklist);
    };

    const deleteTopic = (topicId) => {
        const newChecklist = checklist.filter(t => t.id !== topicId);
        setChecklist(newChecklist);
        saveData('checklist', newChecklist);
    };

    const addItem = (topicId, itemText) => {
        const newChecklist = checklist.map(topic => {
            if (topic.id === topicId) {
                return {
                    ...topic,
                    items: [...topic.items, { id: Date.now(), text: itemText, completed: false }]
                };
            }
            return topic;
        });
        setChecklist(newChecklist);
        saveData('checklist', newChecklist);
    };

    const editItem = (topicId, itemId, newText) => {
        const newChecklist = checklist.map(topic => {
            if (topic.id === topicId) {
                return {
                    ...topic,
                    items: topic.items.map(i => i.id === itemId ? { ...i, text: newText } : i)
                };
            }
            return topic;
        });
        setChecklist(newChecklist);
        saveData('checklist', newChecklist);
    };

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

    const deleteItem = (topicId, itemId) => {
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

    const addSession = (sessionData) => {
        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...sessionData
        };
        const newSessions = [...studySessions, session];
        setStudySessions(newSessions);
        saveData('study_sessions', newSessions);
    };

    const updateChecklist = (newChecklist) => {
        setChecklist(newChecklist);
        saveData('checklist', newChecklist);
    };

    return (
        <StudyContext.Provider value={{
            exams,
            checklist,
            studySessions,
            ollamaModels,
            selectedModel,
            setSelectedModel,
            addExam,
            deleteExam,
            addTopic,
            editTopic,
            deleteTopic,
            addItem,
            editItem,
            toggleItem,
            deleteItem,
            addSession,
            updateChecklist,
            API_URL
        }}>
            {children}
        </StudyContext.Provider>
    );
};
