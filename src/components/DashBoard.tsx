import { useEffect, useState } from "react";
import LeftPanel from "./LeftPanel";
import StockChart from "./StockChart";

interface CompanyData {
  id: string;
  name: string;
  tickerSymbol: string;
}

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

const DashBoard = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>();
  const [companies, setCompanies] = useState<Array<CompanyData>>();
  const [company, setCompany] = useState<CompanyData>();

  useEffect(() => {
    const fetchCompanies = async () => {
      const response = await fetch("http://localhost:8080/");
      const data: Array<CompanyData> = await response.json();
      setCompanies(data);
    };
    fetchCompanies();
  }, []);

  const setCompanyId = async (cmpId: string): Promise<void> => {
    const selectedCmp = companies?.find((cmp) => cmp.id == cmpId);
    setCompany(selectedCmp);
    const response = await fetch(`http://localhost:8080/historical/${cmpId}`);
    const compHistoricalData: HistoricalData[] = await response.json();
    setHistoricalData(compHistoricalData);
  };

  return (
    <div className=" w-[80rem] h-auto border-2 flex flex-wrap justify-around items-center  px-2 py-5 border-stone-500 mx-auto my-auto rounded-2xl">
      <div className="w-2xs mx-1.5 h-[62rem] overflow-y-auto">
        <LeftPanel onCompanySelect={setCompanyId} />
      </div>
      <div className="w-4xl my-14">
        <StockChart stockData={historicalData} companyData={company} />
      </div>
    </div>
  );
};

export default DashBoard;
