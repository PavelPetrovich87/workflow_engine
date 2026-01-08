import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

export type StatusNodeData = {
  label: string;
  type: string;
  status?: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  output?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
};

/**
 * 🎨 STATUS NODE
 * Custom Node for React Flow.
 */
export const StatusNode = memo(({ data, selected }: NodeProps<StatusNodeData>) => {
  const { label, type, status = 'IDLE' } = data;

  // Visual variants
  const variants = {
    IDLE: { 
      border: 'border-slate-600', 
      bg: 'bg-slate-900', 
      icon: <Clock className="w-4 h-4 text-slate-400" /> 
    },
    RUNNING: { 
      border: 'border-blue-500 ring-2 ring-blue-500/20', 
      bg: 'bg-slate-900', 
      icon: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" /> 
    },
    COMPLETED: { 
      border: 'border-emerald-500', 
      bg: 'bg-emerald-950/30', 
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 
    },
    FAILED: { 
      border: 'border-red-500', 
      bg: 'bg-red-950/30', 
      icon: <XCircle className="w-4 h-4 text-red-400" /> 
    },
  };

  const style = variants[status];

  return (
    <div className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[150px] transition-all duration-300 ${style.border} ${style.bg} ${selected ? 'ring-2 ring-white/20' : ''}`}>
      {/* Inputs */}
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-3 !h-3" />
      
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        
        {/* Content */}
        <div className="flex flex-col">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{type}</span>
          <span className="font-semibold text-slate-100">{label}</span>
          
          {/* Output/Error Preview */}
          {status === 'FAILED' && (
             <span className="text-[10px] text-red-400 mt-1 max-w-[120px] truncate">
                 {data.error || 'Error'}
             </span>
          )}
          {status === 'COMPLETED' && data.output && (
              <span className="text-[10px] text-emerald-400 mt-1 font-mono max-w-[120px] truncate">
                  {JSON.stringify(data.output)}
              </span>
          )}
        </div>
      </div>

      {/* Outputs */}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-3 !h-3" />
    </div>
  );
});
