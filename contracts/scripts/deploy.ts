import hre from "hardhat";

  async function doAllDeploymentsForChain() {
    //first deploy erc20 
    const [owner, otherAccount] = await hre.viem.getWalletClients();
    const mytoken = await hre.viem.deployContract("MyToken");
    console.log("MyToken deployed at address", mytoken.address);
    const myTokenAddress = mytoken.address
    
    //then deploy dispute resolution
    const disputeResolution = await hre.viem.deployContract("DisputeResolution",[]);
    console.log("DisputeResolution deployed at address : ", disputeResolution.address);
    const disputeResolutionAddress = disputeResolution.address;
    
    //then deploy market contract
    const market = await hre.viem.deployContract("Market", [myTokenAddress, disputeResolutionAddress]);
    const marketAddress = market.address;
    console.log("Market deployed at address", market.address);

    //Now add market contract to disputeResolutionContract
    const disputeResolutionContract = await hre.viem.getContractAt("DisputeResolution", disputeResolutionAddress);
    await disputeResolutionContract.write.setAddress([marketAddress], { account: owner.account })

    console.log("For the current chain the deployments are : ");
    console.log("TOKEN ADDRESS ", myTokenAddress);
    console.log("DisputeContract Address", disputeResolutionAddress);
    console.log("Market Contract Address",marketAddress )
  }

  doAllDeploymentsForChain();

/// FOR AIRDAO
/// TOKEN ADDRESS  0xcc4a6407b36120f21ff21d0f7eef23dbead2a977
/// DisputeContract Address 0xf3c05f8f1271868e925535c5731a53d310c7c4f5
/// Market Contract Address 0x7ba34df70a46bf83ddb29801a7ee9a2a3d312e4b

/// FOR Sapphire Testnet
/// TOKEN ADDRESS  0xf551eb1842350d05b35A8475A0dA8d4cE88FCF67
/// DisputeContract Address 0x740d945CB85f814E714eFaD06bC12d747A68F0E5
/// Market Contract Address 0xB2f03BcF3433C91cD845E54f706C12041409D3C2

/// FOR morph-testnet
/// TOKEN ADDRESS  0xd15894fd344908c83ae39719fc551b1b5b0faddb
/// DisputeContract Address 0xa984dbf2bfa58fe59b42730450338404b6702973
/// Market Contract Address 0x3915791b77cf27221334890e4f088e5a6c950054
  