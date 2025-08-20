import { PrismaClient } from "../src/generated/client/index.js";

const prisma = new PrismaClient();

const companies = [
  { name: "Walmart Inc", ticker: "WMT" },
  { name: "Walt Disney Co", ticker: "DIS" },
];

async function initDB() {
  for (const company of companies) {
    try {
      const response = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${company.ticker}&interval=1week&apikey=de2e7a993130462cb3570e6beb2c4425`
      );

      const jsonData = await response.json();

      // // Sometimes API may fail — check before inserting
      // if (!jsonData?.meta || !jsonData?.values) {
      //   console.warn(`No data returned for ${company.name}`);
      //   continue;
      // }

      const dbData = await prisma.company.create({
        data: {
          name: company.name,
          tickerSymbol: jsonData.meta.symbol,
          historicalData: {
            create: jsonData.values.map((entry: any) => ({
              datetime: new Date(entry.datetime),
              open: parseFloat(entry.open),
              high: parseFloat(entry.high),
              low: parseFloat(entry.low),
              close: parseFloat(entry.close),
              volume: parseInt(entry.volume, 10),
            })),
          },
        },
      });

      console.log(`Inserted: ${company.name}`);
    } catch (err) {
      console.error(`Failed for ${company.name}`, err);
    }
  }
}

initDB()
  .then(() => console.log("db initialize successfully"))
  .catch((e) => console.error("Error :", e))
  .finally(async () => prisma.$disconnect());
