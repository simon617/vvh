import type { Director } from "@/components/layout/DirectorCards";
import type { Locale } from "./navigation";

/**
 * Director data for the Board of Directors page.
 *
 * Names, categories and bios are broken down from the live `page_contents.contentHtml`
 * envelope for the `board-of-directors` page (EN + ZH). Envelope format:
 *   <h2>{category}</h2>
 *   <p><strong>{name}</strong><br>{bio}</p>
 * plus a final non-director "Roles and Functions" <h2> + link section that is
 * excluded here.
 * Text is transcribed verbatim from the stored HTML (JP markers stay inline in the
 * name as stored).
 *
 * Used as the static fallback for the Board page (when no published DB row exists)
 * and as the seed/placeholder source.
 */
const DIRECTORS: Record<Locale, Director[]> = {
  en: [
    {
      name: "Mr. Lo Lin Shing, Simon",
      category: "Executive Directors",
      bio: "Mr. Lo, joined the Company in March 2000 and is currently the Chairman and executive Director of the Company. He possesses over 40 years of experience in the financial, securities and futures industries, including many trans-border transactions and senior corporate management experience. Mr. Lo is a director of certain subsidiaries of the Company. He is the father of Mr. Lo, Rex Cze Kei, Mr. Lo, Chris Cze Wai and Mr. Lo, James Cze Chung, who are executive Directors of the Company respectively. He is also the chairman and executive director of Mongolia Energy Corporation Limited which is listed on the Stock Exchange.",
    },
    {
      name: "Mr. Ho Hau Chong, Norman",
      category: "Executive Directors",
      bio: "Mr. Ho was appointed as a Non-executive Director in November 2000 and re-designated as executive Director in January 2007. He is an executive director of Honorway Investments Limited and Tak Hung (Holding) Company, Limited and has over 40 years experience in management and property development. Mr. Ho is also an executive director of Miramar Hotel and Investment Company, Limited and an independent non-executive director of Hong Kong Ferry (Holdings) Company Limited, Shun Tak Holdings Limited and SJM Holdings Limited respectively, all of which are listed on The Stock Exchange of Hong Kong Limited. He resigned as an independent non-executive director of Lee Hing Development Limited (de-listed on 18 October 2022) on 19 October 2022. Mr. Ho is a member of the Institute of Chartered Accountants in England and Wales, and a fellow member of the HKICPA.",
    },
    {
      name: "Ms. Yvette Ong",
      category: "Executive Directors",
      bio: "Ms Ong was appointed as an executive Director in February 2018. She has over 30 years of Senior managerial experience in the Asia-Pacific region. She previously served as a managing director of AT&T EasyLink Services Asia Pacific Ltd. Ms. Ong holds an MBA degree in Management Information Systems and Marketing and a bachelor degree in Finance and Management from the University of San Francisco. She is a director of certain subsidiaries of the Company. Ms. Ong is also an executive director of Mongolia Energy Corporation Limited which is listed on The Stock Exchange of Hong Kong Limited.",
    },
    {
      name: "Mr. Lo, Rex Cze Kei",
      category: "Executive Directors",
      bio: "Mr. Rex Lo has been a non-executive Director since November 2016 and re-designated as an executive Director since February 2018. He joined the Group in 2014. He has over 10 years of experience in property business and general management. Mr. Rex Lo holds a Master of Science in Electronic Commerce and Internet Computing and a Bachelor of Science in Business Administration. He is a director of certain subsidiaries of the Company. Mr. Rex Lo is the son of Mr. Lo Lin Shing, Simon, the Chairman and the executive Director of the Company and the elder brother of Lo, Chris Cze Wai and Mr. Lo, James Cze Chung, both are executive Directors of the Company. He is also an executive director of Mongolia Energy Corporation Limited which is listed on The Stock Exchange of Hong Kong Limited.",
    },
    {
      name: "Mr. Lo, Chris Cze Wai",
      category: "Executive Directors",
      bio: "Mr. Chris Lo, holds a Master of Engineering in Mechanical Engineering from University of Bristol, UK. He joined the Group in 2017. He has experienced in property management and corporate finance. Mr. Chris Lo is a director of certain subsidiaries of the Company. He is the son of Mr. Lo Lin Shing, Simon, the Chairman and executive Director of the Company, and the younger brother of Lo, Rex Cze Kei and the elder brother of Mr. Lo, James Cze Chung, both are executive Directors of the Company. Mr. Chris Lo is also an executive director of Mongolia Energy Corporation Limited which is listed on the Stock Exchange.",
    },
    {
      name: "Mr. Lo, James Cze Chung",
      category: "Executive Directors",
      bio: "Mr. James Lo, has been a non-executive Director of the Company in March 2023 and re-designated as an executive Director of the Company on 13 August 2024. He holds a bachelor degree of Science (Hons.) in Business and Management from Brunel University, UK. Before the appointment of non-executive directorship, Mr. James Lo is a director of certain subsidiaries of the Company. He has more than 5 years commercial experience. He is the son of Mr. Lo Lin Shing, Simon, the Chairman and executive Director of the Company and the younger brother of Mr. Lo, Rex Cze Kei and Mr. Lo, Chris Cze Wai, both are executive Directors of the Company. Mr. James Lo is also an executive director of Mongolia Energy Corporation Limited which is listed on the Stock Exchange.",
    },
    {
      name: "Mrr. Tsui Hing Chuen, William jp",
      category: "Independent Non-Executive Directors",
      bio: "Mr. Tsui has been appointed as an independent non-executive Director of the Company since September 2006. He is the founding partner of Messrs. Lo, Wong & Tsui, Solicitors & Notaries, which was established in 1980. Mr. Tsui has been a solicitor of the High Court of Hong Kong since 1977, a solicitor of the Supreme Court of England & Wales since 1981, and a barrister and solicitor of the Supreme Court of Victoria, Australia since 1983. He has also been an advocate and solicitor in Singapore since 1985 and a notary public appointed by the Archbishop of Canterbury, England since 1988. Mr. Tsui was appointed as a Justice of the Peace by The Government of the Hong Kong Special Administrative Region in 1997. He was admitted to the Roll of Honour of The Law Society of Hong Kong in 2013. Mr. Tsui is also an independent non-executive director of Mongolia Energy Corporation Limited which is listed on The Stock Exchange of Hong Kong Limited.",
    },
    {
      name: "Mr. Lau Wai Biu",
      category: "Independent Non-Executive Directors",
      bio: "Mr. Lau has been appointed as an independent non-executive Director of the Company since March 2007. He has over 20 years of extensive experience in accounting and financial management. Mr. Lau is a member of the Hong Kong Institute of Certified Public Accountants and a fellow of the Association of Chartered Certified Accountants. He is also an independent non-executive director of Mongolia Energy Corporation Limited which is listed on The Stock Exchange of Hong Kong Limited.",
    },
    {
      name: "Mr. Lee Kee Wai, Frank",
      category: "Independent Non-Executive Directors",
      bio: "Mr. Lee has been an independent non-executive Director of the Company since April 2007 and is the Senior Partner of Messrs. Vincent T.K. Cheung, Yap & Co., Solicitors and Notaries. He holds a Master of Law from University of Cambridge and a Bachelor of Laws from the London School of Economics & Political Science. Mr. Lee is a solicitor in the respective jurisdictions of Hong Kong, England, Singapore and the Australian Capital Territory (Australia). He is a China-Appointed Attesting Officer and a member of the Chartered Institute of Arbitrators. Mr. Lee is also an independent non-executive director of Pico Far East Holdings Limited and Mongolia Energy Corporation Limited and, both are listed on The Stock Exchange of Hong Kong Limited.",
    },
    {
      name: "Mr. Wei, Chi Kuan Kenny",
      category: "Independent Non-Executive Directors",
      bio: "Mr. Wei has been appointed as an independent non-executive director of the Company with effect from 24 November 2023. Mr. Wei has over 40 years of experience in banking industries, including held senior management positions at various international banks. He was a managing director of trade and commodity finance, Asia Pacific of Rabobank International (HK). Mr. Wei has been retired since 2020. He holds a Bachelor degree of B.A, Economics, Western University, London, Ontario, Canada in 1980.",
    },
  ],
  zh: [
    {
      name: "魯連城先生",
      category: "執行董事",
      bio: "魯先生於二零零零年三月加入本公司，現為本公司董事會主席及執行董事。彼在金融、證券、期貨行業具有四十多年經驗，參與許多跨國交易，具備豐富的企業高管經驗。魯先生為本公司若干附屬公司之董事。彼為本公司執行董事魯士奇先生、魯士偉先生及魯士中先生的父親。魯先生亦擔任蒙古能源有限公司的主席及執行董事，該公司於香港聯合交易所有限公司上市。",
    },
    {
      name: "何厚鏘先生",
      category: "執行董事",
      bio: "何先生於二零零零年十一月獲委任為非執行董事，並於二零零七年一月調任為執行董事。彼為恒威投資有限公司及德雄（集團）有限公司之執行董事，擁有四十年之管理及物業發展經驗。何先生現亦為美麗華酒店企業有限公司之執行董事及香港小輪（集團）有限公司、信德集團有限公司及澳門博彩控股有限公司之獨立非執行董事，該等公司均於香港聯合交易所有限公司上市。彼於二零二二年十月十九日辭任利興發展有限公司（於二零二二年十月十八日被除牌）之獨立非執行董事。何先生為英格蘭及威爾斯特許會計師公會會員及香港會計師公會資深會員。",
    },
    {
      name: "翁綺慧女士",
      category: "執行董事",
      bio: "翁女士於二零一八年二月獲委任為執行董事。彼於亞太區擁有逾三十年高级管理經驗。彼曾於AT&T易連通服務有限公司擔任董事總經理。翁女士持有管理資訊系統及市場推廣工商管理學碩士學位及三藩市大學金融及管理學士學位。彼出任本公司若干附屬公司董事。翁女士亦為蒙古能源有限公司之執行董事，該公司於香港聯合交易所有限公司上市。",
    },
    {
      name: "魯士奇先生",
      category: "執行董事",
      bio: "魯士奇先生自二零一六年十一月起擔任非執行董事並自二零一八年二月起調任為執行董事。彼於二零一四年加入本集團，彼於物業業務及一般管理擁有逾十年經驗。魯士奇先生持有電子商貿及互聯網工程理學碩士及工商管理理學士學位。彼出任本公司若干附屬公司之董事。魯士奇先生為本公司主席兼執行董事魯連城先生之兒子，以及本公司執行董事魯士偉先生及魯士中先生之胞兄。彼亦為蒙古能源有限公司之執行董事，該公司於香港聯合交易所有限公司上市。",
    },
    {
      name: "魯士偉先生",
      category: "執行董事",
      bio: "魯士偉先生，持有英國布里斯托大學机械工程碩士學位。彼於二零一七年加入本集團，彼擁有物業管理及企業融資方面的經驗。魯士偉先生出任本公司若干附屬公司之董事。彼為本公司主席兼執行董事魯連成先生之兒子、本公司執行董事魯士奇先生之胞弟及本公司執行董事魯士中先生之胞兄。彼亦擔任蒙古能源有限公司之執行董事，該公司於香港聯合交易所有限公司上市。",
    },
    {
      name: "魯士中先生",
      category: "執行董事",
      bio: "魯先生於二零二三年三月擔任為本公司非執行董事，並於二零二四年八月十三日調任為本公司執行董事。彼持有英國布魯內爾大學商業及管理學士（榮譽）學位。獲委任為非執行董事之前，魯先生已擔任本公司若干附屬公司之董事。彼有超過五年的商業經驗。彼為本公司主席兼執行董事魯連城先生之兒子、本公司執行董事魯士奇先生及魯士偉先生之胞弟。彼亦為蒙古能源有限公司之執行董事，該公司於香港聯合交易所有限公司上市。",
    },
    {
      name: "徐慶全先生 太平紳士",
      category: "獨立非執行董事",
      bio: "徐先生自二零零六年九月起獲委任為本公司之獨立非執行董事。彼為盧王徐律師事務所的創辦合夥人，該事務所於一九八零年創立。徐先生自一九七七年成為香港高等法院的事務律師、自一九八一年成為英格蘭及威爾斯最高法院的事務律師及自一九八三年成為澳大利亞維多利亞省最高法院的大律師和事務律師。彼亦自一九八五年取得新加坡辯護人及律師資格，並自一九八八年獲英格蘭坎特伯雷大主教委任為國際公證人。徐先生於一九九七年獲香港特別行政區政府頒授太平紳士榮銜。彼於二零一三年獲授為香港律師會榮譽會員。彼亦為蒙古能源有限公司之獨立非執行董事，該等公司均於香港聯合交易所有限公司上市。",
    },
    {
      name: "劉偉彪先生",
      category: "獨立非執行董事",
      bio: "劉先生自二零零七年三月起擔任為本公司之獨立非執行董事。彼在會計和財務管理方面擁有逾二十多年豐富經驗。劉先生為香港會計師公會會員及英國特許公認會計師公會資深會員。彼為蒙古能源有限公司之獨立非執行董事，該等公司均於香港聯合交易所有限公司上市。",
    },
    {
      name: "李企偉先生",
      category: "獨立非執行董事",
      bio: "李先生自二零零七年四月起擔任為本公司之獨立非執行董事。彼為張葉司徒陳律師事務所的高級合夥人。李先生持有劍橋大學法律碩士學位及倫敦政治經濟學院法學學士學位。李先生為香港、英格蘭、新加坡及澳大利亞首都直轄區（澳大利亞）等各司法權區的律師。彼為中國委托公證人及英國皇家仲裁學會之會員。彼亦為筆克遠東集團有限公司及蒙古能源有限公司之獨立非執行董事，兩家公司於香港聯合交易所有限公司上市。",
    },
    {
      name: "魏啟寬先生",
      category: "獨立非執行董事",
      bio: "魏先生已獲委任為本公司非執行董事，由二零二三年十一月二十四日起生效。魏先生於銀行業擁有逾40年經驗，包括於多間國際銀行擔任高級管理職位。彼曾擔任荷蘭合作銀行（香港）亞太區貿易與商品融資董事總經理。魏先生自二零二零年起已退休。彼於 一九八零年取得加拿大安大略省倫敦西大學經濟學學士學位。",
    },
  ],
};

export function getDirectors(locale: Locale): Director[] {
  return DIRECTORS[locale];
}
