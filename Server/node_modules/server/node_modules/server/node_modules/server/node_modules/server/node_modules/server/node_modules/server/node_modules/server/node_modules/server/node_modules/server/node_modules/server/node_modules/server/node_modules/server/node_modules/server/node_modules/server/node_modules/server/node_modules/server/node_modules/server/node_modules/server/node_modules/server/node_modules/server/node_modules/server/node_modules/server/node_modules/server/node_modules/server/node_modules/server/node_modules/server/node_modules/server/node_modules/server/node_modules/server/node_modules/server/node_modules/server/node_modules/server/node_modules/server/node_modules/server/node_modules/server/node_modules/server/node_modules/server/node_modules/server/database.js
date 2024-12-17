import initSqlJs from 'sql.js';


async function initializeDatabase(sqljs) {
    // Importiere die sql.js Bibliothek asynchron.
    const SQL = await initSqlJs({
      // Optional: Lade die Datenbankdatei, falls vorhanden.
      // locateFile: file => `./${file}`
    });
  
    // Erstelle eine neue Datenbankinstanz.
    const db = new SQL.Database();
  
    // Datenbanktransaktion starten
    db.run("BEGIN TRANSACTION");
  
    try {
      // Erstelle die Tabelle "Orte", falls sie noch nicht existiert.
      db.run(`
          CREATE TABLE IF NOT EXISTS Orte (
              id INTEGER PRIMARY KEY,
              name VARCHAR(255),
              lat FLOAT,
              long FLOAT
          );
      `);
  
      // Beispielhafte Orte einfügen.
      const orte = [
        { id: 1, name: 'Schlossgarten', lat: 53.1437, long: 8.2137 },
        { id: 2, name: 'Lappan', lat: 53.1412, long: 8.2154 },
        { id: 3, name: 'Hauptbahnhof', lat: 53.1405, long: 8.2198 },
        { id: 4, name: 'Eisdiele', lat: 56.1405, long: 9.2198 },
      ];
      orte.forEach(ort => {
        // Füge jeden Ort in die Tabelle "Orte" ein, falls er noch nicht existiert.
        // Verwende Prepared Statements, um SQL Injection zu verhindern.
        db.run(`INSERT OR IGNORE INTO Orte (id, name, lat, long) VALUES (?, ?, ?, ?)`, [ort.id, ort.name, ort.lat, ort.long]);
      });
  
      // Erstelle die Tabelle "Umfrage", falls sie noch nicht existiert.
      db.run(`
          CREATE TABLE IF NOT EXISTS Umfrage (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              frage TEXT,
              ort_id INTEGER,
              FOREIGN KEY (ort_id) REFERENCES Orte(id)
          );
      `);
  
      // Beispielhafte Umfragen einfügen.
      const umfragen = [
        { frage: 'Wie hat dir der Schlossgarten gefallen?', ort_id: 1 },
        { frage: 'Was denkst du über den Lappan?', ort_id: 2 },
        { frage: 'Wohin möchtest du als nächstes gehen?', ort_id: 3 },
        { frage: 'Was isst du am liebsten?', ort_id: 4},
      ];
      umfragen.forEach(umfrage => {
        // Füge jede Umfrage in die Tabelle "Umfrage" ein, falls sie noch nicht existiert.
        // Verwende Prepared Statements, um SQL Injection zu verhindern.
        db.run(`INSERT OR IGNORE INTO Umfrage (frage, ort_id) VALUES (?, ?)`, [umfrage.frage, umfrage.ort_id]);
      });
  
      // Erstelle die Tabelle "Antwort", falls sie noch nicht existiert.
      db.run(`
          CREATE TABLE IF NOT EXISTS Antwort (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              antwort TEXT,
              umfrage_id INTEGER,
              ziel_ort_id INTEGER,
              FOREIGN KEY (umfrage_id) REFERENCES Umfrage(id),
              FOREIGN KEY (ziel_ort_id) REFERENCES Orte(id)
          );
      `);
  
      // Beispielhafte Antworten einfügen.
      const antworten = [
        { antwort: 'Sehr schön!', umfrage_id: 1, ziel_ort_id: 2 },
        { antwort: 'Nicht so gut', umfrage_id: 1, ziel_ort_id: 3 },
        { antwort: 'Interessant', umfrage_id: 2, ziel_ort_id: 3 },
        { antwort: 'Langweilig', umfrage_id: 2, ziel_ort_id: 1 },
        { antwort: 'Zum Schlossgarten', umfrage_id: 3, ziel_ort_id: 1 },
        { antwort: 'Zum Lappan', umfrage_id: 3, ziel_ort_id: 2 },
      ];
      antworten.forEach(antwort => {
        // Füge jede Antwort in die Tabelle "Antwort" ein, falls sie noch nicht existiert.
        // Verwende Prepared Statements, um SQL Injection zu verhindern.
        db.run(`INSERT OR IGNORE INTO Antwort (antwort, umfrage_id, ziel_ort_id) VALUES (?, ?, ?)`, [antwort.antwort, antwort.umfrage_id, antwort.ziel_ort_id]);
      });
  
      // Beende die Transaktion und speichere die Änderungen.
      db.run("COMMIT");
    } catch (error) {
      // Falls ein Fehler auftritt, mache alle Änderungen rückgängig.
      console.error("Fehler beim Initialisieren der Datenbank:", error);
      db.run("ROLLBACK");
    }
  
    // Gib die Datenbankinstanz zurück.
    console.log("Datenbank initialisiert");
    return db;
  }
  
  async function getOrtData(db, ortId) {
    // Führe eine SQL-Abfrage aus, um die Daten für den angegebenen Ort abzurufen.
    // Verwende einen JOIN, um die Daten aus den Tabellen "Orte", "Umfrage" und "Antwort" zu kombinieren.
    // Verwende Prepared Statements, um SQL Injection zu verhindern.
    const result = db.exec(`
      SELECT 
        O.id AS ort_id, O.name AS ort_name, O.lat AS ort_lat, O.long AS ort_long,
        U.id AS umfrage_id, U.frage AS umfrage_frage,
        A.id AS antwort_id, A.antwort AS antwort_text, A.ziel_ort_id AS antwort_ziel_ort_id
      FROM Orte O
      LEFT JOIN Umfrage U ON O.id = U.ort_id
      LEFT JOIN Antwort A ON U.id = A.umfrage_id
      WHERE O.id = ?
    `, [ortId])[0];
  
    // Initialisiere die Variablen für die Rückgabewerte.
    const ort = {};
    const umfragen = [];
    const antworten = [];
  
    // Überprüfe, ob die Abfrage Ergebnisse zurückgegeben hat.
    if (result && result.values && result.values.length > 0) {
      // Extrahiere die Daten aus result.values.
  
      // Extrahiere die Daten für den Ort aus der ersten Zeile.
      ort.id = result.values[0][0];
      ort.name = result.values[0][1];
      ort.lat = result.values[0][2];
      ort.long = result.values[0][3];
  
      // Iteriere über die Ergebniszeilen und extrahiere die Daten für die Umfragen und Antworten.
      result.values.forEach(row => {
        const umfrageId = row[4];
        const umfrageFrage = row[5];
        const antwortId = row[6];
        const antwortText = row[7];
        const antwortZielOrtId = row[8];
  
        // Füge die Umfrage hinzu, falls sie noch nicht existiert.
        const existingUmfrage = umfragen.find(u => u.id === umfrageId);
        if (!existingUmfrage && umfrageId) {
          umfragen.push({ id: umfrageId, frage: umfrageFrage });
        }
  
        // Füge die Antwort hinzu, falls sie existiert.
        if (antwortId) {
          antworten.push({ id: antwortId, antwort: antwortText, umfrage_id: umfrageId, ziel_ort_id: antwortZielOrtId });
        }
      });
    }
  
    // Gib die extrahierten Daten zurück.
    return { ort, umfragen, antworten };
  }
  
  // Exportiere die Funktionen, damit sie in anderen Dateien verwendet werden können.
  export { initializeDatabase, getOrtData };
