// src/App.tsx
import React from 'react';
import { useMarketsData } from './hooks/useMarketsData';
import { MarketTable } from './components/MarketsTable';
import './App.css';

function App() {
  const { markets, loading, error, refreshData } = useMarketsData();

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      <p>Getting Data ...</p>
    </div>;
  }  

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600 text-center">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button 
          onClick={refreshData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Market Status</h1>
        <button 
          onClick={refreshData}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>
      <MarketTable markets={markets} />
    </div>
  );
}

export default App;