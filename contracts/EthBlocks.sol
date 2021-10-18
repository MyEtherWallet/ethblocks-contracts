// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721Tradable.sol";
import "./Minter.sol";

/**
 * @title Eth Blocks
 * ETHB - a contract for creating Ethereum block NFTs
 */
contract EthBlocks is ERC721Tradable {
    address public signer;
    address payable public beneficiary;
    Minter public minter;
    mapping(uint256 => bytes32) public blockHashes;
    using SafeMath for uint256;

    /**
     * @dev Throws if called by any account other than the authorized minter.
     */
    modifier onlyMinter() {
        require(
            address(minter) == _msgSender(),
            "EthBlocks: caller is not the minter"
        );
        _;
    }

    constructor(
        address _proxyRegistryAddress,
        string memory _name,
        string memory _symbol
    ) ERC721Tradable(_name, _symbol, _proxyRegistryAddress) {}

    function contractURI() public pure returns (string memory) {
        return "https://ethblocksdata.mewapi.io/contract/meta";
    }

    function changeMinter(Minter _minter) public onlyOwner {
        minter = _minter;
    }

    /**
     * @dev Mints a token to an address with a tokenURI.
     * @param _to address of the future owner of the token
     * @param _blockNumber block number of the block
     * @param _blockHash bytes32 of the blockHash
     * @param _ipfsHash ipfsHash of the token URI
     */

    function mint(
        address _to,
        uint256 _blockNumber,
        bytes32 _blockHash,
        string memory _ipfsHash
    ) external onlyMinter {
        _safeMint(_to, _blockNumber);
        _setTokenURI(_blockNumber, _ipfsHash);
        blockHashes[_blockNumber] = _blockHash;
    }

    /**
     * @dev Updates a token to a new TokenURI.
     * @param _blockNumber block number of the block
     * @param _blockHash bytes32 of the blockHash
     * @param _ipfsHash ipfsHash of the token URI
     */

    function updateToken(
        uint256 _blockNumber,
        bytes32 _blockHash,
        string memory _ipfsHash
    ) external onlyMinter {
        _setTokenURI(_blockNumber, _ipfsHash);
        blockHashes[_blockNumber] = _blockHash;
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
