
## ERC20 - Merkle Airdrop

Follow the tutorial at [this address](https://soliditydeveloper.com/merkle-tree).

The goal is to use Merkle trees to create an ERC20 (or ERC721) token airdrop system that is gas efficient. 

It is the user who has to come and claim his rewards by himself, with a defined amount. 

The goal is to store only one Merkle root on the contract. The claim will be done thanks to a proof that will have to be computed by the dApp that allows to receive the airdrop. 

This way, it is not possible to cheat, and it does not cost too much to the project that wants to realize the airdrop.

## Author

- [@0xNekr](https://www.github.com/0xNekr)

