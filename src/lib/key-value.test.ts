import { describe, expect, it } from "vitest";
import {
  buildKeyValueTable,
  parseKeyValueTable,
} from "./key-value";

const EN_TABLE =
  '<table>\n  <tbody>\n' +
  '    <tr><th style="text-align:left">Place of Incorporation</th><td>Cayman Islands</td></tr>\n' +
  '    <tr><th style="text-align:left">Listing Date</th><td>14 October 1998</td></tr>\n' +
  '    <tr><th style="text-align:left">Authorised Shares</th><td>20,000,000,000</td></tr>\n' +
  "  </tbody>\n</table>";

describe("parseKeyValueTable", () => {
  it("parses th/td rows into key/value pairs", () => {
    const rows = parseKeyValueTable(EN_TABLE);
    expect(rows).toEqual([
      { key: "Place of Incorporation", value: "Cayman Islands" },
      { key: "Listing Date", value: "14 October 1998" },
      { key: "Authorised Shares", value: "20,000,000,000" },
    ]);
  });

  it("decodes HTML entities in keys and values", () => {
    const html =
      '<table><tbody><tr><th>Registered Office</th><td>P.O. Box 31119 &amp; 2 &quot;Hibiscus&quot;</td></tr></tbody></table>';
    const rows = parseKeyValueTable(html);
    expect(rows[0]).toEqual({ key: "Registered Office", value: 'P.O. Box 31119 & 2 "Hibiscus"' });
  });

  it("recovers paragraph-form content produced when a table is edited in the WYSIWYG", () => {
    const paragraphHtml =
      "<p><strong>Place of Incorporation </strong>  Cayman Islands <br>" +
      "<strong>Listing Date</strong>  14 October 1998 <br>" +
      "<strong>Authorised Shares</strong> 20,000,000,000</p>";
    const rows = parseKeyValueTable(paragraphHtml);
    expect(rows).toEqual([
      { key: "Place of Incorporation", value: "Cayman Islands" },
      { key: "Listing Date", value: "14 October 1998" },
      { key: "Authorised Shares", value: "20,000,000,000" },
    ]);
  });

  it("returns an empty array when there is no table / rows", () => {
    expect(parseKeyValueTable("")).toEqual([]);
    expect(parseKeyValueTable("<p>just prose</p>")).toEqual([]);
    expect(parseKeyValueTable("<div>no labels</div>")).toEqual([]);
  });
});

describe("buildKeyValueTable", () => {
  it("round-trips parsed rows back into table HTML", () => {
    const rows = parseKeyValueTable(EN_TABLE);
    const html = buildKeyValueTable(rows);
    expect(parseKeyValueTable(html)).toEqual(rows);
    // Left-aligns the key cells like the placeholder.
    expect(html).toContain('style="text-align:left"');
    expect(html).toContain("<table>");
    expect(html).toContain("<th");
    expect(html).toContain("<td");
  });

  it("escapes special characters on build", () => {
    const html = buildKeyValueTable([{ key: "A & B", value: '<b>"quoted"</b>' }]);
    expect(html).toContain("A &amp; B");
    expect(html).toContain("&lt;b&gt;&quot;quoted&quot;&lt;/b&gt;");
  });

  it("returns an empty string when there are no rows", () => {
    expect(buildKeyValueTable([])).toBe("");
  });
});