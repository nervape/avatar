// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MibaoApi } from "./mibao";

const mibao = new MibaoApi();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const token_class_uuid = req.body.token_class_uuid;
    const addresses = req.body.addresses;
    const mRes = await mibao.fnDistributeToken(token_class_uuid, addresses);
    res.status(200).json({ ...mRes.data });
    // res.status(200).json({ token_class_uuid, addresses });
  } else {
    res.status(200).json({ code: -1, msg: "wrong!!" });
  }
}
