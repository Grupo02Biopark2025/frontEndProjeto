import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, RefreshCw, AlertTriangle, FileText, BarChart3,
  Battery, BatteryLow, BatteryWarning, Zap, HardDrive,
  Wifi, Smartphone, WifiOff, Globe, MapPin, Activity,
  ChevronRight, ChevronDown, Clock, MessageSquare
} from "lucide-react";
import "../styles/DeviceLogsPage.css";

function DeviceLogsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceModel, setDeviceModel] = useState("Dispositivo");
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  useEffect(() => {
    console.log('DeviceLogsPage montado com ID:', id);
    fetchDeviceLogs();
  }, [id]);

  const fetchDeviceLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando logs para o device ID:', id);
      const url = `http://localhost:4040/api/devices/${id}/logs`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setPagination(data.pagination || {});
        
        // Buscar info do device
        if (data.logs && data.logs.length > 0) {
          const deviceId = data.logs[0].deviceId;
          fetchDeviceInfo(deviceId);
        } else {
          fetchDeviceInfo(id);
        }
      } else {
        const errorText = await response.text();
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
      let response = await fetch(`http://localhost:4040/api/devices?deviceId=${deviceId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setDeviceModel(data[0].model || "Dispositivo");
        } else if (data.model) {
          setDeviceModel(data.model);
        } else {
          response = await fetch(`http://localhost:4040/api/devices/${deviceId}`);
          if (response.ok) {
            const device = await response.json();
            setDeviceModel(device.model || "Dispositivo");
          } else {
            setDeviceModel("Dispositivo");
          }
        }
      } else {
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

  const toggleLogExpansion = (index) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
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

  const getBatteryIcon = (level, state) => {
    const isCharging = state?.toLowerCase().includes('charging');
    if (isCharging) return <Zap size={16} />;
    if (level < 20) return <BatteryLow size={16} />;
    if (level < 50) return <BatteryWarning size={16} />;
    return <Battery size={16} />;
  };

  const getConnectionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'wifi': return <Wifi size={16} />;
      case 'mobile': return <Smartphone size={16} />;
      case 'none': return <WifiOff size={16} />;
      default: return <Globe size={16} />;
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
          <div className="error-icon">
            <AlertTriangle size={64} />
          </div>
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
          <ArrowLeft size={18} />
          Voltar
        </button>
        <h1 className="page-title">Logs - {deviceModel}</h1>
        <button className="refresh-button" onClick={refreshData}>
          <RefreshCw size={18} />
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="empty-logs-state">
          <div className="empty-icon">
            <FileText size={64} />
          </div>
          <h3>Nenhum log encontrado</h3>
          <p>Este dispositivo ainda não enviou logs de sincronização</p>
        </div>
      ) : (
        <>
          {/* Stats Header */}
          <div className="stats-header">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ color: "#3b82f6" }}>
                  <BarChart3 size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: "#3b82f6" }}>
                    {stats.totalLogs}
                  </div>
                  <div className="stat-label">Total de Logs</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ color: getBatteryColor(Math.round(stats.avgBattery)) }}>
                  <Battery size={20} />
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: getBatteryColor(Math.round(stats.avgBattery)) }}>
                    {Math.round(stats.avgBattery)}%
                  </div>
                  <div className="stat-label">Bateria Média</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ color: "#2a9d8f" }}>
                  {getConnectionIcon(stats.connectionType)}
                </div>
                <div className="stat-info">
                  <div className="stat-value" style={{ color: "#2a9d8f" }}>
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
                const isExpanded = expandedLogs.has(index);

                // Corrigir coordenadas se necessário
                if (Math.abs(latitude) > 1000) latitude = latitude / 1000000;
                if (Math.abs(longitude) > 1000) longitude = longitude / 1000000;

                return (
                  <div key={index} className="log-card">
                    <div className="log-card-header" onClick={() => toggleLogExpansion(index)}>
                      <div className="log-number">
                        #{log.syncCount || index + 1}
                      </div>
                      <div className="log-main-info">
                        <h4 className="log-timestamp">
                          <Clock size={16} />
                          {formatTimestamp(log.timestamp)}
                        </h4>
                        <div className="log-quick-stats">
                          <div className="quick-stat">
                            <span className="quick-stat-icon" style={{ color: getBatteryColor(batteryLevel) }}>
                              {getBatteryIcon(batteryLevel, log.batteryState)}
                            </span>
                            <span className="quick-stat-text" style={{ color: getBatteryColor(batteryLevel) }}>
                              {batteryLevel}%
                            </span>
                          </div>
                          <div className="quick-stat">
                            <span className="quick-stat-icon" style={{ color: getStorageColor(diskUsedPercentage) }}>
                              <HardDrive size={14} />
                            </span>
                            <span className="quick-stat-text" style={{ color: getStorageColor(diskUsedPercentage) }}>
                              {diskUsedPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="quick-stat">
                            <span className="quick-stat-icon" style={{ color: "#2a9d8f" }}>
                              {getConnectionIcon(log.connectionType)}
                            </span>
                            <span className="quick-stat-text">
                              {formatConnectionType(log.connectionType)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="expand-button">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="log-details">
                        <div className="detail-divider"></div>
                        
                        {/* Mensagem */}
                        <div className="detail-section">
                          <h5 className="detail-section-title">
                            <MessageSquare size={16} />
                            Mensagem
                          </h5>
                          <p className="detail-message">{log.message || 'Sem mensagem'}</p>
                        </div>

                        {/* Bateria */}
                        <div className="detail-section">
                          <h5 className="detail-section-title">
                            <Battery size={16} />
                            Bateria
                          </h5>
                          <div className="battery-details">
                            <span className="battery-icon" style={{ color: getBatteryColor(batteryLevel) }}>
                              {getBatteryIcon(batteryLevel, log.batteryState)}
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
                          <h5 className="detail-section-title">
                            <HardDrive size={16} />
                            Armazenamento
                          </h5>
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
                            <h5 className="detail-section-title">
                              <Wifi size={16} />
                              Conectividade
                            </h5>
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
                            <h5 className="detail-section-title">
                              <MapPin size={16} />
                              Localização
                            </h5>
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
                                <span>
                                  <Activity size={14} style={{ marginRight: '4px' }} />
                                  {speed.toFixed(2)} m/s
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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