export const parseOptionalNumber = (value?: string) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return Number(value);
};