import React, { useState, useEffect } from 'react';
import { Trophy, Activity, Star } from 'lucide-react';
import apiService from '../services/apiService';

const PerformanceStats = () => {
    const [topScorers, setTopScorers] = useState([]);
    const [topAssists, setTopAssists] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [scorersData, assistsData, ratedData] = await Promise.all([
                    apiService.statistics.getTopScorers({ limit: 5 }),
                    apiService.statistics.getTopAssists({ limit: 5 }),
                    apiService.statistics.getBestRatings({ limit: 5, sortBy: 'rating' })
                ]);

                setTopScorers(scorersData);
                setTopAssists(assistsData);
                setTopRated(ratedData);
            } catch (error) {
                console.error('Error fetching performance stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="text-center py-10">Loading statistics...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Performance Statistics</h1>
                <p className="text-gray-500 mt-1">Top performing players across all leagues</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Scorers */}
                <StatCard
                    title="Top Scorers"
                    icon={<Trophy className="w-6 h-6 text-yellow-500" />}
                    data={topScorers}
                    valueKey="goals"
                    valueLabel="Goals"
                />

                {/* Top Assists */}
                <StatCard
                    title="Top Assists"
                    icon={<Activity className="w-6 h-6 text-blue-500" />}
                    data={topAssists}
                    valueKey="assists"
                    valueLabel="Assists"
                />

                {/* Top Rated */}
                <StatCard
                    title="Top Rated"
                    icon={<Star className="w-6 h-6 text-purple-500" />}
                    data={topRated}
                    valueKey="Rating"
                    valueLabel="Rating"
                />
            </div>
        </div>
    );
};

const StatCard = ({ title, icon, data, valueKey, valueLabel }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50">
            {icon}
            <h2 className="font-bold text-gray-900">{title}</h2>
        </div>
        <div className="divide-y divide-gray-100">
            {data.length > 0 ? (
                data.map((player, index) => (
                    <div key={player.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                            <span className={`
                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}
              `}>
                                {index + 1}
                            </span>
                            <div>
                                <p className="font-medium text-gray-900">{player.name}</p>
                                <p className="text-xs text-gray-500">{player.TeamName || 'Free Agent'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="font-bold text-gray-900">{player[valueKey]}</span>
                            <p className="text-xs text-gray-500">{valueLabel}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-8 text-center text-gray-500">No data available</div>
            )}
        </div>
    </div>
);

export default PerformanceStats;
