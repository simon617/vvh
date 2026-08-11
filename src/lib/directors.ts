import type { Director } from "@/components/layout/DirectorCards";
import type { Locale } from "./navigation";

/**
 * Director data from PRD Section 2.2.2.
 * Names and roles are real; bios are placeholder text for Phase 2A
 * (full bios are managed via CMS in Phase 2B).
 */
const DIRECTORS: Record<Locale, Director[]> = {
  en: [
    {
      name: "Mr. Lo Luen Chuen",
      title: "Chairman",
      category: "Executive Directors",
      bio: "Mr. Lo Luen Chuen has extensive experience in corporate management and leadership.",
    },
    {
      name: "Mr. Ho Hau Cheung",
      title: "Executive Director",
      category: "Executive Directors",
      bio: "Mr. Ho Hau Cheung oversees the Group's business operations.",
    },
    {
      name: "Ms. Yung Yee Wai",
      title: "Executive Director",
      category: "Executive Directors",
      bio: "Ms. Yung Yee Wai manages corporate affairs of the Group.",
    },
    {
      name: "Mr. Lo Sze Ki",
      title: "Executive Director",
      category: "Executive Directors",
      bio: "Mr. Lo Sze Ki contributes to the strategic development of the Group.",
    },
    {
      name: "Mr. Lo Sze Wai",
      title: "Executive Director",
      category: "Executive Directors",
      bio: "Mr. Lo Sze Wai oversees investment projects of the Group.",
    },
    {
      name: "Mr. Lo Sze Chung",
      title: "Executive Director",
      category: "Executive Directors",
      bio: "Mr. Lo Sze Chung is responsible for logistics and related businesses.",
    },
    {
      name: "Mr. Tsui Hing Chuen (JP)",
      title: "Independent Non-Executive Director",
      category: "Independent Non-Executive Directors",
      bio: "Mr. Tsui Hing Chuen holds various public service roles and provides independent oversight.",
    },
    {
      name: "Mr. Lau Wai Biu",
      title: "Independent Non-Executive Director",
      category: "Independent Non-Executive Directors",
      bio: "Mr. Lau Wai Biu brings independent financial and governance insight to the Board.",
    },
    {
      name: "Mr. Li Kai Wai",
      title: "Independent Non-Executive Director",
      category: "Independent Non-Executive Directors",
      bio: "Mr. Li Kai Wai provides independent advice on corporate governance matters.",
    },
    {
      name: "Mr. Ngai Hin Foon",
      title: "Independent Non-Executive Director",
      category: "Independent Non-Executive Directors",
      bio: "Mr. Ngai Hin Foon offers independent professional expertise to the Board.",
    },
  ],
  zh: [
    {
      name: "魯連城先生",
      title: "主席",
      category: "執行董事",
      bio: "魯連城先生在企業管理及領導方面經驗豐富。",
    },
    {
      name: "何厚鏘先生",
      title: "執行董事",
      category: "執行董事",
      bio: "何厚鏘先生負責集團之業務營運。",
    },
    {
      name: "翁綺慧女士",
      title: "執行董事",
      category: "執行董事",
      bio: "翁綺慧女士負責集團之公司事務。",
    },
    {
      name: "魯士奇先生",
      title: "執行董事",
      category: "執行董事",
      bio: "魯士奇先生參與集團之策略發展。",
    },
    {
      name: "魯士偉先生",
      title: "執行董事",
      category: "執行董事",
      bio: "魯士偉先生負責集團之投資項目。",
    },
    {
      name: "魯士中先生",
      title: "執行董事",
      category: "執行董事",
      bio: "魯士中先生負責物流及相關業務。",
    },
    {
      name: "徐慶全先生（太平紳士）",
      title: "獨立非執行董事",
      category: "獨立非執行董事",
      bio: "徐慶全先生擔任多項公共服務職務，並提供獨立監督。",
    },
    {
      name: "劉偉彪先生",
      title: "獨立非執行董事",
      category: "獨立非執行董事",
      bio: "劉偉彪先生為董事會帶來獨立的財務及管治見解。",
    },
    {
      name: "李企偉先生",
      title: "獨立非執行董事",
      category: "獨立非執行董事",
      bio: "李企偉先生就企業管治事宜提供獨立意見。",
    },
    {
      name: "魏啟寬先生",
      title: "獨立非執行董事",
      category: "獨立非執行董事",
      bio: "魏啟寬先生為董事會提供獨立專業意見。",
    },
  ],
};

export function getDirectors(locale: Locale): Director[] {
  return DIRECTORS[locale];
}
