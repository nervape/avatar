import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { Component } from "react";
import { UnipassApi } from "./third/unipass";
import { MibaoApi } from "./api/mibao/mibao";
import axios from "axios";
import moment from "moment";
import { createHash, createPublicKey } from "crypto";

const unipass = new UnipassApi();
interface HomeProps {}
interface HomeState {
  UnipassUserName: string;
  UnipassAddress: string;
  UnipassBalance: string;
  UnipassTestSignature: {
    keyType: string;
    pubkey: string;
    sig: string;
  };

  MibaoData: any[];
  distributeToken: string;
  distributeAddress: string;
  searchAddress: string;
  ownToken: string[];
  searchToken: string;
  transferFrom: string;
  transferTo: string;
  transferToken: string;
  transferUnsignedTx: string;

  txUUID: string;
}

export default class Home extends Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);
    this.state = {
      UnipassUserName: "",
      UnipassAddress: "",
      UnipassBalance: "",
      UnipassTestSignature: {
        keyType: "",
        pubkey: "",
        sig: "",
      },

      MibaoData: [],
      distributeToken: "",
      distributeAddress: "",
      searchAddress: "",
      ownToken: [],
      searchToken: "",

      transferFrom: "",
      transferTo: "",
      transferToken: "",
      transferUnsignedTx: "",

      txUUID: "",
    };
    this.fnLoginWithUnipass = this.fnLoginWithUnipass.bind(this);
    this.fnCreateMibaoNft = this.fnCreateMibaoNft.bind(this);
    this.fnReadMibaoNft = this.fnReadMibaoNft.bind(this);
    this.fnGetTokenByAddress = this.fnGetTokenByAddress.bind(this);
    this.fnGetAddressByToken = this.fnGetAddressByToken.bind(this);
    this.fnDistributeToken = this.fnDistributeToken.bind(this);
    this.fnGetUnsignedTx = this.fnGetUnsignedTx.bind(this);
    this.fnTransfer = this.fnTransfer.bind(this);
    this.fnGetTransferStatus = this.fnGetTransferStatus.bind(this);
  }
  async fnLoginWithUnipass() {
    const { username, myAddress, myBalance } = await unipass.fnConnect();
    this.setState({
      UnipassUserName: username,
      UnipassAddress: myAddress,
      UnipassBalance: myBalance,
    });
  }
  async fnAuthWithUnipass(username: string, message: string) {
    const sigRes: any = await unipass.fnAuthorize(username, message);
    this.setState({
      UnipassTestSignature: sigRes,
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

  async fnGetTokenByAddress(address: string) {
    console.log("address", address);
    const result = await axios.get(
      "http://localhost:3000/api/mibao/get-token-by-address",
      {
        params: {
          address: address,
        },
      }
    );
    console.log("get token by address:", result);
    this.setState({
      ownToken: result.data.token_list.map((v: any) => {
        return v.token_uuid;
      }),
    });
  }

  async fnGetAddressByToken(token: string) {
    console.log("token", token);
    const result = await axios.get(
      "http://localhost:3000/api/mibao/get-address-by-token",
      {
        params: {
          token_uuid: token,
        },
      }
    );
    console.log("get token by address:", result);
  }

  async fnDistributeToken(token_class_uuid: string, addresses: string[]) {
    console.log("token", token_class_uuid);
    console.log("addresses", addresses);
    const result = await axios.post(
      "http://localhost:3000/api/mibao/distribute-token",
      {
        token_class_uuid,
        addresses,
      }
    );
    console.log("post distribute token", result);
  }

  async fnGetUnsignedTx(from: string, to: string, token: string) {
    console.log("token", from);
    console.log("to", to);
    console.log("token", token);
    const result = await axios.post(
      "http://localhost:3000/api/mibao/get-unsigned-tx",
      {
        from,
        to,
        token,
      }
    );
    console.log("post distribute token", result);
    this.setState({
      transferUnsignedTx: JSON.stringify(result.data.unsigned_tx),
    });
  }

  async fnTransfer(from: string, to: string, token: string, tx: string) {
    console.log("token", from);
    console.log("to", to);
    console.log("token", token);
    console.log("tx", tx);
    const result = await axios.post(
      "http://localhost:3000/api/mibao/transfer-signed-tx",
      {
        from,
        to,
        token,
        tx,
      }
    );
    console.log("post distribute token", result);
  }

  async fnGetTransferStatus(tx_uuid: string) {
    console.log("tx_uuid", tx_uuid);
    const result = await axios.post(
      "http://localhost:3000/api/mibao/get-transfer-status",
      {
        tx_uuid,
      }
    );
    console.log("fnGetTransferStatus", result);
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
          <div>
            <button onClick={this.fnLoginWithUnipass}>
              login with unipass
            </button>
            <div>UnipassUserName: {UnipassUserName}</div>
            <div>UnipassAddress: {UnipassAddress}</div>
            <div>UnipassBalance: {UnipassBalance}</div>
          </div>
        </div>
        <div>
          <button
            onClick={() => {
              this.fnAuthWithUnipass(
                this.state.UnipassUserName,
                "my auth message"
              );
            }}
          >
            auth unipass test
          </button>
        </div>
        <div style={{ width: "800px", wordWrap: "break-word" }}>
          <p>keyType: {this.state.UnipassTestSignature.keyType}</p>
          <p>pubkey: {this.state.UnipassTestSignature.pubkey}</p>
          <p>sig: {this.state.UnipassTestSignature.sig}</p>
        </div>
        {/* mibao */}
        <h1> ----------- Mibao ----------- </h1>
        <div>
          <button onClick={this.fnCreateMibaoNft}>
            create mibao nft（think twic）
          </button>
        </div>

        <div>
          <button onClick={this.fnReadMibaoNft}>read mibao nft info</button>
        </div>

        <div>---</div>
        <div>
          <div>
            class token:
            <input
              type="text"
              style={{ width: "700px" }}
              defaultValue={this.state.distributeToken}
              onChange={(event) => {
                this.setState({
                  distributeToken: event.target.value,
                });
              }}
            />
          </div>
          <div>
            address:
            <input
              type="text"
              style={{ width: "700px" }}
              defaultValue={this.state.distributeAddress}
              onChange={(event) => {
                this.setState({
                  distributeAddress: event.target.value,
                });
              }}
            />
          </div>

          <button
            onClick={() => {
              //  2022-04-27-16-48-12.280-mnft
              const tokenClassUUid = this.state.distributeToken;
              const addresses = [this.state.distributeAddress];
              this.fnDistributeToken(tokenClassUUid, addresses);
            }}
          >
            distribute token
          </button>
        </div>
        <div>
          <div>---</div>
          <input
            type="text"
            style={{ width: "700px" }}
            defaultValue={this.state.searchAddress}
            onChange={(event) => {
              this.setState({
                searchAddress: event.target.value,
              });
            }}
          />
          <button
            onClick={() => {
              this.fnGetTokenByAddress(this.state.searchAddress);
            }}
            style={{}}
          >
            get token by address
          </button>
          {this.state.ownToken.map((v, i) => {
            return <div key={i}>{v}</div>;
          })}
        </div>

        <div>
          <div>---</div>
          <input
            type="text"
            style={{ width: "700px" }}
            defaultValue={this.state.searchToken}
            onChange={(event) => {
              this.setState({
                searchToken: event.target.value,
              });
            }}
          />
          <button
            onClick={() => {
              this.fnGetAddressByToken(this.state.searchToken);
            }}
          >
            get address by token
          </button>
        </div>

        <div>
          <div> -------------- token transfer -------------- </div>
          <div>
            from:
            <input
              type="text"
              style={{ width: "700px" }}
              defaultValue={this.state.transferFrom}
              onChange={(event) => {
                this.setState({
                  transferFrom: event.target.value,
                });
              }}
            />
          </div>
          <div>
            to:
            <input
              type="text"
              style={{ width: "700px" }}
              defaultValue={this.state.transferTo}
              onChange={(event) => {
                this.setState({
                  transferTo: event.target.value,
                });
              }}
            />
          </div>

          <div>
            token:
            <input
              type="text"
              style={{ width: "700px" }}
              defaultValue={this.state.transferToken}
              onChange={(event) => {
                this.setState({
                  transferToken: event.target.value,
                });
              }}
            />
          </div>
          <div style={{ width: "800px", wordWrap: "break-word" }}>
            unsigned tx: {this.state.transferUnsignedTx}
          </div>

          <button
            onClick={() => {
              this.fnGetUnsignedTx(
                this.state.transferFrom,
                this.state.transferTo,
                this.state.transferToken
              );
            }}
          >
            get unsigned tx
          </button>

          <button
            onClick={async () => {
              console.log("click ------------------ in");
              const from =
                "ckt1qqlpadldfqym94sx2zlfdfq2h776lvlmjs4hkdlvwuy7vn3v6zncxqfvtmp0wppt5gax2ffl8nepj0zqrsfhn9c23dfh3";
              const to =
                "ckt1qqlpadldfqym94sx2zlfdfq2h776lvlmjs4hkdlvwuy7vn3v6zncxqfhh27r2zp9cjv5jxfnpu9a6z2kwtnsnuqdr77rp";
              const token = "cf6db826-1533-4e87-b728-55e0bafb6d67";
              const userName = "quaye163";
              const test_tx = `{"version":"0x0","cell_deps":[{"out_point":{"tx_hash":"0xf11ccb6079c1a4b3d86abe2c574c5db8d2fd3505fdc1d5970b69b31864a4bd1c","index":"0x2"},"dep_type":"code"}],"header_deps":[],"inputs":[{"previous_output":{"tx_hash":"0xb0877934de419d3c0a87c189eaed464998338f165ba5f85168e50887af033a68","index":"0x1"},"since":"0x0"}],"outputs":[{"capacity":"0x31eb3a4cc","lock":{"code_hash":"0x3e1eb7ed4809b2d60650be96a40abfbdafb3fb942b7b37ec7709e64e2cd0a783","args":"0x37babc350825c4994919330f0bdd095672e709f0","hash_type":"type"},"type":{"code_hash":"0xb1837b5ad01a88558731953062d1f5cb547adf89ece01e8934a9f0aeed2d959f","args":"0x53b9a6b381e5f02408ab81bea5462c179f475b7b0000000900000002","hash_type":"type"}}],"outputs_data":["0x000000000000000000c000"],"witnesses":["0x"]}`;
              const tx_clone = JSON.parse(test_tx);

              // const userName = this.state.UnipassUserName;
              // const tx_clone = JSON.parse(this.state.transferUnsignedTx);
              // const from = this.state.transferFrom
              // const to = this.state.transferTo
              // const token =this.state.transferToken

              const signed_tx = await unipass.fnTranscationSignature(
                userName,
                tx_clone
              );
              this.fnTransfer(from, to, token, JSON.stringify(signed_tx));
            }}
          >
            transfer
          </button>
        </div>

        <div>
          <div>---</div>
          <input
            type="text"
            style={{ width: "700px" }}
            defaultValue={this.state.txUUID}
            onChange={(event) => {
              this.setState({
                txUUID: event.target.value,
              });
            }}
          />
          <button
            onClick={() => {
              this.fnGetTransferStatus(this.state.txUUID);
            }}
          >
            get transfer-status
          </button>
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
