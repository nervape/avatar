// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MibaoApi } from "./mibao";

const mibao = new MibaoApi();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const mRes = await mibao.fnGetTokenClasses();
  //   const mRes = { hehe: " await mibao.fnGetTokenClasses()" };
  console.log("router in !!!!");
  res.status(200).json({ ...mRes });
}
