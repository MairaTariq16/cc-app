'use client';

import { useState } from 'react';
import type { HashResponse, CompressionFormat } from '@/types';


export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [hashResults, setHashResults] = useState<HashResponse>([]);
  const [format, setFormat] = useState<CompressionFormat>('zip');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    setLoading(true);
    setError('');
    setHashResults([]);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/hash', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to hash files');
      }

      const data: HashResponse = await response.json();
      setHashResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCompress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) return;

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/compress?format=${format}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to compress files');
      }

      // Create a download link from the streaming response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = format === 'zip' ? 'zip' : 'tar.gz';
      a.download = `compressed-files-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">File Processing Demo</h1>
        
        <form className="space-y-4">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                onChange={(e) => setFiles(e.target.files)}
                className="w-full"
                accept="*/*"
                multiple
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Compression Format:</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as CompressionFormat)}
                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="zip">ZIP</option>
                <option value="tar.gz">TAR.GZ</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleHash}
              disabled={!files || files.length === 0 || loading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Calculate Hashes'}
            </button>

            <button
              type="button"
              onClick={handleCompress}
              disabled={!files || files.length === 0 || loading}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Download Compressed
            </button>
          </div>
        </form>

        {files && files.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
            {files.length} file{files.length === 1 ? '' : 's'} selected
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {hashResults.length > 0 && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg space-y-2">
            <h2 className="text-xl font-semibold mb-4">Hash Results</h2>
            {hashResults.map((result, index) => (
              <div key={index} className="py-4 border-b last:border-b-0">
                <p><span className="font-medium">Original Name:</span> {result.originalName}</p>
                <p><span className="font-medium">File Hash (SHA-256):</span> {result.hash}</p>
                <p><span className="font-medium">File Size:</span> {Math.round(result.size / 1024)} KB</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
