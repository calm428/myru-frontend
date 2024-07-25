import React, { createContext, useContext, ReactNode } from 'react';

interface SelectContextProps {
  onOpenMobileModal?: () => void;
  children?: ReactNode;
}

const SelectContext = createContext<SelectContextProps>({});

export const SelectProvider: React.FC<SelectContextProps> = ({ children, onOpenMobileModal }) => (
  <SelectContext.Provider value={{ onOpenMobileModal }}>
    {children}
  </SelectContext.Provider>
);

export const useSelectContext = () => useContext(SelectContext);