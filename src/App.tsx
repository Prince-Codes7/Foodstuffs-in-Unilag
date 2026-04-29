/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Utensils, RefreshCw, Trophy, ChefHat, MapPin, Info } from 'lucide-react';

const FOOD_SPOTS = [
  { name: 'Jaja', color: '#800000', secondary: '#FFD700' }, // UNILAG Maroon
  { name: 'New Hall Amala', color: '#FFD700', secondary: '#800000' }, // UNILAG Gold
  { name: 'Korede Spaghetti', color: '#2D3436', secondary: '#FAB1A0' }, // Modern Dark
  { name: 'Faculty of Arts', color: '#E17055', secondary: '#FFFFFF' }, // Coral
  { name: 'Cook Indomie', color: '#00B894', secondary: '#FFFFFF' }, // Emerald
];

export default function App() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<null | typeof FOOD_SPOTS[0]>(null);
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    // Randomize rotation: at least 5-10 full spins plus a random angle
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomAngle = Math.floor(Math.random() * 360);
    const newRotation = rotation + (extraSpins * 360) + randomAngle;
    
    setRotation(newRotation);

    // Transition for the spin
    await controls.start({
      rotate: newRotation,
      transition: {
        duration: 4,
        ease: [0.1, 0, 0, 1], // Custom easing for realistic slowdown
      }
    });

    // Calculate winning index
    // The "pointer" is at the top (0 degrees or 360)
    // The wheel rotates clockwise.
    // The actual angle relative to the top is (totalRotation % 360)
    // However, SVG paths are drawn relative to 0.
    // Let's adjust for the fact that index 0 starts at 0 deg.
    const normalizedRotation = newRotation % 360;
    const sliceAngle = 360 / FOOD_SPOTS.length;
    
    // The pointer is at 0 degrees. If we rotate the wheel clockwise by R, 
    // the slice at the pointer is (360 - R % 360) / sliceAngle.
    const winningIndex = Math.floor(((360 - normalizedRotation) % 360) / sliceAngle);
    setWinner(FOOD_SPOTS[winningIndex]);
    setIsSpinning(false);
  };

  const reset = () => {
    setWinner(null);
    controls.set({ rotate: rotation % 360 });
    setRotation(rotation % 360);
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] pattern-grid"></div>
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12 z-10"
      >
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400 mb-2 block">Decision Maker</span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#800000] font-display">
          UNILAG <span className="text-[#FFD700]">FOOD</span> WHEEL
        </h1>
        <p className="mt-2 text-neutral-500 max-w-xs mx-auto">Can't decide where to eat? Let destiny take the wheel.</p>
      </motion.div>

      {/* Main Wheel Container */}
      <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center z-10">
        {/* Pointer */}
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-30 drop-shadow-lg">
          <motion.div 
            animate={isSpinning ? { rotate: [-5, 5, -5] } : {}}
            transition={{ repeat: Infinity, duration: 0.1 }}
            className="w-10 h-12 bg-white flex items-center justify-center rounded-b-2xl border-2 border-neutral-100 shadow-xl"
            id="pointer"
          >
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-red-600"></div>
          </motion.div>
        </div>

        {/* The Wheel */}
        <motion.div
          animate={controls}
          ref={wheelRef}
          className="w-full h-full rounded-full shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] bg-white border-[12px] border-white relative overflow-hidden flex items-center justify-center"
          id="wheel-outer"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
             {FOOD_SPOTS.map((spot, i) => {
               const angle = 360 / FOOD_SPOTS.length;
               const startAngle = i * angle;
               const endAngle = (i + 1) * angle;
               
               // Calculate path for slice
               const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
               const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
               const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
               const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
               
               const largeArc = angle > 180 ? 1 : 0;
               
               return (
                 <g key={spot.name}>
                   <path 
                     d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                     fill={spot.color}
                     className="transition-colors duration-300"
                   />
                   <text
                     x="75"
                     y="50"
                     transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                     fill={spot.secondary}
                     fontSize="3.5"
                     fontWeight="900"
                     textAnchor="middle"
                     className="select-none pointer-events-none uppercase tracking-wider"
                     style={{ dominantBaseline: 'middle' }}
                   >
                     {spot.name}
                   </text>
                 </g>
               );
             })}
          </svg>
          
          {/* Inner Circle Decoration */}
          <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full shadow-inner flex items-center justify-center border-4 border-neutral-50 z-20">
             <Utensils className="w-5 h-5 text-neutral-300" />
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="mt-16 flex flex-col items-center gap-6 z-10 w-full max-w-md">
        <button
          id="spin-button"
          onClick={spin}
          disabled={isSpinning}
          className={`
            w-full py-5 rounded-3xl font-black text-xl uppercase tracking-widest shadow-2xl
            transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3
            ${isSpinning 
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' 
              : 'bg-[#800000] text-white hover:bg-[#a00000] hover:shadow-[0_20px_50px_rgba(128,0,0,0.3)]'
            }
          `}
        >
          {isSpinning ? (
            <>
              <RefreshCw className="animate-spin w-6 h-6" />
              Spinning...
            </>
          ) : (
            'Spin to Eat'
          )}
        </button>

        <div className="flex gap-4">
           <button 
             onClick={reset}
             className="text-neutral-400 hover:text-neutral-600 p-2 transition-colors flex items-center gap-2 text-sm font-medium"
           >
             <RefreshCw className="w-4 h-4" /> Reset
           </button>
        </div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {winner && !isSpinning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-[40px] p-8 md:p-12 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
              id="winner-popup"
            >
              {/* Confetti-like decoration background */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundColor: winner.color }}
              ></div>

              <div className="bg-neutral-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Trophy className="w-10 h-10" style={{ color: winner.color }} />
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">The Winner is</span>
              <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight" style={{ color: winner.color }}>
                {winner.name}
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-neutral-500 justify-content">
                  <div className="w-full h-px bg-neutral-200"></div>
                  <div className="p-2 bg-neutral-50 rounded-full">
                    {winner.name === 'Cook Indomie' ? <ChefHat size={18} /> : <MapPin size={18} />}
                  </div>
                  <div className="w-full h-px bg-neutral-200"></div>
                </div>
                <p className="text-neutral-600 font-medium">
                  {winner.name === 'Cook Indomie' 
                    ? "Hope you have gas and noodles! Or hit up the buttery." 
                    : `Head over to ${winner.name} for a great meal.`}
                </p>
              </div>

              <button
                onClick={() => setWinner(null)}
                className="w-full py-4 rounded-2xl font-bold bg-neutral-900 text-white hover:bg-black transition-all"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="mt-12 text-center text-neutral-400 flex items-center gap-2 z-10">
        <Info size={14} />
        <span className="text-xs font-medium uppercase tracking-widest">Akoka Pride • Est. 2024</span>
      </div>

      <style>{`
        .pattern-grid {
          background-image: 
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}
