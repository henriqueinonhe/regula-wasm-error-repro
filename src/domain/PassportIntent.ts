export type PassportIntent = {
  givenNames?: string;
  middleName?: string;
  lastName?: string;
  number: string;
  expiryDate: string;
  countryOfIssuance: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Unspecified";
  isVerified: boolean;
  type: "Passport";
};
