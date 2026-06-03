<<<<<<< HEAD
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
=======
<h1 align="center">
  <span style="color:#F1C40F;">SPORCU İSTATİSTİK SİSTEMİ</span>
</h1> 

<h2 align="center">  <span style="color:#4A90E2;">Problem Tanımı</span> </h2>
Bu proje'nin amacı sporcuların sezon performanslarının, kariyer bilgilerinin ve istatistiklerinin düzenli, ilişkisel ve yönetilebilir şekilde saklanmasını amaçlayan bir Sporcu İstatistik Veritabanı Sistemi geliştirilmektir.
Sistem içerisinde gol, asist, maç sayısı, kart istatistikleri, oynadığı takım ve lig bilgileri bulunmaktadır. Ayrıca sistemde iki farklı sporcunun istatistiklerini karşılaştırma özelliği de bulunmaktadır. Böylece sporcuların performanslarını analiz edebilmekte ve detaylı karşılaştırmalar yapabilmektedir.
Bu sayede sporcu verilerinin daha düzenli yönetilmesi, analiz edilmesi ve hızlı şekilde sunulması hedeflenmiştir.
<h2 align="center"> <span style="color:#27AE60;">Yapılan Araştırmalar</span> </h2>

Projeyi geliştirme sürecinde veri bütünlüğü, modülerlik ve sorgu performansı açısından çeşitli sorunlarla karşılaşılmış ve bu doğrultuda bazı araştırmalar yapılarak çözümler üretilmiştir

Veri Tekrarı
Oyuncu bilgileri, oynadıkları takımlar ve takımların bulunduğu ligler gibi birbiriyle bağlantılı verilerin tek bir tabloda tutulmasının veri tekrarına ve güncelleme anomalilerine yol açacağı tespit edilmiştir.
Çözüm olarak Lig, Takım ve Oyuncu verileri için sırasıyla Lig, Takim ve Oyuncu isimli ayrı tablolar oluşturulmuştur. Bu tablolar birbirine lig_id ve takim_id referansları üzerinden ilişkisel olarak bağlanmıştır
Ayrıca tablolardaki birincil anahtarların (Primary Key) veri eklendikçe otomatik olarak artması için IDENTITY(1,1) özelliği kullanılmıştır.

Sorgu Performans Sorunu
Oyuncuların kulüp kariyerleri ve sezonluk istatistikleri gibi birden fazla tablonun birleştirilmesini gerektiren uzun sorguların, raporlama sırasında sürekli baştan çalıştırılmasının performansı düşürebileceği gözlemlenmiştir.
Çözüm olarak sık kullanılan istatistiksel raporları sanal tablolar halinde önceden derlemek için VIEW yapıları kullanılmıştır.Sistemdeki veri akışını kolaylaştırmak amacıyla VW_Oyuncu_Takim_Lig_Bilgisi, VW_Oyuncu_Kulup_Kariyeri ve gol/asist sayılarını takım eşleşmeleriyle getiren VW_Gol_Kralligi görünümleri oluşturulmuştur.

Esnek Veri Çekimi
Uygulama üzerinden veritabanına sorgu atılırken sık tekrarlanan listeleme işlemlerinin tek bir standart üzerinden güvenli bir şekilde yönetilmesi gerekmiştir.
Parametre alabilen ve veritabanı sunucusu tarafında saklandığı için yüksek performans sunan STORED PROCEDURE kullanılmıştır. 
En çok gol atan 10 oyuncuyu azalan sırayla listeleyen SP_Gol_Kralligi_Getir
Dışarıdan girilen isim (@ad) ve soyisim (@soyad) parametrelerine göre oyuncunun kariyerini döndüren SP_Oyuncu_Kulup_Kariyeri_Getir 
Belirli bir takımın ID'si ile sezonluk istatistiklerini veren SP_Takim_Sezon_Istatistik_Getir yazılarak veri erişimi daha esnek hale getirilmiştir.

Genel ve Detaylı İstatistiklerin Ayrılması
Bir sporcunun tüm zamanları kapsayan genel kariyer verileri ile sadece belirli bir sezona ait detaylı performans verilerinin tek bir yapıda tutulmasının, istatistiksel analizi zorlaştıracağı belirlenmiştir.
Çözüm olarak da veriler kullanım amacına göre ikiye bölünmüştür. Genel toplamları yansıtan temel veriler için Kulup_Kariyeri tablosu (toplam maç, gol, asist) oluşturulurken; sezona göre ayrıştırılmış detaylı veriler (sarı kart, kırmızı kart ve oynanan dakika gibi) için Sezon_Istatistik tablosu tasarlanarak esnek bir hale getirlmiştir

<h2 align="center"> <span style="color:#9B59B6;">Akış Şeması</span> </h2>
<p align="center">
  <img src="Images/Akis_Semasi.png" width="850">
</p>

<h2 align="center">  <span style="color:#F39C12;">Yazılım Mimarisi</span> </h2>
Veritabanı için MSSQL kullanılmıştır. Burada sporculara ait bilgiler, sezon istatistikleri, kulüp kariyerleri, takım ve lig bilgileri ilişkisel tablolar halinde tutulmaktadır.

Tablolar arasında Primary Key ve Foreign Key ilişkileri kurulmuştur. Ayrıca verilerin daha düzenli çekilebilmesi için View yapıları, belirli işlemleri kolaylaştırmak için Stored Procedure yapıları ve veri doğruluğunu korumak için Trigger yapıları kullanılmıştır.

Backend için Node.js kullanılmıştır. Backend sistemi, frontend ile MSSQL veritabanı arasındaki veri iletişimini sağlanmıştır.

Frontend tarafından gönderilen istekler backend tarafından alınmakta, gerekli SQL sorguları çalıştırılmakta ve elde edilen veriler tekrar frontend tarafına gönderilmektedir. Böylece frontend tarafının doğrudan veritabanına erişmesi engellenmiş ve daha güvenli bir yapı oluşturulmuştur.

Frontend için React Native ve Expo kullanılmıştır. Kullanıcılar uygulama üzerinden sporcuları listeleyebilmekte, oyuncu detaylarını görüntüleyebilmekte ve iki farklı sporcunun istatistiklerini karşılaştırabilmektedir.

Frontend tarafında component yapıları kullanılarak kod tekrarının azaltılması ve daha düzenli bir proje yapısı oluşturulması amaçlanmıştır.

Proje geliştirme sürecinde ilk olarak MSSQL üzerinde veritabanı tasarımı ile başlamıştır. Oyuncu, takım, lig, sezon istatistikleri ve kulüp kariyeri tabloları oluşturulmuştur.

Daha sonra tablolar arasındaki ilişkiler kurulmuş, veri bütünlüğünü sağlamak amacıyla Foreign Key bağlantıları eklenmiştir. Sık kullanılan sorgular için View yapıları oluşturulmuş, belirli işlemleri kolaylaştırmak amacıyla Stored Procedure yapıları eklenmiştir.

Veritabanı işlemleri tamamlandıktan sonra Node.js kullanılarak backend sistemi geliştirilmiş ve MSSQL bağlantısı kurulmuştur.

Son aşamada React Native ve Expo kullanılarak kullanıcı arayüzü geliştirilmiş, sporcu listeleme, detay görüntüleme ve sporcu karşılaştırma özellikleri sisteme eklenmiştir.

<h2 align="center">  <span style="color:#E74C3C;">Veri Tabanı Diyagramı</span> </h2>
<p align="center">
  <img src="Images/ER_Diyagrami.png" width="900">
</p>


<h2 align="center">  <span style="color:#16A085;">Genel Yapı</span> </h2>

Proje sporculara ait istatistiksel verilerin düzenli şekilde saklanması, yönetilmesi ve kullanıcıya sunulması amacıyla geliştirilmiş bir Sporcu İstatistik Veritabanı Sistemidir.

Projede MSSQL kullanılarak ilişkisel bir veritabanı yapısı oluşturulmuştur. Sistem içerisinde oyuncular, takımlar, ligler, sezon istatistikleri ve kulüp kariyerleri gibi veriler ayrı tablolar halinde tutulmaktadır. Tablolar arasında Primary Key ve Foreign Key ilişkileri kurularak veri bütünlüğü sağlanmıştır.

Veritabanı tarafında ayrıca View, Stored Procedure ve Trigger yapıları kullanılmıştır. View yapıları sayesinde sık kullanılan sorgular daha düzenli hale getirilmiş, Stored Procedure yapıları ile belirli işlemler kolaylaştırılmış ve Trigger yapıları ile veri doğruluğu korunmuştur.

Backend tarafında Node.js kullanılmıştır. Backend sistemi, frontend ile MSSQL veritabanı arasındaki veri iletişimini sağlamaktadır. Kullanıcıdan gelen istekler backend tarafından işlenmekte ve gerekli veriler veritabanından çekilerek frontend tarafına gönderilmektedir.

Frontend tarafında React Native ve Expo kullanılmıştır. Kullanıcılar uygulama üzerinden sporcuları listeleyebilmekte, oyuncu detaylarını görüntüleyebilmekte ve iki farklı sporcunun istatistiklerini karşılaştırabilmektedir.

Proje geliştirme sürecinde ilişkisel veritabanı yönetimi, frontend-backend bağlantısı, veri modelleme ve mobil uygulama geliştirme konularında çalışmalar yapılmıştır.


<h2 align="center">  <span style="color:#34495E;">Referanslar</span> </h2>


    [1] Microsoft SQL Server Documentation (MSSQL kullanımı ve SQL yapıları)
    https://learn.microsoft.com/sql/

    [2] React Native Resmi Dokümantasyonu ve Öğretici YouTube Kanalı (Frontend geliştirme)
    https://reactnative.dev/
    https://www.youtube.com/@notjustdev 

    [3] Expo Resmi Dokümantasyonu ve Öğretici YouTube Kanalı (Web uygulaması geliştirme süreci)
    https://docs.expo.dev/
    https://www.youtube.com/@notjustdev 

    [4] Node.js Resmi Dokümantasyonu (Backend geliştirme)
    https://nodejs.org/

    [5] W3Schools SQL Kaynakları (JOIN, VIEW ve SQL araştırmaları)
    https://www.w3schools.com/sql/

    [6] SQL Server Tutorial (Trigger ve Stored Procedure araştırmaları)
    https://www.sqlservertutorial.net/

    [7] Transfermarkt (Oyuncu ve takım verileri)
    https://www.transfermarkt.com/

    [8] FotMob (Maç ve sezon istatistik verileri)
    https://www.fotmob.com/

    [9] ChatGPT – OpenAI (Hata çözümleri)
    https://chat.openai.com/

    [10] OpenAI Codex (Kod geliştirme ve hata analizi desteği)
    https://openai.com/

>>>>>>> e9e7b333023f881f5afff1afd3239706bb4a37ab
