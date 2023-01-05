import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

const airdrop = require("../assets/airdrop.json");

interface Balance {
    addr: string;
    amount: string;
}

const balances: Balance[] = [];

airdrop.map((a: any) => {
    balances.push({
        addr: a.address,
        amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [a.amount]),
    });
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

console.log("---------");
console.log("Merke Tree");
console.log("---------");
console.log(merkleTree.toString());
console.log("---------");
console.log("Merkle Root: " + merkleTree.getHexRoot());

console.log("Proof 1: " + merkleTree.getHexProof(leafNodes[0]));
console.log("Proof 2: " + merkleTree.getHexProof(leafNodes[1]));
