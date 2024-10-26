import React from 'react';
import './App.css';
import CanvasChart from "./components/CanvasChart";

const App: React.FC = () => {
  const apiUrl = 'https://beta.forextester.com/data/api/Metadata/bars/chunked?Broker=Advanced&Symbol=USDJPY&Timeframe=1&Start=57674&End=59113&UseMessagePack=false';

  return (
      <div>
        <h1>Forex Chart</h1>
        <CanvasChart apiUrl={apiUrl} />
      </div>
  );
};

export default App;
