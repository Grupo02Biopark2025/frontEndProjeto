import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, X, Smartphone, Monitor, Laptop, 
  ChevronUp, ChevronLeft, ChevronRight,
  HardDrive, Wifi, WifiOff
} from "lucide-react";
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
      let url = `http://localhost:4040/api/devices?page=${currentPage}&limit=15`;
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
    if (!os) return <Smartphone size={16} />;
    const osLower = os.toLowerCase();
    if (osLower.includes('android')) return <Smartphone size={16} />;
    if (osLower.includes('ios')) return <Smartphone size={16} />;
    if (osLower.includes('windows')) return <Monitor size={16} />;
    if (osLower.includes('mac')) return <Laptop size={16} />;
    return <Monitor size={16} />;
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
    return "#2a9d8f";
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
              {isSearching ? <X size={20} /> : <Search size={20} />}
            </button>
          </div>
          
          {isSearching && (
            <div className="search-container">
              <Search className="search-icon" size={20} />
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

      {/* Device List */}
      <div className="devices-content">
        {devices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Smartphone size={64} />
            </div>
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
                        <Smartphone size={28} />
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
                        <span className="status-badge online">
                          <Wifi size={12} />
                          Online
                        </span>
                      </div>

                      <div className="device-os">
                        {getOSIcon(device.os)}
                        <span className="os-text">
                          {device.os || "Desconhecido"} {device.osVersion || ""}
                        </span>
                      </div>

                      {/* Storage Bar */}
                      <div className="storage-info">
                        <HardDrive size={14} />
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
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                <span className="pagination-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <ChevronUp size={20} />
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