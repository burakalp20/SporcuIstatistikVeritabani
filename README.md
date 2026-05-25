# 🏆 Sporcu İstatistik Veritabanı

Bu proje, SQL Server kullanılarak oluşturulmuş bir sporcu istatistikleri veritabanıdır.
Takımlar, oyuncular, ligler ve sezon istatistiklerini içermektedir.

---

## 📂 İçerik

* Lig bilgileri
* Takım bilgileri
* Oyuncu bilgileri
* Sezon istatistikleri
* Transfer verileri

---

## ⚙️ Kurulum (Backup ile)

### 1. Gerekli Program

* Microsoft SQL Server
* SQL Server Management Studio (SSMS)

---

### 2. Veritabanını Yükleme

1. SSMS’i aç
2. **Databases (Veritabanları)** üzerine sağ tık
3. **Restore Database (Veritabanını Geri Yükle)** seç

---

### 3. Backup Dosyasını Seç

1. **Device (Aygıt)** seç
2. **Add (Ekle)** butonuna bas
3. İndirdiğin `.bak` dosyasını seç

---

### 4. Yükleme

1. OK → OK
2. Veritabanı otomatik olarak yüklenecektir

---

## 🧩 Veritabanı Yapısı

* **Lig**
* **Takim**
* **Oyuncu**
* **Sezon_Istatistik**
* **Oyuncu_Takim_Transfer**

Tablolar arasında ilişkiler (foreign key) tanımlıdır.

---

## 👨‍💻 Geliştirici

Burak Alp Aydoğmuş 
Muhammed Taha Sarıkaya

---
