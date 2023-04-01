/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BytesLike,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  MerkleMultipleAirdrop,
  MerkleMultipleAirdropInterface,
} from "../../../../contracts/other/MerkleMultipleAirdrop.sol/MerkleMultipleAirdrop";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract Token",
        name: "token_",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "merkleRoot_",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "amountClaimed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "bytes32[]",
        name: "merkleProof",
        type: "bytes32[]",
      },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "merkleRoot",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "contract Token",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "merkleRoot_",
        type: "bytes32",
      },
    ],
    name: "updateMerkleRoot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a06040523480156200001157600080fd5b506040516200101d3803806200101d83398181016040528101906200003791906200021f565b620000576200004b6200009a60201b60201c565b620000a260201b60201c565b8173ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff168152505080600181905550505062000266565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600062000198826200016b565b9050919050565b6000620001ac826200018b565b9050919050565b620001be816200019f565b8114620001ca57600080fd5b50565b600081519050620001de81620001b3565b92915050565b6000819050919050565b620001f981620001e4565b81146200020557600080fd5b50565b6000815190506200021981620001ee565b92915050565b6000806040838503121562000239576200023862000166565b5b60006200024985828601620001cd565b92505060206200025c8582860162000208565b9150509250929050565b608051610d94620002896000396000818161032201526104a10152610d946000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80638da5cb5b1161005b5780638da5cb5b146100ed578063d7e1ea171461010b578063f2fde38b1461013b578063fc0c546a1461015757610088565b80632eb4a7ab1461008d5780632f52ebb7146100ab5780634783f0ef146100c7578063715018a6146100e3575b600080fd5b610095610175565b6040516100a291906106d9565b60405180910390f35b6100c560048036038101906100c09190610799565b61017b565b005b6100e160048036038101906100dc9190610825565b6103b5565b005b6100eb6103c7565b005b6100f56103db565b6040516101029190610893565b60405180910390f35b610125600480360381019061012091906108da565b610404565b6040516101329190610916565b60405180910390f35b610155600480360381019061015091906108da565b61041c565b005b61015f61049f565b60405161016c9190610990565b60405180910390f35b60015481565b82600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054036101fc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101f390610a08565b60405180910390fd5b60003384604051602001610211929190610a91565b60405160208183030381529060405280519060200120905060006102398484600154856104c3565b90508061027b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161027290610b09565b60405180910390fd5b6000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054866102c89190610b58565b905085600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546103199190610b8c565b925050819055507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff166340c10f1933836040518363ffffffff1660e01b815260040161037b929190610bc0565b600060405180830381600087803b15801561039557600080fd5b505af11580156103a9573d6000803e3d6000fd5b50505050505050505050565b6103bd6104dc565b8060018190555050565b6103cf6104dc565b6103d9600061055a565b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60026020528060005260406000206000915090505481565b6104246104dc565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610493576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161048a90610c5b565b60405180910390fd5b61049c8161055a565b50565b7f000000000000000000000000000000000000000000000000000000000000000081565b6000826104d186868561061e565b149050949350505050565b6104e4610676565b73ffffffffffffffffffffffffffffffffffffffff166105026103db565b73ffffffffffffffffffffffffffffffffffffffff1614610558576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161054f90610cc7565b60405180910390fd5b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b60008082905060005b8585905081101561066a576106558287878481811061064957610648610ce7565b5b9050602002013561067e565b9150808061066290610d16565b915050610627565b50809150509392505050565b600033905090565b60008183106106965761069182846106a9565b6106a1565b6106a083836106a9565b5b905092915050565b600082600052816020526040600020905092915050565b6000819050919050565b6106d3816106c0565b82525050565b60006020820190506106ee60008301846106ca565b92915050565b600080fd5b600080fd5b6000819050919050565b610711816106fe565b811461071c57600080fd5b50565b60008135905061072e81610708565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f84011261075957610758610734565b5b8235905067ffffffffffffffff81111561077657610775610739565b5b6020830191508360208202830111156107925761079161073e565b5b9250929050565b6000806000604084860312156107b2576107b16106f4565b5b60006107c08682870161071f565b935050602084013567ffffffffffffffff8111156107e1576107e06106f9565b5b6107ed86828701610743565b92509250509250925092565b610802816106c0565b811461080d57600080fd5b50565b60008135905061081f816107f9565b92915050565b60006020828403121561083b5761083a6106f4565b5b600061084984828501610810565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061087d82610852565b9050919050565b61088d81610872565b82525050565b60006020820190506108a86000830184610884565b92915050565b6108b781610872565b81146108c257600080fd5b50565b6000813590506108d4816108ae565b92915050565b6000602082840312156108f0576108ef6106f4565b5b60006108fe848285016108c5565b91505092915050565b610910816106fe565b82525050565b600060208201905061092b6000830184610907565b92915050565b6000819050919050565b600061095661095161094c84610852565b610931565b610852565b9050919050565b60006109688261093b565b9050919050565b600061097a8261095d565b9050919050565b61098a8161096f565b82525050565b60006020820190506109a56000830184610981565b92915050565b600082825260208201905092915050565b7f44726f7020616c726561647920636c61696d65642e0000000000000000000000600082015250565b60006109f26015836109ab565b91506109fd826109bc565b602082019050919050565b60006020820190508181036000830152610a21816109e5565b9050919050565b60008160601b9050919050565b6000610a4082610a28565b9050919050565b6000610a5282610a35565b9050919050565b610a6a610a6582610872565b610a47565b82525050565b6000819050919050565b610a8b610a86826106fe565b610a70565b82525050565b6000610a9d8285610a59565b601482019150610aad8284610a7a565b6020820191508190509392505050565b7f496e76616c69642070726f6f662e000000000000000000000000000000000000600082015250565b6000610af3600e836109ab565b9150610afe82610abd565b602082019050919050565b60006020820190508181036000830152610b2281610ae6565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000610b63826106fe565b9150610b6e836106fe565b9250828203905081811115610b8657610b85610b29565b5b92915050565b6000610b97826106fe565b9150610ba2836106fe565b9250828201905080821115610bba57610bb9610b29565b5b92915050565b6000604082019050610bd56000830185610884565b610be26020830184610907565b9392505050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b6000610c456026836109ab565b9150610c5082610be9565b604082019050919050565b60006020820190508181036000830152610c7481610c38565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b6000610cb16020836109ab565b9150610cbc82610c7b565b602082019050919050565b60006020820190508181036000830152610ce081610ca4565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000610d21826106fe565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203610d5357610d52610b29565b5b60018201905091905056fea2646970667358221220ab12445e1e02efa4d15bcbd4d2060c8e737cdadb480a301044f6140b45da3a8964736f6c63430008110033";

type MerkleMultipleAirdropConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MerkleMultipleAirdropConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MerkleMultipleAirdrop__factory extends ContractFactory {
  constructor(...args: MerkleMultipleAirdropConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    token_: PromiseOrValue<string>,
    merkleRoot_: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<MerkleMultipleAirdrop> {
    return super.deploy(
      token_,
      merkleRoot_,
      overrides || {}
    ) as Promise<MerkleMultipleAirdrop>;
  }
  override getDeployTransaction(
    token_: PromiseOrValue<string>,
    merkleRoot_: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(token_, merkleRoot_, overrides || {});
  }
  override attach(address: string): MerkleMultipleAirdrop {
    return super.attach(address) as MerkleMultipleAirdrop;
  }
  override connect(signer: Signer): MerkleMultipleAirdrop__factory {
    return super.connect(signer) as MerkleMultipleAirdrop__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MerkleMultipleAirdropInterface {
    return new utils.Interface(_abi) as MerkleMultipleAirdropInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MerkleMultipleAirdrop {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as MerkleMultipleAirdrop;
  }
}