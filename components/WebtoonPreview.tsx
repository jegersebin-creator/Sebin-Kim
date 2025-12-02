import React, { useEffect, useState } from 'react';
import { PanelData } from '../types';
import { stitchImagesVertically } from '../utils/imageUtils';

interface WebtoonPreviewProps {
  panels: PanelData[];
  isGenerating: boolean;
}

export const WebtoonPreview: React.FC<WebtoonPreviewProps> = ({ panels, isGenerating }) => {
  const [stitchedImage, setStitchedImage] = useState<string | null>(null);
  const [isStitching, setIsStitching] = useState(false);

  // Check if we have at least one image
  const hasImages = panels.some(p => p.imageData !== null);
  // Check if all requested generations are done (simple check: none are loading)
  const isAllDone = !isGenerating && hasImages;

  // Auto-stitch when all panels that have prompts are ready
  // However, to save resources, we might just show individual panels and stitch on demand or when fully complete.
  // For this UX, let's stitch whenever the panels change and are not loading, to give a live preview feel.
  useEffect(() => {
    if (hasImages && !isGenerating) {
        const performStitch = async () => {
            setIsStitching(true);
            try {
                // Filter only successful images for the preview
                const imagesToStitch = panels
                    .filter(p => p.imageData !== null)
                    .map(p => p.imageData as string);
                
                if (imagesToStitch.length > 0) {
                    const result = await stitchImagesVertically(imagesToStitch);
                    setStitchedImage(result);
                }
            } catch (e) {
                console.error("Stitching failed", e);
            } finally {
                setIsStitching(false);
            }
        };
        performStitch();
    }
  }, [panels, isGenerating, hasImages]);

  if (!hasImages) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 border-2 border-dashed border-slate-700 rounded-xl p-12 bg-slate-800/30">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>생성된 이미지가 여기에 표시됩니다.</p>
        <p className="text-xs mt-2">왼쪽 패널에 내용을 입력하고 생성을 시작하세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-200">미리보기 (Preview)</h3>
            {stitchedImage && (
                <a 
                    href={stitchedImage} 
                    download="nano-webtoon.jpg"
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    전체 다운로드
                </a>
            )}
        </div>
        
        <div className="flex flex-col items-center p-8 bg-slate-800/50 min-h-[500px]">
            {isGenerating && (
                <div className="mb-4 text-blue-400 text-sm animate-pulse flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                    이미지 생성 중입니다...
                </div>
            )}
            
            {/* 
              We display individual images stacked closely to mimic the webtoon strip 
              while the final canvas is being processed or if we just want to show progress.
              Ideally, we show the stitched image if available for a seamless look.
            */}
            {stitchedImage && !isGenerating && !isStitching ? (
                <img src={stitchedImage} alt="Full Webtoon" className="w-full max-w-md shadow-lg" />
            ) : (
                <div className="flex flex-col gap-0 w-full max-w-md shadow-lg">
                    {panels.map((panel) => (
                        panel.imageData ? (
                            <div key={panel.id} className="relative group">
                                <img src={panel.imageData} alt={`Panel ${panel.id}`} className="w-full block" />
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    #{panel.id}
                                </div>
                            </div>
                        ) : panel.isLoading ? (
                            <div key={panel.id} className="w-full aspect-square bg-slate-700 animate-pulse flex items-center justify-center text-slate-500 text-xs">
                                Panel {panel.id} Generating...
                            </div>
                        ) : null
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};