"use client";

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !query || !apiKey) {
      alert("Please fill in all fields.");
      return;
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, url, apikey: apiKey }),
    });

    const data = await res.json();
    if (res.ok) {
      setResponse(data.response);
    } else {
      alert(`Error: ${data.error}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Chat with URL</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow">
        <div className="mb-4">
          <label htmlFor="url" className="block text-gray-700">URL</label>
          <input
            id="url"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="query" className="block text-gray-700">Query</label>
          <input
            id="query"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="apiKey" className="block text-gray-700">API Key</label>
          <input
            id="apiKey"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
      {response && (
        <div className="mt-6 w-full max-w-md bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Response</h2>
          <p className="text-gray-700">{response}</p>
        </div>
      )}
    </div>
  );
}
