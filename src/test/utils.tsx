import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";

import enMessages from "../../messages/en.json";
import zhMessages from "../../messages/zh.json";

export function renderWithLocale(
  ui: ReactElement,
  locale: "en" | "zh" = "en"
) {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === "en" ? enMessages : zhMessages}
      now={new Date("2026-08-11")}
      timeZone="Asia/Hong_Kong"
    >
      {ui}
    </NextIntlClientProvider>
  );
}
