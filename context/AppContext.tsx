import React, { createContext, useContext, useState } from "react";

const AppContext = createContext<{
  farenheit: boolean;
  setFarenheit: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  farenheit: true,
  setFarenheit: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [farenheit, setFarenheit] = useState(true);

  return (
    <AppContext.Provider value={{ farenheit, setFarenheit }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () =>
  useContext<{
    farenheit: boolean;
    setFarenheit: React.Dispatch<React.SetStateAction<boolean>>;
  }>(AppContext);
