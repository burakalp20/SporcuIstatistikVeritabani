require("dotenv").config();

const cors = require("cors");
const express = require("express");
const sql = require("mssql/msnodesqlv8");

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

const dbServer = process.env.DB_SERVER || "localhost";
const dbDatabase = process.env.DB_DATABASE || "SporcuIstatistikVeritabani";
const dbDriver = process.env.DB_ODBC_DRIVER || "ODBC Driver 18 for SQL Server";
const shouldTrustCertificate = process.env.DB_TRUST_SERVER_CERTIFICATE !== "false";

// Windows Authentication kullanildigi icin kullanici adi/sifre yerine
// calisan Windows kullanicisinin SQL Server yetkisi kullanilir.
const dbConfig = {
  connectionString: [
    `Driver={${dbDriver}}`,
    `Server=${dbServer}`,
    `Database=${dbDatabase}`,
    "Trusted_Connection=Yes",
    shouldTrustCertificate ? "TrustServerCertificate=Yes" : "",
  ]
    .filter(Boolean)
    .join(";"),
  driver: "msnodesqlv8",
};

let poolPromise;

function getPool() {
  // Her istekte yeni SQL baglantisi acmamak icin tek bir connection pool tekrar kullanilir.
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig);
  }

  return poolPromise;
}

function mapPlayer(row) {
  // SQL'deki Turkce kolon adlari uygulamanin bekledigi Player formatina cevrilir.
  return {
    // Ayni oyuncu bazi liglerde birden fazla istatistik satirina sahip olabilir.
    // React listelerinde key cakismamasi icin istatistik satiri da anahtara eklenir.
    rowKey: `${row.statId}-${row.id}-${row.teamId}-${row.leagueId}`,
    id: row.id,
    name: row.name,
    surname: row.surname,
    team: row.team,
    league: row.league,
    goals: row.goals ?? 0,
    assists: row.assists ?? 0,
    yellowCards: row.yellowCards ?? 0,
    redCards: row.redCards ?? 0,
    minutes: row.minutes ?? 0,
    season: row.season,
    clubCareer: {
      matches: row.careerMatches ?? 0,
      goals: row.careerGoals ?? 0,
      assists: row.careerAssists ?? 0,
    },
  };
}

// Oyuncu, takim, lig, sezon istatistigi ve kulup kariyeri tek sorguda birlestirilir.
// Boylece frontend tarafinda mockData yerine dogrudan iliskisel SQL verisi kullanilir.
const playersSelect = `
  SELECT
    si.id AS statId,
    o.id AS id,
    t.id AS teamId,
    l.id AS leagueId,
    o.ad AS name,
    o.soyad AS surname,
    t.ad AS team,
    l.ad AS league,
    si.gol AS goals,
    si.asist AS assists,
    si.kart_sari AS yellowCards,
    si.kart_kirmizi AS redCards,
    si.dakika AS minutes,
    si.sezon AS season,
    kk.mac_sayisi AS careerMatches,
    kk.gol AS careerGoals,
    kk.asist AS careerAssists
  FROM dbo.Sezon_Istatistik si
  INNER JOIN dbo.Oyuncu o ON si.oyuncu_id = o.id
  INNER JOIN dbo.Takim t ON si.takim_id = t.id
  INNER JOIN dbo.Lig l ON si.lig_id = l.id
  OUTER APPLY (
    SELECT TOP 1 mac_sayisi, gol, asist
    FROM dbo.Kulup_Kariyeri kk
    WHERE kk.oyuncu_id = o.id AND kk.takim_id = t.id
    ORDER BY kk.id DESC
  ) kk
`;

// Siralama kolonu kullanicidan geldiginde dogrudan SQL'e yazilmaz.
// Sadece bu listede izin verilen kolonlar kullanilir.
const rankingColumns = {
  goals: "si.gol",
  assists: "si.asist",
  yellowCards: "si.kart_sari",
  redCards: "si.kart_kirmizi",
};

app.get("/health", async (_req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ok");
    res.json({ ok: true, database: dbDatabase });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get("/leagues", async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query("SELECT ad AS name FROM dbo.Lig ORDER BY id");

    res.json(result.recordset.map((row) => row.name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/players", async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    const where = [];

    if (req.query.league) {
      // Lig filtresi parametreli verilir; boylece sorgu degeri SQL'e guvenli aktarilir.
      request.input("league", sql.NVarChar, req.query.league);
      where.push("l.ad = @league");
    }

    const result = await request.query(`
      ${playersSelect}
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY si.gol DESC, si.asist DESC, o.ad ASC, o.soyad ASC
    `);

    res.json(result.recordset.map(mapPlayer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/players/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`${playersSelect} WHERE o.id = @id`);

    const player = result.recordset[0];

    if (!player) {
      res.status(404).json({ error: "Oyuncu bulunamadi" });
      return;
    }

    res.json(mapPlayer(player));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/teams/:name", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("team", sql.NVarChar, req.params.name)
      .query(`${playersSelect} WHERE t.ad = @team ORDER BY o.ad ASC, o.soyad ASC`);

    res.json(result.recordset.map(mapPlayer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/rankings/:type", async (req, res) => {
  try {
    const rankingColumn = rankingColumns[req.params.type];

    if (!rankingColumn) {
      res.status(400).json({ error: "Gecersiz siralama tipi" });
      return;
    }

    const pool = await getPool();
    const request = pool.request();
    const where = [];

    if (req.query.league) {
      request.input("league", sql.NVarChar, req.query.league);
      where.push("l.ad = @league");
    }

    const result = await request.query(`
      ${playersSelect}
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY ${rankingColumn} DESC, o.ad ASC, o.soyad ASC
    `);

    res.json(result.recordset.map(mapPlayer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      res.json({ players: [], teams: [] });
      return;
    }

    const pool = await getPool();
    // LIKE aramasi hem oyuncu ad-soyadinda hem de takim adinda kullanilir.
    const likeQuery = `%${query}%`;

    const playersResult = await pool
      .request()
      .input("query", sql.NVarChar, likeQuery)
      .query(`
        SELECT TOP 5 o.id, o.ad AS name, o.soyad AS surname, t.ad AS team
        FROM dbo.Oyuncu o
        INNER JOIN dbo.Takim t ON o.takim_id = t.id
        WHERE CONCAT(o.ad, ' ', o.soyad) LIKE @query
           OR o.ad LIKE @query
           OR o.soyad LIKE @query
        ORDER BY o.ad ASC, o.soyad ASC
      `);

    const teamsResult = await pool
      .request()
      .input("query", sql.NVarChar, likeQuery)
      .query(`
        SELECT TOP 5 ad AS name
        FROM dbo.Takim
        WHERE ad LIKE @query
        ORDER BY ad ASC
      `);

    res.json({
      players: playersResult.recordset,
      teams: teamsResult.recordset.map((row) => row.name),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Sporcu API http://localhost:${port} adresinde calisiyor`);
});
