import { initializeDatabase, getOrtData } from './database.js'; 
import sqljs from "sql.js"; // Import mit 'import'
import express from 'express'; // Import mit 'import'
import cors from 'cors';

const fs = require('fs');

// JSON-Datei laden (achte auf den korrekten Pfad)
const rawData = fs.readFileSync('./tree.json'); // Passe den Pfad ggf. an
const treeData = JSON.parse(rawData); 

class DecisionTree {
  constructor(treeData) {
    this.tree = treeData.tree; // Wurzelknoten
    this.nodes = treeData.nodes; // Alle anderen Knoten
    this.currentNode = this.tree; // Startknoten
  }

  getCurrentNode() {
    return this.currentNode;
  }

  getNextNode(optionIndex) {
    const nextNodeId = this.currentNode.options[optionIndex].next;
    this.currentNode = this.nodes[nextNodeId];
    return this.currentNode;
  }
}

const tree = new DecisionTree(treeData);

const app = express();
app.use(cors()); // CORS aktivieren
const port = 3000;

let db; // Variable für die Datenbankverbindung

const server = app.listen(3000, async (err) => { 
  if (err) {
    if (err.code === 'EADDRINUSE') {
      const newPort = 3001; 
      server.close(); // Schließe den Server, der auf Port 3000 hört
      app.listen(newPort, async () => { // Starte einen neuen Server auf newPort
        console.log(`Server läuft auf Port ${newPort}`);
        db = await initializeDatabase(sqljs); 
      });
    } else {
      console.error("Fehler beim Starten des Servers:", err);
    }
  } else {
    console.log(`Server läuft auf Port ${server.address().port}`);
    db = await initializeDatabase(sqljs); 
  }
});

app.get('/', (req, res) => {
  res.send('Hallo von meinem Express-Server!');
});

app.get('/ort/:id', async (req, res) => {
  const ortId = req.params.id;
  try {
    const data = await getOrtData(db, ortId);
    if (data) {
      res.json(data);
    } else {
      res.status(404).send('Ort nicht gefunden');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Fehler beim Abrufen der Daten');
  }
});