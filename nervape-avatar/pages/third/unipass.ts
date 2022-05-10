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
  Blake2bHasher,
  Reader,
  SerializeWitnessArgs,
  normalizers,
} from "@lay2/pw-core";
import { createHash } from "crypto";
import axios from "axios";
import { SerializeAssetLockWitness } from "./up-lock-witness";

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

  async fnGetDigestMessage(tx_clone: any, placeholderLength: number) {
    console.log("----- fnGetDigestMessage", tx_clone);

    // Note: When calculating txhash, cell deps must be removed first. The purpose is to let the user only sign one time when dep cell changed.
    tx_clone.cell_deps = [];

    const iCells = [];
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
      const capacity = new Amount(output.capacity, 0);
      const lockScript = (await Script.fromRPC(output.lock)) as Script;
      const typeScript = (await Script.fromRPC(output.type)) as Script;
      const cell = new Cell(capacity, lockScript, typeScript);
      oCells.push(cell);
    }
    console.log("iCells", iCells);
    console.log("oCells", oCells);

    const rawTransac = new RawTransaction(iCells, oCells, []);
    const tx_hash = rawTransac.toHash();
    console.log(tx_hash);

    // 不建议使用 blake2b ，推荐使用 Blake2bHasher，自带默认加盐操作。
    // blake2b(
    //   tx_hash,
    //   grouped_inputs_witnesses,
    //   extra_witness
    // );
    const bhashder = new Blake2bHasher();
    const rawTxHash = new Reader(tx_hash).toArrayBuffer();

    // const grouped_input_witnesses = [
    //   {
    //     lock: new Reader("0x" + "0".repeat(130)),
    //     input_type: undefined, // 暂时先不写
    //     output_type: undefined, // 暂时先不写
    //   },
    // ];
    // const unsignedWitness = SerializeWitnessArgs(grouped_input_witnesses[0]);
    const unsignedWitness = SerializeWitnessArgs({
      lock: Buffer.alloc(placeholderLength).buffer,
    });

    const lengthBuf = new ArrayBuffer(8);
    const view = new DataView(lengthBuf);
    view.setBigUint64(0, BigInt(unsignedWitness.byteLength), true);

    const digest_message = bhashder
      .update(rawTxHash)
      .update(lengthBuf)
      .update(unsignedWitness)
      .digest();
    const message = digest_message.serializeJson();
    console.log("digest_message", digest_message);
    console.log("digest_message str", message);
    return { digest_message, message };
  }

  async fnTestPreAuthInfo(userName: string) {
    const snapinfo = await this.fnGetSnapInfo(userName);
    const usernameHash = snapinfo.lock_info[0].username;
    const userinfo = snapinfo.lock_info[0].user_info;
    const user_info_smt_proof = snapinfo.user_info_smt_proof;

    const preAuth = await UP.authorize(
      new UPAuthMessage("PLAIN_MSG", userName, "message")
    );
    const placeholderLength = SerializeAssetLockWitness({
      pubkey: {
        type: preAuth.keyType,
        value: {
          e: new Reader(preAuth.pubkey.slice(0, 10)),
          n: new Reader(`0x${preAuth.pubkey.slice(10)}`),
        },
      }, // pubkey
      sig: new Reader(preAuth.sig), // 先签一笔随意的交易，确定 signature 的长度
      username: new Reader(usernameHash), // usernameHash from snapshot
      user_info: new Reader(userinfo), // user_info from snapshot rpc
      user_info_smt_proof: new Reader(user_info_smt_proof), // smt proof from snapshot url
    });
    // 得到 placeholderLength.byteLength = 1307
    console.log("fnTestPreAuthInfo", placeholderLength.byteLength);
  }

  async fnTranscationSignature(userName: string, tx_clone: any) {
    const unSignedTx = { ...tx_clone };
    const snapinfo = await this.fnGetSnapInfo(userName);
    const usernameHash = snapinfo.lock_info[0].username;
    const userinfo = snapinfo.lock_info[0].user_info;
    const user_info_smt_proof = snapinfo.user_info_smt_proof;

    // console.log("snap info ", snapinfo);
    // console.log("usernameHash", usernameHash);
    // console.log("userinfo", userinfo);
    // console.log("user_info_smt_proof", user_info_smt_proof);

    // 0. 先签一笔交易，确定 signature 的长度
    // await this.fnTestPreAuthInfo(userName);

    // 1. 获取 digest_message
    const { message } = await this.fnGetDigestMessage({ ...tx_clone }, 1307);

    // 2. 使用 digest_message 进行签名
    const { keyType, pubkey, sig } = await UP.authorize(
      new UPAuthMessage("CKB_TX", userName, message)
    );
    console.log("keyType", keyType);
    console.log("pubkey", pubkey);
    console.log("sig", sig);

    // 3. 组织 Lock script’ witness 结构：https://www.notion.so/Technical-Details-of-UP-CKB-f67d2521278346b59d5b31181079f8b9
    const witnessLock = SerializeAssetLockWitness({
      pubkey: {
        type: keyType,
        value: {
          e: new Reader(pubkey.slice(0, 10)),
          n: new Reader(`0x${pubkey.slice(10)}`),
        },
      }, // pubkey
      sig: new Reader(sig), // sig
      username: new Reader(usernameHash), // usernameHash from snapshot
      user_info: new Reader(userinfo), // user_info from snapshot rpc
      user_info_smt_proof: new Reader(user_info_smt_proof), // smt proof from snapshot url
    });

    console.log("witness", witnessLock.byteLength, witnessLock);
    // 4. 添加 cell_deps
    const cell_deps = snapinfo.cell_deps;
    unSignedTx.cell_deps.push(...cell_deps);

    // 5. 替换 witnesses
    unSignedTx.witnesses[0] = new Reader(
      SerializeWitnessArgs(
        normalizers.NormalizeWitnessArgs({
          // 疑问： 这里的 witnessArgs 从何而来？
          // ...(signedTx.witnessArgs[0] as WitnessArgs),
          lock: witnessLock,
        })
      )
    ).serializeJson();

    console.log("signed tx", unSignedTx);

    return unSignedTx;
  }
}
