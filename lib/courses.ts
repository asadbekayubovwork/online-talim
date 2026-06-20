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

// ---------------------------------------------------------------------------
// FAKE curriculum layer (temporary — until the backend is ready).
//
// Everything below is deterministically generated from the static course data
// so that the SAME lessons/sections/durations are produced on the server and
// the client (no hydration mismatch) and on every page (detail + player).
// When the backend lands, replace the generators with real fetches and keep
// the exported types/helpers' shapes.
// ---------------------------------------------------------------------------

export interface Lesson {
  id: number;
  /** Position within the whole course (1-based), used for "N-dars" labels. */
  order: number;
  title: string;
  /** Human duration, e.g. "12:30". */
  duration: string;
  /** Placeholder YouTube video id — swapped for the real one by the backend. */
  youtubeId: string;
  /** Free preview lesson (watchable without enrolling). */
  preview: boolean;
}

export interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
}

// Placeholder YouTube ids. These are public, embeddable videos used purely so
// the mock player actually plays something. The backend will provide real ids.
const SAMPLE_YOUTUBE_IDS = [
  "M7lc1UVf-VE",
  "aqz-KE-bpKQ",
  " scRNEYwgSGo".trim(),
  " tgbNymZ7vqY".trim(),
  "W6NZfCO5SIk",
  "Ke90Tje7VS0",
];

const SECTION_TITLES = [
  "Kirish moduli",
  "Asosiy qism",
  "Chuqurlashtirilgan mavzular",
  "Amaliy mashg'ulotlar",
  "Yakuniy modul",
  "Qo'shimcha materiallar",
];

const LESSON_TOPICS = [
  "Kirish va umumiy ma'lumot",
  "Asosiy istilohlar va ta'riflar",
  "Birinchi bobning sharhi",
  "Dalillar va hujjatlar tahlili",
  "Amaliy masalalar yechimi",
  "Mazhablar qiyosi",
  "Muhim qoidalar",
  "Tarixiy kontekst",
  "Mavzu bo'yicha savol-javob",
  "Takrorlash va mustahkamlash",
  "Manbalar bilan ishlash",
  "Xulosa va yakuniy fikrlar",
];

// Cheap deterministic 0..1 pseudo-random from an integer seed.
function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Build the full section/lesson curriculum for a course (deterministic). */
export function getCurriculum(course: Course): Section[] {
  const perSection = 6;
  const sectionCount = Math.max(1, Math.ceil(course.lessons / perSection));
  const sections: Section[] = [];
  let order = 0;

  for (let s = 0; s < sectionCount; s++) {
    const remaining = course.lessons - order;
    const count = Math.min(perSection, remaining);
    const lessons: Lesson[] = [];

    for (let l = 0; l < count; l++) {
      order += 1;
      const seed = course.id * 1000 + order;
      const mins = 6 + Math.floor(seeded(seed) * 19); // 6..24 min
      const secs = Math.floor(seeded(seed + 7) * 60);
      lessons.push({
        id: order,
        order,
        title: LESSON_TOPICS[(order - 1) % LESSON_TOPICS.length],
        duration: `${pad2(mins)}:${pad2(secs)}`,
        youtubeId: SAMPLE_YOUTUBE_IDS[(order - 1) % SAMPLE_YOUTUBE_IDS.length],
        // First two lessons of the very first section are free previews.
        preview: s === 0 && l < 2,
      });
    }

    sections.push({
      id: s + 1,
      title: SECTION_TITLES[s % SECTION_TITLES.length],
      lessons,
    });
  }

  return sections;
}

/** Flat, ordered list of every lesson in a course. */
export function getCourseLessons(course: Course): Lesson[] {
  return getCurriculum(course).flatMap((section) => section.lessons);
}

export function getCourse(id: number): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getLesson(
  course: Course,
  lessonId: number
): Lesson | undefined {
  return getCourseLessons(course).find((l) => l.id === lessonId);
}

/** Previous / next lesson for player navigation (undefined at the ends). */
export function getAdjacentLessons(
  course: Course,
  lessonId: number
): { prev?: Lesson; next?: Lesson } {
  const all = getCourseLessons(course);
  const i = all.findIndex((l) => l.id === lessonId);
  if (i === -1) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}

// Mock "enrolled" courses with progress. UI mock only — there is no real
// tracking yet; the backend will own this. `completedLessons` are treated as
// the first N lessons of the course being done.
export interface Enrollment {
  courseId: number;
  completedLessons: number;
  /** Lesson to resume from. */
  currentLessonId: number;
}

export const enrollments: Enrollment[] = [
  { courseId: 1, completedLessons: 18, currentLessonId: 19 },
  { courseId: 9, completedLessons: 28, currentLessonId: 28 }, // completed
  { courseId: 10, completedLessons: 6, currentLessonId: 7 },
  { courseId: 2, completedLessons: 4, currentLessonId: 5 },
];

export function getEnrollment(courseId: number): Enrollment | undefined {
  return enrollments.find((e) => e.courseId === courseId);
}

export function progressPercent(course: Course, completedLessons: number): number {
  if (course.lessons === 0) return 0;
  return Math.round((completedLessons / course.lessons) * 100);
}
