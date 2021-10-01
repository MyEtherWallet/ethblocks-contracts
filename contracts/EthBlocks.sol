// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";
import "./Signature.sol";

/**
 * @title Eth Blocks
 * ETHB - a contract for creating Ethereum block NFTs
 */
contract Creature is ERC721Tradable, VerifySignature {
    address signer;
    mapping(uint256 => uint256) public blockHashes;

    constructor(address _proxyRegistryAddress, address _signer)
        ERC721Tradable("Eth Blocks", "ETHB", _proxyRegistryAddress)
    {
        signer = _signer;
    }

    function contractURI() public pure returns (string memory) {
        return "https://ethblocks.mewapi.io/contract/meta";
    }

    function changeSigner(address _newSigner) public onlyOwner {
        signer = _newSigner;
    }

    /**
     * @dev Mints a token to an address with a tokenURI.
     * @param _to address of the future owner of the token
     * @param _blockNumber block number of the block
     * @param _tokenId uint256 of the blockHash
     * @param _ipfsHash ipfsHash of the token URI
     * @param _signature signature of keccak256(abi.encodePacked(_blockNumber, _tokenId, _ipfsHash)) signed by the signer
     */
    function mint(
        address _to,
        uint256 _blockNumber,
        uint256 _tokenId,
        string memory _ipfsHash,
        bytes memory _signature
    ) public onlyOwner {
        require(
            verifySig(
                _to,
                _blockNumber,
                _tokenId,
                _ipfsHash,
                signer,
                _signature
            ),
            "EthBlocks: Not a valid signature"
        );
        _safeMint(_to, _tokenId);
        _setTokenURI(_tokenId, _ipfsHash);
        blockHashes[_blockNumber] = _tokenId;
    }

    function hashToTokenId(bytes32 _hash) public pure returns (uint256) {
        return uint256(_hash);
    }

    function tokenIdToHash(uint256 _tokenId) public pure returns (bytes32) {
        return bytes32(_tokenId);
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
