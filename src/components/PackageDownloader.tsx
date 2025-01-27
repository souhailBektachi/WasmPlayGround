import { useState, useEffect } from 'react';
import ClangService from '../services/clang';

const PackageDownloader = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const service = ClangService.getInstance();
    
    const handleProgress = (progress: number) => {
      setProgress(Math.round(progress));
      setIsDownloading(progress < 100);
      if (progress === 100) {
        setTimeout(() => setIsReady(true), 500); // Add delay to ensure initialization is complete
      }
    };
    
    service.onProgressUpdate = handleProgress;
    setIsReady(service.isReady());

    return () => {
      service.onProgressUpdate = undefined;
    };
  }, []);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setProgress(0);
      setError(null);
      setIsReady(false);
      
      await ClangService.getInstance().downloadAndInitialize();
    } catch (error) {
      console.error('Failed to download Clang:', error);
      setError(error instanceof Error ? error.message : 'Failed to download package');
      setIsReady(false);
    } finally {
      if (!error) {
        setProgress(100);
      }
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={isDownloading || isReady}
        className={`
          relative px-4 py-2 rounded-md text-sm font-medium text-white
          transition-all duration-200 shadow-lg
          flex items-center gap-2 overflow-hidden
          ${isReady 
            ? 'bg-gradient-to-r from-green-600 to-green-500 cursor-default' 
            : isDownloading 
              ? 'bg-gray-600 cursor-default' 
              : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 cursor-pointer hover:scale-105'
          }
        `}
      >
        {isDownloading && (
          <div 
            className="absolute top-0 bottom-0 left-0 transition-all duration-200 bg-blue-500/30"
            style={{ width: `${progress}%` }}
          />
        )}
        <div className="relative z-10 flex items-center gap-2">
          {isReady ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Package Ready</span>
            </>
          ) : isDownloading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{`Downloading ${progress}%`}</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Clang</span>
            </>
          )}
        </div>
      </button>
      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
    </div>
  );
};

export default PackageDownloader;
