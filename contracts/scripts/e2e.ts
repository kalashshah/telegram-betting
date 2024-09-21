import hre from "hardhat";
import { morphHolesky, sapphireTestnet } from "viem/chains";

const getTokenContractAddress = (chainId: number) => {
    switch (chainId) {
      case sapphireTestnet.id:
        return "0xf551eb1842350d05b35A8475A0dA8d4cE88FCF67";
      case morphHolesky.id:
        return "0xd15894fd344908c83ae39719fc551b1b5b0faddb";
      //AIRDAO
      case 22040:
        return "0xcc4a6407b36120f21ff21d0f7eef23dbead2a977";
      //TODO : Add FHENIX
      default:
        return "";
    }
  };
  
  const getMarketContractAddress = (chainId: number) => {
    switch (chainId) {
      case sapphireTestnet.id:
        return "0xB2f03BcF3433C91cD845E54f706C12041409D3C2";
  
      case morphHolesky.id:
        return "0x3915791b77cf27221334890e4f088e5a6c950054";
  
      //Airdao
      case 22040:
        return "0x7ba34df70a46bf83ddb29801a7ee9a2a3d312e4b";
      default:
        return "";
    }
  };


async function e2e() {
  try{
    const testChainId = sapphireTestnet.id
    const [owner, acc1, acc2, acc3] = await hre.viem.getWalletClients();

    const marketAddress = getMarketContractAddress(testChainId) as `0x${string}`;
    const marketContract = await hre.viem.getContractAt("Market", marketAddress);

    const tokenAddress = getTokenContractAddress(testChainId) as `0x${string}`;
    const tokenContract = await hre.viem.getContractAt("MyToken", tokenAddress );

    //send all acc 50 tokens
    await tokenContract.write.transfer([acc1.account.address, BigInt(50)])
    await tokenContract.write.transfer([acc2.account.address, BigInt(50)])
    await tokenContract.write.transfer([acc3.account.address, BigInt(50)])

    //let owner create an option first
    const optionId = ("0x" + "1".padStart(64, "0")) as `0x${string}`; // Example option ID
    const description = "Will it rain tomorrow?";
    const expireTimestamp = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
  
    const tx = await marketContract.write.addOption(
      [optionId, description, BigInt(expireTimestamp)],
      {
        account: owner.account,
      }
    );
    console.log(`Option added with ID: ${optionId}, transaction is ${tx}`);
    console.log("Option has been created !!!");

    // approve tokens to be used in marketAddress
    const tx1 = await tokenContract.write.approve([marketAddress, BigInt(1000)]);
    console.log("Approved successfully!", tx1);

    //let account1 come in and predict 0 with 5 tokens
    const tx2 =  await marketContract.write.predict([optionId, 0, 5], {
      account: acc1.account,
    });
    console.log("Bet Made from acc1 successfully!");

    //let account2 come in and predict 0 with 5 tokens
    const tx3 =  await marketContract.write.predict([optionId, 1, 5], {
      account: acc2.account,
    });
    console.log("Bet Made from acc2 successfully!");

    //let account2 come in and predict 0 with 5 tokens
    const tx4 =  await marketContract.write.predict([optionId, 1, 10], {
      account: acc2.account,
    });
    console.log("Bet Made from acc3 successfully!");

    //let owner end the option with final result as 0
    const tx5 = await marketContract.write.endOption([optionId, BigInt(0)], {
      account: owner.account,
    });
    console.log("Bet closed successfully!");

    console.log("Pay out acc1");
    //payout for acc1
    await marketContract.write.payout([optionId], {
      account: acc1.account,
    });

    console.log("Pay out acc2");
    await marketContract.write.payout([optionId], {
      account: acc2.account,
    });


    console.log("Pay out acc3");
    await marketContract.write.payout([optionId], {
      account: acc3.account,
    });

  }catch(e){
    console.log("Failed with e");
  }
}

e2e();
