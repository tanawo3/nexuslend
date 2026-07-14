import React, { useState, useEffect } from 'react';
import { useGenLayer } from './hooks/useGenLayer';
import { InitializationView } from './components/InitializationView';
import { Dashboard } from './components/Dashboard';
import { ParticleBackground } from './components/ParticleBackground';
import { LenisWrapper } from './components/LenisWrapper';
import { AwwwardsCursor } from './components/AwwwardsCursor';
import { Preloader } from './components/Preloader';

function App() {
  const genLayer = useGenLayer();
  const { isConnected, contractAddress } = genLayer;
  const [preloaderDone, setPreloaderDone] = useState(false);

  // Re-fetch data if contract address changes
  useEffect(() => {
    if (contractAddress && isConnected) {
      genLayer.fetchData();
    }
  }, [contractAddress, isConnected]);

  return (
    <LenisWrapper>
      <div className="min-h-screen bg-[#050505] text-[#f4f3ef] font-sans selection:bg-[#8b7355] selection:text-[#050505] relative overflow-hidden">
        <AwwwardsCursor />
        
        {/* Only show content after preloader finishes */}
        <Preloader onComplete={() => setPreloaderDone(true)} />

        {/* Global WebGL Background with much lower opacity to keep it subtle and luxurious */}
        <div className="fixed inset-0 z-0 opacity-20 mix-blend-screen pointer-events-none">
          <ParticleBackground />
        </div>

        {preloaderDone && (
          <main className="relative z-10 w-full min-h-screen">
            {/* If no contract is deployed yet, show the luxurious init screen */}
            {!contractAddress ? (
              <InitializationView genLayer={genLayer} />
            ) : (
              <Dashboard genLayer={genLayer} />
            )}
          </main>
        )}
      </div>
    </LenisWrapper>
  );
}

export default App;
