import { motion } from 'framer-motion';

interface TerminalStatusProps {
  systemTime: string;
  status: 'LIVE' | 'PAUSED' | 'ENDED';
  nodeId?: string;
}

export function TerminalStatus({ 
  systemTime, 
  status, 
  nodeId = 'CN-01' 
}: TerminalStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'LIVE': return 'text-green-600';
      case 'PAUSED': return 'text-yellow-600';
      case 'ENDED': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getIndicatorColor = () => {
    switch (status) {
      case 'LIVE': return 'bg-green-500';
      case 'PAUSED': return 'bg-yellow-500';
      case 'ENDED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white border-t border-b border-gray-300 py-3 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-gray-900">
            [MODULE] RACING
          </span>
          <div className="w-px h-4 bg-gray-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
            [CHANNEL] OPERATOR
          </span>
          <div className="w-px h-4 bg-gray-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
            NODE: {nodeId}
          </span>
          <div className="w-px h-4 bg-gray-400" />
          <span className={`font-mono text-xs font-bold uppercase tracking-[0.15em] ${getStatusColor()}`}>
            STATUS: {status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div 
            className={`w-2 h-2 ${getIndicatorColor()}`}
            animate={{ 
              scale: status === 'LIVE' ? [0.9, 1.1, 0.9] : 1,
              opacity: status === 'LIVE' ? [0.6, 1, 0.6] : 1
            }}
