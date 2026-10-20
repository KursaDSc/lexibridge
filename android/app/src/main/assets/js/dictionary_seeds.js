/**
 * LexiBridge Curated Offline Dictionary Seeds & High-Frequency Vocabulary
 * Provides instant 0ms offline search suggestions, CEFR levels, and verb conjugations.
 */
window.LEXI_DICTIONARY_SEEDS = [
  // --- En Sık Kullanılan Fiiller (Top Verbs with Conjugation & CEFR) ---
  {
    nl: "zijn",
    tr: "olmak / bulunmak",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "ben", jij: "bent / is", wij: "zijn" },
      past: { singular: "was", plural: "waren" },
      perfect: "is geweest"
    },
    example: { source: "Ik ben vandaag in Amsterdam.", translation: "Bugün Amsterdam'dayım." }
  },
  {
    nl: "hebben",
    tr: "sahip olmak / var olmak",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "heb", jij: "hebt / heeft", wij: "hebben" },
      past: { singular: "had", plural: "hadden" },
      perfect: "heeft gehad"
    },
    example: { source: "Wij hebben een afspraak om drie uur.", translation: "Saat üçte bir randevumuz var." }
  },
  {
    nl: "gaan",
    tr: "gitmek",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "ga", jij: "gaat", wij: "gaan" },
      past: { singular: "ging", plural: "gingen" },
      perfect: "is gegaan"
    },
    example: { source: "Hoe gaat het met jou?", translation: "Nasıl gidiyor / Nasılsın?" }
  },
  {
    nl: "komen",
    tr: "gelmek",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "kom", jij: "komt", wij: "komen" },
      past: { singular: "kwam", plural: "kwamen" },
      perfect: "is gekomen"
    },
    example: { source: "Waar kom je vandaan?", translation: "Nerelisin / Nereden geliyorsun?" }
  },
  {
    nl: "doen",
    tr: "yapmak / etmek",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "doe", jij: "doet", wij: "doen" },
      past: { singular: "deed", plural: "deden" },
      perfect: "heeft gedaan"
    },
    example: { source: "Wat doe je in het weekend?", translation: "Hafta sonu ne yapıyorsun?" }
  },
  {
    nl: "maken",
    tr: "yapmak / üretmek / onarmak",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "maak", jij: "maakt", wij: "maken" },
      past: { singular: "maakte", plural: "maakten" },
      perfect: "heeft gemaakt"
    },
    example: { source: "Ik maak een kopje koffie voor je.", translation: "Senin için bir fincan kahve yapıyorum." }
  },
  {
    nl: "werken",
    tr: "çalışmak",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "werk", jij: "werkt", wij: "werken" },
      past: { singular: "werkte", plural: "werkten" },
      perfect: "heeft gewerkt"
    },
    example: { source: "Zij werkt als programmeur bij een techbedrijf.", translation: "O, bir teknoloji şirketinde yazılımcı olarak çalışıyor." }
  },
  {
    nl: "wonen",
    tr: "ikamet etmek / oturmak / yaşamak",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "woon", jij: "woont", wij: "wonen" },
      past: { singular: "woonde", plural: "woonden" },
      perfect: "heeft gewoond"
    },
    example: { source: "Ik woon al twee jaar in Rotterdam.", translation: "İki yıldır Rotterdam'da oturuyorum." }
  },
  {
    nl: "spreken",
    tr: "konuşmak",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "spreek", jij: "spreekt", wij: "spreken" },
      past: { singular: "sprak", plural: "spraken" },
      perfect: "heeft gesproken"
    },
    example: { source: "Spreekt u Engels of Nederlands?", translation: "İngilizce mi yoksa Felemenkçe mi konuşuyorsunuz?" }
  },
  {
    nl: "leren",
    tr: "öğrenmek / öğretmek / ders çalışmak",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "leer", jij: "leert", wij: "leren" },
      past: { singular: "leerde", plural: "leerden" },
      perfect: "heeft geleerd"
    },
    example: { source: "Ik leer elke dag nieuwe Nederlandse woorden.", translation: "Her gün yeni Felemenkçe kelimeler öğreniyorum." }
  },
  {
    nl: "begrijpen",
    tr: "anlamak / kavramak",
    pos: "Fiil",
    cefr: "A2",
    conjugation: {
      isVerb: true,
      present: { ik: "begrijp", jij: "begrijpt", wij: "begrijpen" },
      past: { singular: "begreep", plural: "begrepen" },
      perfect: "heeft begrepen"
    },
    example: { source: "Ik begrijp het nog niet helemaal.", translation: "Bunu henüz tam olarak anlamıyorum." }
  },
  {
    nl: "weten",
    tr: "bilmek",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "weet", jij: "weet", wij: "weten" },
      past: { singular: "wist", plural: "wisten" },
      perfect: "heeft geweten"
    },
    example: { source: "Weet jij waar het treinstation is?", translation: "Tren istasyonunun nerede olduğunu biliyor musun?" }
  },
  {
    nl: "vragen",
    tr: "sormak / rica etmek",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "vraag", jij: "vraagt", wij: "vragen" },
      past: { singular: "vroeg", plural: "vroegen" },
      perfect: "heeft gevraagd"
    },
    example: { source: "Mag ik jou iets vragen?", translation: "Sana bir şey sorabilir miyim?" }
  },
  {
    nl: "zien",
    tr: "görmek",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "zie", jij: "ziet", wij: "zien" },
      past: { singular: "zag", plural: "zagen" },
      perfect: "heeft gezien"
    },
    example: { source: "Ik zie je morgenochtend om negen uur.", translation: "Yarın sabah saat dokuzda görüşürüz." }
  },
  {
    nl: "kopen",
    tr: "satın almak",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "koop", jij: "koopt", wij: "kopen" },
      past: { singular: "kocht", plural: "kochten" },
      perfect: "heeft gekocht"
    },
    example: { source: "Waar kan ik een treinkaartje kopen?", translation: "Nereden tren bileti satın alabilirim?" }
  },
  {
    nl: "betalen",
    tr: "ödemek",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "betaal", jij: "betaalt", wij: "betalen" },
      past: { singular: "betaalde", plural: "betaalden" },
      perfect: "heeft betaald"
    },
    example: { source: "Kan ik hier met pin betalen?", translation: "Burada banka kartıyla ödeyebilir miyim?" }
  },
  {
    nl: "reizen",
    tr: "seyahat etmek / yolculuk yapmak",
    pos: "Fiil",
    cefr: "A2",
    conjugation: {
      isVerb: true,
      present: { ik: "reis", jij: "reist", wij: "reizen" },
      past: { singular: "reisde", plural: "reisden" },
      perfect: "heeft gereisd"
    },
    example: { source: "Ik reis vaak met het openbaar vervoer.", translation: "Sık sık toplu taşımayla seyahat ederim." }
  },
  {
    nl: "fietsen",
    tr: "bisiklet sürmek",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "fiets", jij: "fietst", wij: "fietsen" },
      past: { singular: "fietste", plural: "fietsten" },
      perfect: "heeft gefietst"
    },
    example: { source: "In Nederland fietst bijna iedereen.", translation: "Hollanda'da neredeyse herkes bisiklete biner." }
  },
  {
    nl: "schrijven",
    tr: "yazmak",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "schrijf", jij: "schrijft", wij: "schrijven" },
      past: { singular: "schreef", plural: "schreven" },
      perfect: "heeft geschreven"
    },
    example: { source: "Ik schrijf een formele e-mail naar de gemeente.", translation: "Belediyeye resmi bir e-posta yazıyorum." }
  },
  {
    nl: "lezen",
    tr: "okumak",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "lees", jij: "leest", wij: "lezen" },
      past: { singular: "las", plural: "lazen" },
      perfect: "heeft gelezen"
    },
    example: { source: "Hij leest elke ochtend de krant.", translation: "Her sabah gazete okur." }
  },
  {
    nl: "vinden",
    tr: "bulmak / düşünmek (fikrinde olmak)",
    pos: "Fiil",
    cefr: "A1",
    conjugation: {
      isVerb: true,
      present: { ik: "vind", jij: "vindt", wij: "vinden" },
      past: { singular: "vond", plural: "vonden" },
      perfect: "heeft gevonden"
    },
    example: { source: "Wat vind je van deze stad?", translation: "Bu şehir hakkında ne düşünüyorsun / nasıl buldun?" }
  },
  {
    nl: "ontmoeten",
    tr: "karşılaşmak / buluşmak / tanışmak",
    pos: "Fiil",
    cefr: "A2",
    conjugation: {
      isVerb: true,
      present: { ik: "ontmoet", jij: "ontmoet", wij: "ontmoeten" },
      past: { singular: "ontmoette", plural: "ontmoetten" },
      perfect: "heeft ontmoet"
    },
    example: { source: "Fijn om jou te ontmoeten!", translation: "Seninle tanıştığıma memnun oldum!" }
  },
  {
    nl: "overtuigen",
    tr: "ikna etmek",
    pos: "Fiil",
    cefr: "B2",
    conjugation: {
      isVerb: true,
      present: { ik: "overtuig", jij: "overtuigt", wij: "overtuigen" },
      past: { singular: "overtuigde", plural: "overtuigden" },
      perfect: "heeft overtuigd"
    },
    example: { source: "Zij probeerde de commissie te overtuigen.", translation: "Komisyonu ikna etmeye çalıştı." }
  },
  {
    nl: "beslissen",
    tr: "karar vermek",
    pos: "Fiil",
    cefr: "B1",
    conjugation: {
      isVerb: true,
      present: { ik: "beslis", jij: "beslist", wij: "beslissen" },
      past: { singular: "besliste", plural: "beslisten" },
      perfect: "heeft beslist"
    },
    example: { source: "We moeten vandaag nog beslissen.", translation: "Bugün içinde karar vermeliyiz." }
  },

  // --- Temel İsimler (Nouns with de/het articles, diminutive & CEFR) ---
  { nl: "fiets", tr: "bisiklet", article: "de", plural: "fietsen", diminutive: "fietsje", pos: "İsim", cefr: "A1", example: { source: "Mijn fiets staat bij het station.", translation: "Bisikletim istasyonun yanında duruyor." } },
  { nl: "huis", tr: "ev", article: "het", plural: "huizen", diminutive: "huisje", pos: "İsim", cefr: "A1", example: { source: "Zij hebben een nieuw huis gekocht.", translation: "Yeni bir ev satın aldılar." } },
  { nl: "auto", tr: "araba / otomobil", article: "de", plural: "auto's", diminutive: "autootje", pos: "İsim", cefr: "A1", example: { source: "De auto staat op de parkeerplaats.", translation: "Araba otoparkta." } },
  { nl: "werk", tr: "iş / çalışma", article: "het", plural: "werken", diminutive: "werkje", pos: "İsim", cefr: "A1", example: { source: "Ik ga om acht uur naar mijn werk.", translation: "Saat sekizde işime gidiyorum." } },
  { nl: "stad", tr: "şehir / kent", article: "de", plural: "steden", diminutive: "stadje", pos: "İsim", cefr: "A1", example: { source: "Utrecht is een gezellige stad.", translation: "Utrecht samimi ve keyifli bir şehir." } },
  { nl: "kind", tr: "çocuk", article: "het", plural: "kinderen", diminutive: "kindje", pos: "İsim", cefr: "A1", example: { source: "De kinderen spelen in het park.", translation: "Çocuklar parkta oynuyor." } },
  { nl: "school", tr: "okul", article: "de", plural: "scholen", diminutive: "schooltje", pos: "İsim", cefr: "A1", example: { source: "De school begint om half negen.", translation: "Okul sekiz buçukta başlıyor." } },
  { nl: "afspraak", tr: "randevu / anlaşma", article: "de", plural: "afspraken", diminutive: "afspraakje", pos: "İsim", cefr: "A1", example: { source: "Ik heb morgen een afspraak bij de huisarts.", translation: "Yarın aile hekiminde bir randevum var." } },
  { nl: "huisarts", tr: "aile hekimi / pratisyen doktor", article: "de", plural: "huisartsen", pos: "İsim", cefr: "A1", example: { source: "Bel eerst de huisarts voor je naar het ziekenhuis gaat.", translation: "Hastaneye gitmeden önce aile hekimini ara." } },
  { nl: "ziekenhuis", tr: "hastane", article: "het", plural: "ziekenhuizen", pos: "İsim", cefr: "A1", example: { source: "Het ziekenhuis ligt dichtbij het centrum.", translation: "Hastane merkeze yakın konumda." } },
  { nl: "gemeente", tr: "belediye", article: "de", plural: "gemeenten", pos: "İsim", cefr: "A2", example: { source: "U moet zich inschrijven bij de gemeente.", translation: "Belediyeye kayıt yaptırmalısınız." } },
  { nl: "inschrijving", tr: "kayıt / ikamet kaydı (BRP)", article: "de", plural: "inschrijvingen", pos: "İsim", cefr: "A2", example: { source: "De inschrijving bij de gemeente is verplicht.", translation: "Belediyeye kayıt zorunludur." } },
  { nl: "brief", tr: "mektup", article: "de", plural: "brieven", diminutive: "briefje", pos: "İsim", cefr: "A1", example: { source: "Ik heb een belangrijke brief van de Belastingdienst gekregen.", translation: "Vergi dairesinden önemli bir mektup aldım." } },
  { nl: "formulier", tr: "form / resmi belge", article: "het", plural: "formulieren", diminutive: "formuliertje", pos: "İsim", cefr: "A2", example: { source: "Kunt u dit formulier alstublieft invullen?", translation: "Bu formu lütfen doldurabilir misiniz?" } },
  { nl: "tijd", tr: "zaman / vakit", article: "de", plural: "tijden", pos: "İsim", cefr: "A1", example: { source: "Heb je vanmiddag even tijd voor mij?", translation: "Öğleden sonra bana ayıracak vaktin var mı?" } },
  { nl: "geld", tr: "para", article: "het", plural: "-", pos: "İsim", cefr: "A1", example: { source: "Ik heb niet genoeg contant geld bij me.", translation: "Yanımda yeterince nakit para yok." } },
  { nl: "taal", tr: "dil / lisan", article: "de", plural: "talen", pos: "İsim", cefr: "A1", example: { source: "Nederlands is een interessante taal.", translation: "Felemenkçe ilginç bir dil." } },
  { nl: "cursus", tr: "kurs / eğitim programı", article: "de", plural: "cursussen", pos: "İsim", cefr: "A1", example: { source: "Ik volg een intensieve taalcursus.", translation: "Yoğun bir dil kursuna katılıyorum." } },
  { nl: "examen", tr: "sınav", article: "het", plural: "examens", pos: "İsim", cefr: "A2", example: { source: "Zij is geslaagd voor haar inburgeringsexamen.", translation: "O, uyum sınavını (inburgering) başarıyla geçti." } },
  { nl: "inburgering", tr: "toplumsal uyum / entegrasyon", article: "de", plural: "-", pos: "İsim", cefr: "A2", example: { source: "De inburgering helpt nieuwkomers in Nederland.", translation: "Uyum süreci Hollanda'daki yeni gelenlere yardımcı olur." } },
  { nl: "paspoort", tr: "pasaport", article: "het", plural: "paspoorten", pos: "İsim", cefr: "A1", example: { source: "Vergeet je paspoort niet mee te nemen.", translation: "Pasaportunu yanına almayı unutma." } },
  { nl: "verblijfsvergunning", tr: "oturum izni / ikamet kartı", article: "de", plural: "verblijfsvergunningen", pos: "İsim", cefr: "B1", example: { source: "Mijn verblijfsvergunning is vijf jaar geldig.", translation: "Oturum iznim beş yıl geçerli." } },
  { nl: "trein", tr: "tren", article: "de", plural: "treinen", diminutive: "treintje", pos: "İsim", cefr: "A1", example: { source: "De trein naar Den Haag heeft vijf minuten vertraging.", translation: "Lahey treni beş dakika gecikmeli." } },
  { nl: "station", tr: "istasyon / gar", article: "het", plural: "stations", diminutive: "stationnetje", pos: "İsim", cefr: "A1", example: { source: "We ontmoeten elkaar voor het Centraal Station.", translation: "Merkez İstasyonu'nun önünde buluşuyoruz." } },
  { nl: "supermarkt", tr: "süpermarket", article: "de", plural: "supermarkten", pos: "İsim", cefr: "A1", example: { source: "De supermarkt is open tot tien uur 's avonds.", translation: "Süpermarket akşam ona kadar açık." } },
  { nl: "rekening", tr: "hesap / fatura", article: "de", plural: "rekeningen", pos: "İsim", cefr: "A1", example: { source: "Mag ik de rekening alstublieft?", translation: "Hesabı alabilir miyim lütfen?" } },
  { nl: "vriend", tr: "arkadaş / dost", article: "de", plural: "vrienden", diminutive: "vriendje", pos: "İsim", cefr: "A1", example: { source: "Mijn beste vriend woont in Eindhoven.", translation: "En iyi arkadaşım Eindhoven'da yaşıyor." } },
  { nl: "gezin", tr: "çekirdek aile", article: "het", plural: "gezinnen", pos: "İsim", cefr: "A2", example: { source: "Zij hebben een hecht gezin.", translation: "Bağları kuvvetli bir çekirdek aileleri var." } },
  { nl: "kamer", tr: "oda", article: "de", plural: "kamers", diminutive: "kamertje", pos: "İsim", cefr: "A1", example: { source: "Ik huur een kamer in het centrum.", translation: "Merkezde bir oda kiralıyorum." } },
  { nl: "deur", tr: "kapı", article: "de", plural: "deuren", diminutive: "deurtje", pos: "İsim", cefr: "A1", example: { source: "Wilt u de deur achter u sluiten?", translation: "Arkanızdan kapıyı kapatır mısınız?" } },
  { nl: "raam", tr: "pencere", article: "het", plural: "ramen", diminutive: "raampje", pos: "İsim", cefr: "A1", example: { source: "Doe het raam maar open voor wat frisse lucht.", translation: "Temiz hava için pencereyi açabilirsin." } },

  // --- Sabit Edatlı Fiiller (Verbs with Vaste Voorzetsels & CEFR) ---
  {
    nl: "wachten",
    tr: "beklemek",
    pos: "Fiil",
    cefr: "A1",
    fixedPreposition: "op (wachten op - birini/bir şeyi beklemek)",
    conjugation: {
      isVerb: true,
      present: { ik: "wacht", jij: "wacht", wij: "wachten" },
      past: { singular: "wachtte", plural: "wachtten" },
      perfect: "heeft gewacht"
    },
    example: { source: "Ik wacht op de bus naar het werk.", translation: "İşe giden otobüsü bekliyorum." }
  },
  {
    nl: "houden",
    tr: "tutmak / sevmek (van ile)",
    pos: "Fiil",
    cefr: "A1",
    fixedPreposition: "van (houden van - sevmek/hoşlanmak)",
    conjugation: {
      isVerb: true,
      present: { ik: "hou / houd", jij: "houdt", wij: "houden" },
      past: { singular: "hield", plural: "hielden" },
      perfect: "heeft gehouden"
    },
    example: { source: "Zij houdt heel veel van reizen.", translation: "Seyahat etmeyi çok seviyor." }
  },
  {
    nl: "kijken",
    tr: "bakmak / izlemek",
    pos: "Fiil",
    cefr: "A1",
    fixedPreposition: "naar (kijken naar - bakmak/izlemek)",
    conjugation: {
      isVerb: true,
      present: { ik: "kijk", jij: "kijkt", wij: "kijken" },
      past: { singular: "keek", plural: "keken" },
      perfect: "heeft gekeken"
    },
    example: { source: "Wij kijken vanavond naar een spannende film.", translation: "Bu akşam heyecanlı bir film izliyoruz." }
  },
  {
    nl: "denken",
    tr: "düşünmek",
    pos: "Fiil",
    cefr: "A1",
    fixedPreposition: "aan (denken aan - düşünmek/hatırlamak)",
    conjugation: {
      isVerb: true,
      present: { ik: "denk", jij: "denkt", wij: "denken" },
      past: { singular: "dacht", plural: "dachten" },
      perfect: "heeft gedacht"
    },
    example: { source: "Ik denk vaak aan mijn familie.", translation: "Sık sık ailemi düşünüyorum." }
  },
  {
    nl: "luisteren",
    tr: "dinlemek",
    pos: "Fiil",
    cefr: "A1",
    fixedPreposition: "naar (luisteren naar - dinlemek)",
    conjugation: {
      isVerb: true,
      present: { ik: "luister", jij: "luistert", wij: "luisteren" },
      past: { singular: "luisterde", plural: "luisterden" },
      perfect: "heeft geluisterd"
    },
    example: { source: "Zij luistert graag naar klassieke muziek.", translation: "Klasik müzik dinlemeyi sever." }
  },

  // --- Sıfatlar (Adjectives with CEFR) ---
  { nl: "gezellig", tr: "keyifli / sıcak / samimi (özel Hollanda kavramı)", pos: "Sıfat", cefr: "A1", example: { source: "Het was gisteren erg gezellig bij jullie.", translation: "Dün sizin evde ortam çok keyifli ve samimiydi." } },
  { nl: "belangrijk", tr: "önemli", pos: "Sıfat", cefr: "A2", example: { source: "Dit is een belangrijk document.", translation: "Bu önemli bir belgedir." } },
  { nl: "duidelijk", tr: "açık / net / anlaşılır", pos: "Sıfat", cefr: "A2", example: { source: "De uitleg van de docent was heel duidelijk.", translation: "Öğretmenin anlatımı gayet açıktı." } },
  { nl: "moeilijk", tr: "zor / güç", pos: "Sıfat", cefr: "A1", example: { source: "De uitspraak van sommige woorden is moeilijk.", translation: "Bazı kelimelerin telaffuzu zordur." } },
  { nl: "makkelijk", tr: "kolay / basit", pos: "Sıfat", cefr: "A1", example: { source: "Deze grammatica-oefening is vrij makkelijk.", translation: "Bu dilbilgisi alıştırması oldukça kolay." } },
  { nl: "nieuw", tr: "yeni", pos: "Sıfat", cefr: "A1", example: { source: "Zij heeft een nieuwe baan gevonden.", translation: "Yeni bir iş buldu." } },
  { nl: "oud", tr: "eski / yaşlı", pos: "Sıfat", cefr: "A1", example: { source: "Dit is een heel oud gebouw in de binnenstad.", translation: "Bu şehir merkezinde çok eski bir bina." } },
  { nl: "duur", tr: "pahalı", pos: "Sıfat", cefr: "A1", example: { source: "Het leven in Amsterdam kan erg duur zijn.", translation: "Amsterdam'da yaşamak çok pahalı olabilir." } },
  { nl: "goedkoop", tr: "ucuz", pos: "Sıfat", cefr: "A1", example: { source: "Op de markt vind je verse en goedkope groenten.", translation: "Pazarda taze ve ucuz sebzeler bulabilirsin." } },
  { nl: "noodzakelijk", tr: "zorunlu / gerekli / elzem", pos: "Sıfat", cefr: "B1", example: { source: "Een zorgverzekering is noodzakelijk in Nederland.", translation: "Hollanda'da sağlık sigortası zorunludur." } },
  { nl: "desalniettemin", tr: "bununla birlikte / yine de / her şeye rağmen", pos: "Zarf", cefr: "C1", example: { source: "Het regende hard; desalniettemin gingen we wandelen.", translation: "Şiddetli yağmur yağıyordu; buna rağmen yürüyüşe çıktık." } },

  // --- Kalıp İfadeler ve Deyimler (Idioms & Expressions) ---
  { nl: "alsjeblieft", tr: "lütfen / buyrun (samimi)", pos: "İfade", cefr: "A1", example: { source: "Hier is je sleutel, alsjeblieft.", translation: "İşte anahtarın, buyur." } },
  { nl: "alstublieft", tr: "lütfen / buyrunuz (saygılı / resmi)", pos: "İfade", cefr: "A1", example: { source: "Kunt u hier tekenen, alstublieft?", translation: "Burayı imzalayabilir misiniz, lütfen?" } },
  { nl: "dank je wel", tr: "teşekkür ederim (samimi)", pos: "İfade", cefr: "A1", example: { source: "Dank je wel voor je hulp!", translation: "Yardımın için teşekkür ederim!" } },
  { nl: "dank u wel", tr: "teşekkür ederim (saygılı / resmi)", pos: "İfade", cefr: "A1", example: { source: "Hartelijk dank u wel, mevrouw.", translation: "Çok teşekkür ederim, hanımefendi." } },
  { nl: "graag gedaan", tr: "rica ederim / bir şey değil", pos: "İfade", cefr: "A1", example: { source: "Geen probleem, heel graag gedaan!", translation: "Sorun değil, çok rica ederim!" } },
  { nl: "tot ziens", tr: "görüşmek üzere / hoşça kal", pos: "İfade", cefr: "A1", example: { source: "Fijne dag verder en tot ziens!", translation: "İyi günler dilerim ve görüşmek üzere!" } },
  { nl: "gefeliciteerd", tr: "tebrikler / doğum günün kutlu olsun", pos: "İfade", cefr: "A1", example: { source: "Van harte gefeliciteerd met je verjaardag!", translation: "Doğum günün en içten dileklerimle kutlu olsun!" } },
  { nl: "geen probleem", tr: "sorun değil / rica ederim", pos: "İfade", cefr: "A1", example: { source: "Maak je geen zorgen, het is geen probleem.", translation: "Endişelenme, hiç sorun değil." } },
  { nl: "de kat uit de boom kijken", tr: "durumu uzaktan izlemek / acele etmeyip bekleyip görmek", pos: "Deyim", cefr: "B2", example: { source: "Hij besloot eerst de kat uit de boom te kijken.", translation: "Önce durumu uzaktan izleyip beklemeye karar verdi." } },
  { nl: "nu komt de aap uit de mouw", tr: "işin aslı ortaya çıktı / baklayı ağzından çıkardı", pos: "Deyim", cefr: "B2", example: { source: "Toen hij de waarheid vertelde, kwam de aap uit de mouw.", translation: "Gerçeği anlattığında işin aslı ortaya çıktı." } },
  { nl: "over koetjes en kalfjes praten", tr: "havadan sudan konuşmak / önemsiz şeylerden bahsetmek", pos: "Deyim", cefr: "B1", example: { source: "We zaten een uur lang over koetjes en kalfjes te praten.", translation: "Bir saat boyunca havadan sudan konuştuk." } },
  { nl: "een appeltje met iemand te schillen hebben", tr: "biriyle görülecek bir hesabı olmak", pos: "Deyim", cefr: "B2", example: { source: "Ik heb nog een appeltje met jou te schillen!", translation: "Seninle görülecek bir hesabım var!" } },

  // --- Günlük Yaşam & Sağlık & NS Ulaşım (Expanded Seeds) ---
  {
    "nl": "apotheek",
    "article": "de",
    "plural": "apotheken",
    "diminutive": "apotheekje",
    "tr": "eczane",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "Het recept ligt klaar bij de apotheek.",
      "translation": "Reçeteniz eczanede hazır bekliyor."
    }
  },
  {
    "nl": "recept",
    "article": "het",
    "plural": "recepten",
    "diminutive": "receptje",
    "tr": "reçete (doktor) / yemek tarifi",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "De arts heeft een recept voor antibiotica uitgeschreven.",
      "translation": "Doktor antibiyotik için bir reçete yazdı."
    }
  },
  {
    "nl": "tandarts",
    "article": "de",
    "plural": "tandartsen",
    "diminutive": "tandartsje",
    "tr": "diş hekimi",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "Twee keer per jaar ga ik naar de tandarts.",
      "translation": "Yılda iki kez diş hekimine giderim."
    }
  },
  {
    "nl": "medicijn",
    "article": "het",
    "plural": "medicijnen",
    "diminutive": "medicijntje",
    "tr": "ilaç",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "Neem dit medicijn in na de maaltijd.",
      "translation": "Bu ilacı yemekten sonra alınız."
    }
  },
  {
    "nl": "koorts",
    "article": "de",
    "tr": "yüksek ateş",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "Mijn dochter heeft hoge koorts en blijft thuis.",
      "translation": "Kızımın yüksek ateşi var ve evde kalıyor."
    }
  },
  {
    "nl": "zorgverzekering",
    "article": "de",
    "plural": "zorgverzekeringen",
    "tr": "sağlık sigortası",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "Iedereen in Nederland is verplicht een zorgverzekering af te sluiten.",
      "translation": "Hollanda'da herkesin sağlık sigortası yaptırması zorunludur."
    }
  },
  {
    "nl": "eigen risico",
    "article": "het",
    "tr": "zorunlu katkı payı / muafiyet (sağlık harcamalarında)",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "Het verplichte eigen risico is dit jaar 385 euro.",
      "translation": "Zorunlu muafiyet payı bu yıl 385 eurodur."
    }
  },
  {
    "nl": "spoedeisende hulp",
    "article": "de",
    "tr": "acil servis / acil yardım",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "Bij levensbedreigende situaties ga je naar de spoedeisende hulp.",
      "translation": "Hayati tehlike olan durumlarda acil servise gidilir."
    }
  },
  {
    "nl": "pijn",
    "article": "de",
    "tr": "ağrı / acı",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "Waar heeft u precies pijn?",
      "translation": "Tam olarak nereniz ağrıyor?"
    }
  },
  {
    "nl": "perron",
    "article": "het",
    "plural": "perrons",
    "diminutive": "perronnetje",
    "tr": "peron (tren/otobüs)",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "De intercity naar Rotterdam vertrekt van perron 4b.",
      "translation": "Rotterdam yönüne giden intercity peron 4b'den kalkıyor."
    }
  },
  {
    "nl": "spoor",
    "article": "het",
    "plural": "sporen",
    "diminutive": "spoortje",
    "tr": "demiryolu hattı / tren peronu hattı",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "Let op: de trein vertrekt vandaag van een ander spoor.",
      "translation": "Dikkat: tren bugün farklı bir hattan kalkmaktadır."
    }
  },
  {
    "nl": "inchecken",
    "tr": "kart okutarak giriş yapmak (toplu taşıma/otel)",
    "pos": "Fiil",
    "cefr": "A1",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "check in",
        "jij": "checkt in",
        "wij": "checken in"
      },
      "past": {
        "singular": "checkte in",
        "plural": "checkten in"
      },
      "perfect": "heeft ingecheckt"
    },
    "example": {
      "source": "Vergeet niet in te checken bij de poortjes.",
      "translation": "Turnikelerde kartınızı okutmayı unutmayın."
    }
  },
  {
    "nl": "uitchecken",
    "tr": "kart okutarak çıkış yapmak",
    "pos": "Fiil",
    "cefr": "A1",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "check uit",
        "jij": "checkt uit",
        "wij": "checken uit"
      },
      "past": {
        "singular": "checkte uit",
        "plural": "checkten uit"
      },
      "perfect": "heeft uitgecheckt"
    },
    "example": {
      "source": "Als u overstapt op een andere vervoerder, moet u eerst uitchecken.",
      "translation": "Farklı bir taşımacıya aktarma yaparken önce çıkış kartınızı okutmalısınız."
    }
  },
  {
    "nl": "vertraging",
    "article": "de",
    "plural": "vertragingen",
    "tr": "gecikme / rötar",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "De trein heeft tien minuten vertraging.",
      "translation": "Trenin on dakika gecikmesi var."
    }
  },
  {
    "nl": "overstappen",
    "tr": "aktarma yapmak",
    "pos": "Fiil",
    "cefr": "A2",
    "fixedPreposition": "op (overstappen op - bir araca/ hatta aktarma yapmak)",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "stap over",
        "jij": "stapt over",
        "wij": "stappen over"
      },
      "past": {
        "singular": "stapte over",
        "plural": "stapten over"
      },
      "perfect": "is overgestapt"
    },
    "example": {
      "source": "In Utrecht kunt u overstappen op de trein naar Den Haag.",
      "translation": "Utrecht'te Lahey trenine aktarma yapabilirsiniz."
    }
  },
  {
    "nl": "ov-chipkaart",
    "article": "de",
    "plural": "ov-chipkaarten",
    "tr": "toplu taşıma kartı",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "Heeft u voldoende saldo op uw ov-chipkaart?",
      "translation": "Toplu taşıma kartınızda yeterli bakiye var mı?"
    }
  },
  {
    "nl": "abonnement",
    "article": "het",
    "plural": "abonnementen",
    "diminutive": "abonnementje",
    "tr": "abonelik (NS, spor, telefon)",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "Met het dal-vrij abonnement reis je buiten de spits gratis.",
      "translation": "Yoğun saat dışı abonelikle yoğun saatler haricinde ücretsiz seyahat edersiniz."
    }
  },
  {
    "nl": "fietsenstalling",
    "article": "de",
    "plural": "fietsenstallingen",
    "tr": "bisiklet otoparkı",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "Je kunt je fiets de eerste 24 uur gratis in de fietsenstalling zetten.",
      "translation": "Bisikletinizi bisiklet otoparkına ilk 24 saat ücretsiz bırakabilirsiniz."
    }
  },
  {
    "nl": "burgerservicenummer",
    "article": "het",
    "plural": "burgerservicenummers",
    "tr": "vatandaşlık servis numarası (BSN)",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "Je BSN heb je nodig voor werk, belasting en zorg.",
      "translation": "BSN numaranız iş, vergi ve sağlık hizmetleri için gereklidir."
    }
  },
  {
    "nl": "gemeentehuis",
    "article": "het",
    "plural": "gemeentehuizen",
    "diminutive": "gemeentehuisje",
    "tr": "belediye binası",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "We hebben om elf uur een afspraak op het gemeentehuis.",
      "translation": "Saat on birde belediye binasında bir randevumuz var."
    }
  },
  {
    "nl": "belastingdienst",
    "article": "de",
    "tr": "Hollanda vergi dairesi",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "De blauwe envelop is een brief van de Belastingdienst.",
      "translation": "Mavi zarf Vergi Dairesi'nden gelen bir mektuptur."
    }
  },
  {
    "nl": "toeslag",
    "article": "de",
    "plural": "toeslagen",
    "diminutive": "toeslagje",
    "tr": "devlet desteği / sübvansiyon (zorgtoeslag, huurtoeslag)",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "Heb je al zorgtoeslag aangevraagd via de overheid?",
      "translation": "Devlet üzerinden sağlık desteği başvurusu yaptın mı?"
    }
  },
  {
    "nl": "digid",
    "article": "de",
    "tr": "Hollanda resmi dijital kimlik doğrulama sistemi",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "Log in met je DigiD om je gegevens in te zien.",
      "translation": "Bilgilerinizi görmek için DigiD ile giriş yapınız."
    }
  },
  {
    "nl": "verhuizing",
    "article": "de",
    "plural": "verhuizingen",
    "tr": "taşınma / ev değiştirme",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "Geef je verhuizing binnen vijf dagen door aan de gemeente.",
      "translation": "Taşınmanızı beş gün içinde belediyeye bildiriniz."
    }
  },
  {
    "nl": "huurovereenkomst",
    "article": "de",
    "plural": "huurovereenkomsten",
    "tr": "kira sözleşmesi",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "Lees de huurovereenkomst goed door voordat je tekent.",
      "translation": "İmzalamadan önce kira sözleşmesini dikkatlice okuyunuz."
    }
  },
  {
    "nl": "waarborgsom",
    "article": "de",
    "plural": "waarborgsommen",
    "tr": "kira teminatı / depozito",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "De waarborgsom bedraagt meestal één maand huur.",
      "translation": "Depozito bedeli genelde bir aylık kiradır."
    }
  },
  {
    "nl": "makelaar",
    "article": "de",
    "plural": "makelaars",
    "diminutive": "makelaartje",
    "tr": "emlakçı",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "De makelaar organiseert morgen een bezichtiging van de woning.",
      "translation": "Emlakçı yarın evin gezilmesi için bir randevu ayarlıyor."
    }
  },
  {
    "nl": "cv-ketel",
    "article": "de",
    "plural": "cv-ketels",
    "tr": "kombi / merkezi ısıtma kazanı",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "De cv-ketel moet elk jaar gecontroleerd worden.",
      "translation": "Kombi her yıl kontrol edilmelidir."
    }
  },
  {
    "nl": "sollicitatiegesprek",
    "article": "het",
    "plural": "sollicitatiegesprekken",
    "diminutive": "sollicitatiegesprekje",
    "tr": "iş görüşmesi / mülakat",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "Ik heb morgen een belangrijk sollicitatiegesprek.",
      "translation": "Yarın önemli bir iş görüşmem var."
    }
  },
  {
    "nl": "arbeidsovereenkomst",
    "article": "de",
    "plural": "arbeidsovereenkomsten",
    "tr": "iş sözleşmesi",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "Zij heeft een vaste arbeidsovereenkomst gekregen.",
      "translation": "Kalıcı (süresiz) bir iş sözleşmesi aldı."
    }
  },
  {
    "nl": "salaris",
    "article": "het",
    "plural": "salarissen",
    "diminutive": "salarisje",
    "tr": "maaş / aylık kazanç",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "Het salaris wordt rond de 25e van de maand gestort.",
      "translation": "Maaş ayın 25'i civarında hesaba yatırılır."
    }
  },
  {
    "nl": "collega",
    "article": "de",
    "plural": "collega's",
    "diminutive": "collegaatje",
    "tr": "iş arkadaşı / meslektaş",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "Ik lunch elke dag gezellig met mijn collega's.",
      "translation": "Her gün iş arkadaşlarımla keyifle öğle yemeği yerim."
    }
  },
  {
    "nl": "vakantiegeld",
    "article": "het",
    "tr": "tatil harçlığı / ödeneği (yıllık %8)",
    "pos": "İsim",
    "cefr": "B1",
    "example": {
      "source": "In mei ontvangen de meeste werknemers hun vakantiegeld.",
      "translation": "Mayıs ayında çalışanların çoğu tatil ödeneğini alır."
    }
  },
  {
    "nl": "vacature",
    "article": "de",
    "plural": "vacatures",
    "diminutive": "vacaturetje",
    "tr": "açık iş pozisyonu",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "Er staat een interessante vacature op LinkedIn.",
      "translation": "LinkedIn'de ilginç bir iş ilanı var."
    }
  },
  {
    "nl": "korting",
    "article": "de",
    "plural": "kortingen",
    "diminutive": "kortinkje",
    "tr": "indirim / tenzilat",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "Op dit product krijg je vandaag 25% korting.",
      "translation": "Bu üründe bugün %25 indirim var."
    }
  },
  {
    "nl": "aanbieding",
    "article": "de",
    "plural": "aanbiedingen",
    "diminutive": "aanbiedinkje",
    "tr": "kampanyalı ürün / indirim teklifi",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "De kaas is deze week in de aanbieding.",
      "translation": "Peynir bu hafta kampanyada/indirimde."
    }
  },
  {
    "nl": "kassabon",
    "article": "de",
    "plural": "kassabonnen",
    "diminutive": "kassabonnetje",
    "tr": "kasa fişi / fatura",
    "pos": "İsim",
    "cefr": "A1",
    "example": {
      "source": "Wilt u de kassabon meenemen?",
      "translation": "Kasa fişinizi almak ister misiniz?"
    }
  },
  {
    "nl": "pinnen",
    "tr": "banka kartıyla / temassız ödemek",
    "pos": "Fiil",
    "cefr": "A1",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "pin",
        "jij": "pint",
        "wij": "pinnen"
      },
      "past": {
        "singular": "pinde",
        "plural": "pinden"
      },
      "perfect": "heeft gepind"
    },
    "example": {
      "source": "Kan ik hier contactloos pinnen?",
      "translation": "Burada temassız kartla ödeyebilir miyim?"
    }
  },
  {
    "nl": "statiegeld",
    "article": "het",
    "tr": "şişe ve kutu depozitosu",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "Je kunt de plastic flesjes inleveren voor statiegeld.",
      "translation": "Plastik şişeleri depozito iadesi için teslim edebilirsiniz."
    }
  },
  {
    "nl": "klantenservice",
    "article": "de",
    "tr": "müşteri hizmetleri",
    "pos": "İsim",
    "cefr": "A2",
    "example": {
      "source": "Als het pakket niet aankomt, bel je de klantenservice.",
      "translation": "Paket ulaşmazsa müşteri hizmetlerini ararsınız."
    }
  },
  {
    "nl": "retourneren",
    "tr": "iade etmek (sipariş/ürün)",
    "pos": "Fiil",
    "cefr": "B1",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "retourneer",
        "jij": "retourneert",
        "wij": "retourneren"
      },
      "past": {
        "singular": "retourneerde",
        "plural": "retourneerden"
      },
      "perfect": "heeft geretourneerd"
    },
    "example": {
      "source": "U kunt de kleding binnen 30 dagen gratis retourneren.",
      "translation": "Kıyafetleri 30 gün içinde ücretsiz iade edebilirsiniz."
    }
  },
  {
    "nl": "bezorgen",
    "tr": "adrese teslim etmek / getirmek",
    "pos": "Fiil",
    "cefr": "A2",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "bezorg",
        "jij": "bezorgt",
        "wij": "bezorgen"
      },
      "past": {
        "singular": "bezorgde",
        "plural": "bezorgden"
      },
      "perfect": "heeft bezorgd"
    },
    "example": {
      "source": "De postbode komt vanmiddag het pakket bezorgen.",
      "translation": "Postacı öğleden sonra paketi teslim etmeye gelecek."
    }
  },
  {
    "nl": "verhuizen",
    "tr": "taşınmak",
    "pos": "Fiil",
    "cefr": "A2",
    "fixedPreposition": "naar (verhuizen naar - bir yere taşınmak)",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "verhuis",
        "jij": "verhuist",
        "wij": "verhuizen"
      },
      "past": {
        "singular": "verhuisde",
        "plural": "verhuisden"
      },
      "perfect": "is verhuisd"
    },
    "example": {
      "source": "Volgende maand verhuizen we naar een grotere woning.",
      "translation": "Gelecek ay daha büyük bir eve taşınıyoruz."
    }
  },
  {
    "nl": "huren",
    "tr": "kiralamak",
    "pos": "Fiil",
    "cefr": "A2",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "huur",
        "jij": "huurt",
        "wij": "huren"
      },
      "past": {
        "singular": "huurde",
        "plural": "huurden"
      },
      "perfect": "heeft gehuurd"
    },
    "example": {
      "source": "Zij huren een gemeubileerd appartement in Rotterdam.",
      "translation": "Rotterdam'da eşyalı bir daire kiralıyorlar."
    }
  },
  {
    "nl": "proberen",
    "tr": "denemek / çabalamak",
    "pos": "Fiil",
    "cefr": "A1",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "probeer",
        "jij": "probeert",
        "wij": "proberen"
      },
      "past": {
        "singular": "probeerde",
        "plural": "probeerden"
      },
      "perfect": "heeft geprobeerd"
    },
    "example": {
      "source": "Ik probeer elke dag een half uur Nederlands te oefenen.",
      "translation": "Her gün yarım saat Felemenkçe pratik yapmaya çalışıyorum."
    }
  },
  {
    "nl": "vergeten",
    "tr": "unutmak",
    "pos": "Fiil",
    "cefr": "A1",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "vergeet",
        "jij": "vergeet",
        "wij": "vergeten"
      },
      "past": {
        "singular": "vergat",
        "plural": "vergaten"
      },
      "perfect": "is/heeft vergeten"
    },
    "example": {
      "source": "Ik ben mijn sleutels thuis vergeten.",
      "translation": "Anahtarlarımı evde unuttum."
    }
  },
  {
    "nl": "onthouden",
    "tr": "akılda tutmak / ezberinde tutmak",
    "pos": "Fiil",
    "cefr": "A2",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "onthoud",
        "jij": "onthoudt",
        "wij": "onthouden"
      },
      "past": {
        "singular": "onthield",
        "plural": "onthielden"
      },
      "perfect": "heeft onthouden"
    },
    "example": {
      "source": "Het is handig om deze woorden goed te onthouden.",
      "translation": "Bu kelimeleri iyi akılda tutmak faydalıdır."
    }
  },
  {
    "nl": "meenemen",
    "tr": "yanına almak / beraberinde götürmek",
    "pos": "Fiil",
    "cefr": "A2",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "neem mee",
        "jij": "neemt mee",
        "wij": "nemen mee"
      },
      "past": {
        "singular": "nam mee",
        "plural": "namen mee"
      },
      "perfect": "heeft meegenomen"
    },
    "example": {
      "source": "Vergeet niet je paraplu mee te nemen!",
      "translation": "Yanına şemsiyeni almayı unutma!"
    }
  },
  {
    "nl": "afrekenen",
    "tr": "hesap ödemek / hesabı kapatmak",
    "pos": "Fiil",
    "cefr": "A2",
    "fixedPreposition": "met (afrekenen met - ile hesaplaşmak)",
    "conjugation": {
      "isVerb": true,
      "present": {
        "ik": "reken af",
        "jij": "rekent af",
        "wij": "rekenen af"
      },
      "past": {
        "singular": "rekende af",
        "plural": "rekenden af"
      },
      "perfect": "heeft afgerekend"
    },
    "example": {
      "source": "Ober, mogen wij alsjeblieft afrekenen?",
      "translation": "Garson, hesabı ödeyebilir miyiz lütfen?"
    }
  }
];
