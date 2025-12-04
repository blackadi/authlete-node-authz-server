export const sendJson = (res: any, status: number, data: any) => {
  res.status(status).json(data);
};
