import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DeviceList.css";

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();
  }, [currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchDevices = async (search = "") => {
    setLoading(true);
    try {
      let url = `http://localhost:8090/api/devices?page=${currentPage}&limit=15`;
      if (search && search.trim() !== "") {
        url += `&search=${search}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      
      setDevices(data.devices);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Erro ao buscar dispositivos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
    fetchDevices(term);
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchTerm("");
      setCurrentPage(1);
      fetchDevices();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const getOSIcon = (os) => {
    if (!os) return "📱";
    if (os.toLowerCase().includes('android')) return "🤖";
    if (os.toLowerCase().includes('ios')) return "📱";
    if (os.toLowerCase().includes('windows')) return "🪟";
    return "💻";
  };

  const getAvatarText = (model) => {
    if (!model) return "??";
    return model
      .split(' ')
      .filter(word => word.length > 0)
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join('');
  };

  const truncateDeviceId = (deviceId) => {
    // Converte para string caso seja um número ou outro tipo
    const id = String(deviceId);
    if (!id || id === 'null' || id === 'undefined' || id.length <= 12) {
      return `ID: ${id || 'N/A'}`;
    }
    return `ID: ${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
  };

  const getStoragePercentage = (device) => {
    try {
      if (!device.freeDiskSpace || !device.totalDiskSpace) return 0.5;
      
      const freeMatch = device.freeDiskSpace.match(/(\d+\.?\d*)/);
      const totalMatch = device.totalDiskSpace.match(/(\d+\.?\d*)/);
      
      if (!freeMatch || !totalMatch) return 0.5;
      
      const freeSpace = parseFloat(freeMatch[1]) || 0;
      const totalSpace = parseFloat(totalMatch[1]) || 1;
      
      if (totalSpace <= 0) return 0.0;
      
      const usedPercentage = 1.0 - (freeSpace / totalSpace);
      return Math.max(0, Math.min(1, usedPercentage));
    } catch (e) {
      return 0.5;
    }
  };

  const getStorageColor = (percentage) => {
    if (percentage > 0.9) return "#ef4444";
    if (percentage > 0.7) return "#f97316";
    return "#259073";
  };

  if (loading && devices.length === 0) {
    return (
      <div className="device-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando dispositivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="device-list-container">
      {/* Header */}
      <div className="device-header">
        <div className="header-content">
          <div className="header-top">
            <h1 className="page-title">Dispositivos</h1>
            <button className="search-toggle-btn" onClick={toggleSearch}>
              {isSearching ? "✕" : "🔍"}
            </button>
          </div>
          
          {isSearching && (
            <div className="search-container">
              <input
                type="text"
                placeholder="Pesquisar por modelo ou SO..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
                autoFocus
              />
            </div>
          )}
          
          <p className="device-count">
            {devices.length} dispositivos encontrados
          </p>
        </div>
      </div>

      <div className="divider"></div>

      {/* Device List */}
      <div className="devices-content">
        {devices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📱</div>
            <h3>Nenhum dispositivo encontrado</h3>
            {isSearching && (
              <p>Tente uma pesquisa diferente</p>
            )}
          </div>
        ) : (
          <>
            <div className="device-grid">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="device-card"
                  onClick={() => navigate(`/devices/${device.id}`, { state: { device } })}
                >
                  <div className="device-card-content">
                    {/* Avatar */}
                    <div className="device-avatar">
                      {getAvatarText(device.model) === "??" ? (
                        <span className="avatar-icon">📱</span>
                      ) : (
                        <span className="avatar-text">
                          {getAvatarText(device.model)}
                        </span>
                      )}
                    </div>

                    {/* Device Info */}
                    <div className="device-info">
                      <div className="device-header-row">
                        <h3 className="device-model">{device.model || "Modelo desconhecido"}</h3>
                        <span className="status-badge online">Online</span>
                      </div>

                      <div className="device-os">
                        <span className="os-icon">{getOSIcon(device.os)}</span>
                        <span className="os-text">
                          {device.os || "Desconhecido"} {device.osVersion || ""}
                        </span>
                      </div>

                      {/* Storage Bar */}
                      <div className="storage-info">
                        <div className="storage-bar">
                          <div
                            className="storage-fill"
                            style={{
                              width: `${getStoragePercentage(device) * 100}%`,
                              backgroundColor: getStorageColor(getStoragePercentage(device))
                            }}
                          ></div>
                        </div>
                        <span className="storage-text">
                          {device.freeDiskSpace || "N/A"} livres
                        </span>
                      </div>

                      <div className="device-id">
                        {truncateDeviceId(device.deviceId)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {!searchTerm && totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  ← Anterior
                </button>
                <span className="pagination-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          ↑
        </button>
      )}

      {/* Loading indicator for pagination */}
      {loading && devices.length > 0 && (
        <div className="loading-more">
          <div className="spinner-small"></div>
        </div>
      )}
    </div>
  );
}

export default DeviceList;