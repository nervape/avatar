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
  OutPoint,
  Cell,
  Script,
  Transaction,
  Builder,
} from "@lay2/pw-core";
import { SHA256 } from "crypto-js";
import { createHash } from "crypto";
import axios from "axios";
import { blake2b } from "blakejs";

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

  async fnTranscationSinature(tx_clone: any) {
    console.log("----- fnTranscationSinature");
    const iCells = [];
    console.log(tx_clone);
    for (let i = 0; i < tx_clone.inputs.length; i++) {
      const input = tx_clone.inputs[i];
      console.log("input", i, input);
      const rpc = new RPC(CKB_NODE_URL);
      const op = new OutPoint(
        input.previous_output.tx_hash,
        input.previous_output.index
      );
      const cell = await Cell.loadFromBlockchain(rpc, op);
      iCells.push(cell);
    }

    const oCells = [];
    for (let i = 0; i < tx_clone.outputs.length; i++) {
      const output = tx_clone.outputs[i];
      console.log("output", i, output);
      const capacity = new Amount(output.capacity);
      const lockScript = (await Script.fromRPC(output.lock)) as Script;
      const typeScript = (await Script.fromRPC(output.type)) as Script;
      const cell = new Cell(capacity, lockScript, typeScript);
      oCells.push(cell);
    }
    console.log("iCells", iCells);
    console.log("oCells", oCells);

    // const transac = new Transaction( new RawTransaction(iCells, oCells), [
    //   Builder.WITNESS_ARGS.RawSecp256k1,
    // ]);
    const rawTransac = new RawTransaction(iCells, oCells, []);
    const tx_hash = rawTransac.toHash();
    console.log(tx_hash);

    // blake2b("input", "key", "outlen");
  }
}
