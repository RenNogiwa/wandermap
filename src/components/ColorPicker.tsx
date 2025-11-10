import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  return (
    <div className="relative inline-block">
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 cursor-pointer opacity-0 absolute inset-0"
        aria-label="Select color"
      />
      <div 
        className="w-8 h-8 rounded-full border-2 border-gray-200 hover:scale-105 transition-transform"
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default ColorPicker;