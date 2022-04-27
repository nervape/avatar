import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { Component } from "react";
import { UnipassApi } from "./third/unipass";
import { MibaoApi } from "./api/mibao/mibao";
import axios from "axios";
import moment from "moment";

const unipass = new UnipassApi();
interface HomeProps {}
interface HomeState {
  UnipassUserName: String;
  UnipassAddress: String;
  UnipassBalance: String;

  MibaoData: any[];
}

export default class Home extends Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      UnipassUserName: "",
      UnipassAddress: "",
      UnipassBalance: "",

      MibaoData: [],
    };
    this.fnLoginWithUnipass = this.fnLoginWithUnipass.bind(this);
    this.fnCreateMibaoNft = this.fnCreateMibaoNft.bind(this);
    this.fnReadMibaoNft = this.fnReadMibaoNft.bind(this);
  }
  async fnLoginWithUnipass() {
    const { username, myAddress, myBalance } = await unipass.fnConnect();
    this.setState({
      UnipassUserName: username,
      UnipassAddress: myAddress,
      UnipassBalance: myBalance,
    });
  }

  async fnCreateMibaoNft() {
    const nowStr = moment().format("yyyy-MM-DD-HH-mm-ss.SSS");

    const result = await axios.post(
      "http://localhost:3000/api/mibao/create-nft",
      {
        // 这个字段超过30会直接返回400
        name: `${nowStr}-mnft`,
        description: `${nowStr} description `,
        total: "128",
        renderer:
          "https://oss.jinse.cc/production/7ea62f75-bec0-4cdc-b81a-d59d7f40ace1.jpg",
      }
    );
    console.log(result);
  }

  async fnReadMibaoNft() {
    const result = await axios.get("http://localhost:3000/api/mibao/get-nfts");
    console.log("get mibao nfts :", result);
    this.setState({
      MibaoData: result.data.token_classes,
    });
  }

  render() {
    console.log("index render");
    const { UnipassUserName, UnipassAddress, UnipassBalance, MibaoData } =
      this.state;

    return (
      <div>
        <div>
          {/* unipass */}
          <h1> ----------- Unipass ----------- </h1>
          <button onClick={this.fnLoginWithUnipass} style={{ height: "50px" }}>
            login with unipass
          </button>

          <div>UnipassUserName:{UnipassUserName}</div>
          <div>UnipassAddress:{UnipassAddress}</div>
          <div>UnipassBalance:{UnipassBalance}</div>
        </div>
        {/* mibao */}
        <h1> ----------- Mibao ----------- </h1>
        <button onClick={this.fnCreateMibaoNft} style={{ height: "50px" }}>
          create mibao nft（think twic）
        </button>
        <button onClick={this.fnReadMibaoNft} style={{ height: "50px" }}>
          read mibao nft info
        </button>

        <div>
          from:
          ckt1qsfy5cxd0x0pl09xvsvkmert8alsajm38qfnmjh2fzfu2804kq47drtdkrgrjy479df0s4wf4hr2zygt2tv45mdth3r
        </div>
        {MibaoData.map((v, i) => {
          return (
            <span key={i}>
              <div>---{i}</div>
              <div>name: {v.name}</div>
              <div>uuid: {v.uuid}</div>
              {/* <div>description: {v.description}</div>
              <div>total: {v.total}</div>
              <div>issued: {v.issued}</div> <div>is_banned: {v.is_banned}</div>{" "}
              <div>cover_image_url: {v.cover_image_url}</div>{" "}
              <div>renderer: {v.renderer}</div> */}
            </span>
          );
        })}
      </div>
    );
  }
}
