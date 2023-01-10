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
}

deploy().then();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
