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
    position: row.position,
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
    o.pozisyon AS position,
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

// Gelen metin değerlerini boşluklardan arındırıp güvenli string formatına çevirir.
function cleanText(value) {
  return String(value || "").trim();
}

// Arama yaparken Türkçe karakter farklarını azaltmak için metni sadeleştirir.
function normalizeSearchText(value) {
  return cleanText(value)
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");
}

// SQL tarafında da Türkçe karakterleri sadeleştirerek LIKE aramasını güçlendirir.
function normalizedSql(column) {
  return `
    LOWER(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(${column}, N'Ç', N'C'),
                          N'ç', N'c'),
                        N'Ğ', N'G'),
                      N'ğ', N'g'),
                    N'İ', N'I'),
                  N'ı', N'i'),
                N'Ö', N'O'),
              N'ö', N'o'),
            N'Ş', N'S'),
          N'ş', N's'),
        N'Ü', N'U'),
      N'ü', N'u')
    )
  `;
}

// Boş bırakılabilen sayı alanlarını null veya negatif olmayan tam sayıya çevirir.
function toOptionalInt(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.trunc(number)) : 0;
}

// Zorunlu sayı alanlarında boş değer gelirse varsayılan olarak 0 kullanır.
function toRequiredInt(value) {
  return toOptionalInt(value) ?? 0;
}

// Oyuncu eklenirken lig varsa mevcut id'yi döndürür, yoksa yeni lig kaydı oluşturur.
async function findOrCreateLeague(transaction, leagueName, country) {
  const leagueResult = await transaction
    .request()
    .input("leagueName", sql.NVarChar, leagueName)
    .query("SELECT id FROM dbo.Lig WHERE ad = @leagueName");

  if (leagueResult.recordset[0]) {
    return leagueResult.recordset[0].id;
  }

  const insertResult = await transaction
    .request()
    .input("leagueName", sql.NVarChar, leagueName)
    .input("country", sql.NVarChar, country)
    .query(`
      INSERT INTO dbo.Lig (ad, ulke)
      OUTPUT INSERTED.id
      VALUES (@leagueName, @country)
    `);

  return insertResult.recordset[0].id;
}

// Oyuncu eklenirken takım varsa mevcut id'yi döndürür, yoksa yeni takım kaydı oluşturur.
async function findOrCreateTeam(transaction, teamName, city, foundedYear, leagueId) {
  const teamResult = await transaction
    .request()
    .input("teamName", sql.NVarChar, teamName)
    .query("SELECT id FROM dbo.Takim WHERE ad = @teamName");

  if (teamResult.recordset[0]) {
    return teamResult.recordset[0].id;
  }

  const insertResult = await transaction
    .request()
    .input("teamName", sql.NVarChar, teamName)
    .input("city", sql.NVarChar, city)
    .input("foundedYear", sql.Int, foundedYear)
    .input("leagueId", sql.Int, leagueId)
    .query(`
      INSERT INTO dbo.Takim (ad, sehir, kurulus_yili, lig_id)
      OUTPUT INSERTED.id
      VALUES (@teamName, @city, @foundedYear, @leagueId)
    `);

  return insertResult.recordset[0].id;
}

// Backend ve SQL Server bağlantısının çalışıp çalışmadığını kontrol eder.
app.get("/health", async (_req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ok");
    res.json({ ok: true, database: dbDatabase });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Ana sayfadaki lig butonları için tüm lig adlarını getirir.
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

// Yeni oyuncu formundaki lig arama alanı için lig seçeneklerini getirir.
app.get("/league-options", async (req, res) => {
  try {
    const query = cleanText(req.query.q);
    const normalizedQuery = normalizeSearchText(query);
    const pool = await getPool();
    const request = pool.request();
    const where = [];

    if (query) {
      request.input("query", sql.NVarChar, `%${query}%`);
      request.input("normalizedQuery", sql.NVarChar, `%${normalizedQuery}%`);
      where.push(`
        ad LIKE @query
        OR ulke LIKE @query
        OR ${normalizedSql("ad")} LIKE @normalizedQuery
        OR ${normalizedSql("ulke")} LIKE @normalizedQuery
      `);
    }

    const result = await request.query(`
      SELECT TOP 8
        id,
        ad AS name,
        ulke AS country
      FROM dbo.Lig
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY ad ASC
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni oyuncu formundaki takım arama alanı için takım ve bağlı lig bilgilerini getirir.
app.get("/team-options", async (req, res) => {
  try {
    const query = cleanText(req.query.q);
    const normalizedQuery = normalizeSearchText(query);
    const pool = await getPool();
    const request = pool.request();
    const where = [];

    if (query) {
      request.input("query", sql.NVarChar, `%${query}%`);
      request.input("normalizedQuery", sql.NVarChar, `%${normalizedQuery}%`);
      where.push(`
        t.ad LIKE @query
        OR t.sehir LIKE @query
        OR l.ad LIKE @query
        OR ${normalizedSql("t.ad")} LIKE @normalizedQuery
        OR ${normalizedSql("t.sehir")} LIKE @normalizedQuery
        OR ${normalizedSql("l.ad")} LIKE @normalizedQuery
      `);
    }

    const result = await request.query(`
      SELECT TOP 8
        t.id,
        t.ad AS name,
        t.sehir AS city,
        t.kurulus_yili AS foundedYear,
        l.ad AS league,
        l.ulke AS leagueCountry
      FROM dbo.Takim t
      INNER JOIN dbo.Lig l ON t.lig_id = l.id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY t.ad ASC
    `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ana sayfa ve lig seçimi için oyuncuları isteğe bağlı lig filtresiyle getirir.
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

// Oyuncu profil sayfası için tek bir oyuncunun detay kaydını getirir.
app.get("/players/:id", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`${playersSelect} WHERE o.id = @id`);

    const player = result.recordset[0];

    if (!player) {
      res.status(404).json({ error: "Oyuncu bulunamadı" });
      return;
    }

    res.json(mapPlayer(player));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni oyuncu formundan gelen verilerle oyuncu, sezon istatistiği ve kulüp kariyeri kaydı oluşturur.
app.post("/players", async (req, res) => {
  const body = req.body || {};
  const name = cleanText(body.name);
  const surname = cleanText(body.surname);
  const birthDate = cleanText(body.birthDate);
  const nationality = cleanText(body.nationality);
  const position = cleanText(body.position);
  const league = cleanText(body.league);
  const leagueCountry = cleanText(body.leagueCountry) || "Belirtilmedi";
  const team = cleanText(body.team);
  const teamCity = cleanText(body.teamCity) || "Belirtilmedi";
  const season = cleanText(body.season);

  if (!name || !surname || !birthDate || !nationality || !position || !league || !team || !season) {
    res.status(400).json({ error: "Zorunlu oyuncu alanları eksik" });
    return;
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const leagueId = await findOrCreateLeague(transaction, league, leagueCountry);
    const teamId = await findOrCreateTeam(
      transaction,
      team,
      teamCity,
      toOptionalInt(body.teamFoundedYear),
      leagueId,
    );

    const playerResult = await transaction
      .request()
      .input("name", sql.NVarChar, name)
      .input("surname", sql.NVarChar, surname)
      .input("birthDate", sql.Date, birthDate)
      .input("nationality", sql.NVarChar, nationality)
      .input("position", sql.NVarChar, position)
      .input("teamId", sql.Int, teamId)
      .query(`
        INSERT INTO dbo.Oyuncu (ad, soyad, dogum_tarihi, uyruk, pozisyon, takim_id)
        OUTPUT INSERTED.id
        VALUES (@name, @surname, @birthDate, @nationality, @position, @teamId)
      `);

    const playerId = playerResult.recordset[0].id;

    await transaction
      .request()
      .input("season", sql.VarChar, season)
      .input("playerId", sql.Int, playerId)
      .input("teamId", sql.Int, teamId)
      .input("leagueId", sql.Int, leagueId)
      .input("matches", sql.Int, toRequiredInt(body.matches))
      .input("goals", sql.Int, toRequiredInt(body.goals))
      .input("assists", sql.Int, toRequiredInt(body.assists))
      .input("yellowCards", sql.Int, toRequiredInt(body.yellowCards))
      .input("redCards", sql.Int, toRequiredInt(body.redCards))
      .input("minutes", sql.Int, toRequiredInt(body.minutes))
      .query(`
        INSERT INTO dbo.Sezon_Istatistik
          (sezon, oyuncu_id, takim_id, lig_id, mac_sayisi, gol, asist, kart_sari, kart_kirmizi, dakika)
        VALUES
          (@season, @playerId, @teamId, @leagueId, @matches, @goals, @assists, @yellowCards, @redCards, @minutes)
      `);

    await transaction
      .request()
      .input("playerId", sql.Int, playerId)
      .input("teamId", sql.Int, teamId)
      .input("careerMatches", sql.Int, toRequiredInt(body.careerMatches))
      .input("careerGoals", sql.Int, toRequiredInt(body.careerGoals))
      .input("careerAssists", sql.Int, toRequiredInt(body.careerAssists))
      .query(`
        INSERT INTO dbo.Kulup_Kariyeri (oyuncu_id, takim_id, mac_sayisi, gol, asist)
        VALUES (@playerId, @teamId, @careerMatches, @careerGoals, @careerAssists)
      `);

    await transaction.commit();

    res.status(201).json({ id: playerId });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Rollback hatasi ana hatayi golgelemesin.
    }

    res.status(500).json({ error: error.message });
  }
});

// Oyuncuyu bağlı istatistik ve kariyer kayıtlarıyla birlikte veritabanından tamamen siler.
app.delete("/players/:id", async (req, res) => {
  const playerId = Number(req.params.id);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    res.status(400).json({ error: "Geçersiz oyuncu id" });
    return;
  }

  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const playerResult = await transaction
      .request()
      .input("playerId", sql.Int, playerId)
      .query("SELECT id FROM dbo.Oyuncu WHERE id = @playerId");

    if (!playerResult.recordset[0]) {
      await transaction.rollback();
      res.status(404).json({ error: "Oyuncu bulunamadı" });
      return;
    }

    await transaction
      .request()
      .input("playerId", sql.Int, playerId)
      .query("DELETE FROM dbo.Kulup_Kariyeri WHERE oyuncu_id = @playerId");

    await transaction
      .request()
      .input("playerId", sql.Int, playerId)
      .query("DELETE FROM dbo.Sezon_Istatistik WHERE oyuncu_id = @playerId");

    await transaction
      .request()
      .input("playerId", sql.Int, playerId)
      .query("DELETE FROM dbo.Oyuncu WHERE id = @playerId");

    await transaction.commit();

    res.json({ ok: true });
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Rollback hatasi ana hatayi golgelemesin.
    }

    res.status(500).json({ error: error.message });
  }
});

// Takım kadrosu sayfası için seçilen takımın oyuncularını listeler.
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

// Gol, asist, sarı kart ve kırmızı kart krallıkları için sıralı oyuncu listesini getirir.
app.get("/rankings/:type", async (req, res) => {
  try {
    const rankingColumn = rankingColumns[req.params.type];

    if (!rankingColumn) {
      res.status(400).json({ error: "Geçersiz sıralama tipi" });
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

// Genel arama çubuğu için oyuncu ve takım sonuçlarını birlikte arar.
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
        SELECT TOP 5
          o.id,
          o.ad AS name,
          o.soyad AS surname,
          o.pozisyon AS position,
          t.ad AS team
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
  console.log(`Sporcu API http://localhost:${port} adresinde çalışıyor`);
});
