import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/DeviceLogsPage.css";

function DeviceLogsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceModel, setDeviceModel] = useState("Dispositivo");

  useEffect(() => {
    console.log('DeviceLogsPage montado com ID:', id);
    console.log('Params completo:', { id });
    fetchDeviceLogs();
  }, [id]);

  const fetchDeviceLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando logs para o device ID:', id);
      const url = `http://localhost:8090/api/devices/${id}/logs`;
      console.log('URL da requisição:', url);
      
      const response = await fetch(url);
      console.log('Status da resposta:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos:', data);
        console.log('Logs encontrados:', data.logs?.length || 0);
        
        setLogs(data.logs || []);
        setPagination(data.pagination || {});
        
        // Buscar info do device usando o deviceId do primeiro log
        if (data.logs && data.logs.length > 0) {
          const deviceId = data.logs[0].deviceId;
          console.log('Device ID do log:', deviceId);
          fetchDeviceInfo(deviceId);
        } else {
          // Tentar buscar com o ID da URL mesmo assim
          fetchDeviceInfo(id);
        }
      } else {
        const errorText = await response.text();
        console.error('Erro na resposta:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText || 'Falha ao carregar logs do dispositivo'}`);
      }
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceInfo = async (deviceId) => {
    try {
      console.log('Buscando info do device:', deviceId);
      // Primeiro tenta buscar por deviceId (campo que identifica o device)
      let response = await fetch(`http://localhost:8090/api/devices?deviceId=${deviceId}`);
      console.log('Status da resposta device info (por deviceId):', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Device info recebida:', data);
        
        // A resposta pode ser um array ou objeto
        if (Array.isArray(data) && data.length > 0) {
          setDeviceModel(data[0].model || "Dispositivo");
        } else if (data.model) {
          setDeviceModel(data.model);
        } else {
          // Se não encontrou por deviceId, tenta pela URL direta
          response = await fetch(`http://localhost:8090/api/devices/${deviceId}`);
          if (response.ok) {
            const device = await response.json();
            setDeviceModel(device.model || "Dispositivo");
          } else {
            console.warn('Não foi possível buscar info do device, usando nome padrão');
            setDeviceModel("Dispositivo");
          }
        }
      } else {
        console.warn('Não foi possível buscar info do device, usando nome padrão');
        setDeviceModel("Dispositivo");
      }
    } catch (err) {
      console.error("Erro ao buscar info do dispositivo:", err);
      setDeviceModel("Dispositivo");
    }
  };

  const refreshData = () => {
    fetchDeviceLogs();
  };

  const getBatteryColor = (level) => {
    if (level < 20) return "#ef4444";
    if (level < 50) return "#f97316";
    return "#22c55e";
  };

  const getStorageColor = (percentage) => {
    if (percentage > 90) return "#ef4444";
    if (percentage > 70) return "#f97316";
    return "#22c55e";
  };

  const getBatteryIcon = (state) => {
    if (state?.toLowerCase().includes('charging')) return "🔋";
    return "🔋";
  };

  const getConnectionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'wifi': return "📶";
      case 'mobile': return "📱";
      case 'none': return "📵";
      default: return "🌐";
    }
  };

  const formatConnectionType = (type) => {
    switch (type?.toLowerCase()) {
      case 'wifi': return 'Wi-Fi';
      case 'mobile': return 'Dados móveis';
      case 'none': return 'Sem conexão';
      default: return type || 'Desconhecido';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Data desconhecida';
    try {
      const date = new Date(timestamp);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return timestamp.toString();
    }
  };

  const formatBatteryState = (state) => {
    if (!state) return 'Desconhecido';
    const cleanState = state.includes('.') ? state.split('.').pop() : state;
    switch (cleanState.toLowerCase()) {
      case 'charging': return 'Carregando';
      case 'discharging': return 'Descarregando';
      case 'full': return 'Completo';
      case 'connectednotcharging': return 'Conectado (não carregando)';
      default: return cleanState;
    }
  };

  const toDouble = (value) => {
    if (value == null) return 0.0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0.0;
    return 0.0;
  };

  // Calcular estatísticas
  const calculateStats = () => {
    if (logs.length === 0) return { totalLogs: 0, avgBattery: 0, connectionType: 'unknown' };
    
    const totalLogs = pagination.totalLogs || logs.length;
    const avgBattery = logs.reduce((sum, log) => sum + (log.batteryLevel || 0), 0) / logs.length;
    const latestLog = logs[0] || {};
    const connectionType = latestLog.connectionType || 'unknown';
    
    return { totalLogs, avgBattery, connectionType };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="device-logs-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando logs do dispositivo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="device-logs-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Erro ao carregar logs</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={refreshData}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="device-logs-container">
      {/* Header */}
      <div className="logs-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <h1 className="page-title">Logs - {deviceModel}</h1>
        <button className="refresh-button" onClick={refreshData}>
          🔄
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="empty-logs-state">
          <div className="empty-icon">📄</div>
          <h3>Nenhum log encontrado</h3>
          <p>Este dispositivo ainda não enviou logs de sincronização</p>
        </div>
      ) : (
        <>
          {/* Stats Header */}
          <div className="stats-header">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ color: "#3b82f6" }}>📊</div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: "#3b82f6" }}>
                    {stats.totalLogs}
                  </div>
                  <div className="stat-label">Total de Logs</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ color: getBatteryColor(Math.round(stats.avgBattery)) }}>
                  🔋
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: getBatteryColor(Math.round(stats.avgBattery)) }}>
                    {Math.round(stats.avgBattery)}%
                  </div>
                  <div className="stat-label">Bateria Média</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ color: "#259073" }}>
                  {getConnectionIcon(stats.connectionType)}
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: "#259073" }}>
                    {formatConnectionType(stats.connectionType)}
                  </div>
                  <div className="stat-label">Conexão</div>
                </div>
              </div>
            </div>
          </div>

          {/* Logs List */}
          <div className="logs-content">
            <div className="logs-list">
              {logs.map((log, index) => {
                const batteryLevel = log.batteryLevel || 0;
                const diskUsedPercentage = toDouble(log.diskUsedPercentage);
                const speed = toDouble(log.speed);
                let latitude = toDouble(log.latitude);
                let longitude = toDouble(log.longitude);

                // Corrigir coordenadas se necessário
                if (Math.abs(latitude) > 1000) latitude = latitude / 1000000;
                if (Math.abs(longitude) > 1000) longitude = longitude / 1000000;

                return (
                  <div key={index} className="log-card">
                    <div className="log-card-header">
                      <div className="log-number">
                        #{log.syncCount || index + 1}
                      </div>
                      <div className="log-main-info">
                        <h4 className="log-timestamp">
                          {formatTimestamp(log.timestamp)}
                        </h4>
                        <div className="log-quick-stats">
                          <div className="quick-stat">
                            <span className="quick-stat-icon" style={{ color: getBatteryColor(batteryLevel) }}>
                              🔋
                            </span>
                            <span className="quick-stat-text" style={{ color: getBatteryColor(batteryLevel) }}>
                              {batteryLevel}%
                            </span>
                          </div>
                          <div className="quick-stat">
                            <span className="quick-stat-icon" style={{ color: getStorageColor(diskUsedPercentage) }}>
                              💾
                            </span>
                            <span className="quick-stat-text" style={{ color: getStorageColor(diskUsedPercentage) }}>
                              {diskUsedPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="quick-stat">
                            <span className="quick-stat-icon" style={{ color: "#259073" }}>
                              {getConnectionIcon(log.connectionType)}
                            </span>
                            <span className="quick-stat-text">
                              {formatConnectionType(log.connectionType)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        className="expand-button"
                        onClick={() => {
                          const card = document.getElementById(`log-details-${index}`);
                          const button = document.getElementById(`expand-btn-${index}`);
                          if (card.style.display === 'none' || !card.style.display) {
                            card.style.display = 'block';
                            button.textContent = '▼';
                          } else {
                            card.style.display = 'none';
                            button.textContent = '▶';
                          }
                        }}
                        id={`expand-btn-${index}`}
                      >
                        ▶
                      </button>
                    </div>

                    <div id={`log-details-${index}`} className="log-details" style={{ display: 'none' }}>
                      <div className="detail-divider"></div>
                      
                      {/* Mensagem */}
                      <div className="detail-section">
                        <h5 className="detail-section-title">Mensagem</h5>
                        <p className="detail-message">{log.message || 'Sem mensagem'}</p>
                      </div>

                      {/* Bateria */}
                      <div className="detail-section">
                        <h5 className="detail-section-title">Bateria</h5>
                        <div className="battery-details">
                          <span className="battery-icon" style={{ color: getBatteryColor(batteryLevel) }}>
                            🔋
                          </span>
                          <span className="battery-level" style={{ color: getBatteryColor(batteryLevel) }}>
                            {batteryLevel}%
                          </span>
                          <span className="battery-state">
                            {formatBatteryState(log.batteryState)}
                          </span>
                        </div>
                      </div>

                      {/* Armazenamento */}
                      <div className="detail-section">
                        <h5 className="detail-section-title">Armazenamento</h5>
                        <div className="storage-details">
                          <div className="detail-row">
                            <span>Espaço livre:</span>
                            <span>{log.freeDiskSpace || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Espaço total:</span>
                            <span>{log.totalDiskSpace || 'N/A'}</span>
                          </div>
                          <div className="detail-row">
                            <span>Usado:</span>
                            <span>{diskUsedPercentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Conectividade */}
                      {log.connectionType && (
                        <div className="detail-section">
                          <h5 className="detail-section-title">Conectividade</h5>
                          <div className="connectivity-details">
                            <div className="detail-row">
                              <span>Tipo:</span>
                              <span>{formatConnectionType(log.connectionType)}</span>
                            </div>
                            {log.wifiName && (
                              <div className="detail-row">
                                <span>Wi-Fi:</span>
                                <span>{log.wifiName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Localização */}
                      {(latitude !== 0 || longitude !== 0) && (
                        <div className="detail-section">
                          <h5 className="detail-section-title">Localização</h5>
                          <div className="location-details">
                            <div className="detail-row">
                              <span>Coordenadas:</span>
                              <span>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                            </div>
                            {log.altitude && (
                              <div className="detail-row">
                                <span>Altitude:</span>
                                <span>{log.altitude}m</span>
                              </div>
                            )}
                            {log.locationAccuracy && (
                              <div className="detail-row">
                                <span>Precisão:</span>
                                <span>{log.locationAccuracy}m</span>
                              </div>
                            )}
                            <div className="detail-row">
                              <span>Velocidade:</span>
                              <span>{speed.toFixed(2)} m/s</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DeviceLogsPage;