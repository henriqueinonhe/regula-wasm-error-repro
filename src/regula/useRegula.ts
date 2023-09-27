import { useContext } from "react";
import { RegulaContext } from "./RegulaProvider";

export const useRegula = () => {
  const value = useContext(RegulaContext);

  if (!value) {
    throw new Error("useRegula must be used within a RegulaProvider");
  }

  const { get, initialize } = value;

  return {
    get,
    initialize,
  };
};
