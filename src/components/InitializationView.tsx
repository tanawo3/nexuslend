import React, { useState, useEffect } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { motion, AnimatePresence } from 'motion/react';

export const InitializationView: React.FC<{ genLayer: ReturnType<typeof useGenLayer> }> = ({ genLayer }) => {
  const { address, isDeploying, connect } = genLayer;
  
  const onDeploy = async () => {
    if (!address) {
      await connect();
      return;
    }
    await genLayer.deployContract();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative p-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#8b7355] rounded-full blur-[150px] opacity-10" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#b49e7f] rounded-full blur-[150px] opacity-10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="text-center flex flex-col items-center max-w-5xl relative z-10"
      >
        <div className="overflow-hidden mb-8">
          <motion.span 
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="inline-block text-[10px] md:text-xs tracking-[0.3em] uppercase text-[#8b7355] font-semibold"
          >
            Phase 01 &mdash; The Foundation
          </motion.span>
        </div>

        <h1 className="text-5xl md:text-8xl lg:text-[7rem] font-display text-[#f4f3ef] leading-[1.1] tracking-tight mb-12">
          Establish the <span className="italic text-[#8b7355]">Nexus</span>
        </h1>

        <p className="text-base md:text-lg text-white/60 font-light max-w-2xl leading-relaxed mb-16">
          Deploy the subjective intelligence layer. A smart contract capable of semantic understanding, powered by consensus and native LLM evaluation.
        </p>

        <div className="flex flex-col items-center gap-6">
          {address && (
            <button 
              onClick={genLayer.disconnect}
              className="group px-4 py-2 rounded-full border border-[#8b7355]/30 bg-[#8b7355]/10 text-[10px] tracking-widest font-mono text-[#b49e7f] flex items-center justify-center gap-2 transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 hover-target min-w-[160px]"
            >
              <div className="w-2 h-2 rounded-full bg-[#8b7355] group-hover:bg-red-500 animate-pulse group-hover:animate-none" />
              <span className="group-hover:hidden">Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
              <span className="hidden group-hover:block font-sans uppercase tracking-[0.2em]">Disconnect</span>
            </button>
          )}

          <button
            onClick={onDeploy}
            disabled={isDeploying}
            className="luxury-button"
          >
            {isDeploying ? 'Initializing Intelligence...' : (!address ? 'Connect Wallet' : 'Deploy Contract')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
