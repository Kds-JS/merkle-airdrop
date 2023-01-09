import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
const keccak256 = require("keccak256");

const ERC20_List = require("../assets/ERC20_list.json");
const ERC721_List = require("../assets/ERC721_list.json");
const ERC1155_List = require("../assets/ERC1155_list.json");

interface ERC20 {
    contractAddress: string;
    address: string;
    amount: string;
}

interface ERC721 {
    contractAddress: string;
    address: string;
    amount: string;
}

interface ERC1155 {
    contractAddress: string;
    address: string;
    tokenId: string;
    amount: string;
}

const balancesERC20: ERC20[] = [];
const balancesERC721: ERC721[] = [];
const balancesERC1155: ERC1155[] = [];

ERC20_List.map((a: any) => {
    balancesERC20.push({
        contractAddress: a.contractAddress,
        address: a.address,
        amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [a.amount]),
    });
});

ERC721_List.map((a: any) => {
    balancesERC721.push({
        contractAddress: a.contractAddress,
        address: a.address,
        amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [a.amount]),
    });
});

ERC1155_List.map((a: any) => {
    balancesERC1155.push({
        contractAddress: a.contractAddress,
        address: a.address,
        tokenId: ethers.utils.defaultAbiCoder.encode(['uint256'], [a.tokenId]),
        amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [a.amount]),
    });
});

const leafNodesERC20 = balancesERC20.map((balance) =>
    keccak256(
        Buffer.concat([
                Buffer.from(balance.contractAddress.replace('0x', ''), 'hex'),
                Buffer.from(balance.address.replace("0x", ""), "hex"),
                Buffer.from(balance.amount.replace("0x", ""), "hex")
            ]
        )
    )
);

const leafNodesERC721 = balancesERC721.map((balance) =>
    keccak256(
        Buffer.concat([
                Buffer.from(balance.contractAddress.replace('0x', ''), 'hex'),
                Buffer.from(balance.address.replace("0x", ""), "hex"),
                Buffer.from(balance.amount.replace("0x", ""), "hex")
            ]
        )
    )
);

const leafNodesERC1155 = balancesERC1155.map((balance) =>
    keccak256(
        Buffer.concat([
                Buffer.from(balance.contractAddress.replace('0x', ''), 'hex'),
                Buffer.from(balance.address.replace("0x", ""), "hex"),
                Buffer.from(balance.tokenId.replace("0x", ""), "hex"),
                Buffer.from(balance.amount.replace("0x", ""), "hex")
            ]
        )
    )
);

const merkleTreeERC20 = new MerkleTree(leafNodesERC20, keccak256, { sort: true });
const merkleTreeERC721 = new MerkleTree(leafNodesERC721, keccak256, { sort: true });
const merkleTreeERC1155 = new MerkleTree(leafNodesERC1155, keccak256, { sort: true });

console.log("---------");
console.log("Merke Tree ERC20");
console.log("---------");
console.log(merkleTreeERC20.toString());
console.log("---------");
console.log("Merkle Root: " + merkleTreeERC20.getHexRoot());

console.log("Proof 1: " + merkleTreeERC20.getHexProof(leafNodesERC20[0]));
console.log("Proof 2: " + merkleTreeERC20.getHexProof(leafNodesERC20[1]));

console.log("---------");
console.log("Merke Tree ERC721");
console.log("---------");
console.log(merkleTreeERC721.toString());
console.log("---------");
console.log("Merkle Root: " + merkleTreeERC721.getHexRoot());

console.log("Proof 1: " + merkleTreeERC721.getHexProof(leafNodesERC721[0]));
console.log("Proof 2: " + merkleTreeERC721.getHexProof(leafNodesERC721[1]));

console.log("---------");
console.log("Merke Tree ERC1155");
console.log("---------");
console.log(merkleTreeERC1155.toString());
console.log("---------");
console.log("Merkle Root: " + merkleTreeERC1155.getHexRoot());

console.log("Proof 1: " + merkleTreeERC1155.getHexProof(leafNodesERC1155[0]));
console.log("Proof 2: " + merkleTreeERC1155.getHexProof(leafNodesERC1155[1]));
console.log("Proof 3: " + merkleTreeERC1155.getHexProof(leafNodesERC1155[2]));
