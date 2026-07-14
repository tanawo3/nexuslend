import React, { useState, useEffect, useRef } from 'react';
import { useGenLayer } from '../hooks/useGenLayer';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, ArrowRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Dashboard: React.FC<{ genLayer: ReturnType<typeof useGenLayer> }> = ({ genLayer }) => {
  const [poolAmount, setPoolAmount] = useState<string>('');
  const [poolConditions, setPoolConditions] = useState<string>('');
  const [activePoolId, setActivePoolId] = useState<string | null>(null);
  const [applicationPitch, setApplicationPitch] = useState<string>('');
  const [collateralAmount, setCollateralAmount] = useState<string>('');

  const { pools, applications, recentTransactions, network } = genLayer;
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    genLayer.fetchData();
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (!heroRef.current) return;
    
    // Smooth Parallax hero (Fixed overlap by parallaxing inner elements, not the container)
    const heroContent = heroRef.current.querySelector('.hero-content');
    gsap.to(heroContent, {
      yPercent: 50,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // Reveal cards
    const cards = document.querySelectorAll('.reveal-card');
    cards.forEach((card) => {
      gsap.fromTo(card, 
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [pools.length]);

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poolAmount || isNaN(Number(poolAmount)) || !poolConditions) return;
    await genLayer.createPool(Number(poolAmount), poolConditions);
    setPoolAmount('');
    setPoolConditions('');
  };

  const handleApply = async (e: React.FormEvent, poolId: string) => {
    e.preventDefault();
    if (!applicationPitch || !collateralAmount) return;
    await genLayer.applyForLoan(poolId, applicationPitch, BigInt(collateralAmount));
    setApplicationPitch('');
    setCollateralAmount('0');
    setActivePoolId(null);
  };

  const handleEvaluate = async (appId: string) => {
    await genLayer.evaluateApplication(appId);
  };

  const getExplorerUrl = (txHash: string) => {
    if (network === 'bradbury') return `https://explorer-bradbury.genlayer.com/transactions/${txHash}`;
    if (network === 'studionet') return `https://explorer-studio.genlayer.com/tx/${txHash}`;
    return `http://localhost:4000/transactions/${txHash}`;
  };

  const tvl = pools.reduce((acc, pool) => acc + (pool.status === 'ACTIVE' ? Number(pool.amount) : 0), 0);

  return (
    <div className="w-full flex flex-col" ref={containerRef}>
      
      {/* FIXED NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-50 mix-blend-difference pointer-events-none">
        <div className="text-[#f4f3ef] font-display text-2xl tracking-tighter pointer-events-auto">
          NX.
        </div>
        <div className="pointer-events-auto flex items-center gap-4">
          <button 
            onClick={async () => {
              localStorage.removeItem('nexuslend_contract_v1');
              localStorage.removeItem('GLOBAL_CONTRACT_ADDRESS');
              await genLayer.deployContract();
            }}
            disabled={genLayer.isDeploying}
            className="px-6 py-2 border border-[var(--accent)] rounded-full text-[10px] uppercase tracking-widest text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors hover-target"
          >
            {genLayer.isDeploying ? 'Deploying...' : 'Deploy Contract'}
          </button>

          {!genLayer.address ? (
            <button onClick={genLayer.connect} className="px-6 py-2 border border-[#f4f3ef]/30 rounded-full text-[10px] uppercase tracking-widest text-[#f4f3ef] hover:bg-[#f4f3ef] hover:text-black transition-colors hover-target">
              Connect Wallet
            </button>
          ) : (
            <button 
              onClick={genLayer.disconnect}
              className="group px-6 py-2 border border-[#b49e7f]/30 rounded-full bg-[#b49e7f]/10 text-[10px] uppercase tracking-widest text-[#b49e7f] flex items-center justify-center gap-2 transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 hover-target min-w-[140px]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#b49e7f] group-hover:bg-red-500 animate-pulse group-hover:animate-none" />
              <span className="group-hover:hidden">{genLayer.address.slice(0, 6)}...{genLayer.address.slice(-4)}</span>
              <span className="hidden group-hover:block">Disconnect</span>
            </button>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section ref={heroRef} className="h-screen w-full flex flex-col justify-between items-center relative px-6 z-0 overflow-hidden pt-32 pb-12">
        <div className="flex-1 flex flex-col justify-center items-center w-full hero-content">
          <div className="overflow-hidden mb-8 md:mb-12">
            <motion.span 
              initial={{ y: '100%' }} animate={{ y: '0%' }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block px-4 py-1.5 border border-[var(--border-color)] rounded-full text-[9px] md:text-[10px] tracking-widest uppercase"
            >
              Nexus AI Lending Protocol
            </motion.span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-[11rem] font-display leading-[0.9] tracking-tighter text-center"
          >
            Semantic <br/> <span className="italic text-[var(--accent)]">Consensus</span>
          </motion.h1>
        </div>

        {/* SCROLL INDICATOR (Outside hero-content so it doesn't get parallaxed or overlapped) */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 1 }}
          className="flex flex-col items-center gap-4 opacity-50 z-10"
        >
          <span className="text-[9px] md:text-[10px] tracking-widest uppercase">Scroll to Explore</span>
          <div className="w-[1px] h-12 md:h-24 bg-[var(--text-primary)]" />
        </motion.div>
      </section>

      {/* EDUCATIONAL EXPLANATION (EASY TO UNDERSTAND) */}
      <section className="w-full py-32 px-6 md:px-12 bg-[#050505] relative z-10 border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16 reveal-card">
          <div className="md:w-1/3">
            <span className="text-[10px] tracking-widest uppercase opacity-50 mb-4 block">How it Works</span>
            <h2 className="text-4xl md:text-5xl font-display tracking-tight leading-[1.1]">
              A lending protocol <br/> where <span className="text-[var(--accent)] italic">AI makes the rules.</span>
            </h2>
          </div>
          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="text-3xl font-display text-[var(--accent)] mb-4">01</div>
              <h3 className="text-xl font-display mb-2">For Investors</h3>
              <p className="text-sm opacity-70 font-light leading-relaxed">
                You provide the funds (USDC) and write the rules in plain English. For example: "Only lend to people building green energy projects in Africa." The AI reads your rules.
              </p>
            </div>
            <div>
              <div className="text-3xl font-display text-[var(--accent)] mb-4">02</div>
              <h3 className="text-xl font-display mb-2">For Borrowers</h3>
              <p className="text-sm opacity-70 font-light leading-relaxed">
                You apply for a loan by writing a pitch. You explain exactly why you need the money, what you are building, and why you fit the investor's rules.
              </p>
            </div>
            <div className="md:col-span-2 border-t border-[var(--border-color)] pt-8 mt-4">
              <div className="text-3xl font-display text-[var(--accent)] mb-4">03</div>
              <h3 className="text-xl font-display mb-2">The AI Decision</h3>
              <p className="text-sm opacity-70 font-light leading-relaxed max-w-2xl">
                GenLayer's decentralized AI reads the borrower's pitch and compares it to the investor's rules. If the pitch matches the rules, the AI automatically approves the loan and sends the money. No banks, no human bias, just pure logic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS & TELEMETRY MARQUEE */}
      <section className="w-full border-y border-[var(--border-color)] bg-[var(--bg-primary)] relative z-20 py-16 px-6 md:px-12 flex flex-col md:flex-row justify-between gap-12">
        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-widest uppercase text-white/50">Total Value Locked</span>
          <span className="text-5xl md:text-7xl font-display">${tvl.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-widest uppercase text-white/50">Active Contexts</span>
          <span className="text-5xl md:text-7xl font-display">{pools.length}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-widest uppercase text-white/50">Inferences</span>
          <span className="text-5xl md:text-7xl font-display">{applications.length}</span>
        </div>
      </section>

      {/* RECENT TELEMETRY */}
      <section className="w-full py-24 px-6 md:px-12 bg-[#050505] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 border-b border-[var(--border-color)] pb-6">
            <h2 className="text-4xl md:text-6xl font-display tracking-tight">Telemetry</h2>
            <span className="text-xs tracking-[0.2em] uppercase opacity-50">Live Ledger</span>
          </div>
          
          <div className="flex flex-col">
            {recentTransactions.map((tx, i) => (
              <a 
                key={tx.hash} 
                href={getExplorerUrl(tx.hash)} 
                target="_blank" 
                rel="noreferrer"
                className="group flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-[var(--border-color)] hover:border-[var(--text-primary)] transition-colors hover-target"
              >
                <div className="flex items-center gap-8 mb-4 md:mb-0">
                  <span className="text-xs font-mono opacity-40">0{i + 1}</span>
                  <span className="text-xl md:text-3xl font-display">{tx.type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-8">
                  <span className="text-xs font-mono tracking-widest uppercase opacity-50">{tx.hash.slice(0, 16)}</span>
                  <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border ${tx.status === 'success' ? 'border-[#b49e7f] text-[#b49e7f]' : tx.status === 'pending' ? 'border-white/20 text-white/50' : 'border-red-500 text-red-500'}`}>
                    {tx.status}
                  </span>
                  <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </a>
            ))}
            {recentTransactions.length === 0 && (
              <div className="py-24 text-center text-sm tracking-widest uppercase opacity-30">No recent transactions</div>
            )}
          </div>
        </div>
      </section>

      {/* CREATE POOL SECTION */}
      <section className="w-full py-32 px-6 md:px-12 bg-[#f4f3ef] text-[#050505] relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 reveal-card">
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-6 block">Capital Deployment</span>
              <h2 className="text-5xl md:text-7xl font-display leading-[0.9] tracking-tighter mb-8">
                Initialize <br/> <span className="italic">Contract</span>
              </h2>
              <p className="text-base md:text-lg opacity-70 font-light max-w-md">
                Deploy capital bound by semantic logic. Define the subjective rules under which your liquidity can be utilized by external agents.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleCreatePool} className="flex flex-col gap-8 pt-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-widest uppercase opacity-50">Amount (USDC)</label>
              <input 
                type="number" 
                value={poolAmount}
                onChange={(e) => setPoolAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent border-b border-[#050505]/20 py-4 text-3xl font-display focus:outline-none focus:border-[#050505] transition-colors hover-target"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-widest uppercase opacity-50">Semantic Ruleset</label>
              <textarea 
                value={poolConditions}
                onChange={(e) => setPoolConditions(e.target.value)}
                placeholder="Describe the subjective conditions..."
                className="w-full bg-transparent border-b border-[#050505]/20 py-4 text-xl md:text-2xl font-display focus:outline-none focus:border-[#050505] transition-colors resize-none min-h-[150px] hover-target"
                required
              />
            </div>
            <div className="pt-8">
              <button type="submit" className="relative overflow-hidden rounded-full border border-[#050505] px-10 py-5 text-xs font-semibold tracking-[0.2em] uppercase transition-colors duration-500 hover:bg-[#050505] hover:text-[#f4f3ef] hover-target w-full md:w-auto">
                Execute Deployment
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ACTIVE MARKETS */}
      <section className="w-full py-32 px-6 md:px-12 bg-[var(--bg-primary)] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-32">
          
          <div className="flex justify-between items-end border-b border-[var(--border-color)] pb-6 reveal-card">
            <h2 className="text-4xl md:text-6xl font-display tracking-tight">Active Contexts</h2>
            <button onClick={genLayer.fetchData} className="text-[10px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity hover-target">
              Sync State
            </button>
          </div>

          <div className="flex flex-col gap-32">
            {pools.map((pool, index) => {
              const poolApps = applications.filter(a => a.pool_id === pool.id);
              
              return (
                <div key={pool.id} className="reveal-card flex flex-col md:flex-row gap-16 border-t border-[var(--border-color)] pt-16 mt-[-16px]">
                  
                  {/* Left Column: Pool Identity */}
                  <div className="md:w-1/3 flex flex-col">
                    <span className="text-[10px] tracking-widest uppercase opacity-50 mb-4">Context ID: {pool.id}</span>
                    <h3 className="text-6xl md:text-8xl font-display tracking-tighter mb-8">${pool.amount}</h3>
                    <p className="text-base md:text-lg opacity-80 font-light leading-relaxed mb-12">
                      {pool.conditions}
                    </p>
                    <span className={`inline-flex px-4 py-2 text-[10px] tracking-[0.2em] uppercase border w-max ${pool.status === 'ACTIVE' ? 'border-[#b49e7f] text-[#b49e7f]' : 'border-[var(--border-color)] opacity-50'}`}>
                      {pool.status}
                    </span>
                  </div>

                  {/* Right Column: Applications & Inference */}
                  <div className="md:w-2/3 flex flex-col">
                    <AnimatePresence mode="wait">
                      {activePoolId !== pool.id ? (
                        <button 
                          onClick={() => setActivePoolId(pool.id)}
                          className="luxury-button w-full text-center hover-target mb-16"
                        >
                          Initialize Proposal
                        </button>
                      ) : (
                        <motion.form 
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          onSubmit={(e) => handleApply(e, pool.id)}
                          className="flex flex-col gap-6 mb-16 border border-[var(--border-color)] p-8 glass-panel"
                        >
                          <textarea 
                            value={applicationPitch}
                            onChange={(e) => setApplicationPitch(e.target.value)}
                            placeholder="Enter semantic pitch..."
                            className="w-full bg-transparent border-b border-[var(--border-color)] py-4 text-xl font-display focus:outline-none focus:border-[var(--accent)] transition-colors resize-none min-h-[100px] hover-target"
                            required
                          />
                          <input 
                            type="number"
                            value={collateralAmount}
                            onChange={(e) => setCollateralAmount(e.target.value)}
                            placeholder="Collateral Amount (GEN)"
                            className="w-full bg-transparent border-b border-[var(--border-color)] py-4 text-xl font-display focus:outline-none focus:border-[var(--accent)] transition-colors hover-target"
                            required
                          />
                          <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setActivePoolId(null)} className="px-6 py-4 text-xs tracking-widest uppercase opacity-50 hover:opacity-100 hover-target">Abort</button>
                            <button type="submit" className="flex-1 bg-[var(--text-primary)] text-[var(--bg-primary)] px-8 py-4 text-xs font-semibold tracking-widest uppercase hover:bg-[var(--accent)] transition-colors hover-target">Transmit</button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {poolApps.length > 0 && (
                      <div className="flex flex-col gap-8">
                        <span className="text-xs font-mono opacity-40 uppercase tracking-widest">State Transients ({poolApps.length})</span>
                        {poolApps.map(app => (
                          <div key={app.id} className="p-8 border border-[var(--border-color)] glass-panel flex flex-col gap-6 relative overflow-hidden">
                            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
                              <span className="text-[10px] tracking-widest uppercase opacity-50">App: {app.id}</span>
                              <span className={`text-[10px] tracking-widest uppercase font-bold ${app.status === 'APPROVED' ? 'text-[#b49e7f]' : app.status === 'PENDING_EVALUATION' ? 'text-white' : 'text-red-500/50'}`}>
                                {app.status.replace('_', ' ')}
                              </span>
                            </div>
                            
                            <p className="text-lg leading-relaxed font-light">{app.applicant_pitch}</p>
                            
                            {app.status === 'PENDING_EVALUATION' ? (
                              <button 
                                onClick={() => handleEvaluate(app.id)}
                                disabled={genLayer.isEvaluating}
                                className="luxury-button mt-4 w-max hover-target"
                              >
                                {genLayer.isEvaluating ? 'Evaluating Context...' : 'Run Consensus'}
                              </button>
                            ) : (
                              <div className="mt-4 p-6 bg-black/40 border-l-2 border-[#b49e7f]">
                                <span className="text-[10px] uppercase tracking-widest opacity-50 mb-4 block">Consensus Trace</span>
                                <p className="text-sm font-light leading-relaxed opacity-80 mb-4">{app.evaluation_reasoning}</p>
                                
                                {app.status === 'APPROVE' && (
                                  <div className="flex justify-between items-center border-t border-[var(--border-color)] pt-4 mt-4">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] uppercase tracking-widest opacity-50">Debt</span>
                                      <span className="text-xl font-display text-red-500">{app.debt?.toString() || '0'} GEN</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] uppercase tracking-widest opacity-50">Collateral</span>
                                      <span className="text-xl font-display text-green-500">{app.collateral?.toString() || '0'} GEN</span>
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={() => genLayer.repayLoan(app.id, BigInt(app.debt || 0))}
                                      className="luxury-button w-max hover-target"
                                    >
                                      Repay Loan
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )
            })}
            
            {pools.length === 0 && (
              <div className="py-32 text-center text-sm tracking-widest uppercase opacity-30 border-y border-[var(--border-color)]">
                No active contexts discovered
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-12 px-6 md:px-12 border-t border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-primary)] z-10 relative">
        <span className="text-[10px] tracking-widest uppercase opacity-50">Nexus Lending © 2026</span>
        <span className="text-[10px] tracking-widest uppercase opacity-50">GenLayer OS</span>
      </footer>

    </div>
  );
};
