import { useEffect, useRef } from "react";
import { useRegula } from "./useRegula";

export const useInitializeRegula = () => {
  const { initialize } = useRegula();

  const initializeRef = useRef(initialize);
  initializeRef.current = initialize;

  useEffect(() => {
    initializeRef.current();
  }, []);
};
