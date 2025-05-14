import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/DeviceDetailsPage.css";

function DeviceDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const device = location.state?.device;

  if (!device) {
    return <p>Dispositivo não encontrado.</p>;
  }

  return (
    <div className="device-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        Voltar
      </button>
      <h1>{device.model}</h1>
      <p>
        <strong>Modelo:</strong> {device.model}
      </p>
      <p>
        <strong>IMEI:</strong> {device.deviceId}
      </p>
      <p>
        <strong>Última sincronização:</strong> 07/03/2025 - 14:21h
      </p>
      <p>
        <strong>Status da sincronização:</strong>{" "}
        <span style={{ color: "red" }}>Dispositivo bloqueado</span>
      </p>
      <div className="actions">
        <button>Forçar sincronização</button>
        <button>Ver histórico de sincronizações</button>
        <button>Marcar como inativo</button>
        <button>Desbloquear/Bloquear</button>
        <button>Excluir dispositivo</button>
      </div>
    </div>
  );
}

export default DeviceDetailsPage;