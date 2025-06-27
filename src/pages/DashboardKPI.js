import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from "recharts";
import { Clock, Wifi, WifiOff, Smartphone, Monitor } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL;

// Paleta de cores mais elegante
const COLORS = [
  "#2a9d8f", "#264653", "#287271", "#2d5a27", "#6a994e",
  "#386641", "#7209b7", "#a663cc", "#4361ee", "#7209b7"
];

// Função customizada para labels das barras
const renderCustomBarLabel = ({ x, y, width, value, payload }) => {
  if (!payload || value === 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#264653"
      textAnchor="middle"
      fontSize={12}
      fontWeight="600"
    >
      {value}
    </text>
  );
};

// Função para formatar tempo de tela
function formatScreenTime(minutes) {
  if (!minutes || minutes < 1) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

// Componente de Card reutilizável
const KPICard = ({ title, children, gradient = false, icon: Icon }) => (
  <div className={`kpi-card ${gradient ? 'gradient' : ''}`}>
    <div className="card-header">
      {Icon && <Icon size={24} className="card-icon" />}
      <h4 className="card-title">{title}</h4>
    </div>
    <div className="card-content">
      {children}
    </div>
  </div>
);

// Componente de Métrica
const MetricItem = ({ value, label, color, online = false }) => (
  <div className="metric-item">
    <div className="metric-indicator">
      <div 
        className="indicator-dot" 
        style={{ backgroundColor: color }}
      />
      <span className="metric-value">{value}</span>
    </div>
    <span className="metric-label">{label}</span>
  </div>
);

function DashboardKPI() {
  const [brands, setBrands] = useState([]);
  const [osVersions, setOsVersions] = useState([]);
  const [averageScreenTime, setAverageScreenTime] = useState(0);
  const [devicesStatus, setDevicesStatus] = useState({ online: 0, offline: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [brandsRes, osRes, statusRes, timeRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/kpi/brands`),
          fetch(`${API_URL}/api/dashboard/kpi/os-versions`),
          fetch(`${API_URL}/api/dashboard/kpi/online-offline`),
          fetch(`${API_URL}/api/dashboard/kpi/average-screen-time`)
        ]);

        if (isMounted) {
          setBrands(await brandsRes.json());
          setOsVersions(await osRes.json());
          setDevicesStatus(await statusRes.json());
          setAverageScreenTime(Math.round((await timeRes.json()).averageScreenTime || 0));
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  const pieData = brands.map(item => ({
    name: item.brand || "Sem marca",
    value: item._count.brand
  }));

  const barData = osVersions.map(item => ({
    osVersion: item.osVersion || "Sem versão",
    Quantidade: item._count.osVersion
  }));

  const totalDevices = devicesStatus.online + devicesStatus.offline;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #2a9d8f 0%, #1e6b5c 100%);
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }
        
        .dashboard-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .dashboard-title {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #2a9d8f, #264653);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
          letter-spacing: -0.5px;
        }
        
        .dashboard-subtitle {
          text-align: center;
          color: #6b7280;
          margin-top: 0.5rem;
          font-weight: 500;
        }
        
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .kpi-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .kpi-card.gradient {
          background: linear-gradient(135deg, #2a9d8f 0%, #1e6b5c 100%);
          color: white;
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        .card-icon {
          color: #2a9d8f;
        }
        
        .gradient .card-icon {
          color: rgba(255, 255, 255, 0.9);
        }
        
        .card-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #264653;
        }
        
        .gradient .card-title {
          color: white;
        }
        
        .card-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .metric-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0;
        }
        
        .metric-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .indicator-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .metric-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #264653;
        }
        
        .gradient .metric-value {
          color: white;
        }
        
        .metric-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .gradient .metric-label {
          color: rgba(255, 255, 255, 0.8);
        }
        
        .screen-time-display {
          text-align: center;
          padding: 2rem 0;
        }
        
        .screen-time-value {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
          display: block;
        }
        
        .screen-time-label {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
        }
        
        .chart-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        
        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .chart-title {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #264653;
        }
        
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          color: white;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .summary-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        
        .summary-stat {
          text-align: center;
        }
        
        .summary-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          display: block;
        }
        
        .summary-stat-label {
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }
          
          .dashboard-title {
            font-size: 1.5rem;
          }
          
          .kpi-grid {
            grid-template-columns: 1fr;
          }
          
          .charts-grid {
            grid-template-columns: 1fr;
          }
          
          .chart-card {
            min-width: unset;
          }
        }
      `}</style>

      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard KPI</h1>
        <p className="dashboard-subtitle">Indicadores de Performance em Tempo Real</p>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="summary-stat">
          <span className="summary-stat-value">{totalDevices}</span>
          <span className="summary-stat-label">Total de Dispositivos</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{brands.length}</span>
          <span className="summary-stat-label">Marcas Diferentes</span>
        </div>
        <div className="summary-stat">
          <span className="summary-stat-value">{osVersions.length}</span>
          <span className="summary-stat-label">Versões do OS</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard title="Status dos Dispositivos" icon={Monitor}>
          <MetricItem
            value={devicesStatus.online}
            label="Online"
            color="#10b981"
          />
          <MetricItem
            value={devicesStatus.offline}
            label="Offline"
            color="#ef4444"
          />
        </KPICard>

        <KPICard title="Tempo Médio de Tela" gradient={true} icon={Clock}>
          <div className="screen-time-display">
            <span className="screen-time-value">
              {formatScreenTime(averageScreenTime)}
            </span>
            <span className="screen-time-label">por dispositivo</span>
          </div>
        </KPICard>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Dispositivos por Marca</h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  innerRadius={60}
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Dispositivos por Versão do OS</h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart 
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="osVersion" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  allowDecimals={false} 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="Quantidade" 
                  fill="#2a9d8f"
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList content={renderCustomBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardKPI;