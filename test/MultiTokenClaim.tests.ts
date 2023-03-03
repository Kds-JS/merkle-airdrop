import {ethers} from "hardhat";
import {MerkleTree} from "merkletreejs";
import {expect} from "chai";

const keccak256 = require("keccak256");

interface ERC20 {
    contractAddress: string;
    address: string;
    amount: string;
    decodedAmount: string;
}

interface ERC721 {
    contractAddress: string;
    address: string;
    amount: string;
    decodedAmount: string;
}

interface ERC1155 {
    contractAddress: string;
    address: string;
    tokenId: string;
    amount: string;
    decodedAmount: string;
}

interface AVAX {
    address: string;
    amount: string;
    decodedAmount: string;
}

describe("Unit tests of MultiTokenClaim contract :", async () => {

    let multiTokenClaim;
    let ERC20Contract_1;
    let ERC20Contract_2;
    let ERC721Contract_1;
    let ERC721Contract_2;
    let ERC1155Contract_1;
    let ERC1155Contract_2;
    let accounts = [];
    let owner;

    let ERC20balancesBeforeUpdate: ERC20[] = [];
    let ERC20balancesAfterUpdate: ERC20[] = [];

    let ERC721balancesBeforeUpdate: ERC721[] = [];
    let ERC721balancesAfterUpdate: ERC721[] = [];

    let ERC1155balancesBeforeUpdate: ERC1155[] = [];
    let ERC1155balancesAfterUpdate: ERC1155[] = [];

    let AVAXbalancesBeforeUpdate: AVAX[] = [];
    let AVAXbalancesAfterUpdate: AVAX[] = [];

    function getERC20MerkleTree(balances: ERC20[]): MerkleTree {
        const leafNodesERC20 = balances.map((balance) =>
            keccak256(
                Buffer.concat([
                        Buffer.from(balance.contractAddress.replace('0x', ''), 'hex'),
                        Buffer.from(balance.address.replace("0x", ""), "hex"),
                        Buffer.from(balance.amount.replace("0x", ""), "hex")
                    ]
                )
            )
        );

        return new MerkleTree(leafNodesERC20, keccak256, { sort: true });
    }

    function getERC721MerkleTree(balances: ERC721[]): MerkleTree {
        const leafNodesERC721 = balances.map((balance) =>
            keccak256(
                Buffer.concat([
                        Buffer.from(balance.contractAddress.replace('0x', ''), 'hex'),
                        Buffer.from(balance.address.replace("0x", ""), "hex"),
                        Buffer.from(balance.amount.replace("0x", ""), "hex")
                    ]
                )
            )
        );

        return new MerkleTree(leafNodesERC721, keccak256, { sort: true });
    }

    function getERC1155MerkleTree(balances: ERC1155[]): MerkleTree {
        const leafNodesERC1155 = balances.map((balance) =>
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

        return new MerkleTree(leafNodesERC1155, keccak256, { sort: true });
    }

    function getAVAXMerkleTree(balances: AVAX[]): MerkleTree {
        const leafNodesAVAX = balances.map((balance) =>
            keccak256(
                Buffer.concat([
                        Buffer.from(balance.address.replace("0x", ""), "hex"),
                        Buffer.from(balance.amount.replace("0x", ""), "hex")
                    ]
                )
            )
        );

        return new MerkleTree(leafNodesAVAX, keccak256, { sort: true });
    }

    function getERC20MerkleRoot(balances: ERC20[]): string {
        const merkleTree = getERC20MerkleTree(balances);
        return merkleTree.getHexRoot();
    }

    function getERC721MerkleRoot(balances: ERC721[]): string {
        const merkleTree = getERC721MerkleTree(balances);
        return merkleTree.getHexRoot();
    }

    function getERC1155MerkleRoot(balances: ERC1155[]): string{
        const merkleTree = getERC1155MerkleTree(balances);
        return merkleTree.getHexRoot();
    }

    function getAVAXMerkleRoot(balances: AVAX[]): string{
        const merkleTree = getAVAXMerkleTree(balances);
        return merkleTree.getHexRoot();
    }

    function getERC20MerkleProof(balances: ERC20[], contractAddressToCheck: string, addressToCheck: string): [string[], number] {
        const line = balances.findIndex((balance) => balance.address === addressToCheck && balance.contractAddress === contractAddressToCheck);
        const merkleTree = getERC20MerkleTree(balances);
        const leafNode = keccak256(
            Buffer.concat([
                    Buffer.from(balances[line].contractAddress.replace('0x', ''), 'hex'),
                    Buffer.from(addressToCheck.replace("0x", ""), "hex"),
                    Buffer.from(balances[line].amount.replace("0x", ""), "hex")
                ]
            )
        );
        return [merkleTree.getHexProof(leafNode), line];
    }

    function getERC721MerkleProof(balances: ERC721[], contractAddressToCheck: string, addressToCheck: string): [string[], number] {
        const line = balances.findIndex((balance) => balance.address === addressToCheck && balance.contractAddress === contractAddressToCheck);
        const merkleTree = getERC721MerkleTree(balances);
        const leafNode = keccak256(
            Buffer.concat([
                    Buffer.from(balances[line].contractAddress.replace('0x', ''), 'hex'),
                    Buffer.from(balances[line].address.replace("0x", ""), "hex"),
                    Buffer.from(balances[line].amount.replace("0x", ""), "hex")
                ]
            )
        );
        return [merkleTree.getHexProof(leafNode), line];
    }

    function getERC1155MerkleProof(balances: ERC1155[], contractAddressToCheck: string, addressToCheck: string, tokenIdToCheck: string): [string[], number] {
        const line = balances.findIndex((balance) => balance.address === addressToCheck && balance.contractAddress === contractAddressToCheck && balance.tokenId === ethers.utils.defaultAbiCoder.encode(['uint256'], [parseInt(tokenIdToCheck, 10)]));
        const merkleTree = getERC1155MerkleTree(balances);
        const leafNode = keccak256(
            Buffer.concat([
                    Buffer.from(balances[line].contractAddress.replace('0x', ''), 'hex'),
                    Buffer.from(balances[line].address.replace("0x", ""), "hex"),
                    Buffer.from(balances[line].tokenId.replace("0x", ""), "hex"),
                    Buffer.from(balances[line].amount.replace("0x", ""), "hex")
                ]
            )
        );
        return [merkleTree.getHexProof(leafNode), line];
    }

    function getAVAXMerkleProof(balances: AVAX[], addressToCheck: string): [string[], number] {
        const line = balances.findIndex((balance) => balance.address === addressToCheck);
        const merkleTree = getAVAXMerkleTree(balances);
        const leafNode = keccak256(
            Buffer.concat([
                    Buffer.from(balances[line].address.replace("0x", ""), "hex"),
                    Buffer.from(balances[line].amount.replace("0x", ""), "hex")
                ]
            )
        );

        return [merkleTree.getHexProof(leafNode), line];
    }

    function getRandomAmount(min, max): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    before(async () => {
        const [eth_accounts] = await ethers.getSigners();

        // @dev 1 owner + 10 users : 5 users for single claims, 5 users for batch claims
        for (let i = 0; i < 11; i++) {
            let signer = ethers.Wallet.createRandom();
            signer = signer.connect(ethers.provider);
            await eth_accounts.sendTransaction({to: signer.address, value: ethers.utils.parseEther("20")});
            accounts.push(signer);
        }

        owner = accounts[0].connect(ethers.provider);
        accounts = accounts.slice(1);

        const USDTest = await ethers.getContractFactory("USDTest");
        ERC20Contract_1 = await USDTest.connect(owner).deploy();
        ERC20Contract_2 = await USDTest.connect(owner).deploy();

        const NFTest_1 = await ethers.getContractFactory("NFTest");
        const NFTest_2 = await ethers.getContractFactory("NFTestKalao");
        ERC721Contract_1 = await NFTest_1.connect(owner).deploy();
        ERC721Contract_2 = await NFTest_2.connect(owner).deploy();

        const sNFTest = await ethers.getContractFactory("sNFTest");
        ERC1155Contract_1 = await sNFTest.connect(owner).deploy();
        ERC1155Contract_2 = await sNFTest.connect(owner).deploy();

        for (let i = 0; i < accounts.length; i++) {
            const ERC20amount_1 = getRandomAmount(100000, 100000000000).toString();
            const ERC20amount_2 = getRandomAmount(100000, 100000000000).toString();
            ERC20balancesBeforeUpdate.push({
                contractAddress: ERC20Contract_1.address,
                address: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC20amount_1]),
                decodedAmount: ERC20amount_1
            }, {
                contractAddress: ERC20Contract_2.address,
                address: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC20amount_2]),
                decodedAmount: ERC20amount_2
            });

            const ERC20amount_after_1 = (parseInt(ERC20amount_1, 10) + getRandomAmount(100000, 100000000000)).toString();
            const ERC20amount_after_2 = (parseInt(ERC20amount_2, 10) + getRandomAmount(100000, 100000000000)).toString();
            ERC20balancesAfterUpdate.push({
                contractAddress: ERC20Contract_1.address,
                address: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC20amount_after_1]),
                decodedAmount: ERC20amount_after_1
            }, {
                contractAddress: ERC20Contract_2.address,
                address: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC20amount_after_2]),
                decodedAmount: ERC20amount_after_2
            });

            const ERC721amount_1 = getRandomAmount(1, 3).toString();
            const ERC721amount_2 = getRandomAmount(1, 3).toString();
            ERC721balancesBeforeUpdate.push({
                contractAddress: ERC721Contract_1.address,
                address: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC721amount_1]),
                decodedAmount: ERC721amount_1
            }, {
                contractAddress: ERC721Contract_2.address,
                address: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC721amount_2]),
                decodedAmount: ERC721amount_2
            });

            const ERC721amount_after_1 = (parseInt(ERC721amount_1, 10) + getRandomAmount(1, 3)).toString();
            const ERC721amount_after_2 = (parseInt(ERC721amount_2, 10) + getRandomAmount(1, 3)).toString();
            ERC721balancesAfterUpdate.push({
                contractAddress: ERC721Contract_1.address,
                address: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC721amount_after_1]),
                decodedAmount: ERC721amount_after_1
            }, {
                contractAddress: ERC721Contract_2.address,
                address: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC721amount_after_2]),
                decodedAmount: ERC721amount_after_2
            });

            const ERC1155amount_ID_1_1 = getRandomAmount(1, 3).toString();
            const ERC1155amount_ID_1_2 = getRandomAmount(1, 3).toString();
            const ERC1155amount_ID_3_1 = getRandomAmount(1, 3).toString();
            const ERC1155amount_ID_3_2 = getRandomAmount(1, 3).toString();
            ERC1155balancesBeforeUpdate.push({
                contractAddress: ERC1155Contract_1.address,
                address: accounts[i].address,
                tokenId: ethers.utils.defaultAbiCoder.encode(['uint256'], [1]),
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC1155amount_ID_1_1]),
                decodedAmount: ERC1155amount_ID_1_1
            }, {
                contractAddress: ERC1155Contract_1.address,
                address: accounts[i].address,
                tokenId: ethers.utils.defaultAbiCoder.encode(['uint256'], [3]),
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC1155amount_ID_3_1]),
                decodedAmount: ERC1155amount_ID_3_1
            }, {
                contractAddress: ERC1155Contract_2.address,
                address: accounts[i].address,
                tokenId: ethers.utils.defaultAbiCoder.encode(['uint256'], [1]),
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC1155amount_ID_1_2]),
                decodedAmount: ERC1155amount_ID_1_2
            }, {
                contractAddress: ERC1155Contract_2.address,
                address: accounts[i].address,
                tokenId: ethers.utils.defaultAbiCoder.encode(['uint256'], [3]),
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC1155amount_ID_3_2]),
                decodedAmount: ERC1155amount_ID_3_2
            });

            const ERC1155amount_after_ID_1_1 = (parseInt(ERC1155amount_ID_1_1, 10) + getRandomAmount(1, 3)).toString();
            const ERC1155amount_after_ID_1_2 = (parseInt(ERC1155amount_ID_1_2, 10) + getRandomAmount(1, 3)).toString();
            const ERC1155amount_after_ID_3_1 = (parseInt(ERC1155amount_ID_3_1, 10) + getRandomAmount(1, 3)).toString();
            const ERC1155amount_after_ID_3_2 = (parseInt(ERC1155amount_ID_3_2, 10) + getRandomAmount(1, 3)).toString();
            ERC1155balancesAfterUpdate.push({
                contractAddress: ERC1155Contract_1.address,
                address: accounts[i].address,
                tokenId: ethers.utils.defaultAbiCoder.encode(['uint256'], [1]),
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC1155amount_after_ID_1_1]),
                decodedAmount: ERC1155amount_after_ID_1_1
            }, {
                contractAddress: ERC1155Contract_1.address,
                address: accounts[i].address,
                tokenId: ethers.utils.defaultAbiCoder.encode(['uint256'], [3]),
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC1155amount_after_ID_3_1]),
                decodedAmount: ERC1155amount_after_ID_3_1
            }, {
                contractAddress: ERC1155Contract_2.address,
                address: accounts[i].address,
                tokenId: ethers.utils.defaultAbiCoder.encode(['uint256'], [1]),
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC1155amount_after_ID_1_2]),
                decodedAmount: ERC1155amount_after_ID_1_2
            }, {
                contractAddress: ERC1155Contract_2.address,
                address: accounts[i].address,
                tokenId: ethers.utils.defaultAbiCoder.encode(['uint256'], [3]),
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [ERC1155amount_after_ID_3_2]),
                decodedAmount: ERC1155amount_after_ID_3_2
            });

            const AVAXamount = getRandomAmount(100000000000000000, 300000000000000000).toString();
            AVAXbalancesBeforeUpdate.push({
                address: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [AVAXamount]),
                decodedAmount: AVAXamount
            });

            const AVAXamount_after = (parseInt(AVAXamount, 10) + getRandomAmount(100000000000000000, 300000000000000000)).toString();
            AVAXbalancesAfterUpdate.push({
                address: accounts[i].address,
                amount: ethers.utils.defaultAbiCoder.encode(['uint256'], [AVAXamount_after]),
                decodedAmount: AVAXamount_after
            });
        }
    })

    describe("Deployment and configuration", () => {

        it("Should deploy 'MultiTokenClaim' contract.", async () => {
            const MultiTokenClaim = await ethers.getContractFactory("MultiTokenClaim");
            multiTokenClaim = await MultiTokenClaim.connect(owner).deploy();
            expect(multiTokenClaim.address).to.not.be.undefined;
        });

        it("Should be able to update start id for NFT contract.", async () => {
            await multiTokenClaim.connect(owner).updateStartId(ERC721Contract_2.address, 1);
            expect(await multiTokenClaim.startIdByContractAddress(ERC721Contract_2.address)).to.be.equal(1);
        });


        describe("Roles", () => {
            it("Should revert with 'Only admin can call this function' when non-owner tries to add 'ROOT_UPDATER' to user.", async () => {
                await expect(multiTokenClaim.connect(accounts[1]).addRootUpdater(accounts[1].address)).to.be.revertedWith("Only admin can call this function");
            });

            it("Should be able to add 'ROOT_UPDATER' role to user for owner", async () => {
                await multiTokenClaim.connect(owner).addRootUpdater(accounts[1].address);
                const ROOT_UPDATER = keccak256("ROOT_UPDATER");
                expect(await multiTokenClaim.hasRole(ROOT_UPDATER, accounts[1].address)).to.be.true;
            });

            it("Should revert with 'Only admin can call this function' when non-owner tries to remove 'ROOT_UPDATER' to user.", async () => {
                await expect(multiTokenClaim.connect(accounts[1]).removeRootUpdater(accounts[1].address)).to.be.revertedWith("Only admin can call this function");
            });

            it("Should be able to remove 'ROOT_UPDATER' role to user for owner", async () => {
                await multiTokenClaim.connect(owner).removeRootUpdater(accounts[1].address);
                const ROOT_UPDATER = keccak256("ROOT_UPDATER");
                expect(await multiTokenClaim.hasRole(ROOT_UPDATER, accounts[1].address)).to.be.false;
            });
        });

        describe("Roots", () => {
            it("Should revert with 'Only ROOT_UPDATER can call this function' when non-owner tries to update every merkle roots.", async () => {
                const merkleRoot = ethers.utils.keccak256("0x00");
                await expect(multiTokenClaim.connect(accounts[0]).updateMerkleRootERC20(merkleRoot)).to.be.revertedWith("Only ROOT_UPDATER can call this function");
                await expect(multiTokenClaim.connect(accounts[0]).updateMerkleRootERC721(merkleRoot)).to.be.revertedWith("Only ROOT_UPDATER can call this function");
                await expect(multiTokenClaim.connect(accounts[0]).updateMerkleRootERC1155(merkleRoot)).to.be.revertedWith("Only ROOT_UPDATER can call this function");
            });

            it("Should be able to update every merkle roots when 'ROOT_UPDATER' user try to update.", async () => {
                const ERC20merkleRoot = getERC20MerkleRoot(ERC20balancesBeforeUpdate);
                const ERC721merkleRoot = getERC721MerkleRoot(ERC721balancesBeforeUpdate);
                const ERC1155merkleRoot = getERC1155MerkleRoot(ERC1155balancesBeforeUpdate);
                const AVAXmerkleRoot = getAVAXMerkleRoot(AVAXbalancesBeforeUpdate);

                await expect(multiTokenClaim.connect(owner).updateMerkleRootERC20(ERC20merkleRoot)).to.emit(multiTokenClaim, "ERC20MerkleRootUpdated");
                expect(await multiTokenClaim.merkleRootERC20()).to.be.equal(ERC20merkleRoot);
                await expect(multiTokenClaim.connect(owner).updateMerkleRootERC721(ERC721merkleRoot)).to.emit(multiTokenClaim, "ERC721MerkleRootUpdated");
                expect(await multiTokenClaim.merkleRootERC721()).to.be.equal(ERC721merkleRoot);
                await expect(multiTokenClaim.connect(owner).updateMerkleRootERC1155(ERC1155merkleRoot)).to.emit(multiTokenClaim, "ERC1155MerkleRootUpdated");
                expect(await multiTokenClaim.merkleRootERC1155()).to.be.equal(ERC1155merkleRoot);
                await expect(multiTokenClaim.connect(owner).updateMerkleRootAVAX(AVAXmerkleRoot)).to.emit(multiTokenClaim, "AVAXMerkleRootUpdated");
                expect(await multiTokenClaim.merkleRootAVAX()).to.be.equal(AVAXmerkleRoot);
            });
        });
    });

    describe("Not enough tokens on contract", () => {

        it("Should revert with 'Contract doesn't have enough tokens' when trying to claim tokens with insufficient balance ERC20 tokens.", async () => {
            let [merkleProof, line] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[0].address);
            const contractAddress = ERC20balancesBeforeUpdate[line].contractAddress;
            const amount = ERC20balancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[line]).claimERC20(contractAddress, amount, merkleProof)).to.be.revertedWith("Contract doesn't have enough tokens");
        });

        it("Should revert with 'Contract doesn't have enough tokens' when trying to claim tokens with insufficient balance ERC721 tokens.", async () => {
            let [merkleProof, line] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            const contractAddress = ERC721balancesBeforeUpdate[line].contractAddress;
            const amount = ERC721balancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[line]).claimERC721(contractAddress, amount, merkleProof)).to.be.revertedWith("Contract doesn't have enough tokens");
        });

        it("Should revert with 'Contract doesn't have enough tokens' when trying to claim tokens with insufficient balance ERC1155 tokens.", async () => {
            let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");
            const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
            const tokenId = ERC1155balancesBeforeUpdate[line].tokenId;
            const amount = ERC1155balancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[line]).claimERC1155(contractAddress, tokenId, amount, merkleProof)).to.be.revertedWith("Contract doesn't have enough tokens");
        });

        it("Should revert with 'Contract doesn't have enough tokens' when trying to claim tokens with insufficient balance AVAX.", async () => {
            let [merkleProof, line] = getAVAXMerkleProof(AVAXbalancesBeforeUpdate, accounts[0].address);
            const amount = AVAXbalancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[line]).claimAVAX(amount, merkleProof)).to.be.revertedWith("Contract doesn't have enough tokens");
        });

        it("Should revert with 'Contract doesn't have enough tokens' when trying to claims tokens with insufficient balance ERC20/ERC721/ERC1155/AVAX tokens in batch.", async () => {
            let [merkleProofERC20, lineERC20] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[0].address);
            let [merkleProofERC721, lineERC721] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            let [merkleProofERC1155, lineERC1155] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");
            let [merkleProofAVAX, lineAVAX] = getAVAXMerkleProof(AVAXbalancesBeforeUpdate, accounts[0].address);

            const contractAddressERC20 = ERC20balancesBeforeUpdate[lineERC20].contractAddress;
            const amountERC20 = ERC20balancesBeforeUpdate[lineERC20].amount;
            const contractAddressERC721 = ERC721balancesBeforeUpdate[lineERC721].contractAddress;
            const amountERC721 = ERC721balancesBeforeUpdate[lineERC721].amount;
            const contractAddressERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].contractAddress;
            const tokenIdERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].tokenId;
            const amountERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].amount;
            const amountAVAX = AVAXbalancesBeforeUpdate[lineAVAX].amount;

            const batchContractAddresses = [contractAddressERC20, contractAddressERC721, contractAddressERC1155, "0x0000000000000000000000000000000000000000"];
            const batchTokenIds = ["0", "0", tokenIdERC1155, "0"];
            const batchAmounts = [amountERC20, amountERC721, amountERC1155, amountAVAX];
            const batchMerkleProofs = [merkleProofERC20, merkleProofERC721, merkleProofERC1155, merkleProofAVAX];
            const batchTokenTypes = ["0", "1", "2", "3"];

            await expect(multiTokenClaim.connect(accounts[lineERC20]).batchClaim(batchContractAddresses, batchTokenIds, batchAmounts, batchMerkleProofs, batchTokenTypes)).to.be.revertedWith("Contract doesn't have enough tokens");

        });
    });

    describe("Receive tokens", () => {
        it("Should be able to receive ERC20 tokens.", async () => {
            await ERC20Contract_1.connect(owner).addMinter(owner.address);
            await ERC20Contract_1.connect(owner).mint(multiTokenClaim.address, ethers.utils.parseEther("10000000000000000"));
            expect(await ERC20Contract_1.balanceOf(multiTokenClaim.address)).to.be.equal(ethers.utils.parseEther("10000000000000000"));

            await ERC20Contract_2.connect(owner).addMinter(owner.address);
            await ERC20Contract_2.connect(owner).mint(multiTokenClaim.address, ethers.utils.parseEther("10000000000000000"));
            expect(await ERC20Contract_2.balanceOf(multiTokenClaim.address)).to.be.equal(ethers.utils.parseEther("10000000000000000"));
        });

        it("Should be able to receive ERC721 tokens.", async () => {
            await ERC721Contract_1.connect(owner).mint(multiTokenClaim.address, 100);
            expect(await ERC721Contract_1.balanceOf(multiTokenClaim.address)).to.be.equal(100);

            await ERC721Contract_2.connect(owner).mint(multiTokenClaim.address, 100);
            expect(await ERC721Contract_2.balanceOf(multiTokenClaim.address)).to.be.equal(100);
        });

        it("Should be able to receive ERC1155 tokens.", async () => {
            await ERC1155Contract_1.connect(owner).mint(multiTokenClaim.address);
            expect(await ERC1155Contract_1.balanceOf(multiTokenClaim.address, 1)).to.be.equal(1000);
            expect(await ERC1155Contract_1.balanceOf(multiTokenClaim.address, 3)).to.be.equal(ethers.utils.parseEther("1000000000000000000"));

            await ERC1155Contract_2.connect(owner).mint(multiTokenClaim.address);
            expect(await ERC1155Contract_2.balanceOf(multiTokenClaim.address, 1)).to.be.equal(1000);
            expect(await ERC1155Contract_2.balanceOf(multiTokenClaim.address, 3)).to.be.equal(ethers.utils.parseEther("1000000000000000000"));
        });

        it("Should be able to receive AVAX tokens", async () => {
            await multiTokenClaim.connect(owner).addAVAX({value: ethers.utils.parseEther("10")});
            expect(await ethers.provider.getBalance(multiTokenClaim.address)).to.be.equal(ethers.utils.parseEther("10"));
        });
    });

    describe("Revert for 'Invalid proof.' (before update)", () => {
        it("Should revert with 'Invalid proof.' when trying to claim tokens with invalid proof ERC20 tokens.", async () => {
            let [merkleProof, line] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[0].address);
            const contractAddress = ERC20balancesBeforeUpdate[line].contractAddress;
            const amount = ERC20balancesBeforeUpdate[line].amount;
            merkleProof[0] = "0x0000000000000000000000000000000000000000000000000000000000000000";
            await expect(multiTokenClaim.connect(accounts[line]).claimERC20(contractAddress, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with invalid amount ERC20 tokens.", async () => {
            let [merkleProof, line] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[0].address);
            const contractAddress = ERC20balancesBeforeUpdate[line].contractAddress;
            const amount = "1000000";
            await expect(multiTokenClaim.connect(accounts[line]).claimERC20(contractAddress, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with invalid contractAddress ERC20 tokens.", async () => {
            let [merkleProof, line] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[0].address);
            const amount = ERC20balancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[line]).claimERC20(ERC20Contract_2.address, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with invalid proof ERC721 tokens.", async () => {
            let [merkleProof, line] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            const contractAddress = ERC721balancesBeforeUpdate[line].contractAddress;
            const amount = ERC721balancesBeforeUpdate[line].amount;
            merkleProof[0] = "0x0000000000000000000000000000000000000000000000000000000000000000";
            await expect(multiTokenClaim.connect(accounts[line]).claimERC721(contractAddress, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with invalid amount ERC721 tokens.", async () => {
            let [merkleProof, line] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            const contractAddress = ERC721balancesBeforeUpdate[line].contractAddress;
            const amount = "100";
            await expect(multiTokenClaim.connect(accounts[line]).claimERC721(contractAddress, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with another account ERC721 tokens.", async () => {
            let [merkleProof, line] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            const contractAddress = ERC721balancesBeforeUpdate[line].contractAddress;
            const amount = ERC721balancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[1]).claimERC721(contractAddress, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with invalid contractAddress ERC721 tokens.", async () => {
            let [merkleProof, line] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            const amount = ERC721balancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[line]).claimERC721(ERC721Contract_2.address, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with invalid proof ERC1155 tokens.", async () => {
            let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");
            const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
            const tokenId = ERC1155balancesBeforeUpdate[line].tokenId;
            const amount = ERC1155balancesBeforeUpdate[line].amount;
            merkleProof[0] = "0x0000000000000000000000000000000000000000000000000000000000000000";
            await expect(multiTokenClaim.connect(accounts[line]).claimERC1155(contractAddress, tokenId, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with invalid amount ERC1155 tokens.", async () => {
            let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");
            const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
            const tokenId = ERC1155balancesBeforeUpdate[line].tokenId;
            const amount = "100";
            await expect(multiTokenClaim.connect(accounts[line]).claimERC1155(contractAddress, tokenId, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with invalid contractAddress ERC1155 tokens.", async () => {
            let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");
            const tokenId = ERC1155balancesBeforeUpdate[line].tokenId;
            const amount = ERC1155balancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[line]).claimERC1155(ERC1155Contract_2.address, tokenId, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with invalid tokenId ERC1155 tokens.", async () => {
            let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");
            const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
            const amount = ERC1155balancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[line]).claimERC1155(contractAddress, "2", amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with another account ERC1155 tokens.", async () => {
            let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");
            const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
            const tokenId = ERC1155balancesBeforeUpdate[line].tokenId;
            const amount = ERC1155balancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[1]).claimERC1155(contractAddress, tokenId, amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim AVAX tokens with invalid amount.", async () => {
            let [merkleProof, line] = getAVAXMerkleProof(AVAXbalancesBeforeUpdate, accounts[0].address);
            const amount = "1000";
            await expect(multiTokenClaim.connect(accounts[line]).claimAVAX(amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim AVAX tokens with invalid proof.", async () => {
            let [merkleProof, line] = getAVAXMerkleProof(AVAXbalancesBeforeUpdate, accounts[0].address);
            const amount = AVAXbalancesBeforeUpdate[line].amount;
            merkleProof[0] = "0x0000000000000000000000000000000000000000000000000000000000000000";
            await expect(multiTokenClaim.connect(accounts[line]).claimAVAX(amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim AVAX tokens with another account.", async () => {
            let [merkleProof, line] = getAVAXMerkleProof(AVAXbalancesBeforeUpdate, accounts[0].address);
            const amount = AVAXbalancesBeforeUpdate[line].amount;
            await expect(multiTokenClaim.connect(accounts[1]).claimAVAX(amount, merkleProof)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with at least one invalid proof for batchClaim.", async () => {
            let [merkleProofERC20, lineERC20] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[0].address);
            let [merkleProofERC721, lineERC721] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            let [merkleProofERC1155, lineERC1155] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");

            const contractAddressERC20 = ERC20balancesBeforeUpdate[lineERC20].contractAddress;
            const amountERC20 = ERC20balancesBeforeUpdate[lineERC20].amount;
            const contractAddressERC721 = ERC721balancesBeforeUpdate[lineERC721].contractAddress;
            const amountERC721 = ERC721balancesBeforeUpdate[lineERC721].amount;
            const contractAddressERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].contractAddress;
            const tokenIdERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].tokenId;
            const amountERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].amount;

            merkleProofERC20[0] = "0x0000000000000000000000000000000000000000000000000000000000000000";

            const batchContractAddresses = [contractAddressERC20, contractAddressERC721, contractAddressERC1155];
            const batchTokenIds = ["0", "0", tokenIdERC1155];
            const batchAmounts = [amountERC20, amountERC721, amountERC1155];
            const batchMerkleProofs = [merkleProofERC20, merkleProofERC721, merkleProofERC1155];
            const batchTokenTypes = ["0", "1", "2"];

            await expect(multiTokenClaim.connect(accounts[lineERC20]).batchClaim(batchContractAddresses, batchTokenIds, batchAmounts, batchMerkleProofs, batchTokenTypes)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with at least one invalid amount for batchClaim.", async () => {
            let [merkleProofERC20, lineERC20] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[0].address);
            let [merkleProofERC721, lineERC721] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            let [merkleProofERC1155, lineERC1155] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");

            const contractAddressERC20 = ERC20balancesBeforeUpdate[lineERC20].contractAddress;
            const amountERC20 = "100";
            const contractAddressERC721 = ERC721balancesBeforeUpdate[lineERC721].contractAddress;
            const amountERC721 = ERC721balancesBeforeUpdate[lineERC721].amount;
            const contractAddressERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].contractAddress;
            const tokenIdERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].tokenId;
            const amountERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].amount;

            const batchContractAddresses = [contractAddressERC20, contractAddressERC721, contractAddressERC1155];
            const batchTokenIds = ["0", "0", tokenIdERC1155];
            const batchAmounts = [amountERC20, amountERC721, amountERC1155];
            const batchMerkleProofs = [merkleProofERC20, merkleProofERC721, merkleProofERC1155];
            const batchTokenTypes = ["0", "1", "2"];

            await expect(multiTokenClaim.connect(accounts[lineERC20]).batchClaim(batchContractAddresses, batchTokenIds, batchAmounts, batchMerkleProofs, batchTokenTypes)).to.be.revertedWith("Invalid proof.");
        });

        it("Should revert with 'Invalid proof.' when trying to claim tokens with at least one invalid contractAddress for batchClaim.", async () => {
            let [merkleProofERC20, lineERC20] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[0].address);
            let [merkleProofERC721, lineERC721] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            let [merkleProofERC1155, lineERC1155] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");

            const contractAddressERC20 = ERC20balancesBeforeUpdate[lineERC20].contractAddress;
            const amountERC20 = ERC20balancesBeforeUpdate[lineERC20].amount;
            const contractAddressERC721 = ERC721balancesBeforeUpdate[lineERC721].contractAddress;
            const amountERC721 = ERC721balancesBeforeUpdate[lineERC721].amount;
            const contractAddressERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].contractAddress;
            const tokenIdERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].tokenId;
            const amountERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].amount;

            const batchContractAddresses = [ERC20Contract_2.address, contractAddressERC721, contractAddressERC1155];
            const batchTokenIds = ["0", "0", tokenIdERC1155];
            const batchAmounts = [amountERC20, amountERC721, amountERC1155];
            const batchMerkleProofs = [merkleProofERC20, merkleProofERC721, merkleProofERC1155];
            const batchTokenTypes = ["0", "1", "2"];

            await expect(multiTokenClaim.connect(accounts[lineERC20]).batchClaim(batchContractAddresses, batchTokenIds, batchAmounts, batchMerkleProofs, batchTokenTypes)).to.be.revertedWith("Invalid proof.");
        });
    });

    describe("Revert on batchClaim", () => {
        it("Should revert with 'Invalid token type.' when trying to claim tokens with at least one invalid tokenType for batchClaim.", async () => {
            let [merkleProofERC20, lineERC20] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[0].address);
            let [merkleProofERC721, lineERC721] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            let [merkleProofERC1155, lineERC1155] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");

            const contractAddressERC20 = ERC20balancesBeforeUpdate[lineERC20].contractAddress;
            const amountERC20 = ERC20balancesBeforeUpdate[lineERC20].amount;
            const contractAddressERC721 = ERC721balancesBeforeUpdate[lineERC721].contractAddress;
            const amountERC721 = ERC721balancesBeforeUpdate[lineERC721].amount;
            const contractAddressERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].contractAddress;
            const tokenIdERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].tokenId;
            const amountERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].amount;

            const batchContractAddresses = [contractAddressERC20, contractAddressERC721, contractAddressERC1155];
            const batchTokenIds = ["0", "0", tokenIdERC1155];
            const batchAmounts = [amountERC20, amountERC721, amountERC1155];
            const batchMerkleProofs = [merkleProofERC20, merkleProofERC721, merkleProofERC1155];
            const batchTokenTypes = ["0", "1", "4"];

            await expect(multiTokenClaim.connect(accounts[lineERC20]).batchClaim(batchContractAddresses, batchTokenIds, batchAmounts, batchMerkleProofs, batchTokenTypes)).to.be.revertedWith("Invalid token type.");
        });

        it("Should revert when trying to claim tokens with at least one wrong tokenType for batchClaim.", async () => {
            let [merkleProofERC20, lineERC20] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[0].address);
            let [merkleProofERC721, lineERC721] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[0].address);
            let [merkleProofERC1155, lineERC1155] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[0].address, "1");

            const contractAddressERC20 = ERC20balancesBeforeUpdate[lineERC20].contractAddress;
            const amountERC20 = ERC20balancesBeforeUpdate[lineERC20].amount;
            const contractAddressERC721 = ERC721balancesBeforeUpdate[lineERC721].contractAddress;
            const amountERC721 = ERC721balancesBeforeUpdate[lineERC721].amount;
            const contractAddressERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].contractAddress;
            const tokenIdERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].tokenId;
            const amountERC1155 = ERC1155balancesBeforeUpdate[lineERC1155].amount;

            const batchContractAddresses = [contractAddressERC20, contractAddressERC721, contractAddressERC1155];
            const batchTokenIds = ["0", "0", tokenIdERC1155];
            const batchAmounts = [amountERC20, amountERC721, amountERC1155];
            const batchMerkleProofs = [merkleProofERC20, merkleProofERC721, merkleProofERC1155];
            const batchTokenTypes = ["0", "1", "1"];

            await expect(multiTokenClaim.connect(accounts[lineERC20]).batchClaim(batchContractAddresses, batchTokenIds, batchAmounts, batchMerkleProofs, batchTokenTypes)).to.be.reverted;
        });
    });

    describe("Able to claim (before update)", () => {
        it("Should be able to claim ERC20 tokens for first ERC20 contract (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[i].address);
                const contractAddress = ERC20balancesBeforeUpdate[line].contractAddress;
                const amount = ERC20balancesBeforeUpdate[line].amount;
                const decodedAmount = ERC20balancesBeforeUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC20(contractAddress, amount, merkleProof)).to.emit(multiTokenClaim, "ERC20Claimed");
                expect(await ERC20Contract_1.balanceOf(accounts[i].address)).to.be.equal(decodedAmount);
            }
        });

        it("Should be able to claim ERC20 tokens for second ERC20 contract (5 firsts accounts).", async () => {
            for (let i = 5; i < 10; i++) {
                let [merkleProof, line] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_2.address, accounts[i].address);
                const contractAddress = ERC20balancesBeforeUpdate[line].contractAddress;
                const amount = ERC20balancesBeforeUpdate[line].amount;
                const decodedAmount = ERC20balancesBeforeUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC20(contractAddress, amount, merkleProof)).to.emit(multiTokenClaim, "ERC20Claimed");
                expect(await ERC20Contract_2.balanceOf(accounts[i].address)).to.be.equal(decodedAmount);
            }
        });

        it("Should be able to claim ERC721 tokens for first ERC721 contract (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[i].address);
                const contractAddress = ERC721balancesBeforeUpdate[line].contractAddress;
                const amount = ERC721balancesBeforeUpdate[line].amount;
                const decodedAmount = ERC721balancesBeforeUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC721(contractAddress, amount, merkleProof)).to.emit(multiTokenClaim, "ERC721Claimed");
                expect(await ERC721Contract_1.balanceOf(accounts[i].address)).to.be.equal(decodedAmount);
            }
        });

        it("Should be able to claim ERC721 tokens for second ERC721 contract (5 firsts accounts).", async () => {
            for (let i = 5; i < 10; i++) {
                let [merkleProof, line] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_2.address, accounts[i].address);
                const contractAddress = ERC721balancesBeforeUpdate[line].contractAddress;
                const amount = ERC721balancesBeforeUpdate[line].amount;
                const decodedAmount = ERC721balancesBeforeUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC721(contractAddress, amount, merkleProof)).to.emit(multiTokenClaim, "ERC721Claimed");
                expect(await ERC721Contract_2.balanceOf(accounts[i].address)).to.be.equal(decodedAmount);
            }
        });

        it("Should be able to claim ERC1155 tokens for first ERC1155 (ID 1) contract (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[i].address, "1");
                const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
                const amount = ERC1155balancesBeforeUpdate[line].amount;
                const decodedAmount = ERC1155balancesBeforeUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "1", amount, merkleProof)).to.emit(multiTokenClaim, "ERC1155Claimed");
                expect(await ERC1155Contract_1.balanceOf(accounts[i].address, 1)).to.be.equal(decodedAmount);
            }
        });

        it("Should be able to claim ERC1155 tokens for first ERC1155 (ID 3) contract (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[i].address, "3");
                const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
                const amount = ERC1155balancesBeforeUpdate[line].amount;
                const decodedAmount = ERC1155balancesBeforeUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "3", amount, merkleProof)).to.emit(multiTokenClaim, "ERC1155Claimed");
                expect(await ERC1155Contract_1.balanceOf(accounts[i].address, 3)).to.be.equal(decodedAmount);
            }
        });

        it("Should be able to claim ERC1155 tokens for second ERC1155 (ID 1) contract (5 firsts accounts).", async () => {
            for (let i = 5; i < 10; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_2.address, accounts[i].address, "1");
                const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
                const amount = ERC1155balancesBeforeUpdate[line].amount;
                const decodedAmount = ERC1155balancesBeforeUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "1", amount, merkleProof)).to.emit(multiTokenClaim, "ERC1155Claimed");
                expect(await ERC1155Contract_2.balanceOf(accounts[i].address, 1)).to.be.equal(decodedAmount);
            }
        });

        it("Should be able to claim ERC1155 tokens for second ERC1155 (ID 3) contract (5 firsts accounts).", async () => {
            for (let i = 5; i < 10; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_2.address, accounts[i].address, "3");
                const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
                const amount = ERC1155balancesBeforeUpdate[line].amount;
                const decodedAmount = ERC1155balancesBeforeUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "3", amount, merkleProof)).to.emit(multiTokenClaim, "ERC1155Claimed");
                expect(await ERC1155Contract_2.balanceOf(accounts[i].address, 3)).to.be.equal(decodedAmount);
            }
        });

        it("Should be able to claim AVAX tokens (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getAVAXMerkleProof(AVAXbalancesBeforeUpdate, accounts[i].address);
                const decodedAmount = AVAXbalancesBeforeUpdate[line].decodedAmount;
                const balanceOfUserBeforeClaim = await ethers.provider.getBalance(accounts[i].address);
                await expect(multiTokenClaim.connect(accounts[i]).claimAVAX(decodedAmount, merkleProof)).to.emit(multiTokenClaim, "AVAXClaimed");
                const balanceOfUserAfterClaim = await ethers.provider.getBalance(accounts[i].address);
                const balanceDifference = balanceOfUserAfterClaim.sub(balanceOfUserBeforeClaim);
                expect(balanceDifference).to.be.greaterThanOrEqual(ethers.utils.parseEther('0.1'));
            }
        });

        it("Should be able to claim tokens (5 lasts accounts) with batchClaim and to emit 'BatchClaimed' event.", async () => {
            for (let i = 5; i < 10; i++) {
                let [merkleProofERC20, lineERC20] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[i].address);
                let [merkleProofERC721, lineERC721] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[i].address);
                let [merkleProofERC1155_1, lineERC1155_1] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[i].address, "1");
                let [merkleProofERC1155_3, lineERC1155_3] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[i].address, "3");
                let [merkleProofAVAX, lineAVAX] = getAVAXMerkleProof(AVAXbalancesBeforeUpdate, accounts[i].address);

                const contractAddressERC20 = ERC20balancesBeforeUpdate[lineERC20].contractAddress;
                const amountERC20 = ERC20balancesBeforeUpdate[lineERC20].amount;
                const contractAddressERC721 = ERC721balancesBeforeUpdate[lineERC721].contractAddress;
                const amountERC721 = ERC721balancesBeforeUpdate[lineERC721].amount;
                const contractAddressERC1155_1 = ERC1155balancesBeforeUpdate[lineERC1155_1].contractAddress;
                const tokenIdERC1155_1 = ERC1155balancesBeforeUpdate[lineERC1155_1].tokenId;
                const amountERC1155_1 = ERC1155balancesBeforeUpdate[lineERC1155_1].amount;
                const contractAddressERC1155_3 = ERC1155balancesBeforeUpdate[lineERC1155_3].contractAddress;
                const tokenIdERC1155_3 = ERC1155balancesBeforeUpdate[lineERC1155_3].tokenId;
                const amountERC1155_3 = ERC1155balancesBeforeUpdate[lineERC1155_3].amount;
                const amountAVAX = AVAXbalancesBeforeUpdate[lineAVAX].amount;


                const batchContractAddresses = [contractAddressERC20, contractAddressERC721, contractAddressERC1155_1, contractAddressERC1155_3, "0x0000000000000000000000000000000000000000"];
                const batchTokenIds = ["0", "0", tokenIdERC1155_1, tokenIdERC1155_3, "0"];
                const batchAmounts = [amountERC20, amountERC721, amountERC1155_1, amountERC1155_3, amountAVAX];
                const batchMerkleProofs = [merkleProofERC20, merkleProofERC721, merkleProofERC1155_1, merkleProofERC1155_3, merkleProofAVAX];
                const batchTokenTypes = ["0", "1", "2", "2", "3"];

                const balanceOfUserBeforeClaim = await ethers.provider.getBalance(accounts[i].address);

                await expect(multiTokenClaim.connect(accounts[i]).batchClaim(batchContractAddresses, batchTokenIds, batchAmounts, batchMerkleProofs, batchTokenTypes)).to.emit(multiTokenClaim, "BatchClaimed").withArgs(accounts[i].address);

                const balanceOfUserAfterClaim = await ethers.provider.getBalance(accounts[i].address);

                expect(await ERC20Contract_1.balanceOf(accounts[i].address)).to.be.equal(ERC20balancesBeforeUpdate[lineERC20].decodedAmount);
                expect(await ERC721Contract_1.balanceOf(accounts[i].address)).to.be.equal(ERC721balancesBeforeUpdate[lineERC721].decodedAmount);
                expect(await ERC1155Contract_1.balanceOf(accounts[i].address, 1)).to.be.equal(ERC1155balancesBeforeUpdate[lineERC1155_1].decodedAmount);
                expect(await ERC1155Contract_1.balanceOf(accounts[i].address, 3)).to.be.equal(ERC1155balancesBeforeUpdate[lineERC1155_3].decodedAmount);
                const balanceDifference = balanceOfUserAfterClaim.sub(balanceOfUserBeforeClaim).add(ethers.utils.parseEther('0.001'));
                expect(balanceDifference).to.be.greaterThanOrEqual(ethers.utils.parseEther('0.1'));
            }
        });
    });

    describe("Revert for 'Nothing to claim.' (before update)", () => {
        it("Should revert with 'Nothing to claim.' when trying to claim ERC20 tokens for first ERC20 contract (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[i].address);
                const contractAddress = ERC20balancesBeforeUpdate[line].contractAddress;
                const amount = ERC20balancesBeforeUpdate[line].amount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC20(contractAddress, amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim ERC20 tokens for second ERC20 contract (5 firsts accounts).", async () => {
            for (let i = 5; i < 10; i++) {
                let [merkleProof, line] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_2.address, accounts[i].address);
                const contractAddress = ERC20balancesBeforeUpdate[line].contractAddress;
                const amount = ERC20balancesBeforeUpdate[line].amount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC20(contractAddress, amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim ERC721 tokens for first ERC721 contract (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[i].address);
                const contractAddress = ERC721balancesBeforeUpdate[line].contractAddress;
                const amount = ERC721balancesBeforeUpdate[line].amount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC721(contractAddress, amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim ERC721 tokens for second ERC721 contract (5 firsts accounts).", async () => {
            for (let i = 5; i < 10; i++) {
                let [merkleProof, line] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_2.address, accounts[i].address);
                const contractAddress = ERC721balancesBeforeUpdate[line].contractAddress;
                const amount = ERC721balancesBeforeUpdate[line].amount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC721(contractAddress, amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim ERC1155 tokens for first ERC1155 (ID 1) contract (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[i].address, "1");
                const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
                const amount = ERC1155balancesBeforeUpdate[line].amount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "1", amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim ERC1155 tokens for first ERC1155 (ID 3) contract (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[i].address, "3");
                const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
                const amount = ERC1155balancesBeforeUpdate[line].amount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "3", amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim ERC1155 tokens for second ERC1155 (ID 1) contract (5 firsts accounts).", async () => {
            for (let i = 5; i < 10; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_2.address, accounts[i].address, "1");
                const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
                const amount = ERC1155balancesBeforeUpdate[line].amount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "1", amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim ERC1155 tokens for second ERC1155 (ID 3) contract (5 firsts accounts).", async () => {
            for (let i = 5; i < 10; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_2.address, accounts[i].address, "3");
                const contractAddress = ERC1155balancesBeforeUpdate[line].contractAddress;
                const amount = ERC1155balancesBeforeUpdate[line].amount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "3", amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim AVAX tokens (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getAVAXMerkleProof(AVAXbalancesBeforeUpdate, accounts[i].address);
                const amount = AVAXbalancesBeforeUpdate[line].amount;
                await expect(multiTokenClaim.connect(accounts[i]).claimAVAX(amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim tokens (5 lasts accounts) with batchClaim.", async () => {
            for (let i = 5; i < 10; i++) {
                let [merkleProofERC20, lineERC20] = getERC20MerkleProof(ERC20balancesBeforeUpdate, ERC20Contract_1.address, accounts[i].address);
                let [merkleProofERC721, lineERC721] = getERC721MerkleProof(ERC721balancesBeforeUpdate, ERC721Contract_1.address, accounts[i].address);
                let [merkleProofERC1155_1, lineERC1155_1] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[i].address, "1");
                let [merkleProofERC1155_3, lineERC1155_3] = getERC1155MerkleProof(ERC1155balancesBeforeUpdate, ERC1155Contract_1.address, accounts[i].address, "3");
                let [merkleProofAVAX, lineAVAX] = getAVAXMerkleProof(AVAXbalancesBeforeUpdate, accounts[i].address);

                const contractAddressERC20 = ERC20balancesBeforeUpdate[lineERC20].contractAddress;
                const amountERC20 = ERC20balancesBeforeUpdate[lineERC20].amount;
                const contractAddressERC721 = ERC721balancesBeforeUpdate[lineERC721].contractAddress;
                const amountERC721 = ERC721balancesBeforeUpdate[lineERC721].amount;
                const contractAddressERC1155_1 = ERC1155balancesBeforeUpdate[lineERC1155_1].contractAddress;
                const tokenIdERC1155_1 = ERC1155balancesBeforeUpdate[lineERC1155_1].tokenId;
                const amountERC1155_1 = ERC1155balancesBeforeUpdate[lineERC1155_1].amount;
                const contractAddressERC1155_3 = ERC1155balancesBeforeUpdate[lineERC1155_3].contractAddress;
                const tokenIdERC1155_3 = ERC1155balancesBeforeUpdate[lineERC1155_3].tokenId;
                const amountERC1155_3 = ERC1155balancesBeforeUpdate[lineERC1155_3].amount;
                const amountAVAX = AVAXbalancesBeforeUpdate[lineAVAX].amount;

                const batchContractAddresses = [contractAddressERC20, contractAddressERC721, contractAddressERC1155_1, contractAddressERC1155_3, "0x0000000000000000000000000000000000000000"];
                const batchTokenIds = ["0", "0", tokenIdERC1155_1, tokenIdERC1155_3, "0"];
                const batchAmounts = [amountERC20, amountERC721, amountERC1155_1, amountERC1155_3, amountAVAX];
                const batchMerkleProofs = [merkleProofERC20, merkleProofERC721, merkleProofERC1155_1, merkleProofERC1155_3, merkleProofAVAX];
                const batchTokenTypes = ["0", "1", "2", "2", "3"];

                await expect(multiTokenClaim.connect(accounts[i]).batchClaim(batchContractAddresses, batchTokenIds, batchAmounts, batchMerkleProofs, batchTokenTypes)).to.be.revertedWith("Nothing to claim.");
            }
        });
    });

    describe("Update merkle roots", () => {
        it("Should be able to update merkle roots", async () => {
            const ERC20merkleRoot = getERC20MerkleRoot(ERC20balancesAfterUpdate);
            const ERC721merkleRoot = getERC721MerkleRoot(ERC721balancesAfterUpdate);
            const ERC1155merkleRoot = getERC1155MerkleRoot(ERC1155balancesAfterUpdate);
            const AVAXmerkleRoot = getAVAXMerkleRoot(AVAXbalancesAfterUpdate);

            await expect(multiTokenClaim.connect(owner).updateMerkleRootERC20(ERC20merkleRoot)).to.emit(multiTokenClaim, "ERC20MerkleRootUpdated");
            expect(await multiTokenClaim.merkleRootERC20()).to.be.equal(ERC20merkleRoot);
            await expect(multiTokenClaim.connect(owner).updateMerkleRootERC721(ERC721merkleRoot)).to.emit(multiTokenClaim, "ERC721MerkleRootUpdated");
            expect(await multiTokenClaim.merkleRootERC721()).to.be.equal(ERC721merkleRoot);
            await expect(multiTokenClaim.connect(owner).updateMerkleRootERC1155(ERC1155merkleRoot)).to.emit(multiTokenClaim, "ERC1155MerkleRootUpdated");
            expect(await multiTokenClaim.merkleRootERC1155()).to.be.equal(ERC1155merkleRoot);
            await expect(multiTokenClaim.connect(owner).updateMerkleRootAVAX(AVAXmerkleRoot)).to.emit(multiTokenClaim, "AVAXMerkleRootUpdated");
            expect(await multiTokenClaim.merkleRootAVAX()).to.be.equal(AVAXmerkleRoot);
        });
    });

    describe("Able to claim (after update)", () => {
        it("Should be able to claim ERC20 tokens for first ERC20 (5 firsts accounts), by recovering the difference with what has already been claimed.", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC20MerkleProof(ERC20balancesAfterUpdate, ERC20Contract_1.address, accounts[i].address);
                const contractAddress = ERC20balancesAfterUpdate[line].contractAddress;
                const amount = ERC20balancesAfterUpdate[line].amount;
                const decodedAmount = ERC20balancesAfterUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC20(contractAddress, amount, merkleProof)).to.emit(multiTokenClaim, "ERC20Claimed");
                expect(await ERC20Contract_1.balanceOf(accounts[i].address)).to.be.equal(decodedAmount);
            }
        });

        it("Should be able to claim ERC721 tokens for first ERC721 (5 firsts accounts), by recovering the difference with what has already been claimed.", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC721MerkleProof(ERC721balancesAfterUpdate, ERC721Contract_1.address, accounts[i].address);
                const contractAddress = ERC721balancesAfterUpdate[line].contractAddress;
                const amount = ERC721balancesAfterUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC721(contractAddress, amount, merkleProof)).to.emit(multiTokenClaim, "ERC721Claimed");
                expect(await ERC721Contract_1.balanceOf(accounts[i].address)).to.be.equal(ERC721balancesAfterUpdate[line].decodedAmount);
            }
        });

        it("Should be able to claim ERC1155 tokens for first ERC1155 (ID 1) contract (5 firsts accounts), by recovering the difference with what has already been claimed.", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesAfterUpdate, ERC1155Contract_1.address, accounts[i].address, "1");
                const contractAddress = ERC1155balancesAfterUpdate[line].contractAddress;
                const amount = ERC1155balancesAfterUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "1", amount, merkleProof)).to.emit(multiTokenClaim, "ERC1155Claimed");
                expect(await ERC1155Contract_1.balanceOf(accounts[i].address, "1")).to.be.equal(ERC1155balancesAfterUpdate[line].decodedAmount);
            }
        });

        it("Should be able to claim ERC1155 tokens for first ERC1155 (ID 3) contract (5 firsts accounts), by recovering the difference with what has already been claimed.", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesAfterUpdate, ERC1155Contract_1.address, accounts[i].address, "3");
                const contractAddress = ERC1155balancesAfterUpdate[line].contractAddress;
                const amount = ERC1155balancesAfterUpdate[line].decodedAmount;

                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "3", amount, merkleProof)).to.emit(multiTokenClaim, "ERC1155Claimed");
                expect(await ERC1155Contract_1.balanceOf(accounts[i].address, "3")).to.be.equal(ERC1155balancesAfterUpdate[line].decodedAmount);
            }
        });

        it("Should be able to claim AVAX tokens (5 firsts accounts), by recovering the difference with what has already been claimed.", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getAVAXMerkleProof(AVAXbalancesAfterUpdate, accounts[i].address);
                const amount = AVAXbalancesAfterUpdate[line].decodedAmount;
                const balanceOfUserBeforeClaim = await ethers.provider.getBalance(accounts[i].address);

                await expect(multiTokenClaim.connect(accounts[i]).claimAVAX(amount, merkleProof)).to.emit(multiTokenClaim, "AVAXClaimed");
                const balanceOfUserAfterClaim = await ethers.provider.getBalance(accounts[i].address);
                const balanceDifference = balanceOfUserAfterClaim.sub(balanceOfUserBeforeClaim).add(ethers.utils.parseEther('0.001'));
                expect(balanceDifference).to.be.greaterThanOrEqual(ethers.utils.parseEther("0.1"));
            }
        });

    })

    describe("Revert for 'Nothing to claim. (after update)", () => {

        it("Should revert with 'Nothing to claim.' when trying to claim ERC20 tokens for first ERC20 contract (5 firsts accounts).", async () => {

            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC20MerkleProof(ERC20balancesAfterUpdate, ERC20Contract_1.address, accounts[i].address);
                const contractAddress = ERC20balancesAfterUpdate[line].contractAddress;
                const amount = ERC20balancesAfterUpdate[line].decodedAmount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC20(contractAddress, amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim ERC721 tokens for first ERC721 contract (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC721MerkleProof(ERC721balancesAfterUpdate, ERC721Contract_1.address, accounts[i].address);
                const contractAddress = ERC721balancesAfterUpdate[line].contractAddress;
                const amount = ERC721balancesAfterUpdate[line].decodedAmount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC721(contractAddress, amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim ERC1155 tokens for first ERC1155 contract (ID 1) (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesAfterUpdate, ERC1155Contract_1.address, accounts[i].address, "1");
                const contractAddress = ERC1155balancesAfterUpdate[line].contractAddress;
                const amount = ERC1155balancesAfterUpdate[line].decodedAmount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "1", amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

        it("Should revert with 'Nothing to claim.' when trying to claim ERC1155 tokens for first ERC1155 contract (ID 3) (5 firsts accounts).", async () => {
            for (let i = 0; i < 5; i++) {
                let [merkleProof, line] = getERC1155MerkleProof(ERC1155balancesAfterUpdate, ERC1155Contract_1.address, accounts[i].address, "3");
                const contractAddress = ERC1155balancesAfterUpdate[line].contractAddress;
                const amount = ERC1155balancesAfterUpdate[line].decodedAmount;
                await expect(multiTokenClaim.connect(accounts[i]).claimERC1155(contractAddress, "3", amount, merkleProof)).to.be.revertedWith("Nothing to claim.");
            }
        });

    });

    describe("Admin function tests", () => {

        it("Should revert with 'Only admin can call this function' when trying to call adminWithdraw function.", async () => {
            const contractAddresses = [ERC20Contract_1.address, ERC20Contract_2.address, ERC721Contract_1.address, ERC721Contract_2.address, ERC1155Contract_1.address, ERC1155Contract_2.address];
            const toAddress = [accounts[0].address, accounts[0].address, accounts[0].address, accounts[0].address, accounts[0].address, accounts[0].address];
            const tokensIds = [[], [], [], [], ["1", "3"], ["1", "3"]];
            const tokenTypes = [0, 0, 1, 1, 2, 2];

            await expect(multiTokenClaim.connect(accounts[0]).adminWithdraw(contractAddresses, toAddress, tokensIds, tokenTypes)).to.be.revertedWith("Only admin can call this function");
        });

        it("Should be able to call adminWithdraw function, balance of contract should be empty for every tokens.", async () => {
            const contractAddresses = [ERC20Contract_1.address, ERC20Contract_2.address, ERC721Contract_1.address, ERC721Contract_2.address, ERC1155Contract_1.address, ERC1155Contract_2.address];
            const toAddress = [owner.address, owner.address, owner.address, owner.address, owner.address, owner.address];
            const tokensIds = [[], [], [], [], ["1", "3"], ["1", "3"]];
            const tokenTypes = [0, 0, 1, 1, 2, 2];

            await expect(multiTokenClaim.adminWithdraw(contractAddresses, toAddress, tokensIds, tokenTypes)).to.not.reverted;
            expect(await ERC20Contract_1.balanceOf(multiTokenClaim.address)).to.be.equal(0);
            expect(await ERC20Contract_2.balanceOf(multiTokenClaim.address)).to.be.equal(0);
            expect(await ERC721Contract_1.balanceOf(multiTokenClaim.address)).to.be.equal(0);
            expect(await ERC721Contract_2.balanceOf(multiTokenClaim.address)).to.be.equal(0);
            expect(await ERC1155Contract_1.balanceOf(multiTokenClaim.address, "1")).to.be.equal(0);
            expect(await ERC1155Contract_1.balanceOf(multiTokenClaim.address, "3")).to.be.equal(0);
            expect(await ERC1155Contract_2.balanceOf(multiTokenClaim.address, "1")).to.be.equal(0);
            expect(await ERC1155Contract_2.balanceOf(multiTokenClaim.address, "3")).to.be.equal(0);
        });

        it("Should revert with 'Only admin can call this function' when trying to call withdraw function.", async () => {
            await expect(multiTokenClaim.connect(accounts[0]).withdraw()).to.be.revertedWith("Only admin can call this function");
        });

        it("Should be able to withdraw all AVAX from contract", async () => {
            await expect(multiTokenClaim.withdraw()).to.not.reverted;
            const balance = await ethers.provider.getBalance(multiTokenClaim.address);
            expect(balance).to.be.equal(0);
        });
    });
})
