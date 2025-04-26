'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const Generate = () => {
  const [response, setResponse] = useState<string>('');
  const [secondResponse, setSecondResponse] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [timer, setTimer] = useState<number>(5);
  const [jobId, setJobId] = useState<string>(''); // Add jobId state
  const intervalRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();
  const router = useRouter();
  
  const pollStatus = async (jobId: string) => {
    try {
      const statusRes = await fetch(`http://localhost:8081/time-table/${jobId}/status`);
      const statusData = await statusRes.json();
      setStatus(JSON.stringify(statusData, null, 2));
      
      // Optional: stop polling if status indicates completion
      // if (statusData.status === 'COMPLETED') {
      //   clearInterval(intervalRef.current);
      // }
    } catch (error) {
      console.error('Error fetching status:', error);
      setStatus('Error fetching status');
    }
  };

  useEffect(() => {
    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(5);
    
    try {
      const res = await fetch('http://localhost:8080/timetable');
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2)); // Pretty print JSON

      // Wait for 2 seconds then make second API call
      setTimeout(async () => {
        try {
          // Send data from 8080 as body to 8081
          const secondRes = await fetch('http://localhost:8081/time-table', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          const rawResponse = await secondRes.text();
          let secondData;
          try {
            secondData = JSON.parse(rawResponse);
          } catch {
            secondData = rawResponse; // Use plain text if not JSON
          }
          setSecondResponse(JSON.stringify(secondData, null, 2));
          
          // Handle both object and string responses
          const jobId = typeof secondData === 'string' 
            ? secondData 
            : secondData?.jobId || secondData?.[0];
          setJobId(jobId || '');
          if (!jobId) {
            setStatus('No jobId returned from backend');
            return;
          }
          intervalRef.current = setInterval(() => pollStatus(jobId), 2000);
          
          // Start timer with redirect
          timerRef.current = setInterval(() => {
            setTimer((prev) => {
              if (prev <= 1) {
                clearInterval(intervalRef.current);
                clearInterval(timerRef.current);
                setTimeout(() => router.push(`/view-tt?jobId=${jobId}`), 100); // Add small delay for final state updates
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
        } catch (error) {
          console.error('Error fetching second data:', error);
          setSecondResponse('Error fetching data');
        }
      }, 2000);

    } catch (error) {
      console.error('Error fetching data:', error);
      setResponse('Error fetching data');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleGenerate}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate
        </button>
        <span className="text-gray-600">Time remaining: {timer}s</span>
      </div>
      <div className="flex gap-4">
        <div className="max-h-[600px] overflow-y-auto border border-gray-300 rounded p-4 bg-white">
          <pre className="whitespace-pre-wrap break-words">{response}</pre>
        </div>
        <div className="overflow-y-auto border border-gray-300 rounded p-4 bg-white">
          <div>
            <span className="font-bold">Job ID: </span>
            <span className="text-blue-700">{jobId}</span>
          </div>
          <div className="mt-2">
            <span className="font-bold">Raw Response:</span>
            <pre className="whitespace-pre-wrap break-words">{secondResponse}</pre>
          </div>
          <div className="mt-2">
            <h3 className="font-bold">Status:</h3>
            <pre className="whitespace-pre-wrap break-words">{status}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generate;

