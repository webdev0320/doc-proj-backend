const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BLOB_ID = "cmv3y899200013uyg8cyjk586";

async function main() {
  const page1 = await prisma.page.findFirst({
    where: { blobId: BLOB_ID, pageIndex: 0 },
    select: { id: true, aiLabel: true },
  });
  if (!page1) {
    console.error("page 1 (pageIndex 0) not found");
    process.exit(1);
  }
  console.log("target page:", page1.id, "| aiLabel:", page1.aiLabel);

  const values = await prisma.extractedValue.findMany({
    where: { blobId: BLOB_ID },
    orderBy: { createdAt: "asc" },
  });

  // The unique constraint is [pageId, fieldName], so duplicate field names
  // would collide once everything is on one page. Keep the first occurrence.
  const seen = new Set();
  const keep = [];
  const dropped = [];
  for (const v of values) {
    if (seen.has(v.fieldName)) {
      dropped.push(v);
      continue;
    }
    seen.add(v.fieldName);
    keep.push(v);
  }

  console.log("existing rows          :", values.length);
  console.log("unique fieldNames (kept):", keep.length);
  console.log("dropped duplicates     :", dropped.length);
  if (dropped.length) {
    const names = [...new Set(dropped.map((d) => d.fieldName))];
    console.log("  duplicated field names:", names.join(", "));
  }

  await prisma.extractedValue.deleteMany({ where: { blobId: BLOB_ID } });

  const created = await prisma.extractedValue.createMany({
    data: keep.map((v) => ({
      blobId: BLOB_ID,
      pageId: page1.id,
      documentId: v.documentId,
      documentName: v.documentName,
      fieldName: v.fieldName,
      extractedValue: v.extractedValue,
      qaValue: v.qaValue,
    })),
    skipDuplicates: true,
  });

  console.log("moved to page 1:", created.count);

  const total = await prisma.extractedValue.count({ where: { blobId: BLOB_ID } });
  console.log("total rows for blob:", total);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
