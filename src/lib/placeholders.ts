import { NAV_SLUGS, type NavSlug } from "./navigation";

export interface PagePlaceholder {
  title: string;
  metaTitle: string;
  metaDescription: string;
  breadcrumb: string;
  heroImage?: string;
  contentHtml: string;
}

export const PLACEHOLDER_SLUGS = NAV_SLUGS;

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
    <tr><th>Place of Incorporation</th><td>Cayman Islands</td></tr>
    <tr><th>Board of Directors</th><td>See Board of Directors page</td></tr>
    <tr><th>Company Secretary</th><td>To be confirmed</td></tr>
    <tr><th>Auditor</th><td>To be confirmed</td></tr>
    <tr><th>Share Registrar and Transfer Office (Hong Kong)</th><td>To be confirmed</td></tr>
    <tr><th>Share Registrar and Transfer Office (Cayman)</th><td>To be confirmed</td></tr>
    <tr><th>Registered Office</th><td>To be confirmed</td></tr>
    <tr><th>Principal Place of Business</th><td>Hong Kong</td></tr>
    <tr><th>Stock Code</th><td>862</td></tr>
    <tr><th>Website</th><td>www.visionvalues.com.hk</td></tr>
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
    <tr><th>註冊地點</th><td>開曼群島</td></tr>
    <tr><th>董事會</th><td>請參閱董事會頁面</td></tr>
    <tr><th>公司秘書</th><td>待確認</td></tr>
    <tr><th>核數師</th><td>待確認</td></tr>
    <tr><th>股份過戶登記處（香港）</th><td>待確認</td></tr>
    <tr><th>股份過戶登記處（開曼群島）</th><td>待確認</td></tr>
    <tr><th>註冊辦事處</th><td>待確認</td></tr>
    <tr><th>主要營業地點</th><td>香港</td></tr>
    <tr><th>股票編號</th><td>862</td></tr>
    <tr><th>網站</th><td>https://www.visionvalues.com.hk</td></tr>
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
<p>The Board of Vision Values Holdings Limited is committed to maintaining high standards of corporate governance to safeguard the interests of shareholders and enhance corporate value.</p>
<p>The Company has adopted the Corporate Governance Code as set out in Appendix 14 of the Rules Governing the Listing of Securities on The Stock Exchange of Hong Kong Limited.</p>
<p><a href="/pdf/CorporateGovernance.pdf" target="_blank">Corporate Governance Policy (PDF)</a></p>
`,
    },
    zh: {
      title: "企業管治",
      metaTitle: "企業管治 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司之企業管治政策",
      breadcrumb: "企業管治",
      contentHtml: `
<p>遠見控股有限公司董事會致力維持高水平的企業管治，以保障股東權益及提升企業價值。</p>
<p>本公司已採納香港聯合交易所有限公司證券上市規則附錄十四所載之《企業管治守則》。</p>
<p><a href="/pdf/CorporateGovernance.pdf" target="_blank">企業管治政策（PDF）</a></p>
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
      contentHtml: `
<table>
  <thead>
    <tr><th>Date</th><th>Document</th></tr>
  </thead>
  <tbody>
    <tr><td>2025</td><td><a href="/pdf/AnnualReport2025.pdf" target="_blank">Annual Report 2025</a></td></tr>
    <tr><td>2025 Interim</td><td><a href="/pdf/InterimReport2025.pdf" target="_blank">Interim Report 2025</a></td></tr>
  </tbody>
</table>
`,
    },
    zh: {
      title: "財務報告",
      metaTitle: "財務報告 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司之財務報告",
      breadcrumb: "財務報告",
      contentHtml: `
<table>
  <thead>
    <tr><th>日期</th><th>文件</th></tr>
  </thead>
  <tbody>
    <tr><td>2025</td><td><a href="/pdf/AnnualReport2025.pdf" target="_blank">2025年報</a></td></tr>
    <tr><td>2025中期</td><td><a href="/pdf/InterimReport2025.pdf" target="_blank">2025中期報告</a></td></tr>
  </tbody>
</table>
`,
    },
  },
  "esg-reports": {
    en: {
      title: "ESG Reports",
      metaTitle: "ESG Reports | Vision Values Holdings Limited",
      metaDescription: "Environmental, Social and Governance reports of Vision Values Holdings Limited",
      breadcrumb: "ESG Reports",
      contentHtml: `
<table>
  <thead>
    <tr><th>Date</th><th>Document</th></tr>
  </thead>
  <tbody>
    <tr><td>2025</td><td><a href="/pdf/ESGReport2025.pdf" target="_blank">ESG Report 2025</a></td></tr>
  </tbody>
</table>
`,
    },
    zh: {
      title: "環境、社會及管治報告",
      metaTitle: "環境、社會及管治報告 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司之環境、社會及管治報告",
      breadcrumb: "環境、社會及管治報告",
      contentHtml: `
<table>
  <thead>
    <tr><th>日期</th><th>文件</th></tr>
  </thead>
  <tbody>
    <tr><td>2025</td><td><a href="/pdf/ESGReport2025.pdf" target="_blank">2025環境、社會及管治報告</a></td></tr>
  </tbody>
</table>
`,
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
      metaDescription: "Corporate communication policy of Vision Values Holdings Limited",
      breadcrumb: "Corporate Communications",
      contentHtml: `
<p>The Company communicates with shareholders through annual reports, interim reports, circulars, notices and announcements published on the HKEX website.</p>
<p>Shareholders may elect to receive corporate communications in printed form or via electronic means.</p>
`,
    },
    zh: {
      title: "公司通訊",
      metaTitle: "公司通訊 | 遠見控股有限公司",
      metaDescription: "遠見控股有限公司之公司通訊政策",
      breadcrumb: "公司通訊",
      contentHtml: `
<p>本公司透過年報、中期報告、通函、通告及於香港交易所網站刊發之公告與股東溝通。</p>
<p>股東可選擇以印刷本或電子方式收取公司通訊。</p>
`,
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