import React, { Component } from "react";
import axios from "axios";
import type { Method } from "axios";
import { MD5, HmacSHA1, enc } from "crypto-js";

const { Base64 } = enc;

const mbHost = "https://goldenlegend.staging.nervina.cn";
const mbApiVersion = "/api/v1";
const mbKey = "bls2RtJtJOULTw3h";
const mbSecret =
  "faf57e6b2f20e4e74f0a0202574325267c34c36f395084ec803d9cd05562c025";

export class MibaoApi {
  fnGetSignature(
    secret: string,
    method: string,
    endpoint: string,
    content: string,
    gmt: string,
    content_type: string
  ) {
    let contentMd5 = "";
    if (content !== "") {
      contentMd5 = Base64.stringify(MD5(content));
    }
    const msg = `${method}\n${endpoint}\n${contentMd5}\n${content_type}\n${gmt}`;
    console.log(msg);
    const signature = Base64.stringify(HmacSHA1(msg, secret));
    return signature;
  }

  /**
   * mibao 请求签名
   * @param {*} method GET | POST
   * @param {*} endpoint
   * @param {*} content
   */
  async fnMiBaoRequest(m: Method, e: string, c = "") {
    // 运行时数据
    const key = mbKey;
    const secret = mbSecret;
    const method = m;
    const endpoint = e;
    const content = c;
    const content_type = "application/json";
    const gmt = new Date().toUTCString();

    // 测试数据
    // const key = "44CF9590006BF252F707";
    // const secret = "OtxrzxIsfpFjA7SwPzILwy8Bw21TLhquhboDYROV";
    // const method = "GET";
    // const endpoint = "/api/v1/token_classes";
    // const content = "";
    // const content_type = "application/json";
    // const gmt = "Tue, 06 Jul 2021 00:00:34 GMT";

    console.log("key", key);
    console.log("secret", secret);
    console.log("method", method);
    console.log("content", content);
    console.log("content_type", content_type);
    console.log("gmt", gmt);

    const signature = this.fnGetSignature(
      secret,
      method,
      endpoint,
      content,
      gmt,
      content_type
    );
    const cutVersion = endpoint.replace(mbApiVersion, "");
    const url = `${mbHost}${mbApiVersion}${cutVersion}`;

    const header = {
      Authorization: `NFT ${key}:${signature}`,
      Date: gmt,
      "Content-Type": content_type,
    };

    console.log(
      JSON.stringify({
        type: "request",
        method,
        url,
        content,
        signature,
        header,
      })
    );
    const res = await axios.request({
      method,
      url,
      headers: header,
      data: content === "" ? undefined : content,
    });

    // console.log(
    //   JSON.stringify({
    //     type: "response",
    //     method,
    //     url,
    //     content,
    //     response: res.data,
    //   })
    // );
    return res;
  }

  /**
   * 设计秘宝 doc https://hackmd.io/@ybian/B1AdNn6dF#41-%E8%AE%BE%E8%AE%A1%E7%A7%98%E5%AE%9D
   *
   * @param {*} name 秘宝的名称，不超过 30 个字符（一旦创建，不可修改）
   * @param {*} description 秘宝的简介，不超过 200 个字符（一旦创建，不可修改）
   * @param {*} total 类型的非负整数，为 0 时，表示秘宝不限量；大于 0 时，表示秘宝限量的数量（一旦创建，不可修改）
   * @param {*} renderer 秘宝的媒体信息，必须为以 https:// 开头、媒体信息有效的 url，且不超过 255 字符（秘宝设计完成后，30 天内可修改一次 renderer）
   *                      - renderer 为图片：支持格式为 png, jpg, jpeg, gif, webp 和 svg 6 种格式，必须以 https:// 开头，且结尾为 png | jpg | jpeg | gif | webp | svg
   *                      - renderer 为视频或 3D：支持格式为 mp4, webm, glb 和 gltf 6 种格式，必须以 https:// 开头，且结尾为 mp3 | wav | mp4 | webm | glb | gltf。当 renderer 为音视频或 3D 时，同时需要传入参数 cover_image_url 用于设置 NFT 封面，校验规则与图片格式的 renderer 一致
   *                      - 设计的秘宝 token class 会上链，上链操作由平台完成
   */
  fnCreateTokenClass = async (
    name: string,
    description: string,
    total: string,
    renderer: string
  ) => {
    const method = "POST";
    const endpoint = `${mbApiVersion}/token_classes`;
    const content = {
      name,
      description,
      total,
      renderer,
    };
    const res = await this.fnMiBaoRequest(
      method,
      endpoint,
      JSON.stringify(content)
    );
    return res;
  };

  /**
   * 查询 token class
   * @param {*} uuid  在创建 token class 时返回的 uuid
   */
  fnGetTokenClasses = async (uuid?: string) => {
    const method = "GET";
    const endpoint = `${mbApiVersion}/token_classes${!uuid ? "" : "/" + uuid}`;
    return await this.fnMiBaoRequest(method, endpoint);
  };

  /**
   * 铸造并分发秘宝
   * @param {*} token_class_uuid 设计秘宝时返回的 token class uuid
   * @param {*} addresses 一个由 ckb 地址组成的列表:[ add1 , add2 ]
   */
  fnDistributeToken = async (token_class_uuid: string, addresses: string) => {
    const method = "POST";
    const endpoint = `${mbApiVersion}/token_classes/${token_class_uuid}/tokens`;
    const content = { addresses };
    const res = await this.fnMiBaoRequest(
      method,
      endpoint,
      JSON.stringify(content)
    );
    return res;
  };

  /**
   * 查询 NFT token
   * @param {*} token_uuid 铸造并分发秘宝时返回的 token uuid
   */
  fnGetTokenInfo = async (token_uuid: string) => {
    const method = "GET";
    const endpoint = `${mbApiVersion}/tokens/${token_uuid}`;
    return await this.fnMiBaoRequest(method, endpoint);
  };
}
