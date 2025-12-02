import React, { useState } from 'react';
import { PanelData, WebtoonConfig } from './types';
import { Sidebar } from './components/Sidebar';
import { PanelInput } from './components/PanelInput';
import { WebtoonPreview } from './components/WebtoonPreview';
import { generatePanelImage } from './services/geminiService';
import { createBlankBase64Image } from './utils/imageUtils';

const INITIAL_PANEL_COUNT = 20;

const createInitialPanels = (): PanelData[] => 
  Array.from({ length: INITIAL_PANEL_COUNT }, (_, i) => ({
    id: i + 1,
    prompt: '',
    imageData: null,
    isLoading: false,
    error: null,
  }));

export default function App() {
  const [panels, setPanels] = useState<PanelData[]>(createInitialPanels());
  const [config, setConfig] = useState<WebtoonConfig>({
    referenceImages: [],
    styleDescription: 'Korean Webtoon Style, High Quality, Detailed'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePromptChange = (id: number, text: string) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, prompt: text } : p));
  };

  const updatePanelState = (id: number, updates: Partial<PanelData>) => {
    setPanels(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleGeneratePanel = async (panel: PanelData) => {
    updatePanelState(panel.id, { isLoading: true, error: null });

    // If prompt is empty, generate a white blank image immediately
    if (!panel.prompt.trim()) {
        try {
            // Default size 1024x1024 to match standard generation roughly
            const blankImage = createBlankBase64Image(1024, 1024);
            updatePanelState(panel.id, { isLoading: false, imageData: blankImage });
        } catch (e) {
            updatePanelState(panel.id, { isLoading: false, error: "Failed to create blank image" });
        }
        return;
    }

    try {
      const imageUrl = await generatePanelImage({
        prompt: panel.prompt,
        referenceImagesBase64: config.referenceImages,
        styleDescription: config.styleDescription,
        panelIndex: panel.id - 1
      });
      updatePanelState(panel.id, { isLoading: false, imageData: imageUrl });
    } catch (error: any) {
      updatePanelState(panel.id, { isLoading: false, error: error.message || "Failed" });
    }
  };

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    
    // Process ALL panels. 
    // Empty prompts will become white images, filled prompts will use AI.
    const tasks = panels.map(p => handleGeneratePanel(p));

    await Promise.all(tasks);
    setIsGenerating(false);
  };

  const handleRetry = (id: number) => {
    const panel = panels.find(p => p.id === id);
    if (panel) handleGeneratePanel(panel);
  };

  const handleClear = () => {
    if (window.confirm("모든 내용을 초기화하시겠습니까?")) {
        setPanels(createInitialPanels());
        setConfig(prev => ({...prev, referenceImages: []}));
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar for Settings */}
      <Sidebar 
        config={config} 
        setConfig={setConfig} 
        isGenerating={isGenerating} 
        onGenerate={handleGenerateAll}
        onClear={handleClear}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">1</span>
              스토리보드 작성 (Storyboard)
            </h2>
            <div className="grid gap-4">
              {panels.map(panel => (
                <PanelInput 
                  key={panel.id} 
                  panel={panel} 
                  onChange={handlePromptChange} 
                  onRetry={handleRetry}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Preview & Result */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm">2</span>
              웹툰 결과물 (Result)
            </h2>
            <div className="sticky top-8">
                <WebtoonPreview panels={panels} isGenerating={isGenerating} />
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}