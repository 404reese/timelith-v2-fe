'use client';
import React, { useState } from 'react';

const Generate = () => {
  const [response, setResponse] = useState<string>('');

  const handleGenerate = async () => {
    try {
      const res = await fetch('http://localhost:8080/timetable');
      const data = await res.text();
      setResponse(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResponse('Error fetching data');
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleGenerate}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Generate
      </button>
      <div 
        className="w-[800px] max-h-[600px] overflow-y-auto border border-gray-300 rounded p-4 bg-white"
      >
        <pre className="whitespace-pre-wrap break-words">{response}</pre>
      </div>
    </div>
  );
};

export default Generate;

