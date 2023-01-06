import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

const airdrop = require("../assets/airdrop.json");

interface Balance {
    addr: string;
    amount: string;
}

const balances: Balance[] = [];

const addressToCheck = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4";
let amount;
let amountEncoded;

airdrop.map((a: any) => {
    balances.push({
        addr: a.address,
        amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [a.amount]),
    });

    if (a.address == addressToCheck) {
        amountEncoded =  ethers.utils.defaultAbiCoder.encode(['uint256'], [a.amount]);
        amount = a.amount;
    }
});

const leafNodes = balances.map((balance) =>
    keccak256(
        Buffer.concat([
                Buffer.from(balance.addr.replace("0x", ""), "hex"),
                Buffer.from(balance.amount.replace("0x", ""), "hex")
            ]
        )
    )
);

const merkleTree = new MerkleTree(leafNodes, keccak256, { sort: true });

const leafNode = keccak256(
    Buffer.concat([
            Buffer.from(addressToCheck.replace("0x", ""), "hex"),
            Buffer.from(amountEncoded.replace("0x", ""), "hex")
        ]
    )
);

const proof = merkleTree.getHexProof(leafNode);
console.log("Proof for address :", addressToCheck, "and amount", amount,":\n" + proof);

