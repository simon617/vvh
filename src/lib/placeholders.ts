import { NAV_SLUGS, type NavSlug } from "./navigation";
import { buildReportContent, type ReportRowItem } from "./report-rows";

export interface PagePlaceholder {
  title: string;
  metaTitle: string;
  metaDescription: string;
  breadcrumb: string;
  heroImage?: string;
  contentHtml: string;
  /** True when the data came from the `page_contents` DB (vs the static placeholder). */
  isDbContent?: boolean;
}

export const PLACEHOLDER_SLUGS = NAV_SLUGS;

/* ------------------------------------------------------------------ *
 * Canonical default report rows (single source of truth for the report
 * pages). These feed the placeholder contentHtml as a JSON envelope
 * ({"__type":"reports","rows":[...]}) so `getReportRows()` can read the
 * same shape from BOTH the static placeholder and the CMS DB rows.
 * ------------------------------------------------------------------ */

const DEFAULT_FINANCIAL_REPORTS: Record<"en" | "zh", ReportRowItem[]> = {
  en: [
    { id: "fin-2025", date: "October 2025", title: "Annual Report 2025", url: "/pdf/AnnualReport2025.pdf" },
    { id: "fin-2025-interim", date: "March 2025", title: "Interim Report 2024/2025", url: "/pdf/InterimReport2025.pdf" },
  ],
  zh: [
    { id: "fin-2025", date: "2025年10月", title: "2025年報", url: "/pdf/AnnualReport2025.pdf" },
    { id: "fin-2025-interim", date: "2025年3月", title: "2024/2025年中期報告", url: "/pdf/InterimReport2025.pdf" },
  ],
};

const REPORT_ESG_REPORTS: Record<"en" | "zh", ReportRowItem[]> = {
  en: [
    { id: "esg-2025", date: "2025", title: "ESG Report 2025", url: "/pdf/ESGReport2025.pdf" },
  ],
  zh: [
    { id: "esg-2025", date: "2025", title: "2025環境、社會及管治報告", url: "/pdf/ESGReport2025.pdf" },
  ],
};

const REPORT_CORPORATE_COMMUNICATIONS: Record<"en" | "zh", ReportRowItem[]> = {
  en: [
    {
      id: "comm-202401",
      date: "January 2024",
      title: "Arrangements Regarding Dissemination of Corporate Communications",
      url: "/pdf/communication/e_Communications202401.pdf",
    },
  ],
  zh: [
    {
      id: "comm-202401",
      date: "2024年1月",
      title: "有關發佈公司通訊之安排",
      url: "/pdf/communication/c_Communications202401.pdf",
    },
  ],
};

const HOME_EN = `
<p>Vision Values Holdings Limited (Hong Kong stock code: 862) is a public company listed in The Stock Exchange of Hong Kong Limited.</p>
<p>The Group is principally engaged in the provision of property investment, logistics business, minerals exploration and private jet management services.</p>
`;

const HOME_ZH = `
<p>遠見控股有限公司﹝香港股票編號：862﹞，是香港聯合交易所之上市公司。</p>
<p>集團主要提供物業投資、物流業務、勘探礦藏業務及私人飛機管理服務。</p>
`;

const PLACEHOLDERS: Record<NavSlug, { en: PagePlaceholder; zh: PagePlaceholder }> = {
  home: {
    en: {
      title: "Vision Values Holdings Limited",
      metaTitle: "Vision Values Holdings Limited | HKEX: 862",
      metaDescription:
        "Vision Values Holdings Limited (HKEX: 862) - Property Investment, Logistics, Minerals Exploration & Private Jet Management",
      breadcrumb: "Home",
      contentHtml: HOME_EN,
    },
    zh: {
      title: "遠見控股有限公司",
      metaTitle: "遠見控股有限公司 | 香港交易所：862",
      metaDescription: "遠見控股有限公司（香港交易所：862）— 物業投資、物流業務、勘探礦藏業務及私人飛機管理服務",
      breadcrumb: "首頁",
      contentHtml: HOME_ZH,
    },
  },
  "board-of-directors": {
    en: {
      title: "Board of Directors",
      metaTitle: "Board of Directors | Vision Values Holdings Limited",
      metaDescription:
        "Board of Directors of Vision Values Holdings Limited - Executive and Independent Non-Executive Directors",
      breadcrumb: "Board of Directors",
      contentHtml: `
<h2>Executive Directors</h2>
<ul>
  <li>Mr. Lo Luen Chuen (Chairman)</li>
  <li>Mr. Ho Hau Cheung</li>
  <li>Ms. Yung Yee Wai</li>
  <li>Mr. Lo Sze Ki</li>
  <li>Mr. Lo Sze Wai</li>
  <li>Mr. Lo Sze Chung</li>
</ul>
<h2>Independent Non-Executive Directors</h2>
<ul>
  <li>Mr. Tsui Hing Chuen (JP)</li>
  <li>Mr. Lau Wai Biu</li>
  <li>Mr. Li Kai Wai</li>
  <li>Mr. Ngai Hin Foon</li>
</ul>
<p>Download: <a href="/pdf/RoleAndFunction.pdf" target="_blank">Directors' Roles and Functions (PDF)</a></p>
`,
    },
    zh: {
      title: "董事會",
      metaTitle: "董事會 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司董事會 — 執行董事及獨立非執行董事",
      breadcrumb: "董事會",
      contentHtml: `
<h2>執行董事</h2>
<ul>
  <li>魯連城先生（主席）</li>
  <li>何厚鏘先生</li>
  <li>翁綺慧女士</li>
  <li>魯士奇先生</li>
  <li>魯士偉先生</li>
  <li>魯士中先生</li>
</ul>
<h2>獨立非執行董事</h2>
<ul>
  <li>徐慶全先生（太平紳士）</li>
  <li>劉偉彪先生</li>
  <li>李企偉先生</li>
  <li>魏啟寬先生</li>
</ul>
<p><a href="/pdf/RoleAndFunction.pdf" target="_blank">董事名單與其角色和職能（PDF）</a></p>
`,
    },
  },
  "corporate-details": {
    en: {
      title: "Corporate Details",
      metaTitle: "Corporate Details | Vision Values Holdings Limited",
      metaDescription: "Corporate details of Vision Values Holdings Limited",
      breadcrumb: "Corporate Details",
      contentHtml: `
<table>
  <tbody>
    <tr><th style="text-align:left">Place of Incorporation</th><td>Cayman Islands</td></tr>
    <tr><th style="text-align:left">Principal Activities</th><td>Provision of property investment, logistics business, exploration and evaluation of mineral resources and private jet management services</td></tr>
    <tr><th style="text-align:left">Registered Office</th><td>P.O. Box 31119 Grand Pavilion Hibiscus Way, 802 West Bay Road, Grand Cayman KY1-1205 Cayman Islands</td></tr>
    <tr><th style="text-align:left">Principal Place of Business in Hong Kong</th><td>17th Floor, 118 Connaught Road West, Hong Kong.</td></tr>
    <tr><th style="text-align:left">Principal Share Registrar</th><td>Vistra (Cayman) Limited P.O. Box 31119 Grand Pavilion Hibiscus Way, 802 West Bay Road, Grand Cayman KY1-1205 Cayman Islands</td></tr>
    <tr><th style="text-align:left">Hong Kong Branch Share Registrar</th><td>Tricor Investor Services Limited 17/F, Far East Finance Centre, 16 Harcourt Road, Hong Kong</td></tr>
    <tr><th style="text-align:left">Listing Date</th><td>14 October 1998</td></tr>
    <tr><th style="text-align:left">Authorised Shares</th><td>20,000,000,000</td></tr>
    <tr><th style="text-align:left">Issued Shares</th><td>3,924,190,467</td></tr>
    <tr><th style="text-align:left">Par Value</th><td>HK$0.01</td></tr>
    <tr><th style="text-align:left">Board Lot</th><td>5,000</td></tr>
    <tr><th style="text-align:left">Financial Year End Date</th><td>30 June</td></tr>
  </tbody>
</table>
`,
    },
    zh: {
      title: "公司詳情",
      metaTitle: "公司詳情 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司之公司詳情",
      breadcrumb: "公司詳情",
      contentHtml: `
<table>
  <tbody>
    <tr><th style="text-align:left">註冊地點</th><td>開曼群島</td></tr>
    <tr><th style="text-align:left">主要業務</th><td>提供物業投資、物流業務、勘探和評估礦產資源及私人飛機管理服務</td></tr>
    <tr><th style="text-align:left">註冊辦事處</th><td>P.O. Box 31119 Grand Pavilion Hibiscus Way, 802 West Bay Road, Grand Cayman KY1-1205 Cayman Islands</td></tr>
    <tr><th style="text-align:left">香港主要營業地點</th><td>香港干諾道西 118 號 17 樓</td></tr>
    <tr><th style="text-align:left">主要股份過戶登記處</th><td>Vistra (Cayman) Limited P.O. Box 31119 Grand Pavilion Hibiscus Way, 802 West Bay Road, Grand Cayman KY1-1205 Cayman Islands</td></tr>
    <tr><th style="text-align:left">股份過戶登記處香港分處</th><td>卓佳證券登記有限公司 香港夏慤道 16 號遠東金融中心 17 樓</td></tr>
    <tr><th style="text-align:left">上市日期</th><td>1998 年 10 月 14 日</td></tr>
    <tr><th style="text-align:left">法定股本</th><td>20,000,000,000</td></tr>
    <tr><th style="text-align:left">發行股數</th><td>3,924,190,467</td></tr>
    <tr><th style="text-align:left">票面值</th><td>HK$0.01</td></tr>
    <tr><th style="text-align:left">買賣單位</th><td>5,000</td></tr>
    <tr><th style="text-align:left">財務年度結算日期</th><td>6 月 30 日</td></tr>
  </tbody>
</table>
`,
    },
  },
  "corporate-governance": {
    en: {
      title: "Corporate Governance",
      metaTitle: "Corporate Governance | Vision Values Holdings Limited",
      metaDescription: "Corporate governance policies of Vision Values Holdings Limited",
      breadcrumb: "Corporate Governance",
      contentHtml: `
<p>Corporate governance documents of the Company are available for download below.</p>
<table>
  <tbody>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/MoAandAoA.pdf" target="_blank" rel="noopener noreferrer">Memorandum of Association and Articles of Association</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/TOR-AuditCommittee.pdf" target="_blank" rel="noopener noreferrer">Audit Committee - Terms of Reference</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/TOR-RemunerationCommittee.pdf" target="_blank" rel="noopener noreferrer">Remuneration Committee - Terms of Reference</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/e_Terms of Reference of Nomination Committee.pdf" target="_blank" rel="noopener noreferrer">Nomination Committee - Terms of Reference</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/CodeForSecuritiesTransactions.pdf" target="_blank" rel="noopener noreferrer">Code for Securities Transaction by Directors and Employees</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/e-20161025.pdf" target="_blank" rel="noopener noreferrer">Procedures for Shareholders to Propose a Person for Election as a Director of the Company at a general meeting</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/E-Nomination Policy.pdf" target="_blank" rel="noopener noreferrer">Nomination Policy for Recruitment of Board Members</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/VVH Anti-corruption policy (eng).pdf" target="_blank" rel="noopener noreferrer">Anti-Corruption Policy</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/E-20180800-Board Diversity PolicyV2.pdf" target="_blank" rel="noopener noreferrer">Board Diversity Policy</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/E-dividend policy.pdf" target="_blank" rel="noopener noreferrer">Dividend Policy</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/WHISTLEBLOWING POLICY MEC (eng).pdf" target="_blank" rel="noopener noreferrer">Whistleblowing Policy</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/eng/pdf/governance/e_Workforce Diversity Policy.pdf" target="_blank" rel="noopener noreferrer">Workforce Diversity Policy</a></td></tr>
  </tbody>
</table>
`,
    },
    zh: {
      title: "企業管治",
      metaTitle: "企業管治 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司之企業管治政策",
      breadcrumb: "企業管治",
      contentHtml: `
<p>本公司之企業管治文件可供下列下載。</p>
<table>
  <tbody>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/MoAandAoA.pdf" target="_blank" rel="noopener noreferrer">公司組織章程大綱及組織章程細則</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/TOR-AuditCommittee.pdf" target="_blank" rel="noopener noreferrer">審核委員會 - 職權範圍書</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/TOR-RemunerationCommittee.pdf" target="_blank" rel="noopener noreferrer">薪酬委員會 - 職權範圍書</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/c_Terms of Reference of Nomination Committee.pdf" target="_blank" rel="noopener noreferrer">提名委員會 - 職權範圍書</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/CodeForSecuritiesTransactions.pdf" target="_blank" rel="noopener noreferrer">董事及員工進行證券交易守則 (只提供英文版)</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/c-20161025.pdf" target="_blank" rel="noopener noreferrer">股東於股東大會上提名個別人士參選董事職位之程序</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/C-Nomination Policy.pdf" target="_blank" rel="noopener noreferrer">提名政策招聘董事會成員</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/VVH Anti-corruption policy (chi).pdf" target="_blank" rel="noopener noreferrer">反貪污政策</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/C-20181205-Board Diversity Policy (chi).pdf" target="_blank" rel="noopener noreferrer">董事會多元化政策</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/C-dividend policy.pdf" target="_blank" rel="noopener noreferrer">股息政策</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/WHISTLEBLOWING POLICY MEC (chi).pdf" target="_blank" rel="noopener noreferrer">舉報政策</a></td></tr>
    <tr><td><a href="https://www.visionvalues.com.hk/chi/pdf/governance/c_Workforce Diversity Policy.pdf" target="_blank" rel="noopener noreferrer">員工多元化政策</a></td></tr>
  </tbody>
</table>
`,
    },
  },
  announcements: {
    en: {
      title: "Announcements & Circulars",
      metaTitle: "Announcements & Circulars | Vision Values Holdings Limited",
      metaDescription: "Announcements and circulars of Vision Values Holdings Limited",
      breadcrumb: "Announcements & Circulars",
      contentHtml: `
<table>
  <thead>
    <tr><th>Date</th><th>Document</th></tr>
  </thead>
  <tbody>
    <tr><td>2026-01-15</td><td><a href="https://www1.hkexnews.hk/" target="_blank">Announcement of Annual Results</a></td></tr>
    <tr><td>2025-12-01</td><td><a href="https://www1.hkexnews.hk/" target="_blank">Circular</a></td></tr>
  </tbody>
</table>
`,
    },
    zh: {
      title: "公告及通函",
      metaTitle: "公告及通函 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司之公告及通函",
      breadcrumb: "公告及通函",
      contentHtml: `
<table>
  <thead>
    <tr><th>日期</th><th>文件</th></tr>
  </thead>
  <tbody>
    <tr><td>2026-01-15</td><td><a href="https://www1.hkexnews.hk/" target="_blank">全年業績公告</a></td></tr>
    <tr><td>2026-12-01</td><td><a href="https://www1.hkexnews.hk/" target="_blank">通函</a></td></tr>
  </tbody>
</table>
`,
    },
  },
  "financial-reports": {
    en: {
      title: "Financial Reports",
      metaTitle: "Financial Reports | Vision Values Holdings Limited",
      metaDescription: "Financial reports of Vision Values Holdings Limited",
      breadcrumb: "Financial Reports",
      contentHtml: buildReportContent(DEFAULT_FINANCIAL_REPORTS.en),
    },
    zh: {
      title: "財務報告",
      metaTitle: "財務報告 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司之財務報告",
      breadcrumb: "財務報告",
      contentHtml: buildReportContent(DEFAULT_FINANCIAL_REPORTS.zh),
    },
  },
  "esg-reports": {
    en: {
      title: "ESG Reports",
      metaTitle: "ESG Reports | Vision Values Holdings Limited",
      metaDescription: "Environmental, Social and Governance reports of Vision Values Holdings Limited",
      breadcrumb: "ESG Reports",
      contentHtml: buildReportContent(REPORT_ESG_REPORTS.en),
    },
    zh: {
      title: "環境、社會及管治報告",
      metaTitle: "環境、社會及管治報告 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司之環境、社會及管治報告",
      breadcrumb: "環境、社會及管治報告",
      contentHtml: buildReportContent(REPORT_ESG_REPORTS.zh),
    },
  },
  "lost-share-certificates": {
    en: {
      title: "Lost Share Certificates",
      metaTitle: "Lost Share Certificates | Vision Values Holdings Limited",
      metaDescription: "Procedures for lost share certificates of Vision Values Holdings Limited",
      breadcrumb: "Lost Share Certificates",
      contentHtml: `
<p>If your share certificate is lost, stolen or destroyed, please contact our share registrar immediately.</p>
<p>You will be required to provide a letter of indemnity and follow the prescribed procedures to obtain a replacement certificate.</p>
`,
    },
    zh: {
      title: "遺失股票證書",
      metaTitle: "遺失股票證書 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司遺失股票證書之處理程序",
      breadcrumb: "遺失股票證書",
      contentHtml: `
<p>如您的股票證書遺失、被盜或損毀，請立即聯絡本公司之股份登記處。</p>
<p>您需要提供彌償保證書並按照既定程序以取得補發證書。</p>
`,
    },
  },
  "corporate-communications": {
    en: {
      title: "Corporate Communications",
      metaTitle: "Corporate Communications | Vision Values Holdings Limited",
      metaDescription:
        "Corporate communications and dissemination arrangements of Vision Values Holdings Limited",
      breadcrumb: "Corporate Communications",
      contentHtml: buildReportContent(REPORT_CORPORATE_COMMUNICATIONS.en),
    },
    zh: {
      title: "公司通訊",
      metaTitle: "公司通訊 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司之公司通訊及發佈安排",
      breadcrumb: "公司通訊",
      contentHtml: buildReportContent(REPORT_CORPORATE_COMMUNICATIONS.zh),
    },
  },
  contact: {
    en: {
      title: "Contact Us",
      metaTitle: "Contact Us | Vision Values Holdings Limited",
      metaDescription: "Contact Vision Values Holdings Limited",
      breadcrumb: "Contact Us",
      contentHtml: `
<p>Please use the form below to contact us. Fields marked with * are required.</p>
<form>
  <div><label>Name *</label><input type="text" name="name" /></div>
  <div><label>Subject *</label><input type="text" name="subject" /></div>
  <div><label>Email *</label><input type="email" name="email" /></div>
  <div><label>Message *</label><textarea name="message"></textarea></div>
  <button type="submit">Submit</button>
  <button type="reset">Reset</button>
</form>
`,
    },
    zh: {
      title: "聯絡我們",
      metaTitle: "聯絡我們 | 遠見控股有限公司",
      metaDescription: "聯絡遠見控股有限公司",
      breadcrumb: "聯絡我們",
      contentHtml: `
<p>請使用以下表格與我們聯絡。標有 * 的欄位為必填。</p>
<form action="">
  <div><label>姓名 *</label><input type="text" name="name" /></div>
  <div><label>主旨 *</label><input type="text" name="subject" /></div>
  <div><label>電郵地址 *</label><input type="email" name="email" /></div>
  <div><label>留言 *</label><textarea name="message"></textarea></div>
  <button type="submit">遞交</button>
  <button type="reset">重設</button>
</form>
`,
    },
  },
};

export function getPlaceholder(
  slug: string,
  locale: "en" | "zh"
): PagePlaceholder | null {
  const entry = PLACEHOLDERS[slug as NavSlug];
  if (!entry) return null;
  return entry[locale];
}