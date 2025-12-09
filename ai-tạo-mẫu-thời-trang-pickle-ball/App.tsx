import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ComparisonView } from './components/ComparisonView';
import { editImageWithGemini } from './services/geminiService';

const EXAMPLE_PROMPTS = [
  "Hai người mẫu nữ Việt Nam mặc chân váy trắng ngắn, tạo dáng trong studio sáng, nền trắng sạch. Ánh sáng mềm, phong cách chụp catalog thời trang, sắc nét. Giữ nguyên tư thế, biểu cảm; áo polo đồng phục giống mẫu mình gửi",
  "4 người mẫu nữ trẻ người Việt Nam tạo dáng chụp nhóm trong studio nền trắng. Tất cả mặc áo pickle ball giống như mẫu mình gửi Tất cả đều đứng, tạo dáng, cười tự nhiên, 2 người cầm vợt pickleball.Mọi người đều chân váy đen hoặc trắng đồng bộ. Ánh sáng studio chuyên nghiệp, bố cục chặt chẽ, phong cách chụp đồng phục thương hiệu cao cấp. Giữ nguyên tư thế và vị trí của từng người",
  "A group of 7 Việt Nam office staff posing in professional team photo styles. Keep the same faces and body proportions but vary the poses naturally: some people crossing arms, some with hands in pockets, some smiling confidently. Random camera angles (eye-level, slight low-angle, 3/4 angle). Random composition (casual standing formation). Studio lighting variations: softbox, rim light, key light — still clean and elegant. Ultra-realistic, 8K, corporate style, premium uniform catalog look.",
  "Change the outfit to a red summer dress",
  "Turn the image into a pencil sketch drawing",
  "1 nhân vật mẫu nữ Việt Nam mặc váy thể thao xếp ly màu trắng ngắn, cầm vợt pickleball đứng trong studio nền trắng đơn giản. Ánh sáng tự nhiên, mềm. Mẫu áo polo đồng phục giống mẫu mình gửi nhé."
];

function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  
  const [referenceImage, setReferenceImage] = useState<{ data: string, mimeType: string } | null>(null);

  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = useCallback((base64: string, type: string) => {
    setOriginalImage(base64);
    setMimeType(type);
    setGeneratedImage(null);
    setError(null);
  }, []);

  const handleReferenceSelected = useCallback((base64: string, type: string) => {
    setReferenceImage({ data: base64, mimeType: type });
  }, []);

  const clearReference = () => {
    setReferenceImage(null);
  }

  const handleGenerate = async () => {
    if (!originalImage || !prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await editImageWithGemini(
        originalImage, 
        mimeType, 
        prompt,
        referenceImage ? referenceImage : undefined
      );
      setGeneratedImage(result.imageData);
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating the image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `nano-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setOriginalImage(null);
    setReferenceImage(null);
    setGeneratedImage(null);
    setPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-brand-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Nano Studio
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <span className="hidden md:block text-xs font-mono text-slate-500 border border-slate-800 px-2 py-1 rounded">gemini-2.5-flash-image</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Intro / Empty State */}
        {!originalImage && (
          <div className="text-center mb-10 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Edit real life with <span className="text-brand-400">AI</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg mb-8">
              Upload an image and use natural language to add objects, change backgrounds, or apply artistic styles using Gemini 2.5 Flash.
            </p>
            
            <div className="max-w-2xl mx-auto">
              <ImageUploader onImageSelected={handleImageSelected} className="h-64" />
            </div>
          </div>
        )}

        {/* Workspace */}
        {originalImage && !generatedImage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {/* Left: Images */}
            <div className="flex flex-col gap-6">
               {/* Main Image */}
               <div className="flex flex-col gap-2">
                 <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-xl group">
                   <img src={originalImage} alt="Source" className="w-full h-auto object-cover max-h-[400px]" />
                   <button 
                    onClick={resetAll}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove and start over"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                   </button>
                 </div>
                 <p className="text-center text-sm text-slate-500">Source Image</p>
               </div>

               {/* Reference Image (Optional) */}
               <div className="flex flex-col gap-2 p-4 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Reference Image <span className="text-slate-500 font-normal">(Optional)</span></label>
                    {referenceImage && (
                       <button onClick={clearReference} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    )}
                  </div>
                  
                  {referenceImage ? (
                    <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-700 h-40 flex items-center justify-center">
                       <img src={referenceImage.data} alt="Reference" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <ImageUploader onImageSelected={handleReferenceSelected} className="h-32" />
                  )}
                  <p className="text-xs text-slate-500">Upload a style reference or object sample to guide the edit.</p>
               </div>
            </div>

            {/* Right: Controls */}
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What would you like to change?
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your edit, e.g., 'Change the background to a sunset beach' or 'Use the reference shirt pattern on the model'..."
                    className="w-full h-40 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none transition-shadow shadow-inner"
                  />
                   <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                    {prompt.length} chars
                   </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Try these prompts</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(p)}
                      className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 transition-colors text-left max-w-full truncate"
                      title={p}
                    >
                      {p.length > 50 ? p.substring(0, 50) + '...' : p}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                 <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                   <strong>Error:</strong> {error}
                 </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isLoading}
                className={`
                  w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all transform
                  ${!prompt.trim() || isLoading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-brand-600 hover:bg-brand-500 text-white hover:scale-[1.02] active:scale-[0.98]'}
                `}
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.683a1 1 0 0 1 .633.633l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684ZM13.949 13.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.683a1 1 0 0 1 .633.633l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L13.95 13.684Z" />
                    </svg>
                    Generate Edit
                  </>
                )}
              </button>
            </div>
            
             {isLoading && <LoadingOverlay message="Gemini is dreaming up your edit..." />}
          </div>
        )}

        {/* Results View */}
        {originalImage && generatedImage && (
          <div className="w-full max-w-6xl mx-auto">
             <div className="mb-6 flex items-center justify-between">
               <div>
                <h3 className="text-xl font-semibold text-white">Edit Complete</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-2xl truncate">"{prompt}"</p>
               </div>
             </div>
             
             <ComparisonView 
                originalImage={originalImage}
                generatedImage={generatedImage}
                onDownload={handleDownload}
                onClose={resetAll}
             />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 py-6 mt-12 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Powered by Google Gemini 2.5 Flash Image Model</p>
        </div>
      </footer>
    </div>
  );
}

export default App;