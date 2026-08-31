import React, { useRef, useEffect, useState } from 'react';
import { Crown, Rotate3D } from 'lucide-react';

interface HeroRing3DProps {
  interactive?: boolean;
}

export const HeroRing3D: React.FC<HeroRing3DProps> = React.memo(({ interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const currentAngleRef = useRef(0);

  // Global window listeners for drag release & move
  useEffect(() => {
    if (!isDragging || !interactive) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      currentAngleRef.current += deltaX * 0.01;
      startXRef.current = e.clientX;
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
    window.addEventListener('touchend', handleWindowMouseUp);

    function handleWindowTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - startXRef.current;
        currentAngleRef.current += deltaX * 0.01;
        startXRef.current = touch.clientX;
      }
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowMouseUp);
    };
  }, [isDragging, interactive]);

  // 3D Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let autoAngle = currentAngleRef.current;

    const render = () => {
      if (!isDragging) {
        autoAngle += isHovered ? 0.008 : 0.015;
        currentAngleRef.current = autoAngle;
      }
      const angle = currentAngleRef.current;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radiusX = Math.min(width, height) * 0.32;
      const radiusY = radiusX * 0.42;

      ctx.clearRect(0, 0, width, height);

      // Radial background glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radiusX * 1.6);
      glowGrad.addColorStop(0, 'rgba(223, 183, 108, 0.22)');
      glowGrad.addColorStop(0.5, 'rgba(197, 155, 39, 0.08)');
      glowGrad.addColorStop(1, 'rgba(8, 24, 22, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw floating sparkles
      const time = Date.now() * 0.002;
      for (let i = 0; i < 6; i++) {
        const sparkAngle = time + i * (Math.PI / 3);
        const sparkDist = radiusX * (0.8 + 0.3 * Math.sin(time * 1.5 + i));
        const sx = centerX + Math.cos(sparkAngle) * sparkDist;
        const sy = centerY + Math.sin(sparkAngle) * (sparkDist * 0.5);
        const sparkAlpha = Math.max(0, Math.sin(time * 3 + i * 2));

        ctx.save();
        ctx.fillStyle = `rgba(255, 235, 175, ${sparkAlpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5 + sparkAlpha * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Calculate 3D perspective ellipse points
      const segments = 64;
      const bandWidth = 14;

      // 1. Back half of the ring
      ctx.save();
      ctx.lineWidth = bandWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Back Ring Gradient (Darker interior shadow)
      const backGrad = ctx.createLinearGradient(centerX - radiusX, centerY, centerX + radiusX, centerY);
      backGrad.addColorStop(0, '#8A6715');
      backGrad.addColorStop(0.5, '#5C440A');
      backGrad.addColorStop(1, '#8A6715');

      ctx.strokeStyle = backGrad;
      ctx.beginPath();
      for (let i = 0; i <= segments / 2; i++) {
        const theta = angle + Math.PI + (i / (segments / 2)) * Math.PI;
        const x = centerX + Math.cos(theta) * radiusX;
        const y = centerY + Math.sin(theta) * radiusY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // 2. Solitaire Diamond Crown (Mounted on top edge of back/front intersection)
      const diamondTheta = angle - Math.PI / 2;
      const diamondX = centerX + Math.cos(diamondTheta) * radiusX;
      const diamondY = centerY + Math.sin(diamondTheta) * radiusY - 8;

      // 3. Front half of the ring (Brilliant 22K Gold Luster)
      ctx.save();
      ctx.lineWidth = bandWidth;
      ctx.lineCap = 'round';

      const frontGrad = ctx.createLinearGradient(
        centerX - radiusX + Math.sin(angle) * 30,
        centerY - radiusY,
        centerX + radiusX - Math.sin(angle) * 30,
        centerY + radiusY
      );
      frontGrad.addColorStop(0, '#DFB76C');
      frontGrad.addColorStop(0.2, '#FFEBB5');
      frontGrad.addColorStop(0.4, '#C59B27');
      frontGrad.addColorStop(0.7, '#996515');
      frontGrad.addColorStop(0.9, '#FCE8A2');
      frontGrad.addColorStop(1, '#DFB76C');

      ctx.strokeStyle = frontGrad;
      ctx.beginPath();
      for (let i = 0; i <= segments / 2; i++) {
        const theta = angle + (i / (segments / 2)) * Math.PI;
        const x = centerX + Math.cos(theta) * radiusX;
        const y = centerY + Math.sin(theta) * radiusY;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Inner highlight rim
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      for (let i = 0; i <= segments / 2; i++) {
        const theta = angle + (i / (segments / 2)) * Math.PI;
        const x = centerX + Math.cos(theta) * (radiusX - 4);
        const y = centerY + Math.sin(theta) * (radiusY - 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // 4. Draw Solitaire Diamond Setting & Prong Claws
      ctx.save();
      ctx.translate(diamondX, diamondY);

      // Gold Prong Base
      ctx.fillStyle = '#C59B27';
      ctx.beginPath();
      ctx.ellipse(0, 4, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Prongs
      ctx.fillStyle = '#FFEBB5';
      ctx.fillRect(-8, -2, 3, 7);
      ctx.fillRect(5, -2, 3, 7);

      // Faceted Diamond (Brilliant Cut Top Silhouette)
      const dSize = 16;
      ctx.beginPath();
      // Table / Crown top
      ctx.moveTo(-dSize * 0.7, -dSize * 0.4);
      ctx.lineTo(dSize * 0.7, -dSize * 0.4);
      // Upper Girdle
      ctx.lineTo(dSize, 0);
      // Culet / Pavilion point
      ctx.lineTo(0, dSize * 0.8);
      // Left girdle
      ctx.lineTo(-dSize, 0);
      ctx.closePath();

      // Diamond Refraction Gradient
      const diamondGrad = ctx.createLinearGradient(-dSize, -dSize, dSize, dSize);
      diamondGrad.addColorStop(0, '#FFFFFF');
      diamondGrad.addColorStop(0.3, '#E0F2FE');
      diamondGrad.addColorStop(0.6, '#FDF2F8');
      diamondGrad.addColorStop(0.8, '#F0FDFA');
      diamondGrad.addColorStop(1, '#FFFFFF');

      ctx.fillStyle = diamondGrad;
      ctx.fill();

      // Facet Lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.7)';
      ctx.beginPath();
      // Table facet
      ctx.moveTo(-dSize * 0.45, -dSize * 0.4);
      ctx.lineTo(0, 0);
      ctx.lineTo(dSize * 0.45, -dSize * 0.4);
      // Pavilion facet lines
      ctx.moveTo(-dSize, 0);
      ctx.lineTo(0, dSize * 0.8);
      ctx.lineTo(dSize, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, dSize * 0.8);
      ctx.stroke();

      // Diamond Light Glint / Flare
      const flarePulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
      if (flarePulse > 0.3) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flarePulse})`;
        ctx.beginPath();
        ctx.arc(0, -dSize * 0.3, 3 * flarePulse, 0, Math.PI * 2);
        ctx.fill();

        // Cross rays
        ctx.strokeStyle = `rgba(255, 255, 255, ${flarePulse * 0.9})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-8 * flarePulse, -dSize * 0.3);
        ctx.lineTo(8 * flarePulse, -dSize * 0.3);
        ctx.moveTo(0, -dSize * 0.3 - 8 * flarePulse);
        ctx.lineTo(0, -dSize * 0.3 + 8 * flarePulse);
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!interactive || e.touches.length === 0) return;
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas */}
      <div className="relative group cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          width={280}
          height={220}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="w-[240px] h-[190px] sm:w-[280px] sm:h-[220px] filter drop-shadow-[0_10px_25px_rgba(223,183,108,0.3)] transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover / Touch Hint Badge */}
        <div className="absolute bottom-1 inset-x-0 flex justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#DFB76C] bg-[#081816]/90 border border-[#C59B27]/40 px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-md opacity-85 group-hover:opacity-100 transition">
            <Rotate3D className="w-3 h-3 text-[#DFB76C] animate-spin" />
            <span>3D Interactive • Drag to Orbit</span>
          </span>
        </div>
      </div>

      {/* Ring Metadata & Hallmarking */}
      <div className="mt-1 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#E8D5B5] font-serif-luxury font-bold">
          <Crown className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>The Imperial Solitaire • 18KT &amp; VVS1</span>
        </div>
        <div className="text-[10px] text-stone-400 font-sans-modern flex items-center justify-center gap-2 mt-0.5">
          <span>BIS 916 Hallmark</span>
          <span>•</span>
          <span>HUID DLX916SOL01</span>
        </div>
      </div>
    </div>
  );
});

HeroRing3D.displayName = 'HeroRing3D';
