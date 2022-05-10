// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MibaoApi } from "./mibao";

const mibao = new MibaoApi();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const tx_uuid = req.body.tx_uuid;
    const mRes = await mibao.fnGetTransferStatus(tx_uuid);
    res.status(200).json({ ...mRes.data });
    // res.status(200).json({ tx_uuid });
  } else {
    res.status(200).json({ code: -1, msg: "wrong!!" });
  }
}
