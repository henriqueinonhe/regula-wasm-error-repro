import {
  CameraSnapshotDetailType,
  DocumentReaderCaptureWebComponent,
  Locales,
} from "@regulaforensics/vp-frontend-document-components";
import { useRef, useEffect, ReactNode } from "react";
import { match } from "ts-pattern";
import { useRegula } from "./useRegula";

export type RegulaCameraSnapshotProps = {
  onCameraProcessClosed?: (event: RegulaCameraSnapshotEvent) => void;
  onCameraProcessStarted?: (event: RegulaCameraSnapshotEvent) => void;
  onClose?: (event: RegulaCameraSnapshotEvent) => void;
  onElementVisible?: (event: RegulaCameraSnapshotEvent) => void;
  onFileProcessStarted?: (event: RegulaCameraSnapshotEvent) => void;
  onPressCameraButton?: (event: RegulaCameraSnapshotEvent) => void;
  onPressFileButton?: (event: RegulaCameraSnapshotEvent) => void;
  onPressRetryButton?: (event: RegulaCameraSnapshotEvent) => void;
  onPressSkipButton?: (event: RegulaCameraSnapshotEvent) => void;
  onProcessFinished?: (event: RegulaCameraSnapshotEvent) => void;
  onServiceInitialized?: (event: RegulaCameraSnapshotEvent) => void;

  /**
   * Default: en
   */
  locale?: Locales;

  /**
   * Default: false
   */
  startScreen?: boolean;

  /**
   * Default: false
   */
  multiple?: boolean;

  cameraId?: string;

  /**
   * Default: true
   */
  copyright?: boolean;

  /**
   * Default: false
   */
  changeCamera?: boolean;

  /**
   * Default: true
   */
  closeButton?: boolean;

  /**
   * Displayed when regula is not ready
   */
  fallback?: ReactNode;
};

export const RegulaCameraSnapshot = ({
  onProcessFinished,
  onCameraProcessClosed,
  onCameraProcessStarted,
  onClose,
  onElementVisible,
  onFileProcessStarted,
  onPressCameraButton,
  onPressFileButton,
  onPressRetryButton,
  onPressSkipButton,
  onServiceInitialized,
  cameraId,
  changeCamera,
  closeButton,
  copyright,
  locale,
  multiple,
  startScreen,
  fallback = null,
}: RegulaCameraSnapshotProps) => {
  const { get: getRegula } = useRegula();
  const regula = getRegula();
  const elementRef = useRef<DocumentReaderCaptureWebComponent>(null);

  // Using refs to minimize the number of effects
  const onProcessFinishedRef = useRef(onProcessFinished);
  const onCameraProcessStartedRef = useRef(onCameraProcessStarted);
  const onCameraProcessClosedRef = useRef(onCameraProcessClosed);
  const onCloseRef = useRef(onClose);
  const onElementVisibleRef = useRef(onElementVisible);
  const onFileProcessStartedRef = useRef(onFileProcessStarted);
  const onPressCameraButtonRef = useRef(onPressCameraButton);
  const onPressFileButtonRef = useRef(onPressFileButton);
  const onPressRetryButtonRef = useRef(onPressRetryButton);
  const onPressSkipButtonRef = useRef(onPressSkipButton);
  const onServiceInitializedRef = useRef(onServiceInitialized);

  onProcessFinishedRef.current = onProcessFinished;
  onCameraProcessStartedRef.current = onCameraProcessStarted;
  onCameraProcessClosedRef.current = onCameraProcessClosed;
  onCloseRef.current = onClose;
  onElementVisibleRef.current = onElementVisible;
  onFileProcessStartedRef.current = onFileProcessStarted;
  onPressCameraButtonRef.current = onPressCameraButton;
  onPressFileButtonRef.current = onPressFileButton;
  onPressRetryButtonRef.current = onPressRetryButton;
  onPressSkipButtonRef.current = onPressSkipButton;
  onServiceInitializedRef.current = onServiceInitialized;

  useEffect(() => {
    if (!regula) {
      return;
    }

    const element = elementRef.current;

    if (!element) {
      return;
    }

    const callback = (event: RegulaCameraSnapshotEvent) => {
      match(event.detail.action)
        .with("CAMERA_PROCESS_CLOSED", () => {
          onCameraProcessClosedRef.current?.(event);
        })
        .with("CAMERA_PROCESS_STARTED", () => {
          onCameraProcessStartedRef.current?.(event);
        })
        .with("CLOSE", () => {
          onCloseRef.current?.(event);
        })
        .with("ELEMENT_VISIBLE", () => {
          onElementVisibleRef.current?.(event);
        })
        .with("FILE_PROCESS_STARTED", () => {
          onFileProcessStartedRef.current?.(event);
        })
        .with("PRESS_CAMERA_BUTTON", () => {
          onPressCameraButtonRef.current?.(event);
        })
        .with("PRESS_FILE_BUTTON", () => {
          onPressFileButtonRef.current?.(event);
        })
        .with("PRESS_RETRY_BUTTON", () => {
          onPressRetryButtonRef.current?.(event);
        })
        .with("PRESS_SKIP_BUTTON", () => {
          onPressSkipButtonRef.current?.(event);
        })
        .with("PROCESS_FINISHED", () => {
          onProcessFinishedRef.current?.(event);
        })
        .with("SERVICE_INITIALIZED", () => {
          onServiceInitializedRef.current?.(event);
        })
        .exhaustive();
    };

    element.addEventListener("camera-snapshot", callback);

    return () => {
      element.removeEventListener("camera-snapshot", callback);
    };
  }, [regula]);

  if (!regula) {
    return <>{fallback}</>;
  }

  return (
    <camera-snapshot
      locale={locale}
      start-screen={startScreen}
      multiple={multiple}
      camera-id={cameraId}
      copyright={copyright}
      change-camera={changeCamera}
      close-button={closeButton}
      ref={elementRef}
    />
  );
};

export type RegulaCameraSnapshotEvent = CustomEvent<CameraSnapshotDetailType>;
