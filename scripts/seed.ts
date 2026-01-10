import { and, eq } from "drizzle-orm";

import { db } from "../src/db/drizzle";
import { assets, projects, users } from "../src/db/schema";

type TemplateSeed = {
  name: string;
  width: number;
  height: number;
};

type AssetSeed = {
  name: string;
  type: "image" | "icon" | "svg";
  url: string;
  tags: string[];
};

const systemEmail = process.env.SYSTEM_USER_EMAIL;

if (!systemEmail) {
  throw new Error("Missing SYSTEM_USER_EMAIL");
}

const templates: TemplateSeed[] = [
  { name: "Square Promo", width: 1080, height: 1080 },
  { name: "Square Quote", width: 1080, height: 1080 },
  { name: "Square Product", width: 1080, height: 1080 },
  { name: "Story Spotlight", width: 1080, height: 1920 },
  { name: "Story Announcement", width: 1080, height: 1920 },
  { name: "Story Minimal", width: 1080, height: 1920 },
  { name: "Thumbnail Bold", width: 1280, height: 720 },
  { name: "Thumbnail Clean", width: 1280, height: 720 },
  { name: "Thumbnail Title", width: 1280, height: 720 },
  { name: "Square Newsletter", width: 1080, height: 1080 },
];

const builtinAssets: AssetSeed[] = [
  { name: "Arrow", type: "svg", url: "/builtins/arrow.svg", tags: ["shape", "arrow"] },
  { name: "Badge", type: "svg", url: "/builtins/badge.svg", tags: ["shape", "badge"] },
  { name: "Circle", type: "svg", url: "/builtins/circle.svg", tags: ["shape", "circle"] },
  { name: "Frame", type: "svg", url: "/builtins/frame.svg", tags: ["shape", "frame"] },
  { name: "Grid", type: "svg", url: "/builtins/grid.svg", tags: ["shape", "grid"] },
  { name: "Star", type: "svg", url: "/builtins/star.svg", tags: ["shape", "star"] },
];

const createTemplateJson = (width: number, height: number, title: string) => {
  const centerX = width / 2;
  const centerY = height / 2;

  return {
    version: "5.3.0",
    objects: [
      {
        type: "rect",
        name: "clip",
        left: centerX,
        top: centerY,
        width,
        height,
        fill: "#ffffff",
        originX: "center",
        originY: "center",
        selectable: false,
        hasControls: false,
        evented: false,
      },
      {
        type: "rect",
        name: "brand-color-1",
        left: centerX,
        top: centerY,
        width: width * 0.9,
        height: height * 0.5,
        fill: "#E6C27A",
        originX: "center",
        originY: "center",
        rx: 24,
        ry: 24,
      },
      {
        type: "textbox",
        text: title,
        name: "brand-color-2",
        left: centerX,
        top: height * 0.28,
        width: width * 0.7,
        fontSize: Math.round(width * 0.06),
        fill: "#0F0F10",
        fontFamily: "Inter",
        originX: "center",
        originY: "center",
        textAlign: "center",
      },
      {
        type: "textbox",
        text: "Tap to edit",
        left: centerX,
        top: height * 0.6,
        width: width * 0.6,
        fontSize: Math.round(width * 0.03),
        fill: "#0F0F10",
        fontFamily: "Inter",
        originX: "center",
        originY: "center",
        textAlign: "center",
      },
    ],
  };
};

const ensureSystemUser = async () => {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, systemEmail));

  if (existing) {
    return existing.id;
  }

  const [created] = await db
    .insert(users)
    .values({
      name: "System",
      email: systemEmail,
    })
    .returning();

  return created.id;
};

const seedTemplates = async (systemUserId: string) => {
  const existing = await db
    .select({ name: projects.name })
    .from(projects)
    .where(
      and(
        eq(projects.userId, systemUserId),
        eq(projects.isTemplate, true)
      )
    );

  const existingNames = new Set(existing.map((row) => row.name));
  const now = new Date();

  const rows = templates
    .filter((template) => !existingNames.has(template.name))
    .map((template) => ({
      name: template.name,
      userId: systemUserId,
      json: JSON.stringify(
        createTemplateJson(template.width, template.height, template.name),
      ),
      width: template.width,
      height: template.height,
      thumbnailUrl: "/placeholder.svg",
      isTemplate: true,
      isPro: false,
      createdAt: now,
      updatedAt: now,
    }));

  if (rows.length === 0) {
    return;
  }

  await db.insert(projects).values(rows);
};

const seedAssets = async (systemUserId: string) => {
  const existing = await db
    .select({ url: assets.url })
    .from(assets)
    .where(
      and(
        eq(assets.userId, systemUserId),
        eq(assets.isBuiltin, true)
      )
    );

  const existingUrls = new Set(existing.map((row) => row.url));
  const now = new Date();

  const rows = builtinAssets
    .filter((asset) => !existingUrls.has(asset.url))
    .map((asset) => ({
      userId: systemUserId,
      type: asset.type,
      name: asset.name,
      url: asset.url,
      tags: asset.tags,
      isBuiltin: true,
      createdAt: now,
    }));

  if (rows.length === 0) {
    return;
  }

  await db.insert(assets).values(rows);
};

const run = async () => {
  const systemUserId = await ensureSystemUser();

  await seedTemplates(systemUserId);
  await seedAssets(systemUserId);
};

run()
  .then(() => {
    console.log("Seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed");
    console.error(error);
    process.exit(1);
  });
