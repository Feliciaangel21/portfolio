import { useContext } from "react";
import { PortfolioContext } from "./portfolioContext";

export const usePortfolio = () => useContext(PortfolioContext);
