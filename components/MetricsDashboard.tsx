
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BehaviorMetrics } from '../types';
import { TrendingUp, Users, Clock, ArrowDownRight, Eye } from 'lucide-react';

interface Props {
  metrics: BehaviorMetrics;
}

const MetricsDashboard: React.FC<Props> = ({ metrics }) => {
  const barData = [
    { name: 'CTR', value: metrics.ctr, color: '#6366f1' },
    { name: 'Bounce Rate', value: metrics.bounceRate, color: '#f43f5e' },
    { name: 'Scroll Depth', value: metrics.scrollDepth, color: '#10b981' },
  ];

  const statCards = [
    { label: 'Avg. CTR', value: `${metrics.ctr}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Bounce Rate', value: `${metrics.bounceRate}%`, icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Session Duration', value: `${metrics.sessionDuration}s`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Page Views', value: metrics.pageViews.toLocaleString(), icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className={`${stat.bg} p-2 rounded-lg`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">Engagement Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold mb-4 w-full">Behavior Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active Users', value: metrics.pageViews * (1 - metrics.bounceRate/100) },
                    { name: 'Dropped', value: metrics.pageViews * (metrics.bounceRate/100) }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#cbd5e1" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex space-x-4 mt-2">
             <div className="flex items-center text-sm"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Retained</div>
             <div className="flex items-center text-sm"><span className="w-3 h-3 rounded-full bg-slate-300 mr-2"></span> Bounced</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
