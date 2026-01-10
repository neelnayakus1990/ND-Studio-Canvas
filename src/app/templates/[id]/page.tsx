import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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

const getTemplate = async (id: string) => {
  const response = await fetch(
    `${getBaseUrl()}/api/public/templates/${id}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return null;
  }

  const { data } = (await response.json()) as { data: TemplateItem };
  return data;
};

interface TemplatePreviewPageProps {
  params: {
    id: string;
  };
}

export default async function TemplatePreviewPage({
  params,
}: TemplatePreviewPageProps) {
  const template = await getTemplate(params.id);

  if (!template) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-foreground">
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative w-full md:w-2/3 aspect-[4/5] bg-[var(--panel2)] border border-[var(--stroke)] rounded-[var(--r2)] overflow-hidden">
            <Image
              src={template.thumbnailUrl || "/placeholder.svg"}
              alt={template.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted-text)]">
                Template
              </p>
              <h1 className="text-3xl font-semibold">{template.name}</h1>
              <p className="text-sm text-[var(--muted-text)]">
                {template.width} x {template.height}
              </p>
            </div>
            <p className="text-sm text-[var(--muted-text)]">
              This template is read-only until you sign in. Editing creates a personal copy.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/templates/${template.id}/edit`}
                className="px-5 py-2 rounded-[var(--r1)] bg-[var(--grad-gold)] text-black font-semibold text-center"
              >
                Edit this template
              </Link>
              <Link
                href="/templates"
                className="px-5 py-2 rounded-[var(--r1)] border border-[var(--stroke)] text-center"
              >
                Back to gallery
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
