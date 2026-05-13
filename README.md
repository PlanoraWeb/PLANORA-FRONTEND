# Planora Frontend

Planora, modern proje yönetim ihtiyaçlarını karşılamak için geliştirilmiş kapsamlı bir web uygulamasıdır. React ve Vite teknolojileri kullanılarak oluşturulmuştur.

## Özellikler

- **Kanban Board**: Görevleri görsel olarak yönetmek için sürükle-bırak özellikli kanban tahtası
- **Görev Yönetimi**: Görev oluşturma, düzenleme, silme ve durum takibi
- **Takım İş Birliği**: Takım üyeleriyle gerçek zamanlı işbirliği
- **Sohbet Widget**: Entegre sohbet sistemi
- **Takvim Görünümü**: Görevleri takvim üzerinde görüntüleme
- **Raporlar**: Proje ilerlemesi ve performans raporları
- **Arşiv**: Tamamlanan görevleri arşivleme
- **Kullanıcı Kimlik Doğrulama**: Güvenli giriş ve kayıt sistemi
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu arayüz

## Teknolojiler

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Routing**: React Router DOM 7.13.1
- **HTTP Client**: Axios 1.13.6
- **Drag & Drop**: @hello-pangea/dnd 18.0.1
- **Icons**: React Icons 5.6.0
- **Linting**: ESLint 9.39.1
- **Deployment**: Vercel

## Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone <repository-url>
   cd planora-frontend
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

4. Tarayıcınızda `http://localhost:5173` adresine gidin.

## Kullanım

- **Geliştirme**: `npm run dev` - Hot reload ile geliştirme sunucusu
- **Build**: `npm run build` - Üretim için build oluşturma
- **Lint**: `npm run lint` - Kod kalitesi kontrolü
- **Preview**: `npm run preview` - Build sonrası önizleme

## Proje Yapısı

```
src/
├── components/     # Yeniden kullanılabilir UI bileşenleri
├── pages/         # Sayfa bileşenleri
├── layouts/       # Sayfa düzenleri
├── hooks/         # Özel React hook'ları
├── services/      # API servisleri
├── styles/        # CSS stilleri
├── utils/         # Yardımcı fonksiyonlar
└── routes/        # Rota tanımları
```

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
