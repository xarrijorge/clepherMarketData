// src/App.tsx
import React from 'react';
import { useMarketsData } from './hooks/useMarketsData';
import { MarketTable } from './components/MarketsTable';
import './App.css';
import { Loading } from './components/Loading';
import { ShowError } from './components/Error';

function App() {
  const { markets, loading, error, refreshData } = useMarketsData();

  if (loading) {
    return <Loading />; 
  }  

  if (error) {
    return <ShowError error={error} onRetry={refreshData} />; 
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