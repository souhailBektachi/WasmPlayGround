import { useState, useEffect } from 'react';
import ClangService from '../services/clang';

const PackageDownloader = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const service = ClangService.getInstance();
    setIsReady(service.isReady());
  }, []);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await ClangService.getInstance().downloadAndInitialize();
      setIsReady(true);
    } catch (error) {
      console.error('Failed to download Clang:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading || isReady}
      className={`
        px-4 py-2 rounded-md text-sm font-medium text-white
        transition-all duration-200 shadow-lg
        flex items-center gap-2
        ${isReady 
          ? 'bg-gradient-to-r from-green-600 to-green-500 cursor-default' 
          : isDownloading 
            ? 'bg-gray-600 cursor-default' 
            : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 cursor-pointer hover:scale-105'
        }
      `}
    >
      {isReady ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Package Ready</span>
        </>
      ) : isDownloading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Downloading...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Clang</span>
        </>
      )}
    </button>
  );
};

export default PackageDownloader;
