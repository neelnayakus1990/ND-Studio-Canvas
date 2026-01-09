import { db } from "../src/db/drizzle";
import { projects } from "../src/db/schema";

type TemplateSeed = {
  name: string;
  width: number;
  height: number;
};

const seedUserId = process.env.TEMPLATE_SEED_USER_ID;

if (!seedUserId) {
  throw new Error("Missing TEMPLATE_SEED_USER_ID");
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

const run = async () => {
  const now = new Date();

  const rows = templates.map((template) => ({
    name: template.name,
    userId: seedUserId,
    json: JSON.stringify(
      createTemplateJson(template.width, template.height, template.name),
    ),
    width: template.width,
    height: template.height,
    isTemplate: true,
    isPro: false,
    createdAt: now,
    updatedAt: now,
  }));

  await db.insert(projects).values(rows);
};

run()
  .then(() => {
    console.log("Template seed complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Template seed failed");
    console.error(error);
    process.exit(1);
  });
