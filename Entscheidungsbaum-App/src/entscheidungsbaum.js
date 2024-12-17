export const entscheidungsbaum = {
    start: {
      text: "Du wachst in einem dunklen Wald auf. Was machst du?",
      optionen: {
        "Umsehen": "umsehen",
        "Weglaufen": "weglaufen"
      }
    },
    umsehen: {
      text: "Du siehst einen Pfad und eine Hütte. Wohin gehst du?",
      optionen: {
        "Pfad": "pfad",
        "Hütte": "huette"
      }
    },
    weglaufen: {
      text: "Du rennst weg und verirrst dich im Wald. Game Over!",
      optionen: null // Keine weiteren Optionen, Spielende
    },
    // ... weitere Knoten (pfad, huette, etc.)
  };