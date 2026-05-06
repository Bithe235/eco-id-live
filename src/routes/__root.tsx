import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-toxic">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Signal lost</h2>
        <p className="mt-2 text-sm text-muted-foreground">This ledger entry doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md gradient-toxic px-4 py-2 text-sm font-semibold text-primary-foreground">
            Return to ledger
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Carbon Ledger — Live Score" },
      { name: "description", content: "Generate your ECO_ID and see your carbon debt in real time." },
      { property: "og:title", content: "Carbon Ledger — Live Score" },
      { property: "og:description", content: "Generate your ECO_ID and see your carbon debt in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Carbon Ledger — Live Score" },
      { name: "twitter:description", content: "Generate your ECO_ID and see your carbon debt in real time." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/94d1eed2-8db1-47c6-afae-00e4223b6701/id-preview-7594d9e8--75cbf55a-ea88-4413-9df3-632edea54175.lovable.app-1778053509431.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/94d1eed2-8db1-47c6-afae-00e4223b6701/id-preview-7594d9e8--75cbf55a-ea88-4413-9df3-632edea54175.lovable.app-1778053509431.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}
