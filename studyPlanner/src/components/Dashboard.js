import React from 'react';
import { Calendar, Check, Clock, TrendingUp, Activity } from 'lucide-react';

export default function Dashboard({ exams, checklist, studySessions }) {
    const stats = [
        {
            label: 'Upcoming Exams',
            value: exams.length,
            icon: Calendar,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: '+2 this week'
        },
        {
            label: 'Tasks Completed',
            value: `${checklist.filter(c => c.completed).length}/${checklist.length}`,
            icon: Check,
            color: 'text-green-600',
            bg: 'bg-green-50',
            trend: '85% completion'
        },
        {
            label: 'Study Sessions',
            value: studySessions.length,
            icon: Clock,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            trend: '12h total'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
                    <p className="text-slate-500 mt-1">Welcome back! Here's your study overview.</p>
                </div>
                <div className="text-sm text-slate-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-card p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                        <p className="text-slate-500 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Sessions */}
                <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-primary-600" />
                            Recent Activity
                        </h3>
                    </div>

                    {studySessions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500">No study sessions yet. Start a timer!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {studySessions.slice(-5).reverse().map(session => (
                                <div key={session.id} className="group p-4 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all duration-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                                            {session.planned}
                                        </p>
                                        <span className="text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                                            {new Date(session.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2">{session.covered}</p>
                                    <div className="mt-3 flex items-center text-xs text-slate-400">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {session.duration} mins
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions or Other Stats could go here */}
                <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-700 text-white border-none">
                    <h3 className="text-xl font-bold mb-4">Stay Consistent!</h3>
                    <p className="text-primary-100 mb-6">
                        "Success is the sum of small efforts, repeated day in and day out."
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                            <p className="text-2xl font-bold">25m</p>
                            <p className="text-xs text-primary-200">Focus Time</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                            <p className="text-2xl font-bold">5m</p>
                            <p className="text-xs text-primary-200">Break Time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
