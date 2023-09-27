import { useEffect, useRef, useState } from "react";
import { UploadPassport } from "./components/UploadPassport";
import { RegulaProvider } from "./regula/RegulaProvider";
import { useRegula } from "./regula/useRegula";
import { PassportIntent } from "./domain/PassportIntent";

function App() {
  const { get: getRegula, initialize } = useRegula();

  const [isScanning, setIsScanning] = useState(false);

  const initializeRef = useRef(initialize);
  initializeRef.current = initialize;

  useEffect(() => {
    initializeRef.current();
  }, []);

  const regula = getRegula();

  const handlePassportUploadStarted = () => {
    setIsScanning(true);
  };

  const handlePassportUploadSucceeded = (passportIntent: PassportIntent) => {
    setIsScanning(false);
    console.log(passportIntent);
  };

  const handlePassportUploadFailed = (error: unknown) => {
    console.error(error);
    setIsScanning(false);
  };

  if (!regula) {
    return "Loading...";
  }

  return (
    <>
      <UploadPassport
        onPassportUploadStart={handlePassportUploadStarted}
        onPassportUploadSuccess={handlePassportUploadSucceeded}
        onPassportUploadFailed={handlePassportUploadFailed}
      />

      {isScanning && <>Scanning...</>}
    </>
  );
}

export default function AppWithProviders() {
  return (
    <RegulaProvider>
      <App />
    </RegulaProvider>
  );
}
