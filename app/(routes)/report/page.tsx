'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const Report = () => {
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groqAnalysis, setGroqAnalysis] = useState('');
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await fetch(`http://localhost:8081/time-table/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setTimetableData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [jobId]);

  const analyzeWithGroq = async () => {
    setAnalyzeLoading(true);
    setGroqAnalysis(''); // Clear previous analysis
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scoreExplanation: timetableData.scoreExplanation 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setGroqAnalysis(data.analysis || "No analysis content received");
    } catch (error) {
      console.error('Groq Analysis Error:', error);
      setGroqAnalysis(`Error: ${error instanceof Error ? error.message : 'Failed to analyze'}`);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading report...</div>;
  if (!timetableData) return <div className="p-4">No report data available</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Timetable Report</h1>
        <button
          onClick={() => router.back()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Timetable
        </button>
      </div>

      <div className="bg-white border rounded shadow p-6">
        <div className="text-xl font-semibold mb-4">
          Score: <span className="font-mono">{timetableData.score}</span>
        </div>
        <div className="text-xl font-semibold mb-4">
          Status: <span className="font-mono">{timetableData.status}</span>
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Score Explanation:</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border">
            {timetableData.scoreExplanation}
          </pre>
        </div>
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold">AI Analysis:</h2>
            <button
              onClick={analyzeWithGroq}
              disabled={analyzeLoading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {analyzeLoading ? 'Analyzing...' : 'Analyze with Groq'}
            </button>
          </div>
          {groqAnalysis && (
            <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded border mt-4">
              {groqAnalysis}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
