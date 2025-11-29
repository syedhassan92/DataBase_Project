import React, { useState, useEffect } from 'react';
import { ArrowRight, Search, Plus, History } from 'lucide-react';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const PlayerTransfers = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [transfers, setTransfers] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [sourceLeague, setSourceLeague] = useState('');
    const [sourceTeam, setSourceTeam] = useState('');
    const [sourceTeams, setSourceTeams] = useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);

    const [destLeague, setDestLeague] = useState('');
    const [destTeams, setDestTeams] = useState([]);

    const [formData, setFormData] = useState({
        playerId: '',
        toTeamId: '',
        transferDate: new Date().toISOString().split('T')[0],
        transferType: 'Permanent',
        contractDetails: '',
        transferFee: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch Source Teams when Source League changes
    useEffect(() => {
        const fetchSourceTeams = async () => {
            if (sourceLeague) {
                try {
                    const teamsData = await apiService.teams.getByLeague(sourceLeague);
                    setSourceTeams(teamsData);
                } catch (error) {
                    console.error('Error fetching source teams:', error);
                    setSourceTeams([]);
                }
            } else {
                setSourceTeams([]);
                setAvailablePlayers([]);
            }
            setSourceTeam('');
            setFormData(prev => ({ ...prev, playerId: '' }));
        };
        fetchSourceTeams();
    }, [sourceLeague]);

    // Fetch Players when Source Team changes
    useEffect(() => {
        const fetchPlayers = async () => {
            if (sourceTeam) {
                try {
                    const playersData = await apiService.players.getAll({ teamId: sourceTeam });
                    setAvailablePlayers(playersData);
                } catch (error) {
                    console.error('Error fetching players:', error);
                    setAvailablePlayers([]);
                }
            } else {
                setAvailablePlayers([]);
            }
            setFormData(prev => ({ ...prev, playerId: '' }));
        };
        fetchPlayers();
    }, [sourceTeam]);

    // Fetch Destination Teams when Destination League changes
    useEffect(() => {
        const fetchDestTeams = async () => {
            if (destLeague) {
                try {
                    const teamsData = await apiService.teams.getByLeague(destLeague);
                    // Filter out source team if leagues match
                    if (sourceLeague == destLeague && sourceTeam) {
                        setDestTeams(teamsData.filter(t => (t.TeamID || t.id) != sourceTeam));
                    } else {
                        setDestTeams(teamsData);
                    }
                } catch (error) {
                    console.error('Error fetching destination teams:', error);
                    setDestTeams([]);
                }
            } else {
                setDestTeams([]);
            }
            setFormData(prev => ({ ...prev, toTeamId: '' }));
        };
        fetchDestTeams();
    }, [destLeague, sourceLeague, sourceTeam]);

    const fetchData = async () => {
        try {
            const [transfersData, leaguesData] = await Promise.all([
                apiService.transfers.getAll(),
                apiService.leagues.getAll()
            ]);
            setTransfers(transfersData);
            setLeagues(leaguesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (sourceTeam == formData.toTeamId) {
            alert('Cannot transfer player to the same team they are currently in.');
            return;
        }

        try {
            await apiService.post('/transfers', {
                ...formData,
                fromLeagueId: sourceLeague
            });
            alert('Transfer completed successfully');
            setShowModal(false);

            // Reset Form
            setSourceLeague('');
            setSourceTeam('');
            setDestLeague('');
            setFormData({
                playerId: '',
                toTeamId: '',
                transferDate: new Date().toISOString().split('T')[0],
                transferType: 'Permanent',
                contractDetails: '',
                transferFee: ''
            });

            // Refresh list
            const transfersData = await apiService.transfers.getAll();
            setTransfers(transfersData);
        } catch (error) {
            console.error('Error creating transfer:', error);
            alert('Failed to process transfer: ' + error.message);
        }
    };

    if (loading) return <div className="text-center py-8">Loading transfers...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Player Transfers</h1>
                    <p className="text-gray-600 mt-2">Manage player movements between teams</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        New Transfer
                    </button>
                )}
            </div>

            {/* Transfer History */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Transfer History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">League</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transfers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No transfers recorded yet
                                    </td>
                                </tr>
                            ) : (
                                transfers.map((transfer) => (
                                    <tr key={transfer.TransferID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(transfer.TransferDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {transfer.PlayerName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transfer.FromTeamName || <span className="text-gray-400 italic">Free Agent</span>}
                                            {transfer.FromLeagueName && <span className="text-xs text-gray-400 block">({transfer.FromLeagueName})</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            <div className="flex items-center gap-2">
                                                {transfer.FromTeamName && <ArrowRight className="w-4 h-4 text-gray-400" />}
                                                {transfer.ToTeamName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transfer.TransferType === 'Loan' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {transfer.TransferType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transfer.LeagueName}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transfer Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 my-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Process Transfer</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Step 1: Source League */}
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">1. Source</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Source League</label>
                                        <select
                                            required
                                            value={sourceLeague}
                                            onChange={(e) => setSourceLeague(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        >
                                            <option value="" className="text-gray-500">Select Source League</option>
                                            {leagues.map(league => (
                                                <option key={league.LeagueID || league.id} value={league.LeagueID || league.id} className="text-gray-900">
                                                    {league.LeagueName || league.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Source Team</label>
                                        <select
                                            required
                                            value={sourceTeam}
                                            onChange={(e) => setSourceTeam(e.target.value)}
                                            disabled={!sourceLeague}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black disabled:bg-gray-100"
                                        >
                                            <option value="" className="text-gray-500">Select Source Team</option>
                                            {sourceTeams.map(team => (
                                                <option key={team.TeamID || team.id} value={team.TeamID || team.id} className="text-gray-900">
                                                    {team.TeamName || team.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Player to Transfer</label>
                                        <select
                                            required
                                            value={formData.playerId}
                                            onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
                                            disabled={!sourceTeam}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black disabled:bg-gray-100"
                                        >
                                            <option value="" className="text-gray-500">Select Player</option>
                                            {availablePlayers.map(player => (
                                                <option key={player.PlayerID || player.id} value={player.PlayerID || player.id} className="text-gray-900">
                                                    {player.PlayerName || player.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Destination */}
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider mb-3">2. Destination</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination League</label>
                                        <select
                                            required
                                            value={destLeague}
                                            onChange={(e) => setDestLeague(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        >
                                            <option value="" className="text-gray-500">Select Destination League</option>
                                            {leagues.map(league => (
                                                <option key={league.LeagueID || league.id} value={league.LeagueID || league.id} className="text-gray-900">
                                                    {league.LeagueName || league.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination Team</label>
                                        <select
                                            required
                                            value={formData.toTeamId}
                                            onChange={(e) => setFormData({ ...formData, toTeamId: e.target.value })}
                                            disabled={!destLeague}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black disabled:bg-gray-100"
                                        >
                                            <option value="" className="text-gray-500">Select Destination Team</option>
                                            {destTeams.map(team => (
                                                <option key={team.TeamID || team.id} value={team.TeamID || team.id} className="text-gray-900">
                                                    {team.TeamName || team.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.transferDate}
                                        onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={formData.transferType}
                                        onChange={(e) => setFormData({ ...formData, transferType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    >
                                        <option value="Permanent">Permanent</option>
                                        <option value="Loan">Loan</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Details</label>
                                <textarea
                                    value={formData.contractDetails}
                                    onChange={(e) => setFormData({ ...formData, contractDetails: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    rows="2"
                                    placeholder="Optional contract notes..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Complete Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerTransfers;
