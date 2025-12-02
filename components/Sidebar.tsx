import React, { useRef } from 'react';
import { WebtoonConfig } from '../types';
import { fileToBase64 } from '../utils/imageUtils';

interface SidebarProps {
  config: WebtoonConfig;
  setConfig: React.Dispatch<React.SetStateAction<WebtoonConfig>>;
  isGenerating: boolean;
  onGenerate: () => void;
  onClear: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, isGenerating, onGenerate, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const newImages: string[] = [];
        for (let i = 0; i < e.target.files.length; i++) {
            const base64 = await fileToBase64(e.target.files[i]);
            newImages.push(base64);
        }
        
        setConfig(prev => ({ 
            ...prev, 
            referenceImages: [...prev.referenceImages, ...newImages] 
        }));
      } catch (error) {
        console.error("Failed to read file", error);
      }
    }
    // Reset the input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setConfig(prev => ({ 
        ...prev, 
        referenceImages: prev.referenceImages.filter((_, index) => index !== indexToRemove) 
    }));
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 overflow-y-auto z-10">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          NanoToon
        </h1>
        <p className="text-xs text-slate-500 mt-1">AI Webtoon Generator</p>
      </div>

      <div className="p-6 flex-1 space-y-8">
        {/* Style Settings */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
            전역 설정 (Settings)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">화풍 / 분위기 (Art Style)</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="예: 흑백 만화, 수채화, 사이버펑크..."
                value={config.styleDescription}
                onChange={(e) => setConfig({ ...config, styleDescription: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Reference Image */}
        <div>
          <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider flex items-center gap-2">
            참조 이미지 (Reference)
            <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Img2Img</span>
          </h2>
          
          <div className="space-y-4">
             <div className="relative group">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="text-xs text-slate-400">클릭하여 이미지 추가 (여러장 가능)</p>
                    </div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      multiple 
                      onChange={handleImageUpload} 
                    />
                  </label>
             </div>

             {/* Image Grid */}
             {config.referenceImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {config.referenceImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 aspect-square">
                            <img 
                                src={img} 
                                alt={`Reference ${idx + 1}`} 
                                className="w-full h-full object-cover"
                            />
                            <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition opacity-0 group-hover:opacity-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
             )}
             
             <p className="text-[10px] text-slate-500 leading-tight">
               * 캐릭터나 스타일을 유지하기 위해 여러 참조 이미지를 사용할 수 있습니다.
             </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2
              ${isGenerating 
                ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-900/20'
              }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                생성 중...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                웹툰 생성 (Generate)
              </>
            )}
          </button>
          
          <button
            onClick={onClear}
            disabled={isGenerating}
            className="w-full py-2 px-4 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
             초기화 (Reset)
          </button>
        </div>
      </div>
    </aside>
  );
};