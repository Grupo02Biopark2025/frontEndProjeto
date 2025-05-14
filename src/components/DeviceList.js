import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DeviceList.css";

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8090/api/devices?page=${currentPage}&limit=10`)
      .then((response) => response.json())
      .then((data) => {
        setDevices(data.devices);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar dispositivos:", error);
        setLoading(false);
      });
  }, [currentPage]);

  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      fetch(`http://localhost:8090/api/devices?page=${currentPage}&limit=10`)
        .then((response) => response.json())
        .then((data) => {
          setDevices(data.devices);
          setTotalPages(data.totalPages);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao buscar dispositivos:", error);
          setLoading(false);
        });
    } else {
      fetch(`http://localhost:8090/api/devices?search=${term}`)
        .then((response) => response.json())
        .then((data) => {
          setDevices(data.devices);
          setTotalPages(1);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao buscar dispositivos:", error);
          setLoading(false);
        });
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

  if (loading) {
    return <p>Carregando dispositivos...</p>;
  }

  return (
    <div className="device-list-container">
      <h1>Dispositivos</h1>
      <input
        type="text"
        placeholder="Procurar"
        className="device-search-input"
        value={searchTerm}
        onChange={handleSearch}
      />
      <button className="add-device-button">+ Adicionar novo dispositivo</button>
      <ul className="device-list">
        {devices.map((device) => (
          <li key={device.id} className="device-item">
            <div>
              <h2>{device.model}</h2>
              <p>
                <strong>OS:</strong> {device.os} {device.osVersion}
              </p>
            </div>
            <button
              className="details-button"
              onClick={() =>
                navigate(`/devices/${device.id}`, { state: { device } })
              }
            >
              Ver detalhes
            </button>
          </li>
        ))}
      </ul>
      {!searchTerm && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="pagination-button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

export default DeviceList;