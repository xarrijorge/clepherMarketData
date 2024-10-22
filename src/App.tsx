import React, {useState, useEffect} from 'react';
import { getUserLocation, Coordinates } from './utilities/GetUserLocation';
import './App.css';

function App() {
  const [location, setLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    getUserLocation()
      .then((coords) => {
        setLocation(coords);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  return (
    <div className="App">
      <h1>Market Data</h1>
    </div>
  );
}

export default App;
