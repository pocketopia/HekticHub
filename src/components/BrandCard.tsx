
import React from 'react';
import { Brand } from '../types';
import { BRAND_ICONS } from '../constants';
import { Code } from 'lucide-react';

interface BrandCardProps {
  brand: Brand;
  onClick: (brand: Brand) => void;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, onClick }) => {
  return (
    <button
      onClick={() => onClick(brand)}
      className="group relative aspect-square sm:aspect-auto sm:h-64 overflow-hidden rounded-xl glass-card transition-all duration-500 hover:scale-[1.02] hover:red-border-glow text-left"
    >
      {brand.imageUrl && (
        <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
          <img 
            src={brand.imageUrl} 
            alt={brand.name} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 sm:via-black/70 to-transparent" />
        </div>
      )}
      
      <div className="relative z-10 p-2 sm:p-6 h-full flex flex-col justify-end">
        <div 
          className="mb-1 sm:mb-3 p-1 sm:p-2 w-fit rounded-lg glass-card transition-colors duration-300"
          style={{ color: brand.theme.accent }}
        >
          {/* Fallback and responsive sizing for icons */}
          {React.cloneElement((BRAND_ICONS[brand.id] || <Code />) as React.ReactElement, {
            className: "w-3 h-3 sm:w-6 sm:h-6"
          })}
        </div>
        <h3 className="font-futuristic text-xs sm:text-lg font-black uppercase tracking-widest text-white mb-0.5 sm:mb-1 group-hover:text-red-500 transition-colors duration-300">
          {brand.name}
        </h3>
        <p className="text-[8px] sm:text-xs text-gray-400 font-medium uppercase tracking-tighter line-clamp-1">
          {brand.description}
        </p>
      </div>

      <div 
        className="absolute top-0 left-0 w-0.5 h-0 bg-red-600 transition-all duration-500 group-hover:h-full" 
        style={{ backgroundColor: brand.theme.accent }}
      />
    </button>
  );
};
