import express from "express";
import cors from "cors";
import { PrismaClient } from "../src/generated/client/index.js";
import { GoogleGenAI } from "@google/genai";
import bodyParser from "body-parser";

const app = express();
const port = 8080;
const prisma = new PrismaClient();
const ai = new GoogleGenAI({
  apiKey: "AIzaSyAw7-sMj-hBOFosR5XwsvLT4AKgA91F54o",
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get("/", async (req, res) => {
  try {
    const fetchedData = await prisma.company.findMany();
    res.send(fetchedData);
  } catch (err) {
    console.log(err);
  }
});

app.get("/historical/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.historicalData.findMany({
      where: { companyId: String(id) },
      orderBy: { datetime: "asc" },
    });
    res.send(data);
  } catch (err) {
    console.log(err);
  }
});

app.get("/company/:cmpId", async (req, res) => {
  const { cmpId } = req.params;
  try {
    const reqData = await prisma.company.findUnique({
      where: {
        id: cmpId,
      },
    });
    res.send(reqData);
  } catch (err) {
    console.log(err);
  }
});

app.get("/yerarlymaxmin/:cmpId", async (req, res) => {
  try {
    const { cmpId } = req.params;
    const result = await prisma.historicalData.aggregate({
      where: {
        companyId: cmpId,
      },
      _max: {
        close: true,
      },
      _min: {
        close: true,
      },
      _avg: {
        volume: true,
      },
    });
    res.send({
      yearlyMax: result._max.close,
      yearlyMin: result._min.close,
      avgVolume: result._avg.volume,
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/predict", async (req, res) => {
  try {
    const { companyData, stockData } = req.body;

    if (!companyData || !stockData) {
      return res
        .status(400)
        .json({ error: "Missing companyData or stockData" });
    }

    const lastWeekData = stockData ? stockData[stockData.length - 1] : null;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `
      You are a financial assistant. Based on each week stock data of the company,
      predict the next week's stock trend.

      Company: ${companyData?.name} (${companyData?.ticker})
      Weeks Data from start of year 2025: ${JSON.stringify(stockData)}
      
      Return:
      I dont want you to return any factored dependent or real data , this is just for project purposes , you just need to return a highest and lowest price of traded stock for the next week , please dont add explanation , i just want a object of numbers(high , low & percentage along with high and low like high : {price : number , percentageIncreased : (calculated from last week data ${lastWeekData})} & low : {price : number , percentageDeclined : (calculated from last week data ${lastWeekData})}) & no text required.
    `,
    });

    res.send(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Prediction failed" });
  }
});

app.listen(port, () => console.log(`server is running at port ${port}`));
