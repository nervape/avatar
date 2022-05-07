import UP, { UPAuthMessage, UPAuthResponse } from "up-core-test";
import UPCKB from "up-ckb-alpha-test";
import PWCore, {
  Address,
  IndexerCollector,
  AddressType,
  Amount,
  ChainID,
  RawTransaction,
  RPC,
} from "@lay2/pw-core";
import { SHA256 } from "crypto-js";
import { createHash } from "crypto";
import axios from "axios";

// # demo.app.unipass.id
const UNIPASS_URL = "t.app.unipass.id";
const ASSET_LOCK_CODE_HASH =
  "0x3e1eb7ed4809b2d60650be96a40abfbdafb3fb942b7b37ec7709e64e2cd0a783";

const CKB_NODE_URL = "https://testnet.ckb.dev";
const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";
// # ckb 0 ckb_testnet 1 ckb_dev 2
const PW_CORE_CHAIN_ID = 1;

const AGGREGATOR_URL = "https://t.aggregator.unipass.id/dev/";

export class UnipassApi {
  constructor() {
    UP.config({
      domain: UNIPASS_URL,
      // domain: 'localhost:3000',
      // protocol: 'http',
    });
    PWCore.setChainId(Number(PW_CORE_CHAIN_ID));
    UPCKB.config({
      upSnapshotUrl: AGGREGATOR_URL + "/snapshot/",
      chainID: Number(PW_CORE_CHAIN_ID),
      ckbIndexerUrl: CKB_INDEXER_URL,
      ckbNodeUrl: CKB_NODE_URL,
      upLockCodeHash: ASSET_LOCK_CODE_HASH as string,
    });
  }

  public async fnConnect() {
    console.log("connect clicked");
    let username = "";
    let myAddress = "";
    let myBalance = "";
    try {
      const account = await UP.connect({ email: true, evmKeys: true });
      username = account.username;
      console.log("account", account);
      const address: Address = UPCKB.getCKBAddress(username);
      myAddress = address.toCKBAddress();
      const indexerCollector = new IndexerCollector(CKB_INDEXER_URL as string);
      console.log("address", address);
      const balance = await indexerCollector.getBalance(address as Address);
      console.log("balance", balance);
      myBalance = balance.toString();
    } catch (err) {
      console.log("connect err", err);
    }

    console.log(`username:${username}`);

    console.log(`myAddress:${myAddress}`);

    console.log(`myBalance:${myBalance}`);

    return { username, myAddress, myBalance };
  }

  async fnAuthorize(username: string, message: string) {
    console.log("authorize clicked");
    console.log({
      username,
      message,
    });
    try {
      const resp = await UP.authorize(
        new UPAuthMessage("PLAIN_MSG", username, message)
      );
      console.log("resp", resp);
      return resp;
    } catch (err) {
      console.error("auth err", err);
    }
  }

  async fnGetSnapInfo(name: string) {
    const username = createHash("sha256").update(name).digest("hex");
    console.log(username);
    // const url = " https://aggregator.unipass.id/snapshot"
    const url = "https://t.aggregator.unipass.id/snapshot/";

    const result = await axios.post(url, {
      jsonrpc: "2.0",
      method: "get_asset_lock_tx_info",
      params: [`0x${username}`],
      id: "1",
    });
    console.log(result);

    return result.data.result;
  }
}
