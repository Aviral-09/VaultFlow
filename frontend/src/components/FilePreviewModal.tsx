import React, { useState, useEffect } from 'react';
import type { FileItem } from '../types';
import { api } from '../lib/api';
import { formatBytes, getProviderMeta } from '../lib/utils';
import { X, Download, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface FilePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [textError, setTextError] = useState(false);

  if (!file) return null;

  const mime = (file.mime_type || '').toLowerCase();
  const name = file.name || (file as any).file_name || 'Unnamed File';
  const previewUrl = api.files.getPreviewUrl(file.id);
  const downloadUrl = api.files.getDownloadUrl(file.id);
  const meta = getProviderMeta(file.provider);

  const isImage = mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(name);
  const isVideo = mime.startsWith('video/') || /\.(mp4|webm|mkv|mov)$/i.test(name);
  const isAudio = mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac)$/i.test(name);
  const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(name);
  const isText = mime.startsWith('text/') || mime === 'application/json' || /\.(txt|md|js|ts|tsx|json|html|css|py|sh|yaml|yml)$/i.test(name);

  // Load text content if file is text/code
  useEffect(() => {
    if (isText) {
      setLoadingText(true);
      setTextError(false);
      fetch(previewUrl, { credentials: 'include' })
        .then((res) => {
          if (!res.ok) throw new Error('Preview stream failed');
          return res.text();
        })
        .then((text) => setTextContent(text.slice(0, 100000))) // limit preview to 100kb
        .catch(() => setTextError(true))
        .finally(() => setLoadingText(false));
    }
  }, [file.id, isText, previewUrl]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white border-2 border-black shadow-[10px_10px_0px_#000] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#FEF08A] border-b-2 border-black px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden mr-4">
            <span className={`neo-badge ${meta.badgeBg} text-black text-[10px] shrink-0`}>
              {meta.name}
            </span>
            <span className="font-['Space_Grotesk_Variable'] font-black text-base text-black truncate">
              {name}
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
              ({formatBytes(file.size)})
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={downloadUrl}
              download={name}
              className="neo-btn bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center hover:bg-rose-100 font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Preview Canvas */}
        <div className="flex-1 overflow-auto bg-[#FAFAF8] p-4 flex items-center justify-center min-h-[360px]">
          {isImage ? (
            <img
              src={previewUrl}
              alt={name}
              className="max-w-full max-h-[70vh] object-contain border-2 border-black shadow-[4px_4px_0px_#000]"
            />
          ) : isVideo ? (
            <video
              controls
              autoPlay
              src={previewUrl}
              className="max-w-full max-h-[70vh] border-2 border-black shadow-[4px_4px_0px_#000] bg-black"
            />
          ) : isAudio ? (
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-8 flex flex-col items-center max-w-md w-full">
              <div className="w-16 h-16 bg-[#DDD6FE] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <p className="font-bold text-sm mb-4 text-center truncate w-full">{name}</p>
              <audio controls src={previewUrl} className="w-full" />
            </div>
          ) : isPdf ? (
            <iframe
              src={previewUrl}
              title={name}
              className="w-full h-[70vh] border-2 border-black shadow-[4px_4px_0px_#000]"
            />
          ) : isText ? (
            <div className="w-full h-full max-h-[70vh] flex flex-col bg-white border-2 border-black shadow-[4px_4px_0px_#000] overflow-hidden">
              <div className="bg-slate-100 border-b border-black px-4 py-2 font-mono text-xs font-bold text-slate-700 flex justify-between">
                <span>Direct Code / Text Viewer</span>
                <span>{mime}</span>
              </div>
              <div className="p-4 overflow-auto flex-1 font-mono text-xs leading-relaxed">
                {loadingText ? (
                  <div className="flex items-center gap-2 text-slate-500 py-8 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading stream content...</span>
                  </div>
                ) : textError ? (
                  <div className="text-rose-600 font-bold p-4 text-center">
                    Failed to read text stream from provider.
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap select-text">{textContent}</pre>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-8 text-center max-w-md">
              <div className="w-12 h-12 bg-amber-100 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-amber-700" />
              </div>
              <h4 className="font-['Space_Grotesk_Variable'] font-black text-lg text-black mb-1">
                Direct In-Browser Preview Not Available
              </h4>
              <p className="text-xs font-mono text-slate-600 mb-6">
                This file type ({mime || 'binary'}) cannot be displayed inline. You can download it directly from your provider.
              </p>
              <a
                href={downloadUrl}
                download={name}
                className="neo-btn neo-btn-primary px-5 py-2.5 text-sm font-bold shadow-[3px_3px_0px_#000] inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Original File
              </a>
            </div>
          )}
        </div>

        {/* Modal Status Footer */}
        <div className="bg-slate-100 border-t-2 border-black px-5 py-2 flex items-center justify-between font-mono text-[11px] text-slate-600 font-bold">
          <span>Streaming directly via adapter pipeline</span>
          <span>Security: Active User Session</span>
        </div>
      </div>
    </div>
  );
};
