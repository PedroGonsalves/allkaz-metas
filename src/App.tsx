import React, { useState, useEffect } from 'react';
import Presentation from './components/Presentation';
import Editor from './components/Editor';
import { loadData, saveData } from './data';
import { AppData } from './types';

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [mode, setMode] = useState<'presentation' | 'editor'>('presentation');

  useEffect(() => {
    setData(loadData());
  }, []);

  if (!data) return <div className="min-h-screen bg-blue-900"></div>;

  const handleSave = (newData: AppData) => {
    saveData(newData);
    setData(newData);
    setMode('presentation');
  };

  return (
    <>
      {mode === 'presentation' ? (
        <Presentation data={data} onExit={() => setMode('editor')} />
      ) : (
        <Editor data={data} onSave={handleSave} onClose={() => setMode('presentation')} />
      )}
    </>
  );
}

