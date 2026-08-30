import type { PropsWithChildren } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <ScrollViewStyleReset />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));` }} />
      </body>
    </html>
  );
}
