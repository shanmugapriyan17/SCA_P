import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export const FONT = "'Poppins', system-ui, sans-serif";
export const IND = '#4f46e5';
export const VIO = '#7c3aed';

export function Card({ children, style = {} }) {
    return <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f0f0f8', fontFamily: FONT, ...style }}>{children}</div>;
}

export function SectionTitle({ icon, text }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: IND }}>{icon}</span>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>{text}</h3>
        </div>
    );
}

export function Badge({ text, color }) {
    const palette = { green: { bg: '#ecfdf5', fg: '#059669' }, red: { bg: '#fef2f2', fg: '#dc2626' }, yellow: { bg: '#fffbeb', fg: '#d97706' }, indigo: { bg: '#eef2ff', fg: '#4f46e5' } };
    const p = palette[color] || palette.indigo;
    return <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px', background: p.bg, color: p.fg }}>{text}</span>;
}

export function skillLevel(v) {
    return v >= 80 ? { label: 'Expert', color: 'green' } : v >= 60 ? { label: 'Proficient', color: 'indigo' } : v >= 40 ? { label: 'Intermediate', color: 'yellow' } : { label: 'Beginner', color: 'red' };
}

export const QUIZ_BANK = {
    Python: [
        { q: 'Which data type is immutable in Python?', opts: ['List', 'Tuple', 'Dict', 'Set'], ans: 1 },
        { q: 'What does `len([1,2,3])` return?', opts: ['2', '3', '4', 'None'], ans: 1 },
        { q: 'Which keyword defines a function?', opts: ['fun', 'define', 'def', 'func'], ans: 2 },
        { q: 'Output of `2**3`?', opts: ['6', '8', '9', '5'], ans: 1 },
        { q: 'Which module handles JSON?', opts: ['os', 'json', 'sys', 'xml'], ans: 1 },
    ],
    'ML / AI': [
        { q: 'Algorithm for classification?', opts: ['K-Means', 'Linear Regression', 'Decision Tree', 'PCA'], ans: 2 },
        { q: 'Overfitting means…', opts: ['underfits', 'fits train data too well', 'ignores data', 'optimal'], ans: 1 },
        { q: 'CNN stands for?', opts: ['Core Neural Net', 'Convolutional Neural Network', 'Clustered Node', 'None'], ans: 1 },
        { q: 'Loss function for regression?', opts: ['Cross-Entropy', 'MSE', 'Hinge', 'KL'], ans: 1 },
        { q: 'Batch GD uses…', opts: ['one sample', 'all samples', 'random subset', 'none'], ans: 1 },
    ],
    SQL: [
        { q: 'Clause to filter after grouping?', opts: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], ans: 1 },
        { q: 'JOIN returning all rows from both?', opts: ['INNER', 'LEFT', 'RIGHT', 'FULL OUTER'], ans: 3 },
        { q: 'Function counting non-NULL?', opts: ['SUM()', 'COUNT()', 'AVG()', 'MAX()'], ans: 1 },
        { q: 'PRIMARY KEY is…', opts: ['Allow NULLs', 'Unique+NOT NULL', 'Can repeat', 'Optional'], ans: 1 },
        { q: 'SELECT DISTINCT removes…', opts: ['Nulls', 'Duplicates', 'Negatives', 'Strings'], ans: 1 },
    ],
    Cloud: [
        { q: 'AWS S3 is…', opts: ['Compute', 'Object storage', 'Database', 'CDN'], ans: 1 },
        { q: 'Serverless means…', opts: ['No servers', 'Auto-managed', 'Local only', 'Manual'], ans: 1 },
        { q: 'Kubernetes is for…', opts: ['CI/CD', 'Container orchestration', 'Monitoring', 'Storage'], ans: 1 },
        { q: 'IAM stands for…', opts: ['Internet Access', 'Identity & Access Mgmt', 'Instance Auto', 'None'], ans: 1 },
        { q: 'Most managed cloud model?', opts: ['IaaS', 'PaaS', 'SaaS', 'FaaS'], ans: 2 },
    ],
};

export const CAREER_REQUIREMENTS = [
    { career: 'Data Scientist', reqs: { Python: 75, 'ML / AI': 70, SQL: 65, Cloud: 50 } },
    { career: 'ML Engineer', reqs: { Python: 70, 'ML / AI': 80, SQL: 50, Cloud: 60 } },
    { career: 'Frontend Developer', reqs: { Python: 30, 'ML / AI': 20, SQL: 40, Cloud: 45 } },
    { career: 'Backend Developer', reqs: { Python: 65, 'ML / AI': 30, SQL: 70, Cloud: 55 } },
    { career: 'Cloud Architect', reqs: { Python: 50, 'ML / AI': 40, SQL: 55, Cloud: 85 } },
];
