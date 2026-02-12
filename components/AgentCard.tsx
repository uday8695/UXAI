
import React from 'react';
import { AgentOutput } from '../types';
import { ShieldCheck, Activity, Lightbulb, Code, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface Props {
  agent: AgentOutput;
  type: 'diagnostic' | 'validation' | 'solution' | 'technical';
}

const AgentCard: React.FC<Props> = ({ agent, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'diagnostic': return <ShieldCheck className="w-5 h-5" />;
      case 'validation': return <Activity className="w-5 h-5" />;
      case 'solution': return <Lightbulb className="w-5 h-5" />;
      case 'technical': return <Code className="w-5 h-5" />;
    }
  };

  const getSeverityColor = () => {
    switch (agent.severity) {
      case 'high': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSeverityIcon = () => {
    switch (agent.severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            {getIcon()}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 leading-tight">{agent.agentName}</h4>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{type}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1 uppercase ${getSeverityColor()}`}>
          {getSeverityIcon()} {agent.severity} priority
        </div>
      </div>
      <div className="p-5">
        <h5 className="text-md font-semibold text-slate-900 mb-3 underline decoration-indigo-200 underline-offset-4">
          {agent.title}
        </h5>
        <ul className="space-y-3">
          {agent.content.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 group">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 group-hover:scale-125 transition-transform"></span>
              <p className="text-sm text-slate-600 leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AgentCard;
