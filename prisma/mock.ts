import prisma from '../src/lib/prisma';

async function main() {
  console.log("Mock data yaratilmoqda...");

  const cat1 = await prisma.category.create({ data: { name: 'Ichimliklar' } });
  const cat2 = await prisma.category.create({ data: { name: 'Parfyumeriya' } });
  const cat3 = await prisma.category.create({ data: { name: 'Oziq-ovqat' } });

  const b1 = await prisma.brand.create({ data: { name: 'Coca-Cola' } });
  const b2 = await prisma.brand.create({ data: { name: 'Chanel' } });
  const b3 = await prisma.brand.create({ data: { name: 'Nestle' } });

  const products = [
    { name: 'Coca-Cola 1L', cat: cat1.id, brand: b1.id, price: 12000, cost: 9000, barcode: '4820000000001' },
    { name: 'Coca-Cola 1.5L', cat: cat1.id, brand: b1.id, price: 15000, cost: 11000, barcode: '4820000000002' },
    { name: 'Chanel Bleu 50ml', cat: cat2.id, brand: b2.id, price: 1500000, cost: 1000000, barcode: '3145891074505' },
    { name: 'Chanel Chance 100ml', cat: cat2.id, brand: b2.id, price: 2000000, cost: 1400000, barcode: '3145891263206' },
    { name: 'Nestle Shokolad 100g', cat: cat3.id, brand: b3.id, price: 25000, cost: 18000, barcode: '7613031123456' },
    { name: 'Nestle Kofe 50g', cat: cat3.id, brand: b3.id, price: 35000, cost: 25000, barcode: '7613031123457' },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        categoryId: p.cat,
        brandId: p.brand,
        skus: {
          create: [{
            name: p.name,
            sellPrice: p.price,
            costPrice: p.cost,
            barcode: p.barcode
          }]
        }
      }
    });
  }

  console.log("Mock data muvaffaqiyatli qo'shildi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
