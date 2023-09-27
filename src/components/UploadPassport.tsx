import { DocumentReaderService } from "@regulaforensics/vp-frontend-document-components";
import { useRef, useState } from "react";
import { useRegula } from "../regula/useRegula";
import { PassportIntent } from "../domain/PassportIntent";
import { returnException } from "return-exception";
import { mapRegulaResponseToPassportIntent } from "../regula/mapRegulaResponseToPassportIntent";

export type UploadPassportProps = {
  onPassportUploadStart?: () => void;
  onPassportUploadFailed?: (error: unknown) => void;
  onPassportUploadSuccess?: (passportIntent: PassportIntent) => void;
};

export const UploadPassport = ({
  onPassportUploadStart,
  onPassportUploadFailed,
  onPassportUploadSuccess,
}: UploadPassportProps) => {
  const { get: getRegula } = useRegula();
  const regula = getRegula();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>("");

  if (!regula) {
    logRegulaUndefinedError();
    return null;
  }

  const resetFileInput = () => {
    // Whenever we pick a file with the file picker input,
    // it changes the input value to the file fake path.
    // We need to reset it to an empty string so that
    // we can pick the same file again, otherwise, as the
    // file fake path will remain the same, the onChange handler
    // won't be triggered.
    setInputValue("");
  };

  const handleFileSelected = async () => {
    onPassportUploadStart?.();

    // Ref is set during render and thus
    // this callback will only run once the element
    // has rendered and the ref is already set
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const inputElement = inputRef.current!;

    // We currently only allow uploading a single file
    // and we know that the input is of type file,
    // thus we can safely assume that there will be a file
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const file = inputElement.files![0];
    try {
      const passportIntent = await processPassportImage(regula, file);
      onPassportUploadSuccess?.(passportIntent);
    } catch (error) {
      onPassportUploadFailed?.(error);
    }

    resetFileInput();
  };

  return (
    <>
      <button onClick={() => inputRef?.current?.click()}>
        Upload Passport
      </button>

      <input
        type="file"
        hidden
        ref={inputRef}
        accept="image/*"
        onChange={() => handleFileSelected()}
        value={inputValue}
      />
    </>
  );
};

const logRegulaUndefinedError = () => {
  const message = [
    `Regula is undefined in UploadPassport component, which means that either you didn't wait for Regula to load before rendering it or because you forgot the RegulaProvider somewhere up in the component tree.`,
    `Either way, this component always expects Regula to be loaded.`,
    `To avoid breaking the application, when Regula is undefined this component simply doesn't render anything, but you still should fix this error.`,
  ];

  console.error(message.join("\n"));
};

const processPassportImage = async (
  regula: DocumentReaderService,
  imageFile: File,
) => {
  const arrayBuffer = await imageFile.arrayBuffer();
  const typedArray = new Uint8Array(arrayBuffer);
  const stringifiedTypedArray = typedArray.reduce(
    (str, byte) => str + String.fromCharCode(byte),
    "",
  );
  const imageBase64 = btoa(stringifiedTypedArray);

  const processImage = returnException(() =>
    regula.processImageBase64([imageBase64], {
      processParam: {
        scenario: "Mrz",
      },
    }),
  );

  const [response, error] = await processImage();

  if (error !== undefined) {
    throw error;
  }

  const passportIntent = mapRegulaResponseToPassportIntent(response);

  return passportIntent;
};
