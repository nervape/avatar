// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MibaoApi } from "./mibao";

const mibao = new MibaoApi();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token_uuid = req.query.token_uuid as string;
  const mRes = await mibao.fnGetAddressByToken(token_uuid);
  res.status(200).json({ ...mRes.data });
//   res.status(200).json({ token_uuid });
}
