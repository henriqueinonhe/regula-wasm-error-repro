import {
  defineComponents,
  DocumentReaderService,
} from "@regulaforensics/vp-frontend-document-components";

export const initializeRegula = async () => {
  const regula = new DocumentReaderService();

  await defineComponents();
  await regula.prepare();
  await regula.initialize({
    license: import.meta.env.VITE_LICENSE_KEY,
  });
  regula.recognizerProcessParam = {
    ...regula.recognizerProcessParam,
    processParam: {
      ...regula.recognizerProcessParam.processParam,
      timeout: Infinity,
    },
  };

  // Regula needs this because it uses web-components
  // that rely on this global variable
  window.RegulaDocumentSDK = regula;

  return regula;
};
