Sporcu İstatistik Sistemi
Proje Özeti

Bu proje, futbol ligleri, takımlar ve oyunculara ait istatistiklerin veritabanı üzerinde saklanması ve yönetilmesi amacıyla geliştirilmiştir. Sistem sayesinde oyuncuların kariyer bilgileri, sezon performansları, takımları ve lig bilgileri merkezi bir veritabanında tutulabilmektedir.

Proje kapsamında Microsoft SQL Server kullanılarak ilişkisel bir veritabanı tasarlanmış, React Native ile kullanıcı arayüzü geliştirilmiştir.

Problem Tanımı

Futbol oyuncularına ait kariyer ve sezon istatistiklerinin düzenli şekilde saklanması, sorgulanması ve yönetilmesi gerekmektedir.

Oyuncuların:

Oynadıkları takımlar
Bulundukları ligler
Sezon performansları
Kariyer istatistikleri

gibi bilgilerin birbiriyle ilişkili şekilde tutulması amaçlanmıştır.

Kullanılan Teknolojiler
Veritabanı
Microsoft SQL Server
Backend
Node.js
Express.js
Frontend
React Native
Expo
Versiyon Kontrol
Git
GitHub
Veritabanı Yapısı

Proje kapsamında aşağıdaki tablolar oluşturulmuştur:

Oyuncu

Oyunculara ait temel bilgileri tutar.

Alanlar:

id
ad
soyad
dogum_tarihi
uyruk
pozisyon
Takim

Takımlara ait bilgileri tutar.

Alanlar:

id
ad
sehir
kurulus_yili
lig_id
Lig

Lig bilgilerini tutar.

Alanlar:

id
ad
ulke
Kulup_Kariyeri

Oyuncuların kulüplerdeki kariyer istatistiklerini tutar.

Alanlar:

oyuncu_id
takim_id
mac_sayisi
gol
asist
Sezon_Istatistik

Oyuncuların sezon bazlı performanslarını tutar.

Alanlar:

oyuncu_id
takim_id
lig_id
sezon
mac_sayisi
gol
asist
kart_sari
kart_kirmizi
dakika
Veritabanı İlişkileri
Bir lig birçok takıma sahip olabilir.
Bir takım birçok oyuncuya sahip olabilir.
Bir oyuncunun birçok sezon istatistiği olabilir.
Bir oyuncunun birçok kulüp kariyeri kaydı olabilir.
Kullanılan SQL Yapıları
Primary Key

Tüm tablolarda benzersiz kayıt oluşturmak amacıyla kullanılmıştır.

Foreign Key

Tablolar arasındaki ilişkileri sağlamak amacıyla kullanılmıştır.

Check Constraint

Negatif değer girişlerini engellemek amacıyla kullanılmıştır.

Default Constraint

Varsayılan değerlerin atanması amacıyla kullanılmıştır.

Index

Sorgu performansını artırmak amacıyla kullanılmıştır.

View

Sık kullanılan sorgular için oluşturulmuştur.

Örnek:

VW_Oyuncu_Sezon_Istatistikleri
VW_Gol_Kralligi
Stored Procedure

Tekrarlanan sorguların merkezi olarak yönetilmesi amacıyla kullanılmıştır.

Örnek:

SP_Oyuncu_Istatistik_Getir
SP_Gol_Kralligi_Getir
SP_Takim_Sezon_Istatistik_Getir
Trigger

Veri bütünlüğünü korumak amacıyla kullanılmıştır.

Örnek:

TRG_KulupKariyeri_Negatif_Kontrol
TRG_SezonIstatistik_Negatif_Kontrol
ER Diyagramı

Buraya oluşturduğun ER diyagramının ekran görüntüsü eklenecektir.

![ER Diagram](images/er-diagram.png)
Kurulum
Veritabanı
SporcuIstatistikVeritabaniV8.sql

dosyası SQL Server üzerinde çalıştırılır.

Backend
npm install
npm start
Frontend
npm install
npx expo start
Örnek Uygulama Görselleri

Buraya uygulama ekran görüntüleri eklenecektir.

Örnek:

Ana Sayfa
Oyuncu Listesi
Takım Detay Sayfası
Gol Krallığı Sayfası
Yapılan Araştırmalar

Proje geliştirilirken aşağıdaki konularda araştırmalar yapılmıştır:

SQL Server ilişkisel veritabanı tasarımı
Normalizasyon kuralları
Index kullanımı
Stored Procedure yapıları
Trigger kullanımı
React Native veri yönetimi
MSSQL bağlantıları
Referanslar
Microsoft SQL Server Documentation
React Native Documentation
Expo Documentation
Transfermarkt
W3Schools SQL Documentation
Microsoft Learn
