import {run, ethers} from "hardhat";

async function deploy() {
    console.log("Deploying contract...");
    const contract = await ethers.getContractFactory("MultiTokenClaim");
    const Contract = await contract.deploy();
    await Contract.deployed();
    console.log("Contract deployed to:", Contract.address);

    console.log("Waiting 30 seconds before verifying the contract... (to avoid errors)");
    await delay(30000);

    console.log("Verify contract...")

    try {
        await run(`verify:verify`, {
            address: Contract.address,
            constructorArguments: [],
        })
        console.log("Contract verified !")
    } catch (error) {
        console.log(error);
    }

    await Contract.addRootUpdater("0xB49923913C499CFAFab2f4871c593E716b1f8C0E");
    await Contract.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000", "0x993f33D97A01Ab067bD39d9bd8E3A90361Bb8cc4");
}

deploy().then();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
