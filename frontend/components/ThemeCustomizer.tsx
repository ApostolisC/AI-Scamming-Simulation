"use client";

import React, { useState } from 'react';
import { useTheme, ThemeVariant } from '@/contexts/ThemeContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, X } from 'lucide-react';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme, colorTheme, applyCustomColors } = useTheme();
  const [customPrimary, setCustomPrimary] = useState('');
  const [customSidebar, setCustomSidebar] = useState('');

  const themeOptions: { value: ThemeVariant; label: string; preview: string }[] = [
    { value: 'default', label: 'Default (Indigo)', preview: 'rgb(99, 102, 241)' },
    { value: 'dark', label: 'Dark (Slate)', preview: 'rgb(31, 41, 55)' },
    { value: 'purple', label: 'Purple', preview: 'rgb(147, 51, 234)' },
    { value: 'green', label: 'Green', preview: 'rgb(34, 197, 94)' },
    { value: 'orange', label: 'Orange', preview: 'rgb(249, 115, 22)' },
    { value: 'pink', label: 'Pink', preview: 'rgb(236, 72, 153)' },
    { value: 'cyan', label: 'Cyan', preview: 'rgb(6, 182, 212)' }
  ];

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r}, ${g}, ${b}`;
    }
    return '';
  };

  const handleCustomColorApply = () => {
    const customColors: any = {};
    
    if (customPrimary) {
      const rgbPrimary = hexToRgb(customPrimary);
      if (rgbPrimary) {
        customColors.primary = rgbPrimary;
        customColors.secondary = rgbPrimary; // Use same for secondary
      }
    }
    
    if (customSidebar) {
      const rgbSidebar = hexToRgb(customSidebar);
      if (rgbSidebar) {
        customColors.sidebar = rgbSidebar;
      }
    }
    
    if (Object.keys(customColors).length > 0) {
      applyCustomColors(customColors);
    }
  };

  const resetToDefaults = () => {
    applyCustomColors({});
    setCustomPrimary('');
    setCustomSidebar('');
  };

  if (!isOpen) return null;

  return (
    <div className="theme-customizer-modal fixed inset-0 bg-opacity-80 flex items-center justify-center z-50">
      <Card className="theme-customizer-card w-96 max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme Customizer
            </h2>
            <Button onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Theme Presets */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Theme Presets</h3>
            <div className="grid grid-cols-2 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    currentTheme === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: option.preview }}
                  />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Custom Colors</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="primary-color" className="block text-sm font-medium mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    id="primary-color"
                    type="color"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customPrimary}
                    onChange={(e) => setCustomPrimary(e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1 px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sidebar-color" className="block text-sm font-medium mb-2">
                  Sidebar Color
                </label>
                <div className="flex gap-2">
                  <input
                    id="sidebar-color"
                    type="color"
                    value={customSidebar}
                    onChange={(e) => setCustomSidebar(e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customSidebar}
                    onChange={(e) => setCustomSidebar(e.target.value)}
                    placeholder="#1e293b"
                    className="flex-1 px-3 py-2 border rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleCustomColorApply}>
                Apply Custom Colors
              </Button>
              <Button onClick={resetToDefaults} className="bg-gray-500 hover:bg-gray-600">
                Reset to Default
              </Button>
            </div>
          </div>

          {/* Current Theme Preview */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-3">Current Theme</h3>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: `rgb(${colorTheme.primary})` }}
                  title="Primary"
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: `rgb(${colorTheme.secondary})` }}
                  title="Secondary"
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: `rgb(${colorTheme.accent})` }}
                  title="Accent"
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: `rgb(${colorTheme.sidebar || colorTheme.primary})` }}
                  title="Sidebar"
                />
              </div>
              <span className="text-sm text-gray-600">
                {currentTheme} theme
              </span>
            </div>
          </div>

          {/* Server Status Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Server Status Colors</h3>
            <div className="flex gap-2">
              <span
                className="px-2 py-1 rounded text-white text-xs"
                style={{ backgroundColor: `rgb(${colorTheme.serverStatus.connected})` }}
              >
                Connected
              </span>
              <span
                className="px-2 py-1 rounded text-white text-xs"
                style={{ backgroundColor: `rgb(${colorTheme.serverStatus.disconnected})` }}
              >
                Disconnected
              </span>
              <span
                className="px-2 py-1 rounded text-white text-xs"
                style={{ backgroundColor: `rgb(${colorTheme.serverStatus.checking})` }}
              >
                Checking
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ThemeCustomizer;
