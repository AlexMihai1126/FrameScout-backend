/* eslint-disable @typescript-eslint/no-explicit-any */
export const getBaseUrl = (req: any) => {
  return `${req.protocol}://${req.get("host")}`;
};