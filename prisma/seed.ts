import { prisma } from "../src/lib/prisma.js";

async function main() {
  const apparel = await prisma.category.upsert({
    where: { slug: "apparel" },
    update: {},
    create: { name: "Apparel", slug: "apparel" },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { name: "Electronics", slug: "electronics" },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: { name: "Accessories", slug: "accessories" },
  });

  const decorations = await prisma.category.upsert({
    where: { slug: "decorations" },
    update: {},
    create: { name: "Decorations", slug: "decorations" },
  });

  await prisma.product.upsert({
    where: { slug: "classic-tee" },
    update: {},
    create: {
      name: "Classic Tee",
      slug: "classic-tee",
      description: "A comfortable 100% cotton t-shirt.",
      priceCents: 1999,
      stock: 100,
      categories: { connect: [{ id: apparel.id }] },
    },
  });

  await prisma.product.upsert({
    where: { slug: "wireless-earbuds" },
    update: {},
    create: {
      name: "Wireless Earbuds",
      slug: "wireless-earbuds",
      description: "Noise-cancelling Bluetooth earbuds.",
      priceCents: 8999,
      stock: 50,
      categories: { connect: [{ id: electronics.id }] },
    },
  });

  await prisma.product.upsert({
    where: { slug: "golden-neck-collar" },
    update: {},
    create: {
      name: "Golden Neck Collar",
      slug: "golden-neck-collar",
      description: "Gold-colored neck collar (made out of iron, not real gold).",
      priceCents: 1550,
      stock: 10,
      categories: { connect: [{ id: accessories.id }] },
    },
  });

  await prisma.product.upsert({
    where: { slug: "wooden-horse-desktop-decoration" },
    update: {},
    create: {
      name: "Wooden horse desktop decoration",
      slug: "wooden-horse-desktop-decoration",
      description: "Small wooden horse to decorate desktop/working areas.",
      priceCents: 1290,
      stock: 35,
      categories: { connect: [{ id: decorations.id }] },
    },
  });

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
