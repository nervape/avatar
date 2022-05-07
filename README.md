# avatar

## 对于 nervape3d 项目的思考

- 钱包方面（unipass）
  - V3 接入仅能使用 ssr 方式，nervape3d 是一个重前端的 canvas 项目，若采用 ssr 模式，后期将额外产生很大维护成本。
  - V2 已有适合纯前端工程的接入方案。
    - 优势：
      - 继续使用 mibao mNFT 方式发布资产，不影响之前到业务
      - 可迅速进入 nervape3d 开发环节。
    - 劣势：
      - 未来 Unipass 会主推升级到 V3，有业务链路变更风险。
      - 无版权费。
- 交易市场 方面 （kollect）
  - 如果 kollect 支持 ERC/NRC 721
    - 优势：
      - 需自研 NRC 721

## 问题记录：

- opensea 侧：

  - finkeby 网络下无法读取 mumbai 网络下的 matic 数据，也就意味着，测试网络下，无法完成流程。
  - https://github.com/ProjectOpenSea/opensea-js 新版本兼容性有问题，nodejs 14/15 通过，但 16 的版本无法安装成功。
  - 验证流程：
    - 从 已知 账户 A 转让 nft 给账户 B
    - erc 721 方面的转让验证

- mibao 侧：
  - 测试账号没了 test@nervape.com？这还玩什么？
    - （解决） mibao 已解决
  - 通过 api 创建的 mnft，不具备可视化窗口 ,发布环节怎么办？
    - （解决） 通过api创建测试通过
  - 验证流程验证
    - （解决）从 unipassV3 获取 ckt 地址 ckb-address-01
    - （解决）生成未签名交易 A
    - （解决）获取 unipass 签名 A
    - （待定）从 mibao 转让 nft 给 ckb-address-01
    - （待定）从 ckb-address-01 转让 nft 给 add02
