import React, { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from "recharts";
import { MdOutlineAccessTime } from "react-icons/md";

const API_URL = process.env.REACT_APP_API_URL;

// Nova paleta de cores baseada na imagem
const COLORS = [
  "#1e3a8a", // Azul Escuro
  "#059669", // Verde Escuro  
  "#10b981", // Verde Médio
  "#34d399", // Verde Claro
  "#a7f3d0", // Verde Muito Claro
  "#0f766e", // Verde Teal
  "#14b8a6", // Teal Médio
  "#5eead4", // Teal Claro
  "#06b6d4"  // Cyan
];

// Função customizada para mostrar nome (quantidade) acima da barra
const renderCustomBarLabel = ({ x, y, width, value, payload }) => {
  if (!payload) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#222"
      textAnchor="middle"
      fontSize={14}
      fontWeight="bold"
    >
      {(payload.osVersion || "Sem versão") + " (" + value + ")"}
    </text>
  );
};

// Função para exibir o tempo em "2h 5min" ou "30 min"
function formatScreenTime(minutes) {
  if (!minutes || minutes < 1) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}

function DashboardKPI() {
  const [brands, setBrands] = useState([]);
  const [osVersions, setOsVersions] = useState([]);
  const [averageScreenTime, setAverageScreenTime] = useState(0);
  const [devicesStatus, setDevicesStatus] = useState({ online: 0, offline: 0 });

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_URL}/api/dashboard/kpi/brands`)
      .then((res) => res.json())
      .then(data => { if (isMounted) setBrands(data); });

    fetch(`${API_URL}/api/dashboard/kpi/os-versions`)
      .then((res) => res.json())
      .then(data => { if (isMounted) setOsVersions(data); });

    fetch(`${API_URL}/api/dashboard/kpi/online-offline`)
      .then((res) => res.json())
      .then(data => { if (isMounted) setDevicesStatus(data); });

    fetch(`${API_URL}/api/dashboard/kpi/average-screen-time`)
      .then((res) => res.json())
      .then(data => {
        if (isMounted) setAverageScreenTime(Math.round(data.averageScreenTime || 0));
      });

    return () => { isMounted = false; };
  }, []);

  // Dados do PieChart
  const pieData = brands.map(item => ({
    name: item.brand || "Sem marca",
    value: item._count.brand
  }));

  // Dados para o BarChart
  const barData = osVersions.map(item => ({
    osVersion: item.osVersion || "Sem versão",
    Quantidade: item._count.osVersion
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2A9D8F 0%, #1a6b61 100%)',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #2A9D8F, #1a6b61)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          Dashboard de Indicadores de Performance (KPI)
        </h2>
      </div>

      {/* Cards KPI */}
      <div style={{display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap'}}>
        {/* Card dispositivos online/offline */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)", 
          padding: 24, 
          borderRadius: 16,
          minWidth: 250, 
          textAlign: "center",
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          flex: 1
        }}>
          <h4 style={{marginBottom: 24, color: '#333', fontSize: '18px', fontWeight: 'bold'}}>
            Status dos Dispositivos
          </h4>
          <div style={{display: "flex", alignItems: "center", marginBottom: 16, justifyContent: "center"}}>
            <span style={{
              width: 16, height: 16, borderRadius: "50%",
              display: "inline-block", background: "#10b981", marginRight: 12
            }} />
            <span style={{fontSize: 28, fontWeight: 700, marginRight: 8, color: '#333'}}>
              {devicesStatus.online}
            </span>
            <span style={{color: '#666', fontWeight: '500'}}>Online</span>
          </div>
          <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
            <span style={{
              width: 16, height: 16, borderRadius: "50%",
              display: "inline-block", background: "#1e3a8a", marginRight: 12
            }} />
            <span style={{fontSize: 28, fontWeight: 700, marginRight: 8, color: '#333'}}>
              {devicesStatus.offline}
            </span>
            <span style={{color: '#666', fontWeight: '500'}}>Offline</span>
          </div>
        </div>

        {/* Card tempo de tela */}
        <div style={{
          background: "linear-gradient(135deg, #2A9D8F 0%, #1a6b61 100%)",
          padding: 24, 
          borderRadius: 16, 
          minWidth: 250, 
          textAlign: "center", 
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          color: 'white',
          flex: 1
        }}>
          <MdOutlineAccessTime 
            size={48} 
            style={{ 
              marginBottom: 16, 
              color: "rgba(255,255,255,0.9)",
              display: 'block',
              margin: '0 auto 16px auto'
            }} 
          />
          <h4 style={{marginBottom: 20, fontWeight: 700, fontSize: '18px'}}>
            Tempo Médio de Tela
          </h4>
          <span style={{fontSize: 42, fontWeight: 800, display: 'block', marginBottom: 8}}>
            {formatScreenTime(averageScreenTime)}
          </span>
          <span style={{opacity: 0.8, fontSize: '14px'}}>por dispositivo</span>
        </div>
      </div>

      {/* Charts */}
      <div style={{display: 'flex', gap: 32, flexWrap: 'wrap'}}>
        <div style={{
          flex: 1,
          minWidth: '400px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{marginBottom: 20, color: '#333', fontSize: '20px', fontWeight: 'bold'}}>
            Dispositivos por Marca
          </h4>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={50}
                  label={({name, value}) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{
          flex: 1,
          minWidth: '400px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{marginBottom: 20, color: '#333', fontSize: '20px', fontWeight: 'bold'}}>
            Dispositivos por Versão do OS
          </h4>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="osVersion" stroke="#666" />
                <YAxis allowDecimals={false} stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="Quantidade" 
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                >
                  <LabelList content={renderCustomBarLabel} />
                </Bar>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2A9D8F" />
                    <stop offset="100%" stopColor="#1a6b61" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardKPI;