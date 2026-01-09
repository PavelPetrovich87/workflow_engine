
import React from 'react';
import { Node } from '../core/def/workflow';
import { X, Activity } from 'lucide-react';

interface NodeModalProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NodeModal({ node, isOpen, onClose }: NodeModalProps) {
  if (!isOpen || !node) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-slate-200">Node Details</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-500 uppercase">Label</label>
            <p className="text-lg font-medium text-slate-100">{node.label}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-500 uppercase">Type</label>
            <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-mono">
                    {node.type}
                </span>
            </div>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800/50">
            <label className="text-xs font-mono text-slate-500 uppercase">ID</label>
            <p className="text-xs font-mono text-slate-400 select-all">{node.id}</p>
          </div>

        </div>

      </div>
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
