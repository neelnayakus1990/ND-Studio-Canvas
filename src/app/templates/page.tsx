import Image from "next/image";
import Link from "next/link";

type TemplateItem = {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnailUrl: string | null;
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

export default async function PublicTemplatesPage() {
  const templates = await getTemplates();

  return (
    <main className="min-h-screen bg-[var(--bg)] text-foreground">
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted-text)]">
            Public Templates
          </p>
          <h1 className="text-3xl font-semibold">Template gallery</h1>
          <p className="text-sm text-[var(--muted-text)]">
            Browse read-only templates. Sign in to edit or export.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/templates/${template.id}`}
              className="bg-[var(--panel2)] border border-[var(--stroke)] rounded-[var(--r2)] overflow-hidden"
            >
              <div className="relative w-full aspect-[4/5] bg-black/40">
                <Image
                  src={template.thumbnailUrl || "/placeholder.svg"}
                  alt={template.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 space-y-1">
                <p className="text-sm font-medium">{template.name}</p>
                <p className="text-xs text-[var(--muted-text)]">
                  {template.width} x {template.height}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
