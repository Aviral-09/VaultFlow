import React, { useState } from 'react';
import type { FileItem } from '../types';
import { api } from '../lib/api';
import { formatBytes, formatDate, getProviderMeta } from '../lib/utils';
import {
  Search,
  Grid,
  List,
  Star,
  Download,
  Eye,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  Folder,
  File,
  Sparkles,
  RefreshCw,
  MoreVertical,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';

interface FileBrowserProps {
  files: FileItem[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedProvider: string;
  onProviderChange: (p: string) => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onRefresh: () => void;
  onPreviewFile: (file: FileItem) => void;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({
  files,
  loading,
  searchQuery,
  onSearchChange,
  selectedProvider,
  onProviderChange,
  activeCategory,
  onCategoryChange,
  onRefresh,
  onPreviewFile,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const handleToggleStar = async (e: React.MouseEvent, file: FileItem) => {
    e.stopPropagation();
    try {
      const nextStar = !file.starred;
      await api.files.star(file.id, nextStar);
      file.starred = nextStar;
      toast.success(nextStar ? 'Added to starred' : 'Removed from starred');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update star');
    }
  };

  const handleRename = async (e: React.MouseEvent, file: FileItem) => {
    e.stopPropagation();
    const currentName = file.name || (file as any).file_name || '';
    const newName = prompt('Enter new filename:', currentName);
    if (!newName || newName.trim() === currentName) return;

    try {
      await api.files.rename(file.id, newName.trim());
      toast.success('File renamed');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to rename file');
    }
  };

  const handleDelete = async (e: React.MouseEvent, file: FileItem) => {
    e.stopPropagation();
    const name = file.name || (file as any).file_name || 'this file';
    if (!confirm(`Are you sure you want to delete "${name}" from ${file.provider}?`)) return;

    try {
      await api.files.delete(file.id);
      toast.success('File deleted from cloud');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete file');
    }
  };

  const getFileIcon = (file: FileItem) => {
    if (file.is_directory || (file as any).is_folder) {
      return <Folder className="w-5 h-5 text-amber-500 fill-amber-200" />;
    }
    const mime = (file.mime_type || '').toLowerCase();
    const name = (file.name || (file as any).file_name || '').toLowerCase();

    if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(name)) {
      return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    }
    if (mime.startsWith('video/') || /\.(mp4|webm|mkv|mov)$/i.test(name)) {
      return <Video className="w-5 h-5 text-blue-600" />;
    }
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac)$/i.test(name)) {
      return <Music className="w-5 h-5 text-purple-600" />;
    }
    if (mime.startsWith('text/') || /\.(ts|tsx|js|jsx|json|py|html|css|md|txt)$/i.test(name)) {
      return <Code className="w-5 h-5 text-rose-600" />;
    }
    return <FileText className="w-5 h-5 text-slate-600" />;
  };

  // Filter files by category and provider
  const filteredFiles = files.filter((file) => {
    const name = (file.name || (file as any).file_name || '').toLowerCase();
    const mime = (file.mime_type || '').toLowerCase();
    const prov = (file.provider || '').toLowerCase();

    if (selectedProvider !== 'all' && !prov.includes(selectedProvider)) {
      return false;
    }

    if (activeCategory === 'documents') {
      return mime.includes('pdf') || mime.includes('word') || mime.includes('document') || /\.(pdf|docx?|xlsx?|pptx?|txt)$/i.test(name);
    }
    if (activeCategory === 'media') {
      return mime.startsWith('image/') || mime.startsWith('video/') || mime.startsWith('audio/');
    }
    if (activeCategory === 'code') {
      return mime.includes('json') || mime.startsWith('text/') || /\.(ts|tsx|js|jsx|json|py|html|css|md|yaml|sh)$/i.test(name);
    }
    if (activeCategory === 'starred') {
      return Boolean(file.starred);
    }

    return true;
  });

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-6 space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b-2 border-black pb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search all connected drives by filename..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAFAF8] border-2 border-black font-mono text-sm focus:outline-none focus:bg-white shadow-[2px_2px_0px_#000]"
          />
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Provider Filter Dropdown */}
          <select
            value={selectedProvider}
            onChange={(e) => onProviderChange(e.target.value)}
            className="px-3 py-2 bg-[#FAFAF8] border-2 border-black font-mono text-xs font-bold shadow-[2px_2px_0px_#000] focus:outline-none cursor-pointer"
          >
            <option value="all">All Cloud Providers</option>
            <option value="google">Google Drive</option>
            <option value="onedrive">OneDrive</option>
            <option value="dropbox">Dropbox</option>
            <option value="mega">MEGA</option>
            <option value="pcloud">pCloud</option>
            <option value="s3">AWS S3</option>
          </select>

          {/* Grid vs Table View Mode */}
          <div className="flex items-center border-2 border-black shadow-[2px_2px_0px_#000]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 cursor-pointer ${viewMode === 'table' ? 'bg-[#FEF08A]' : 'bg-white hover:bg-slate-100'}`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 border-l-2 border-black cursor-pointer ${viewMode === 'grid' ? 'bg-[#FEF08A]' : 'bg-white hover:bg-slate-100'}`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="neo-btn bg-white hover:bg-slate-100 p-2 shadow-[2px_2px_0px_#000]"
            title="Refresh files"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Files' },
          { id: 'documents', label: 'Documents' },
          { id: 'media', label: 'Media & Photos' },
          { id: 'code', label: 'Code & Text' },
          { id: 'starred', label: 'Starred' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`neo-badge cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-black text-white'
                : 'bg-[#FAFAF8] text-black hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-black mb-3" />
          <p className="font-mono text-xs font-bold text-slate-600 uppercase">
            Querying provider adapters & SQLite index...
          </p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="p-16 border-2 border-dashed border-black/30 text-center bg-[#FAFAF8]">
          <File className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="font-['Space_Grotesk_Variable'] font-bold text-base text-slate-800 mb-1">
            No Files Found
          </p>
          <p className="text-xs font-mono text-slate-500">
            {searchQuery
              ? `No files matching "${searchQuery}"`
              : 'Link a cloud account above to start browsing files.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-x-auto border-2 border-black shadow-[3px_3px_0px_#000]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#FEF08A] border-b-2 border-black text-black font-black uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4 hidden sm:table-cell">Provider</th>
                <th className="py-3 px-4 hidden md:table-cell">Size</th>
                <th className="py-3 px-4 hidden lg:table-cell">Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black bg-white">
              {filteredFiles.map((file) => {
                const name = file.name || (file as any).file_name || 'Unnamed';
                const meta = getProviderMeta(file.provider);
                const isFolder = file.is_directory || (file as any).is_folder;

                return (
                  <tr
                    key={file.id}
                    onClick={() => !isFolder && onPreviewFile(file)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, file)}
                          className="text-slate-400 hover:text-amber-500"
                        >
                          <Star
                            className={`w-4 h-4 ${file.starred ? 'fill-amber-400 text-amber-500' : ''}`}
                          />
                        </button>
                        <div className="shrink-0">{getFileIcon(file)}</div>
                        <span className="font-bold text-black truncate max-w-xs sm:max-w-md">
                          {name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className={`neo-badge ${meta.badgeBg} text-[10px] py-0 px-2`}>
                        {meta.name}
                      </span>
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell font-bold text-slate-700">
                      {isFolder ? '—' : formatBytes(file.size)}
                    </td>

                    <td className="py-3 px-4 hidden lg:table-cell text-slate-500">
                      {formatDate(file.updated_at || (file as any).modifiedTime)}
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {!isFolder && (
                          <button
                            onClick={() => onPreviewFile(file)}
                            className="neo-btn bg-white hover:bg-slate-100 p-1.5 shadow-[1px_1px_0px_#000]"
                            title="Direct Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <a
                          href={api.files.getDownloadUrl(file.id)}
                          download={name}
                          className="neo-btn bg-white hover:bg-slate-100 p-1.5 shadow-[1px_1px_0px_#000]"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={(e) => handleRename(e, file)}
                          className="neo-btn bg-white hover:bg-slate-100 p-1.5 shadow-[1px_1px_0px_#000]"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, file)}
                          className="neo-btn bg-rose-100 hover:bg-rose-200 text-rose-900 p-1.5 shadow-[1px_1px_0px_#000]"
                          title="Delete from cloud"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const name = file.name || (file as any).file_name || 'Unnamed';
            const meta = getProviderMeta(file.provider);
            const isFolder = file.is_directory || (file as any).is_folder;

            return (
              <div
                key={file.id}
                onClick={() => !isFolder && onPreviewFile(file)}
                className="bg-[#FAFAF8] border-2 border-black shadow-[3px_3px_0px_#000] p-4 flex flex-col justify-between hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`neo-badge ${meta.badgeBg} text-[9px] py-0 px-1.5`}>
                      {meta.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(e, file)}
                      className="text-slate-400 hover:text-amber-500"
                    >
                      <Star
                        className={`w-4 h-4 ${file.starred ? 'fill-amber-400 text-amber-500' : ''}`}
                      />
                    </button>
                  </div>

                  <div className="w-full h-24 bg-white border border-black flex items-center justify-center mb-3">
                    {getFileIcon(file)}
                  </div>

                  <p className="font-bold text-xs text-black truncate mb-1" title={name}>
                    {name}
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    {isFolder ? 'Folder' : formatBytes(file.size)}
                  </p>
                </div>

                <div
                  className="pt-3 mt-3 border-t border-black/10 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onPreviewFile(file)}
                    className="neo-btn bg-white hover:bg-slate-100 px-2 py-1 text-[10px] font-bold shadow-[1px_1px_0px_#000] flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={api.files.getDownloadUrl(file.id)}
                      download={name}
                      className="neo-btn bg-white hover:bg-slate-100 p-1 shadow-[1px_1px_0px_#000]"
                      title="Download"
                    >
                      <Download className="w-3 h-3" />
                    </a>
                    <button
                      onClick={(e) => handleDelete(e, file)}
                      className="neo-btn bg-rose-100 hover:bg-rose-200 text-rose-900 p-1 shadow-[1px_1px_0px_#000]"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
