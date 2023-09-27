import { Response } from "@regulaforensics/vp-frontend-document-components";
import { match } from "ts-pattern";
import { PassportIntent } from "../domain/PassportIntent";
import { addMinutes } from "date-fns";

export const mapRegulaResponseToPassportIntent = (
  response: Response,
): PassportIntent => {
  const text = response.text;

  if (!text) {
    console.error(response);
    throw new Error("PassportScanFailed");
  }

  const fields = {
    givenNames: text.getFieldValueByName("Given Names"),
    lastName: text.getFieldValueByName("Surname"),
    number: text.getFieldValueByName("Document Number"),
    expiryDate: text.getFieldValueByName("Date of Expiry"),
    issuingStateCode: text.getFieldValueByName("Issuing State Code"),
    dateOfBirth: text.getFieldValueByName("Date of Birth"),
    sex: text.getFieldValueByName("Sex"),
  };

  validateFields(fields);

  const {
    dateOfBirth,
    expiryDate,
    givenNames,
    issuingStateCode,
    lastName,
    number,
    sex,
  } = fields;

  const countryOfIssuance = issuingStateCode;
  const gender = mapSexToGender(sex);
  const type = "Passport";
  // The dates we get are formatted as `yyyy-mm-dd`,
  // so when they are parsed by `new Date()`, they are
  // parsed as UTC, so we need to adjust them to the
  // local timezone, by adding the timezone offset
  const expiryDateAdjustedForTimezone = addMinutes(
    new Date(expiryDate),
    new Date().getTimezoneOffset(),
  );
  const dateOfBirthAdjustedForTimezone = addMinutes(
    new Date(dateOfBirth),
    new Date().getTimezoneOffset(),
  );
  const formattedExpiryDate = expiryDateAdjustedForTimezone.toISOString();
  const formattedDateOfBirth = dateOfBirthAdjustedForTimezone.toISOString();

  return {
    givenNames,
    lastName,
    number,
    expiryDate: formattedExpiryDate,
    countryOfIssuance,
    type,
    gender,
    isVerified: true,
    dateOfBirth: formattedDateOfBirth,
  };
};

const mapSexToGender = (sex: string): "Male" | "Female" | "Unspecified" => {
  return match(sex)
    .with("M", () => "Male" as const)
    .with("F", () => "Female" as const)
    .otherwise(() => "Unspecified" as const);
};

function validateFields<Fields extends Record<string, string | undefined>>(
  fields: Fields,
): asserts fields is ForceRequired<Fields> {
  const missingFields = Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length !== 0) {
    throw new Error("MissingFieldsInResponse");
  }
}

type ForceRequired<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};
