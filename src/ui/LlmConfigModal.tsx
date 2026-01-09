import React, { useState, useEffect } from 'react';
import { X, Save, Key, Cpu } from 'lucide-react';
import { useLlmConfig } from '../hooks/useLlmConfig';

interface LlmConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  // TODO: Add save handler support
}

export function LlmConfigModal({ isOpen, onClose }: LlmConfigModalProps) {
  const { config, saveConfig } = useLlmConfig();
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state when modal opens or config updates elsewhere
  useEffect(() => {
    if (isOpen) {
      setApiKey(config.apiKey);
      setModel(config.model);
      setIsSaved(false);
    }
  }, [isOpen, config]);

  const handleSave = () => {
      saveConfig({ apiKey, model });
      setIsSaved(true);
      setTimeout(() => {
          setIsSaved(false);
          onClose(); // Optional: close on save
      }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            AI Configuration
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Gemini API Key
            </label>
            <input 
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm placeholder:text-slate-600"
            />
            <p className="text-xs text-slate-500">
              Stored locally in your browser. Never sent to our servers.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">
              Default Model
            </label>
            <select 
              className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (New)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-3-flash-preview">Gemini 3.0 Flash Preview</option>
              <option value="gemini-3-pro-preview">Gemini 3.0 Pro Preview</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3 items-center">
            {isSaved && <span className="text-emerald-400 text-sm font-medium mr-auto animate-pulse">Settings Saved!</span>}
          
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
