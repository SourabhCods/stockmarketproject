import { useEffect, useState } from "react";

interface LeftPanelProps {
  onCompanySelect: (cmpId: string) => void;
}

interface CompanyData {
  id: string;
  name: string;
  tickerSymbol: string;
}

const LeftPanel = ({ onCompanySelect }: LeftPanelProps) => {
  const [companies, setCompanies] = useState<Array<CompanyData>>();

  useEffect(() => {
    const fetchCompanies = async (): Promise<void> => {
      const response = await fetch("http://localhost:8080/");
      const data: Array<CompanyData> = await response.json();
      setCompanies(data);
    };
    fetchCompanies();
  }, []);

  return (
    <div className="grid grid-cols-1 grid-rows-10 gap-5 border-2 border-stone-300 px-4 py-2 h-auto">
      {companies?.map((company) => (
        <div
          onClick={() => onCompanySelect(company.id)}
          className="flex flex-col items-center gap-y-4 p-4 border border-stone-300 cursor-pointer rounded-b-xl"
        >
          <p className="text-xl text-stone-300">{company.name}</p>
          <p className="text-2xl text-stone-300">{company.tickerSymbol}</p>
        </div>
      ))}
    </div>
  );
};

export default LeftPanel;
