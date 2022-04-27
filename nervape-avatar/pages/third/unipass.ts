import UP, { UPAuthMessage, UPAuthResponse } from "up-core-test";
import UPCKB from "up-ckb-alpha-test";
import PWCore, {
  Address,
  IndexerCollector,
  AddressType,
  Amount,
  ChainID,
} from "@lay2/pw-core";

// # demo.app.unipass.id
const UNIPASS_URL = "d.app.unipass.id";
const ASSET_LOCK_CODE_HASH =
  "0xd41445a4845a09c163d174f59644877465710031582f640ba2e11437b005b812";

const CKB_NODE_URL = "https://testnet.ckb.dev";
const CKB_INDEXER_URL = "https://testnet.ckb.dev/indexer";
// # ckb 0 ckb_testnet 1 ckb_dev 2
const PW_CORE_CHAIN_ID = 1;

const AGGREGATOR_URL = "https://d.aggregator.unipass.id/dev/";

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
}
