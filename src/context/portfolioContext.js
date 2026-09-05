import { createContext } from "react";

export const PortfolioContext = createContext({
  projects: [],
  certificates: [],
  loading: true,
  error: null,
});
