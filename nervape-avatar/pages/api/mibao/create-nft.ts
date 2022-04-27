// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { MibaoApi } from "./mibao";

const mibao = new MibaoApi();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const name = req.body.name;
    const description = req.body.description;
    const total = req.body.total;
    const renderer = req.body.renderer;
    const mRes = await mibao.fnCreateTokenClass(
      name,
      description,
      total,
      renderer
    );
    res.status(200).json({ ...mRes.data });
    // res.status(200).json({ name, description, total, renderer });
  } else {
    res.status(200).json({ code: -1, msg: "wrong!!" });
  }
}
