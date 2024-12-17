import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Spiel() {
  const location = useLocation();
  const [ort, setOrt] = useState(null);
  const [umfrage, setUmfrage] = useState(null);
  const [antworten, setAntworten] = useState([]);

  useEffect(() => {
    console.log("useEffect wird ausgeführt mit location.key:", location.key);
    const ladeOrt = async () => {
      const searchParams = new URLSearchParams(location.search);
      const qrId = searchParams.get("id");
      if (qrId) {
        try {
          // State-Variablen zurücksetzen
          setOrt(null);
          setUmfrage(null);
          setAntworten([]);

          const response = await fetch(`/api/ort/${qrId}`);
          const data = await response.json();
          setOrt(data.ort);
          setUmfrage(data.umfragen[0]);
          setAntworten(data.antworten);
        } catch (error) {
          console.error("Fehler beim Laden der Daten:", error);
        }
      }
    };
    ladeOrt();
    // window.location.reload(); // Seite neu laden
  }, [location]); // location als Abhängigkeit

  return (
    <div>
      {ort && (
        <div>
          <h2>{ort.name}</h2>
          {umfrage && antworten.length > 0 && (
            <div>
              <p>{umfrage.frage}</p>
              <ul>
                {antworten.map((antwort) => (
                  <li key={antwort.id}>
                    <Link to={`/ort?id=${antwort.ziel_ort_id}`}>
                      {antwort.antwort}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <MapContainer center={[53.1437, 8.2137]} zoom={13} scrollWheelZoom={false} style={{ height: "400px" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {ort && (
              <Marker position={[ort.lat, ort.long]}>
                <Popup>
                  {ort.name}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default Spiel;