import React, { useState, useEffect } from 'react';
import { X, Camera, Box, RotateCcw, Smartphone } from 'lucide-react';
import { JewelryProduct } from '../types';

interface ArTryOnModalProps {
  product: JewelryProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArTryOnModal: React.FC<ArTryOnModalProps> = ({ product, isOpen, onClose }) => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsInitializing(true);
      // Simulate loading AR engine and 3D model
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
        <div className="text-white">
          <h3 className="font-serif-luxury text-lg font-bold">Virtual AR Try-On</h3>
          <p className="text-xs text-stone-300 opacity-80">{product.name}</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* AR Viewport */}
      <div className="flex-1 relative overflow-hidden bg-stone-900 flex items-center justify-center">
        {isInitializing ? (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-[#C59B27] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#DFB76C] font-mono text-xs uppercase tracking-widest">Initializing 3D Engine...</p>
            <p className="text-stone-400 text-xs">Loading {product.grossWeight}g {product.purity} model</p>
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            {/* Simulated AR Camera Feed background */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617325247661-675ab03407b3?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
            
            {/* The 3D Object */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-sm aspect-square bg-transparent flex items-center justify-center z-10 animate-[bounce_4s_infinite]">
              <img 
                src={product.images[0]} 
                alt="3D object" 
                className="w-full h-full object-contain filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]"
              />
            </div>
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 border-2 border-[#DFB76C]/30 m-8 rounded-3xl z-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#DFB76C] rounded-tl-3xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#DFB76C] rounded-tr-3xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#DFB76C] rounded-bl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#DFB76C] rounded-br-3xl"></div>
              
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#DFB76C]/50 animate-[scan_3s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/90 p-6 pb-8 border-t border-stone-800 flex justify-center gap-8 relative z-10">
        <button className="flex flex-col items-center gap-2 text-stone-400 hover:text-white transition group">
          <div className="p-4 rounded-full bg-stone-800 group-hover:bg-stone-700 transition">
            <RotateCcw className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Reset</span>
        </button>
        <button className="flex flex-col items-center gap-2 text-[#DFB76C] hover:text-[#E8D5B5] transition group">
          <div className="p-5 rounded-full bg-[#DFB76C]/20 border-2 border-[#DFB76C] group-hover:bg-[#DFB76C]/30 transition shadow-[0_0_15px_rgba(197,155,39,0.5)]">
            <Camera className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Capture</span>
        </button>
        <button className="flex flex-col items-center gap-2 text-stone-400 hover:text-white transition group">
          <div className="p-4 rounded-full bg-stone-800 group-hover:bg-stone-700 transition">
            <Box className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">3D Mode</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { transform: translateY(-150px); opacity: 0; }
          50% { transform: translateY(150px); opacity: 1; }
        }
      `}} />
    </div>
  );
};
