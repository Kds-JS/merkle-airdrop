import { expect } from "chai";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

interface Balance {
    addr: string;
    amount: string;
    decodedAmount: string;
}

describe("Unit tests of MerkleMultipleAirdrop contract :", async () => {

    let airdropContract;
    let tokenContract;
    let accounts = [];
    let owner;

    let balancesBeforeUpdate: Balance[] = [];
    let balancesAfterUpdate: Balance[] = [];

    function getMerkleTree(balances: Balance[]) {
        const leafNodes = balances.map((balance) =>
            keccak256(
                Buffer.concat([
                        Buffer.from(balance.addr.replace("0x", ""), "hex"),
                        Buffer.from(balance.amount.replace("0x", ""), "hex")
                    ]
                )
            )
        );

        return new MerkleTree(leafNodes, keccak256, { sort: true });
    }

    function getMerkleRoot(balances: Balance[]) {
        const merkleTree = getMerkleTree(balances);
        return merkleTree.getHexRoot();
    }

    function getMerkleProof(balances: Balance[], addressToCheck: string) {
        const merkleTree = getMerkleTree(balances);
        const amountEncoded = balances.find(b => b.addr == addressToCheck).amount;
        const leafNode = keccak256(
            Buffer.concat([
                    Buffer.from(addressToCheck.replace("0x", ""), "hex"),
                    Buffer.from(amountEncoded.replace("0x", ""), "hex")
                ]
            )
        );
        return merkleTree.getHexProof(leafNode);
    }

    function getRandomAmount(excluded) {
        // BETWEEN 1 ETHER AND 10 ETHERS
        let amount = Math.floor(Math.random() * (10000000000000000000 - 1000000000000000000 + 1)) + 1000000000000000000;
        while (amount == excluded) {
            amount = Math.floor(Math.random() * (10000000000000000000 - 1000000000000000000 + 1)) + 1000000000000000000;
        }
        return amount;
    }

    before(async () => {
        const [eth_accounts] = await ethers.getSigners();

        for (let i = 0; i < 60; i++) {
            let signer = ethers.Wallet.createRandom();
            signer = signer.connect(ethers.provider);
            await eth_accounts.sendTransaction({to: signer.address, value: ethers.utils.parseEther("2")});
            accounts.push(signer);
        }

        owner = accounts[0].connect(ethers.provider);
        accounts = accounts.slice(1);

        const TokenContract = await ethers.getContractFactory("USDTest");
        tokenContract = await TokenContract.connect(owner).deploy();


    })

    it("Should deploy 'MerkleMultipleAirdrop' contract", async () => {
        for (let i = 0; i < accounts.length; i++) {
            const amount = getRandomAmount(0).toString();
            balancesBeforeUpdate.push({
                addr: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [amount]),
                decodedAmount: amount
            });
        }

        let merkleRoot = getMerkleRoot(balancesBeforeUpdate);

        const AirdropContract = await ethers.getContractFactory("MerkleMultipleAirdrop");
        airdropContract = await AirdropContract.connect(owner).deploy(
            tokenContract.address,
            merkleRoot
        );

        expect(airdropContract.address).to.not.be.undefined;
    })

    it("Should be able to add 'MerkleMultipleAirdrop' contract as minter of 'USDTest' contract", async () => {
        expect(await tokenContract.connect(owner).addMinter(airdropContract.address)).to.not.reverted;

    });

    it("Should return token address", async () => {
        expect(await airdropContract.token()).to.be.equal(tokenContract.address);
    });

    it("Should return merkle root", async () => {
        expect(await airdropContract.merkleRoot()).to.be.equal(getMerkleRoot(balancesBeforeUpdate));
    });

    it("Should revert with 'Invalid proof.' if user send invalid proof", async () => {

        await expect(airdropContract.connect(accounts[0]).claim(
            balancesBeforeUpdate[0].decodedAmount,
            []
        )).to.be.revertedWith("Invalid proof.");
    });

    it("Should revert with 'Invalid proof.' for all users if they send invalid proof", async () => {
        for (let i = 0; i < accounts.length; i++) {
            await expect(airdropContract.connect(accounts[i]).claim(
                balancesBeforeUpdate[i].decodedAmount,
                []
            )).to.be.revertedWith("Invalid proof.");
        }
    });

    it("Should revert with 'Invalid proof.' if user send invalid amount", async () => {
        await expect(airdropContract.connect(accounts[0]).claim(
            "100000000000000000000",
            getMerkleProof(balancesBeforeUpdate, accounts[0].address)
        )).to.be.revertedWith("Invalid proof.");
    });

    it("Should revert with 'Invalid proof.' for all users if they send invalid amount", async () => {
        for (let i = 0; i < accounts.length; i++) {
            await expect(airdropContract.connect(accounts[i]).claim(
                "100000000000000000000",
                getMerkleProof(balancesBeforeUpdate, accounts[i].address)
            )).to.be.revertedWith("Invalid proof.");
        }
    });

    it("Should be able to claim tokens for all users", async () => {
        for (let i = 0; i < accounts.length; i++) {
            await expect(airdropContract.connect(accounts[i]).claim(
                balancesBeforeUpdate[i].decodedAmount,
                getMerkleProof(balancesBeforeUpdate, accounts[i].address)
            )).to.not.be.reverted;

            const balanceOf = await tokenContract.balanceOf(accounts[i].address);
            expect(balanceOf.toString()).to.be.equal(balancesBeforeUpdate[i].decodedAmount);
        }
    });

    it("Should revert with 'Drop already claimed.' if user try to claim tokens again", async () => {
        await expect(airdropContract.connect(accounts[0]).claim(
            balancesBeforeUpdate[0].decodedAmount,
            getMerkleProof(balancesBeforeUpdate, accounts[0].address)
        )).to.be.revertedWith("Drop already claimed.");
    });

    it("Should revert with 'Ownable: caller is not the owner' if user try to update merkle root", async () => {
        await expect(airdropContract.connect(accounts[0]).updateMerkleRoot(
            getMerkleRoot(balancesBeforeUpdate)
        )).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should be able to update merkle root", async () => {
        for (let i = 0; i < accounts.length; i++) {
            const randomAmount = getRandomAmount(0);
            const amount = (randomAmount + parseInt(balancesBeforeUpdate[i].decodedAmount, 10)).toString();
            balancesAfterUpdate.push({
                addr: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [amount]),
                decodedAmount: amount
            });
        }
        await expect(airdropContract.connect(owner).updateMerkleRoot(
            getMerkleRoot(balancesAfterUpdate)
        )).to.not.be.reverted;
    });

    it("Should be able to claim tokens for all users after update merkle root", async () => {
        for (let i = 0; i < accounts.length; i++) {
            await expect(airdropContract.connect(accounts[i]).claim(
                balancesAfterUpdate[i].decodedAmount,
                getMerkleProof(balancesAfterUpdate, accounts[i].address)
            )).to.not.be.reverted;
        }
    });
})
