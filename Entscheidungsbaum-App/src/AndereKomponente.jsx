import React, { useEffect } from 'react';
import { getDatabase } from './db';

function AndereKomponente() {
  useEffect(() => {
    const fetchData = async () => {
      const db = await getDatabase();
      // ... (Hier kannst du die Datenbankverbindung db verwenden) ...
    };
    fetchData();
  }, []);

  // ... restlicher Code ...
}