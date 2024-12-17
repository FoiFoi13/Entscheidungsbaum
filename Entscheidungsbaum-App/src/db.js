import initSqlJs from 'sql.js';

let db; // Variable für die Datenbankverbindung

export async function getDatabase() {
  if (!db) {
    const SQL = await initSqlJs({
      // Optional: Lade die Datenbankdatei, falls vorhanden
      // locateFile: file => `./${file}` 
    });
    db = new SQL.Database();

    try {
      db.run("BEGIN TRANSACTION"); // Transaktion starten

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
        db.run(`INSERT OR IGNORE INTO Antwort (antwort, umfrage_id, ziel_ort_id) VALUES (?, ?, ?)`, [antwort.antwort, antwort.umfrage_id, antwort.ziel_ort_id]);
      });

      db.run("COMMIT"); // Transaktion beenden
    } catch (error) {
      console.error("Fehler beim Initialisieren der Datenbank:", error);
      db.run("ROLLBACK"); // Im Fehlerfall Rollback durchführen
    }
  }
  return db;
}