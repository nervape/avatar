import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { Component } from "react";
import { UnipassApi } from "./third/unipass";

const unipass = new UnipassApi();
interface HomeProps {}
interface HomeState {
  UnipassUserName: String;
  UnipassAddress: String;
  UnipassBalance: String;
}

export default class Home extends Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      UnipassUserName: "",
      UnipassAddress: "",
      UnipassBalance: "",
    };
    this.fnLoginWithUnipass = this.fnLoginWithUnipass.bind(this);
  }
  async fnLoginWithUnipass() {
    const { username, myAddress, myBalance } = await unipass.fnConnect();
    this.setState({
      UnipassUserName: username,
      UnipassAddress: myAddress,
      UnipassBalance: myBalance,
    });
  }

  async fnCheckoutMibaoNft() {
    // const result = await mibao.fnGetTokenClasses();
    // console.log(result);
  }

  render() {
    console.log("index render");
    const { UnipassUserName, UnipassAddress, UnipassBalance } = this.state;

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
        <button onClick={this.fnCheckoutMibaoNft} style={{ height: "50px" }}>
          checkout mibao nft
        </button>
      </div>
    );
  }
}
