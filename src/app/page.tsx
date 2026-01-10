import Image from "next/image";
import Link from "next/link";

type TemplateItem = {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnailUrl: string | null;
};

type AssetItem = {
  id: string;
  name: string;
  url: string;
  type: string;
};

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

const getTemplates = async () => {
  const response = await fetch(
    `${getBaseUrl()}/api/public/templates`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return [];
  }

  const { data } = (await response.json()) as { data: TemplateItem[] };
  return data;
};

const getAssets = async () => {
  const response = await fetch(
    `${getBaseUrl()}/api/public/assets`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return [];
  }

  const { data } = (await response.json()) as { data: AssetItem[] };
  return data;
};

export default async function PublicHomePage() {
  const [templates, assets] = await Promise.all([
    getTemplates(),
    getAssets(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-foreground">
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted-text)]">
            ND Studio Canva
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold">
            Launch-ready social templates
          </h1>
          <p className="text-sm text-[var(--muted-text)] max-w-2xl">
            Browse templates and assets without logging in. Sign in only when you want to edit,
            export, or create your own projects.
          </p>
          <div className="flex gap-3">
            <Link
              href="/templates"
              className="px-5 py-2 rounded-[var(--r1)] bg-[var(--grad-gold)] text-black font-semibold"
            >
              Browse templates
            </Link>
            <Link
              href="/sign-in"
              className="px-5 py-2 rounded-[var(--r1)] border border-[var(--stroke)] text-foreground"
            >
              Sign in to edit
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Featured templates</h2>
            <Link href="/templates" className="text-sm text-[var(--gold)]">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.slice(0, 6).map((template) => (
              <Link
                key={template.id}
                href={`/templates/${template.id}`}
                className="bg-[var(--panel2)] border border-[var(--stroke)] rounded-[var(--r2)] overflow-hidden"
              >
                <div className="relative aspect-[4/5] bg-black/40">
                  <Image
                    src={template.thumbnailUrl || "/placeholder.svg"}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium">{template.name}</p>
                  <p className="text-xs text-[var(--muted-text)]">
                    {template.width} x {template.height}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Public assets</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {assets.slice(0, 12).map((asset) => (
              <div
                key={asset.id}
                className="bg-[var(--panel2)] border border-[var(--stroke)] rounded-[var(--r1)] p-3 flex items-center justify-center"
              >
                <Image
                  src={asset.url}
                  alt={asset.name}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
