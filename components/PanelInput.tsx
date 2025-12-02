import React from 'react';
import { PanelData } from '../types';

interface PanelInputProps {
  panel: PanelData;
  onChange: (id: number, text: string) => void;
  onRetry: (id: number) => void;
}

export const PanelInput: React.FC<PanelInputProps> = ({ panel, onChange, onRetry }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md transition-colors hover:border-slate-600">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-bold text-slate-300">
          컷 {panel.id} (Panel {panel.id})
        </label>
        {panel.imageData && (
          <span className="text-xs text-green-400 font-semibold bg-green-400/10 px-2 py-0.5 rounded">
            완료 (Ready)
          </span>
        )}
        {panel.isLoading && (
          <span className="text-xs text-blue-400 font-semibold animate-pulse">
            생성 중... (Generating)
          </span>
        )}
      </div>
      
      <textarea
        className="w-full h-24 bg-slate-900 border border-slate-700 rounded p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder={`컷 ${panel.id}에 대한 장면 설명을 입력하세요...`}
        value={panel.prompt}
        onChange={(e) => onChange(panel.id, e.target.value)}
        disabled={panel.isLoading}
      />

      {panel.error && (
        <div className="mt-2 text-xs text-red-400 flex justify-between items-center">
          <span>Error: {panel.error}</span>
          <button 
            onClick={() => onRetry(panel.id)}
            className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition"
          >
            재시도
          </button>
        </div>
      )}
    </div>
  );
};