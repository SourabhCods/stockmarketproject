import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface HistoricalData {
  id: string;
  datetime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  companyId: string;
}

interface StockChartProps {
  stockData: HistoricalData[] | undefined;
  companyData:
    | {
        id: string;
        name: string;
        tickerSymbol: string;
      }
    | undefined;
}

interface Price {
  yearlyMax: number;
  yearlyMin: number;
  avgVolume: number;
}

type PredictedStockPrice = {
  low: {
    price: number;
    percentageDeclined: number;
  };
  high: {
    price: number;
    percentageIncreased: number;
  };
};

const StockChart = ({ stockData, companyData }: StockChartProps) => {
  const [yearlyStockTradeData, setYearlyStockTradeData] = useState<Price>();
  const [futureStockData, setFutureStockData] = useState<PredictedStockPrice>();

  useEffect(() => {
    const getFiftyTwoWeekHighAndLow = async () => {
      let res = await fetch(
        `http://localhost:8080/yerarlymaxmin/${companyData?.id}`
      );
      let fetchedData = await res.json();
      setYearlyStockTradeData(fetchedData);
    };
    getFiftyTwoWeekHighAndLow();
  }, [companyData]);

  useEffect(() => {
    const getPrediction = async () => {
      const res = await fetch("http://localhost:8080/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyData,
          stockData,
        }),
      });
      const predictedData = await res.json();
      const rawText = predictedData?.candidates[0]?.content?.parts[0]?.text;
      const obj = rawText.replace(/```json|```/g, "").trim();

      try {
        const prediction: PredictedStockPrice = JSON.parse(obj);
        setFutureStockData(prediction);
      } catch (err) {
        console.error("Failed to parse prediction:", obj, err);
      }
    };
    getPrediction();
  }, [companyData]);

  const options = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            title: () => {
              return `${companyData?.name} (${
                companyData?.tickerSymbol ?? "N/A"
              })`;
            },
            label: (context: any) => {
              const index = context.dataIndex;
              if (!stockData) return "";

              const d = stockData[index];
              return [
                `Open: ${d.open}`,
                `High: ${d.high}`,
                `Low: ${d.low}`,
                `Close: ${d.close}`,
                `Vol: ${d.volume}`,
              ];
            },
          },
        },
      },
    };
  }, [stockData, companyData]);

  const data = useMemo(() => {
    if (!stockData) return { labels: [], datasets: [] };

    return {
      labels: stockData.map((entry) =>
        new Date(entry.datetime).toLocaleDateString()
      ),
      datasets: [
        {
          label: `${companyData?.name ?? "Unknown"} (${
            companyData?.tickerSymbol ?? "N/A"
          })`,
          data: stockData.map((entry) => entry.close),
          borderColor: "#052e16",
          backgroundColor: "#86efac",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [stockData]);

  return (
    <>
      <div className="w-full h-[20%] border border-stone-500 flex justify-around justify-items-center items-center px-10 py-5 rounded-2xl">
        <div className="h-auto w-auto px-5 py-3 border flex flex-col rounded-xl border-stone-500 gap-2.5 bg-gradient-to-r from-[#434343] to-[black]">
          <p className="text-left text-2xl text-gray-300">52Week High</p>
          <p className="text-left text-xl text-gray-300">
            {yearlyStockTradeData?.yearlyMax}
          </p>
        </div>
        <div className="h-auto w-auto px-5 py-3 border rounded-xl  flex border-stone-500 flex-col gap-2.5 bg-gradient-to-r from-[#434343] to-[black]">
          <p className="text-left text-2xl text-gray-300">52Week Low</p>
          <p className="text-left text-xl text-gray-300">
            {yearlyStockTradeData?.yearlyMin}
          </p>
        </div>
        <div className="h-auto w-auto px-5 py-3 border rounded-xl border-stone-500 flex flex-col gap-2.5 bg-gradient-to-r from-[#434343] to-[black]">
          <p className="text-left text-2xl text-gray-300">Avg.Volume</p>
          <p className="text-left text-xl text-gray-300">
            {yearlyStockTradeData?.avgVolume}
          </p>
        </div>
      </div>
      {companyData ? (
        <Line data={data} options={options} className="my-10" />
      ) : (
        <div className="my-10 h-96 w-full flex items-center justify-center border border-stone-500 rounded-xl">
          <p className="text-gray-500 text-xl italic">
            Select Company to View Chart
          </p>
        </div>
      )}
      <div className="w-full h-auto border border-stone-500 rounded-xl py-10">
        <p className="text-center text-4xl text-gray-300 my-3.5">
          Next-Day Price Forecast
        </p>
        <div className="w-[90%] mx-auto my-auto h-auto flex justify-around items-center rounded-xl py-10">
          <div className="w-[40%] h-auto px-10 py-5 border border-stone-500 rounded-xl">
            <p className="text-xl text-red-800 text-left">Lowest fall Price</p>
            <p className="text-xl text-red-800 text-left font-semibold">
              {futureStockData?.low.price} ( -
              {futureStockData?.low.percentageDeclined}%)
            </p>
          </div>
          <div className="w-[40%] h-auto px-10 py-5 border border-stone-500 rounded-xl">
            <p className="text-xl text-green-900 text-left">Peak Price</p>
            <p className="text-xl text-green-900 text-left font-semibold">
              {futureStockData?.high.price} ( +
              {futureStockData?.high.percentageIncreased}%)
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockChart;
