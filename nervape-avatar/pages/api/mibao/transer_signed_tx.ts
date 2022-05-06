// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MibaoApi } from "./mibao";

const mibao = new MibaoApi();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const from = req.body.from;
    const to = req.body.to;
    const token = req.body.token;
    const tx = req.body.tx;
    const mRes = await mibao.fnTransfer(from, to, token,tx);
    res.status(200).json({ ...mRes.data });
    // res.status(200).json({ from, to, token, tx });
  } else {
    res.status(200).json({ code: -1, msg: "wrong!!" });
  }
}