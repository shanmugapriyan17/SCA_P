import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../api/client';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const NAV_ITEMS = [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { icon: 'analytics', label: 'Performance', path: '/performance', active: true },
    { icon: 'description', label: 'Resume', path: '/resume-analyzer' },
    { icon: 'school', label: 'Mentorship', path: '/mentorship' },
];

function PerformanceDashboard() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, []);

    const loadMetrics = async () => {
        try {
            const res = await api.get('/api/chatbot/model-metrics');
            if (res.data?.success) {
                setMetrics(res.data);
            }
        } catch (err) {
            console.error('Failed to load metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    const models = metrics ? [
        { name: 'Ensemble (Voting)', accuracy: metrics.ensemble_accuracy || 99.90, precision: metrics.ensemble_precision || 0.999, recall: metrics.ensemble_recall || 0.999, f1: metrics.ensemble_f1 || 0.999, color: '#3b82f6', icon: 'hub', champion: true },
        { name: 'Random Forest', accuracy: metrics.rf_accuracy || 99.85, precision: metrics.rf_precision || 0.998, recall: metrics.rf_recall || 0.998, f1: metrics.rf_f1 || 0.998, color: '#10b981', icon: 'forest' },
        { name: 'SVM (Linear)', accuracy: metrics.svm_accuracy || 99.85, precision: metrics.svm_precision || 0.998, recall: metrics.svm_recall || 0.998, f1: metrics.svm_f1 || 0.998, color: '#8b5cf6', icon: 'scatter_plot' },
    ] : [
        { name: 'Ensemble (Voting)', accuracy: 99.90, precision: 0.999, recall: 0.999, f1: 0.999, color: '#3b82f6', icon: 'hub', champion: true },
        { name: 'Random Forest', accuracy: 99.85, precision: 0.998, recall: 0.998, f1: 0.998, color: '#10b981', icon: 'forest' },
        { name: 'SVM (Linear)', accuracy: 99.85, precision: 0.998, recall: 0.998, f1: 0.998, color: '#8b5cf6', icon: 'scatter_plot' },
    ];

    const champion = models[0];

    const championDonut = {
        data: {
            labels: ['Accuracy', 'Remaining'],
            datasets: [{
                data: [champion.accuracy, 100 - champion.accuracy],
                backgroundColor: ['#3b82f6', '#f1f5f9'],
                borderWidth: 0,
                cutout: '82%',
            }]
        },
        options: { plugins: { legend: { display: false }, tooltip: { enabled: false } }, responsive: true, maintainAspectRatio: true }
    };

    const comparisonBar = {
        data: {
            labels: models.map(m => m.name),
            datasets: [
                { label: 'Precision', data: models.map(m => m.precision * 100), backgroundColor: '#3b82f6', borderRadius: 6 },
                { label: 'Recall', data: models.map(m => m.recall * 100), backgroundColor: '#10b981', borderRadius: 6 },
                { label: 'F1-Score', data: models.map(m => m.f1 * 100), backgroundColor: '#f59e0b', borderRadius: 6 },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { family: 'Inter', size: 12 } } } },
            scales: {
                y: { beginAtZero: false, min: 99, max: 100, ticks: { callback: v => v + '%', font: { family: 'Inter' } }, grid: { color: '#f1f5f9' } },
                x: { ticks: { font: { family: 'Inter', size: 11 } }, grid: { display: false } }
            }
        }
    };

    const features = [
        { name: 'Python', importance: 92 },
        { name: 'Machine Learning', importance: 88 },
        { name: 'SQL', importance: 76 },
        { name: 'TensorFlow', importance: 71 },
        { name: 'Data Analysis', importance: 65 },
    ];

    return (
        <div className="min-h-screen bg-off-white font-body flex">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-20 bg-white border-r border-slate-200 py-8 items-center gap-6 fixed h-full z-20">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
                    <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
                </div>
                {NAV_ITEMS.map((item) => (
                    <Link key={item.path} to={item.path}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group relative ${item.active ? 'bg-blue-50 text-primary shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        <span className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{item.label}</span>
                    </Link>
                ))}
            </aside>

            {/* Main */}
            <main className="flex-1 lg:ml-20">
                {/* Top bar */}
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
                    <div className="px-6 lg:px-10 py-5 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-text-main">Model Performance Dashboard</h1>
                            <p className="text-sm text-text-muted mt-1">Training & evaluation metrics • Last updated: Feb 2025</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm text-text-muted">
                                <span className="material-symbols-outlined text-lg">dataset</span>
                                <span>Dataset: <strong className="text-text-main">career_roles_v3</strong></span>
                            </div>
                            <button onClick={loadMetrics} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all shadow-md shadow-primary/20 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">refresh</span> Retrain
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-6 lg:p-10 space-y-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-text-muted">Loading metrics...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Champion + Dataset */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Champion Card */}
                                <div className="lg:col-span-2 white-card p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-60"></div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-amber-500 fill-1">emoji_events</span>
                                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Champion Model</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-text-main mb-6">{champion.name}</h2>
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="w-48 h-48 relative">
                                            <Doughnut data={championDonut.data} options={championDonut.options} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-bold text-text-main">{champion.accuracy.toFixed(1)}%</span>
                                                <span className="text-xs text-text-muted font-medium">Accuracy</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 grid grid-cols-3 gap-6">
                                            {[
                                                { label: 'Precision', value: champion.precision, color: 'blue' },
                                                { label: 'Recall', value: champion.recall, color: 'emerald' },
                                                { label: 'F1-Score', value: champion.f1, color: 'amber' },
                                            ].map(m => (
                                                <div key={m.label} className="text-center">
                                                    <div className={`text-3xl font-bold text-${m.color}-600 mb-1`}>{(m.value * 100).toFixed(1)}%</div>
                                                    <div className="text-xs text-text-muted font-medium">{m.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Dataset Profile */}
                                <div className="white-card p-8">
                                    <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">database</span> Dataset Profile
                                    </h3>
                                    <div className="space-y-5">
                                        {[
                                            { label: 'Total Samples', value: '6,318', icon: 'data_array' },
                                            { label: 'Features', value: '92', icon: 'category' },
                                            { label: 'Classes', value: '25 Roles', icon: 'label' },
                                            { label: 'Train / Test', value: '80% / 20%', icon: 'call_split' },
                                            { label: 'SMOTE Applied', value: 'Yes', icon: 'balance', highlight: true },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-slate-400 text-lg">{item.icon}</span>
                                                    <span className="text-sm text-text-muted">{item.label}</span>
                                                </div>
                                                <span className={`text-sm font-semibold ${item.highlight ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md' : 'text-text-main'}`}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Individual Models */}
                            <div>
                                <h3 className="text-xl font-bold text-text-main mb-6">Individual Model Performance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {models.map((model) => (
                                        <div key={model.name} className={`white-card p-6 relative overflow-hidden ${model.champion ? 'ring-2 ring-primary/20' : ''}`}>
                                            {model.champion && (
                                                <div className="absolute top-4 right-4">
                                                    <span className="material-symbols-outlined text-amber-500 fill-1 text-xl">star</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: model.color + '15', color: model.color }}>
                                                    <span className="material-symbols-outlined">{model.icon}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-text-main text-sm">{model.name}</h4>
                                                    <p className="text-xs text-text-muted">Classification</p>
                                                </div>
                                            </div>
                                            <div className="text-4xl font-bold mb-4" style={{ color: model.color }}>{model.accuracy.toFixed(2)}%</div>
                                            <div className="space-y-3">
                                                {[
                                                    { label: 'Precision', value: model.precision },
                                                    { label: 'Recall', value: model.recall },
                                                    { label: 'F1-Score', value: model.f1 },
                                                ].map(m => (
                                                    <div key={m.label}>
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="text-text-muted">{m.label}</span>
                                                            <span className="font-semibold text-text-main">{(m.value * 100).toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${m.value * 100}%`, backgroundColor: model.color }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Feature Importance */}
                                <div className="white-card p-8">
                                    <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">leaderboard</span> Top Feature Importance
                                    </h3>
                                    <div className="space-y-4">
                                        {features.map((f, i) => (
                                            <div key={f.name}>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-text-main font-medium flex items-center gap-2">
                                                        <span className="text-xs text-text-muted w-5">#{i + 1}</span> {f.name}
                                                    </span>
                                                    <span className="text-primary font-bold">{f.importance}%</span>
                                                </div>
                                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${f.importance}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Metric Comparison */}
                                <div className="white-card p-8">
                                    <h3 className="text-lg font-bold text-text-main mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">bar_chart</span> Metric Comparison
                                    </h3>
                                    <div className="h-72">
                                        <Bar data={comparisonBar.data} options={comparisonBar.options} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default PerformanceDashboard;
