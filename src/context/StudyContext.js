import React, { createContext, useContext, useState, useEffect } from 'react';

const StudyContext = createContext();

export const useStudyContext = () => {
    const context = useContext(StudyContext);
    if (!context) {
        throw new Error('useStudyContext must be used within a StudyProvider');
    }
    return context;
};

const API_URL = `http://${window.location.hostname}:5000`;

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
                console.log('API unavailable, loading from local storage');
                const localExams = localStorage.getItem('study_exams');
                const localChecklist = localStorage.getItem('study_checklist');
                const localSessions = localStorage.getItem('study_sessions');

                if (localExams) setExams(JSON.parse(localExams));
                if (localChecklist) setChecklist(JSON.parse(localChecklist));
                if (localSessions) setStudySessions(JSON.parse(localSessions));
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

    // --- Data Import/Export ---
    const { exportData: compressData, importData: decompressData } = require('../utils/dataHandler');

    // --- Sync Logic ---
    const [pendingSync, setPendingSync] = useState(() => {
        const saved = localStorage.getItem('study_pending_sync');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('study_pending_sync', JSON.stringify(pendingSync));
    }, [pendingSync]);

    const syncPendingChanges = async () => {
        if (pendingSync.length === 0) return;

        console.log('Syncing pending changes...', pendingSync.length);
        const queue = [...pendingSync];
        setPendingSync([]); // Clear queue optimistically, will re-add on failure

        for (const item of queue) {
            try {
                await fetch(`${API_URL}/api/data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            } catch (err) {
                console.error('Sync failed for item', item, err);
                // Re-add to queue if failed
                setPendingSync(prev => [...prev, item]);
                return; // Stop syncing if one fails to maintain order
            }
        }
        console.log('Sync complete');
    };

    // Listen for online status
    useEffect(() => {
        const handleOnline = () => {
            console.log('Back online, syncing...');
            syncPendingChanges();
            // Also fetch latest data
            fetch(`${API_URL}/api/data`)
                .then(res => res.json())
                .then(data => {
                    // Merge logic could go here, for now just simple update if newer
                    // Ideally we should use a proper merge strategy
                    if (data.exams) setExams(prev => {
                        // Simple merge: add missing, update existing if server has more items? 
                        // For now, let's trust server if we just synced our changes
                        return data.exams;
                    });
                    if (data.checklist) setChecklist(data.checklist);
                    if (data.study_sessions) setStudySessions(data.study_sessions);
                })
                .catch(err => console.error('Fetch after sync failed', err));
        };

        window.addEventListener('online', handleOnline);

        // Try to sync on load if online
        if (navigator.onLine) {
            syncPendingChanges();
        }

        return () => window.removeEventListener('online', handleOnline);
    }, [API_URL]); // eslint-disable-line react-hooks/exhaustive-deps

    // Save data
    const saveData = async (type, data) => {
        // Always save to local storage for offline support
        try {
            localStorage.setItem(`study_${type}`, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to local storage', e);
        }

        // Try saving to API if available
        try {
            await fetch(`${API_URL}/api/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, data })
            });
        } catch (err) {
            console.warn('API save failed, adding to pending sync');
            setPendingSync(prev => [...prev, { type, data }]);
        }
    };

    const handleExport = async () => {
        const data = {
            exams,
            checklist,
            studySessions,
            version: 1,
            timestamp: new Date().toISOString()
        };
        try {
            const blob = await compressData(data);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `study-data-${new Date().toISOString().split('T')[0]}.chandu`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed', error);
            alert('Failed to export data');
        }
    };

    const handleImport = async (file, mode = 'merge') => {
        try {
            const data = await decompressData(file);

            if (mode === 'replace') {
                setExams(data.exams || []);
                setChecklist(data.checklist || []);
                setStudySessions(data.studySessions || []);
                saveData('exams', data.exams || []);
                saveData('checklist', data.checklist || []);
                saveData('study_sessions', data.studySessions || []);
            } else {
                // Merge Logic
                // Exams: Add if ID doesn't exist
                const newExams = [...exams];
                (data.exams || []).forEach(e => {
                    if (!newExams.find(curr => curr.id === e.id)) {
                        newExams.push(e);
                    }
                });
                setExams(newExams);
                saveData('exams', newExams);

                // Checklist: Add if ID doesn't exist (Simple merge)
                const newChecklist = [...checklist];
                (data.checklist || []).forEach(t => {
                    if (!newChecklist.find(curr => curr.id === t.id)) {
                        newChecklist.push(t);
                    }
                });
                setChecklist(newChecklist);
                saveData('checklist', newChecklist);

                // Sessions: Add if ID doesn't exist
                const newSessions = [...studySessions];
                (data.studySessions || []).forEach(s => {
                    if (!newSessions.find(curr => curr.id === s.id)) {
                        newSessions.push(s);
                    }
                });
                setStudySessions(newSessions);
                saveData('study_sessions', newSessions);
            }
            return true;
        } catch (error) {
            console.error('Import failed', error);
            alert('Failed to import data. Invalid file format.');
            return false;
        }
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
            handleExport,
            handleImport,
            API_URL
        }}>
            {children}
        </StudyContext.Provider>
    );
};
