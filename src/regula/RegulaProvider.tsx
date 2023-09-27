import type { DocumentReaderService } from "@regulaforensics/vp-frontend-document-components";
import {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

export type RegulaContextValue = {
  get: () => DocumentReaderService | undefined;
  initialize: () => Promise<void>;
};

export const RegulaContext = createContext<RegulaContextValue | undefined>(
  undefined,
);

export type RegulaProviderProps = {
  children: ReactNode;
};

export const RegulaProvider = ({ children }: RegulaProviderProps) => {
  const [regula, setRegula] = useState<DocumentReaderService | undefined>(
    undefined,
  );
  const initializeHasBeenCalledRef = useRef(false);

  const initialize = async () => {
    if (initializeHasBeenCalledRef.current) {
      return;
    }
    initializeHasBeenCalledRef.current = true;

    // Has to be dynamically imported because
    // Regula imports have side effects that
    // rely on Web APIs and because
    // we want to lazy load this chunk
    const initializeRegula = await import("./initializeRegula").then(
      (module) => module.initializeRegula,
    );

    const regula = await initializeRegula();
    setRegula(regula);
  };

  const get = useCallback(() => {
    initialize();

    return regula;
  }, [regula]);

  const value = useMemo(
    () => ({
      get,
      initialize,
    }),
    [get],
  );

  return (
    <RegulaContext.Provider value={value}>{children}</RegulaContext.Provider>
  );
};
