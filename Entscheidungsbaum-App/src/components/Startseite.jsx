import React, { useState, useEffect } from 'react';
import '../Startseite.css';
import { Link } from 'react-router-dom'; 

function Startseite() { // onSpielStart wird nicht mehr benötigt
  const queryParameters = new URLSearchParams(window.location.search);
  const qrId = queryParameters.get("id");
  const [ort, setOrt] = useState(null);
  const [umfrage, setUmfrage] = useState(null);
  const [antworten, setAntworten] = useState([]);

    useEffect(() => {
        const ladeOrt = async () => {
          if (qrId) {
            try {
              const response = await fetch(`/api/ort/${qrId}`) 
              const data = await response.json();
              setOrt(data.ort); // Ort setzen
              setUmfrage(data.umfragen[0]); // Umfrage setzen (falls vorhanden)
              setAntworten(data.antworten); // Antworten setzen
            } catch (error) {
              console.error("Fehler beim Laden der Daten:", error);
            }
          }
        };
        ladeOrt();
      }, [qrId]);

      return (
        <div className="container">
          {!ort && ( // Zeige den Startseiteninhalt nur an, wenn ort NICHT gesetzt ist
            <>
              <h1 className="text-center mb-4">Willkommen zum Entscheidungsbaum-Abenteuer!</h1>
              <p className="text-center">Du erwachst in einem dunklen Wald...</p>
              <div className="d-flex justify-content-center">
                <Link to="/ort?id=1" className="btn btn-primary start-button"> 
                  Spiel starten
                </Link>
              </div>
            </>
          )}
    
          {ort && (
            <div>
              <h2>{ort.name}</h2>
              {umfrage && antworten.length > 0 && (
                <div>
                  <p>{umfrage.frage}</p>
                  <ul>
                    {antworten.map(antwort => (
                      <li key={antwort.id}>
                        <Link to={`/ort?id=${antwort.ziel_ort_id}`}> {/* Link in der Antwort */}
                          {antwort.antwort}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    export default Startseite;