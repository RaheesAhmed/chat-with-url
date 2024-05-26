"use client";

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
 
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !query) {
      alert("Please fill in all fields.");
      return;
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, url}),
    });

    const data = await res.json();
    if (res.ok) {
      setResponse(data.response);
    } else {
      alert(`Error: ${data.error}`);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Chat with URL</h1>
      {response && (
        <div className="w-full max-w-2xl bg-white p-6 rounded shadow mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">{response}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-8 rounded shadow fixed bottom-0 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              id="url"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1 bg-gray-100 focus:bg-white focus:border-blue-500 focus:outline-none"
              placeholder="Enter a URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <input
              id="query"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1 bg-gray-100 focus:bg-white focus:border-blue-500 focus:outline-none"
              placeholder="Enter a query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}
