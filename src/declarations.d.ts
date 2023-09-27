import type {
  DocumentReaderService,
  DocumentReaderCaptureWebComponent,
  ICameraSnapshot,
  IDocumentReader,
  DocumentReaderWebComponent,
} from "@regulaforensics/vp-frontend-document-components";

declare global {
  interface Window {
    RegulaDocumentSDK: DocumentReaderService;
  }

  namespace JSX {
    interface IntrinsicElements {
      "camera-snapshot": DetailedHTMLProps<
        ICameraSnapshot & HTMLAttributes<DocumentReaderCaptureWebComponent>,
        DocumentReaderCaptureWebComponent
      >;

      "document-reader": DetailedHTMLProps<
        IDocumentReader & HTMLAttributes<DocumentReaderWebComponent>,
        DocumentReaderWebComponent
      >;
    }
  }
}
