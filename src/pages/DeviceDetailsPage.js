import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft, RefreshCw, Smartphone, Battery, BatteryLow, BatteryWarning,
  HardDrive, Wifi, Smartphone as Mobile, WifiOff, Globe, Activity,
  Clock, AlertTriangle, Eye, Navigation, MapPin, Zap, Signal
} from "lucide-react";
import "../styles/DeviceDetailsPage.css";

function DeviceDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const deviceFromState = location.state?.device;
  
  const [device, setDevice] = useState(deviceFromState);
  const [lastLog, setLastLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!device && id) {
      fetchDeviceDetails(id);
    }
    if (device?.deviceId || device?.id || id) {
      const deviceIdentifier = device?.deviceId || device?.id || id;
      fetchLastLog(deviceIdentifier);
    }
  }, [device, id]);

  const fetchDeviceDetails = async (deviceId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4040/api/devices/${deviceId}`);
      if (response.ok) {
        const deviceData = await response.json();
        setDevice(deviceData);
      } else {
        setError("Dispositivo não encontrado");
      }
    } catch (err) {
      setError("Erro ao carregar dispositivo");
    } finally {
      setLoading(false);
    }
  };

  const fetchLastLog = async (deviceId) => {
    try {
      console.log('Buscando último log para device:', deviceId);
      const url = `http://localhost:4040/api/devices/${deviceId}/logs`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.logs && data.logs.length > 0) {
          setLastLog(data.logs[0]);
        } else {
          setLastLog(null);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar último log:", err);
    }
  };

  const refreshData = () => {
    const deviceIdentifier = device?.deviceId || device?.id || id;
    if (deviceIdentifier) {
      fetchLastLog(deviceIdentifier);
      if (!deviceFromState) {
        fetchDeviceDetails(deviceIdentifier);
      }
    }
  };

  const getBatteryIcon = (level, state) => {
    const isCharging = state?.toLowerCase().includes('charging');
    if (isCharging) return <Zap size={20} />;
    if (level < 20) return <BatteryLow size={20} />;
    if (level < 50) return <BatteryWarning size={20} />;
    return <Battery size={20} />;
  };

  const getBatteryColor = (level) => {
    if (level < 20) return "#ef4444";
    if (level < 50) return "#f97316";
    return "#22c55e";
  };

  const getStorageColor = (percentage) => {
    if (percentage > 90) return "#ef4444";
    if (percentage > 70) return "#f97316";
    return "#2a9d8f";
  };

  const getConnectionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'wifi': return <Wifi size={20} />;
      case 'mobile': return <Mobile size={20} />;
      case 'none': return <WifiOff size={20} />;
      default: return <Globe size={20} />;
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

  const truncateDeviceId = (deviceId) => {
    const id = String(deviceId || '');
    if (!id || id === 'null' || id === 'undefined' || id.length <= 12) {
      return id || 'N/A';
    }
    return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="device-details-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando detalhes do dispositivo...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="device-details-container">
        <div className="error-state">
          <div className="error-icon">
            <AlertTriangle size={64} />
          </div>
          <h3>Erro ao carregar dispositivo</h3>
          <p>{error || "Dispositivo não encontrado"}</p>
          <button className="retry-btn" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="device-details-container">
      {/* Header */}
      <div className="details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Voltar
        </button>
        <h1 className="page-title">Detalhes do Dispositivo</h1>
        <button className="refresh-button" onClick={refreshData}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="details-content">
        {/* Device Info Card */}
        <div className="device-info-card">
          <div className="device-info-header">
            <div className="device-icon">
              <Smartphone size={32} />
            </div>
            <div className="device-basic-info">
              <h2 className="device-model">{device.model || "Modelo desconhecido"}</h2>
              <p className="device-id">ID: {truncateDeviceId(device.deviceId || device.id)}</p>
            </div>
          </div>
          
          <div className="device-info-details">
            <div className="info-row">
              <span className="info-label">Sistema Operacional</span>
              <span className="info-value">
                {device.os || "Desconhecido"} {device.osVersion || ""}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Espaço Total</span>
              <span className="info-value">{device.totalDiskSpace || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Espaço Livre</span>
              <span className="info-value">{device.freeDiskSpace || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Status Atual */}
        {lastLog && (
          <>
            <div className="section-title">
              <h3>Status Atual</h3>
            </div>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon" style={{ color: getBatteryColor(lastLog.batteryLevel || 0) }}>
                  {getBatteryIcon(lastLog.batteryLevel || 0, lastLog.batteryState)}
                </div>
                <div className="metric-info">
                  <span className="metric-label">Bateria</span>
                  <span className="metric-value" style={{ color: getBatteryColor(lastLog.batteryLevel || 0) }}>
                    {lastLog.batteryLevel || 0}%
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ color: getStorageColor(lastLog.diskUsedPercentage || 0) }}>
                  <HardDrive size={20} />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Armazenamento</span>
                  <span className="metric-value" style={{ color: getStorageColor(lastLog.diskUsedPercentage || 0) }}>
                    {(lastLog.diskUsedPercentage || 0).toFixed(1)}% usado
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ color: "#2a9d8f" }}>
                  {getConnectionIcon(lastLog.connectionType)}
                </div>
                <div className="metric-info">
                  <span className="metric-label">Conexão</span>
                  <span className="metric-value">
                    {formatConnectionType(lastLog.connectionType)}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ color: "#3b82f6" }}>
                  <Activity size={20} />
                </div>
                <div className="metric-info">
                  <span className="metric-label">Velocidade</span>
                  <span className="metric-value">
                    {(lastLog.speed || 0).toFixed(2)} m/s
                  </span>
                </div>
              </div>
            </div>

            {/* Último Log */}
            <div className="section-title">
              <h3>Último Log</h3>
            </div>
            
            <div className="last-log-card">
              <div className="log-header">
                <span className="log-timestamp">
                  <Clock size={16} />
                  {formatTimestamp(lastLog.timestamp)}
                </span>
                <div className="sync-badge">
                  <Signal size={14} />
                  Sync #{lastLog.syncCount || '0'}
                </div>
              </div>

              <div className="log-message">
                <strong>Mensagem:</strong> {lastLog.message || 'Sem mensagem'}
              </div>

              <div className="log-details">
                <div className="log-section">
                  <h4><Battery size={16} /> Bateria</h4>
                  <div className="battery-info">
                    <span className="battery-icon" style={{ color: getBatteryColor(lastLog.batteryLevel || 0) }}>
                      {getBatteryIcon(lastLog.batteryLevel || 0, lastLog.batteryState)}
                    </span>
                    <span className="battery-level" style={{ color: getBatteryColor(lastLog.batteryLevel || 0) }}>
                      {lastLog.batteryLevel || 0}%
                    </span>
                    <span className="battery-state">
                      {formatBatteryState(lastLog.batteryState)}
                    </span>
                  </div>
                </div>

                <div className="log-section">
                  <h4><HardDrive size={16} /> Armazenamento</h4>
                  <div className="storage-details">
                    <div className="storage-row">
                      <span>Espaço livre:</span>
                      <span>{lastLog.freeDiskSpace || 'N/A'}</span>
                    </div>
                    <div className="storage-row">
                      <span>Espaço total:</span>
                      <span>{lastLog.totalDiskSpace || 'N/A'}</span>
                    </div>
                    <div className="storage-row">
                      <span>Percentual usado:</span>
                      <span>{(lastLog.diskUsedPercentage || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {lastLog.connectionType && (
                  <div className="log-section">
                    <h4><Wifi size={16} /> Conectividade</h4>
                    <div className="connectivity-details">
                      <div className="connectivity-row">
                        <span>Tipo de conexão:</span>
                        <span>{formatConnectionType(lastLog.connectionType)}</span>
                      </div>
                      {lastLog.wifiName && (
                        <div className="connectivity-row">
                          <span>Nome da rede:</span>
                          <span>{lastLog.wifiName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(lastLog.altitude || lastLog.locationAccuracy || lastLog.speed) && (
                  <div className="log-section">
                    <h4><MapPin size={16} /> Informações de Localização</h4>
                    <div className="location-details">
                      {lastLog.altitude && (
                        <div className="location-row">
                          <span>Altitude:</span>
                          <span>{lastLog.altitude}m</span>
                        </div>
                      )}
                      {lastLog.locationAccuracy && (
                        <div className="location-row">
                          <span>Precisão:</span>
                          <span>{lastLog.locationAccuracy}m</span>
                        </div>
                      )}
                      {lastLog.speed && (
                        <div className="location-row">
                          <span>Velocidade:</span>
                          <span>{(lastLog.speed).toFixed(2)} m/s</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {!lastLog && (
          <div className="no-log-card">
            <div className="no-log-icon">
              <Clock size={48} />
            </div>
            <h3>Nenhum log disponível</h3>
            <p>Este dispositivo ainda não enviou logs de sincronização</p>
          </div>
        )}

        {/* Actions */}
        <div className="actions-section">
          <button 
            className="primary-button"
            onClick={() => {
              const deviceIdentifier = device?.deviceId || device?.id || id;
              navigate(`/devices/${deviceIdentifier}/logs`);
            }}
          >
            <Eye size={18} />
            Visualizar Todos os Logs
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeviceDetailsPage;