import { DocumentReaderService } from "@regulaforensics/vp-frontend-document-components";
import { useRef, useState } from "react";
import { useRegula } from "../regula/useRegula";
import { PassportIntent } from "../domain/PassportIntent";
import { returnException } from "return-exception";
import { mapRegulaResponseToPassportIntent } from "../regula/mapRegulaResponseToPassportIntent";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const base64String = event.target?.result;
      if (typeof base64String === "string") {
        resolve(base64String);
      } else {
        reject("Reader error");
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

async function getImageData(
  files: FileList | Array<Blob>,
  resizeValue: number,
): Promise<Array<Promise<ImageData>>> {
  const promises: Array<Promise<ImageData>> = [];

  for (let i = 0; i < files.length; i++) {
    const promise = new Promise<ImageData>((res, rej) => {
      const file = Array.from(files)[i];

      if (file) {
        if (!file.size) return rej("INCORRECT_FILE");

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const objURL = URL.createObjectURL(file);
        const img = new Image();

        img.onload = function () {
          let canvasWidth = img.width;
          let canvasHeight = img.height;

          const isImageResizeNeed =
            img.width > resizeValue || img.height > resizeValue;

          if (isImageResizeNeed) {
            const aspectRatio = img.width / img.height;

            if (img.width > img.height) {
              canvasWidth = resizeValue;
              canvasHeight = resizeValue / aspectRatio;
            } else {
              canvasHeight = resizeValue;
              canvasWidth = resizeValue * aspectRatio;
            }
          }

          canvas.width = canvasWidth;
          canvas.height = canvasHeight;

          if (ctx) {
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            const imageData = ctx?.getImageData(
              0,
              0,
              canvasWidth,
              canvasHeight,
            );

            if (imageData) {
              res(imageData);
              URL.revokeObjectURL(objURL);
            }
          }
        };

        img.src = objURL;
        img.onerror = () => rej("INCORRECT_FILE");
      } else {
        rej("INCORRECT_FILE");
      }
    });
    promises.push(promise);
  }
  return promises;
}

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
        onChange={handleFileSelected}
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
  // Using Base64 (not recommended)
  const imageBase64 = await fileToBase64(imageFile);
  const rawBase64 = imageBase64.replace("data:image/jpeg;base64,", "");
  const processImage = returnException(() =>
    regula.processImageBase64([rawBase64], {
      processParam: {
        scenario: "Mrz",
      },
    }),
  );

  // Using uint (more optimal method, allows you to process larger files and works faster)
  const promiseArray = await getImageData([new Blob([imageFile])], 1920);
  const imagesArray = await Promise.all(promiseArray);
  const res = await regula.processImage(imagesArray);
  console.log("Using uint:", res);

  const [response, error] = await processImage();

  if (error !== undefined) {
    throw error;
  }

  const passportIntent = mapRegulaResponseToPassportIntent(response);

  return passportIntent;
};
