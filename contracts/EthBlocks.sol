// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";
import "./Signature.sol";

/**
 * @title Eth Blocks
 * ETHB - a contract for creating Ethereum block NFTs
 */
contract EthBlocks is ERC721Tradable, VerifySignature {
    address public signer;
    address payable public beneficiary;
    mapping(uint256 => bytes32) public blockHashes;
    using SafeMath for uint256;

    constructor(
        address _proxyRegistryAddress,
        address _signer,
        address payable _beneficiary,
        string memory _name,
        string memory _symbol
    ) ERC721Tradable(_name, _symbol, _proxyRegistryAddress) {
        signer = _signer;
        beneficiary = _beneficiary;
    }

    function contractURI() public pure returns (string memory) {
        return "https://ethblocksdata.mewapi.io/contract/meta";
    }

    function changeSigner(address _newSigner) public onlyOwner {
        signer = _newSigner;
    }

    function changeBeneficiary(address payable _beneficiary) public onlyOwner {
        beneficiary = _beneficiary;
    }

    /**
     * @dev Mints a token to an address with a tokenURI.
     * @param _to address of the future owner of the token
     * @param _blockNumber block number of the block
     * @param _blockHash bytes32 of the blockHash
     * @param _ipfsHash ipfsHash of the token URI
     * @param _price price of the token
     * @param _signature signature of keccak256(abi.encodePacked(_blockNumber, _tokenId, _ipfsHash)) signed by the signer
     */
    function mint(
        address _to,
        uint256 _blockNumber,
        bytes32 _blockHash,
        string memory _ipfsHash,
        uint256 _price,
        bytes memory _signature
    ) public payable {
        require(
            verifySig(
                _to,
                _blockNumber,
                _blockHash,
                _ipfsHash,
                _price,
                signer,
                _signature
            ),
            "EthBlocks: Not a valid signature"
        );
        require(msg.value >= _price, "EthBlocks: Price is low");
        uint256 remainder = msg.value.sub(_price);
        beneficiary.transfer(_price);
        _safeMint(_to, _blockNumber);
        _setTokenURI(_blockNumber, _ipfsHash);
        blockHashes[_blockNumber] = _blockHash;
        payable(msg.sender).transfer(remainder);
    }

    function updateToken(
        address _to,
        uint256 _blockNumber,
        bytes32 _blockHash,
        string memory _ipfsHash,
        uint256 _price,
        bytes memory _signature
    ) public payable {
        require(
            verifySig(
                _to,
                _blockNumber,
                _blockHash,
                _ipfsHash,
                _price,
                signer,
                _signature
            ),
            "EthBlocks: Not a valid signature"
        );
        require(msg.value >= _price, "EthBlocks: Price is low");
        require(
            _isApprovedOrOwner(_msgSender(), _blockNumber),
            "EthBlocks: update caller is not owner nor approved"
        );
        uint256 remainder = msg.value.sub(_price);
        beneficiary.transfer(_price);
        _setTokenURI(_blockNumber, _ipfsHash);
        blockHashes[_blockNumber] = _blockHash;
        payable(msg.sender).transfer(remainder);
    }

    function multicall(bytes[] calldata data)
        external
        returns (bytes[] memory results)
    {
        results = new bytes[](data.length);
        for (uint256 i = 0; i < data.length; i++) {
            (bool success, bytes memory result) = address(this).delegatecall(
                data[i]
            );
            require(success);
            results[i] = result;
        }
        return results;
    }
}
