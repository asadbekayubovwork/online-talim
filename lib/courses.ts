// Shared course catalogue.
//
// Lives in `lib/` (not inside the client component) so it can be consumed by
// BOTH the interactive <CoursesSection> client component AND the server-side
// JSON-LD structured data emitted for SEO. Keep it free of client-only APIs.

export type Level = "beginner" | "intermediate" | "advanced";
export type Category = "fiqh" | "aqida" | "tazkiya";

export interface Course {
  id: number;
  title: string;
  arabicTitle: string;
  description: string;
  instructor: string;
  category: Category;
  lessons: number;
  hours: number;
  students: number;
  level: Level;
  price: number | null;
  badge?: string;
  color: string;
  icon: string;
}

export const courses: Course[] = [
  // Iftoga tayyorlov
  {
    id: 1,
    title: "Muqaddimat us-Salot",
    arabicTitle: "مقدمة الصلاة",
    description:
      "Namoz asoslarini chuqur o'rganish. Hanafiy mazhabiga ko'ra namozning farz, vojib va sunnatlarini qamrab oluvchi kitob.",
    instructor: "Shayx Abdulloh Domla",
    category: "fiqh",
    lessons: 24,
    hours: 12,
    students: 540,
    level: "beginner",
    price: null,
    color: "from-teal-500 to-emerald-600",
    icon: "🕌",
  },
  {
    id: 2,
    title: "Tuhfatul Muluk",
    arabicTitle: "تحفة الملوك",
    description:
      "Hanafiy fiqhining asosiy masalalarini qamrab olgan qimmatli risola. Ibodat va muomalotga oid masalalar.",
    instructor: "Ustoz Ibrohim Hasan",
    category: "fiqh",
    lessons: 36,
    hours: 18,
    students: 420,
    level: "intermediate",
    price: null,
    color: "from-teal-500 to-emerald-600",
    icon: "📖",
  },
  {
    id: 3,
    title: "Tuhfatut Tullob",
    arabicTitle: "تحفة الطلاب",
    description:
      "Talabalar uchun mo'ljallangan fiqhiy asar. Ibodat masalalarida mustahkam asos hosil qilish uchun.",
    instructor: "Ustoz Ibrohim Hasan",
    category: "fiqh",
    lessons: 30,
    hours: 15,
    students: 380,
    level: "intermediate",
    price: null,
    color: "from-teal-500 to-emerald-600",
    icon: "📚",
  },
  {
    id: 4,
    title: "Masarul Usul",
    arabicTitle: "مسار الأصول",
    description:
      "Usul ul-fiqh — fiqh ilmining metodologik asoslarini o'rganish. Fatvo chiqarishda zarur bo'lgan qoidalar.",
    instructor: "Dr. Yusuf Muhammadiy",
    category: "fiqh",
    lessons: 40,
    hours: 20,
    students: 310,
    level: "intermediate",
    price: null,
    color: "from-teal-500 to-emerald-600",
    icon: "🔬",
  },
  {
    id: 5,
    title: "Sharhi Viqoya",
    arabicTitle: "شرح الوقاية",
    description:
      "Hanafiy fiqhidagi 'Al-Viqoya' asarining sharhi. Muftiylik darajasiga tayyorlovning eng muhim qismi.",
    instructor: "Shayx Abdulloh Domla",
    category: "fiqh",
    lessons: 52,
    hours: 26,
    students: 290,
    level: "advanced",
    price: null,
    color: "from-teal-500 to-emerald-600",
    icon: "📜",
  },
  {
    id: 6,
    title: "Diniy matnlarni rasmiylashtirish",
    arabicTitle: "تنسيق النصوص الدينية",
    description:
      "MS Word va boshqa dasturlarda arab yozuvidagi diniy matnlarni to'g'ri formatlash va rasmiylashtirish.",
    instructor: "Ustoz Sherzod Karimov",
    category: "fiqh",
    lessons: 16,
    hours: 8,
    students: 460,
    level: "beginner",
    price: null,
    color: "from-teal-500 to-emerald-600",
    icon: "💻",
  },
  // Ifto bo'limi
  {
    id: 7,
    title: "Ifto (Fatvo) dasturi",
    arabicTitle: "برنامج الإفتاء",
    description:
      "8 semestrlik (24 oy) oliy darajali dastur. Qiyosiy va amaliy fiqh bo'yicha 'Muftiy' maqomini olishga tayyorlovchi kurs.",
    instructor: "Shayx Abdulloh Domla",
    category: "fiqh",
    lessons: 120,
    hours: 192,
    students: 180,
    level: "advanced",
    price: null,
    badge: "8 semestr",
    color: "from-indigo-500 to-purple-600",
    icon: "🏛️",
  },
  // Ijoza kurslari
  {
    id: 8,
    title: "Al-Hidoya — Savdo-sotiq bo'limi",
    arabicTitle: "الهداية — كتاب البيوع",
    description:
      "Hanafiy fiqhining asosiy manbasidan 'Buyuu' bo'limi. Kursni tugatganlarga kitobni o'qitish huquqi beriladi.",
    instructor: "Dr. Yusuf Muhammadiy",
    category: "fiqh",
    lessons: 45,
    hours: 22,
    students: 220,
    level: "advanced",
    price: null,
    badge: "Ijoza beriladi",
    color: "from-amber-500 to-orange-600",
    icon: "🎓",
  },
  // Umumiy kurslar
  {
    id: 9,
    title: "Tajvid darslari",
    arabicTitle: "دروس التجويد",
    description:
      "Qur'on tilovatining qoidalarini o'rganish. Makhorijul huruf, sifatlar va tajvid qoidalari batafsil.",
    instructor: "Qori Muhammadali",
    category: "fiqh",
    lessons: 28,
    hours: 14,
    students: 1240,
    level: "beginner",
    price: null,
    color: "from-green-500 to-teal-600",
    icon: "📿",
  },
  {
    id: 10,
    title: "Tazkiya — Nafsni poklash",
    arabicTitle: "التزكية",
    description:
      "Islomiy ruhiy tarbiya. Nafsni poklash, yomon xulqlardan xalos bo'lish va yaxshi axloqni shakllantirish.",
    instructor: "Shayx Abdulloh Domla",
    category: "tazkiya",
    lessons: 20,
    hours: 10,
    students: 890,
    level: "beginner",
    price: null,
    color: "from-green-500 to-teal-600",
    icon: "🌿",
  },
];

// The three teaching departments. The Arabic label is fixed; the localized
// label is resolved from the translation messages (`coursesSection.categories`).
export const categories: { key: "all" | Category; arabicLabel: string }[] = [
  { key: "all", arabicLabel: "الجميع" },
  { key: "fiqh", arabicLabel: "الفِقْهُ الحَنَفِيُّ وَأُصُولُهُ" },
  { key: "aqida", arabicLabel: "العَقِيدَة" },
  { key: "tazkiya", arabicLabel: "التَّزْكِيَة" },
];
