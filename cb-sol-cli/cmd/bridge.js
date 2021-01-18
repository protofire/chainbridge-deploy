const ethers = require('ethers');
const constants = require('../constants');

const {Command} = require('commander');
const {setupParentArgs, getFunctionBytes, safeSetupParentArgs, safeTransactionAppoveExecute, splitCommaList, waitForTx, log, logSafe} = require("./utils");
const config = require('@protofire/gnosis-safe-toolchain/src/config');

const EMPTY_SIG = "0x00000000"

const registerResourceCmd = new Command("register-resource")
    .description("Register a resource ID with a contract address for a handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'Handler address', constants.ERC20_HANDLER_ADDRESS)
    .option('--targetContract <address>', `Contract address to be registered`, constants.ERC20_ADDRESS)
    .option('--resourceId <address>', `Resource ID to be registered`, constants.ERC20_RESOURCEID)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)

        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args,`Registering contract ${args.targetContract} with resource ID ${args.resourceId} on handler ${args.handler}`);
        const tx = await bridgeInstance.adminSetResource(args.handler, args.resourceId, args.targetContract, { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
        await waitForTx(args.provider, tx.hash)
    })

const safeRegisterResourceCmd = new Command("safe-register-resource")
    .description("Register a resource ID with a contract address for a handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'Handler address', constants.ERC20_HANDLER_ADDRESS)
    .option('--targetContract <address>', `Contract address to be registered`, constants.ERC20_ADDRESS)
    .option('--resourceId <address>', `Resource ID to be registered`, constants.ERC20_RESOURCEID)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will acts bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function (args) {
        await safeSetupParentArgs(args, args.parent.parent)

        logSafe(args,`Registering contract ${args.targetContract} with resource ID ${args.resourceId} on handler ${args.handler}`);

        await safeTransactionAppoveExecute(args, 'adminSetResource', [args.handler, args.resourceId, args.targetContract])
    })

const registerGenericResourceCmd = new Command("register-generic-resource")
    .description("Register a resource ID with a generic handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'Handler contract address', constants.GENERIC_HANDLER_ADDRESS)
    .option('--targetContract <address>', `Contract address to be registered`, constants.CENTRIFUGE_ASSET_STORE_ADDRESS)
    .option('--resourceId <address>', `ResourceID to be registered`, constants.GENERIC_RESOURCEID)
    .option('--deposit <string>', "Deposit function signature", EMPTY_SIG)
    .option('--execute <string>', "Execute proposal function signature", EMPTY_SIG)
    .option('--hash', "Treat signature inputs as function prototype strings, hash and take the first 4 bytes", false)
    .action(async function(args) {
        await setupParentArgs(args, args.parent.parent)

        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        if (args.hash) {
            args.deposit = getFunctionBytes(args.deposit)
            args.execute = getFunctionBytes(args.execute)
        }

        log(args,`Registering generic resource ID ${args.resourceId} with contract ${args.targetContract} on handler ${args.handler}`)
        const tx = await bridgeInstance.adminSetGenericResource(args.handler, args.resourceId, args.targetContract, args.deposit, args.execute, { gasPrice: args.gasPrice, gasLimit: args.gasLimit})
        await waitForTx(args.provider, tx.hash)
    })

const safeRegisterGenericResourceCmd = new Command("safe-register-generic-resource")
    .description("Register a resource ID with a generic handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'Handler contract address', constants.GENERIC_HANDLER_ADDRESS)
    .option('--targetContract <address>', `Contract address to be registered`, constants.CENTRIFUGE_ASSET_STORE_ADDRESS)
    .option('--resourceId <address>', `ResourceID to be registered`, constants.GENERIC_RESOURCEID)
    .option('--depositSig <string>', "Deposit function signature", EMPTY_SIG)
    .option('--executeSig <string>', "Execute proposal function signature", EMPTY_SIG)
    .option('--hash', "Treat signature inputs as function prototype strings, hash and take the first 4 bytes", false)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will acts bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function(args) {
        await safeSetupParentArgs(args, args.parent.parent)

        if (args.hash) {
            args.deposit = getFunctionBytes(args.deposit)
            args.execute = getFunctionBytes(args.execute)
        }

        logSafe(args,`Registering generic resource ID ${args.resourceId} with contract ${args.targetContract} on handler ${args.handler}`)

        await safeTransactionAppoveExecute(args, 'adminSetGenericResource', [args.handler, args.resourceId, args.targetContract, args.deposit, args.execute])
    })

const setBurnCmd = new Command("set-burn")
    .description("Set a token contract as burnable in a handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'ERC20 handler contract address', constants.ERC20_HANDLER_ADDRESS)
    .option('--tokenContract <address>', `Token contract to be registered`, constants.ERC20_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        log(args,`Setting contract ${args.tokenContract} as burnable on handler ${args.handler}`);
        const tx = await bridgeInstance.adminSetBurnable(args.handler, args.tokenContract, { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
        await waitForTx(args.provider, tx.hash)
    })

const safeSetBurnCmd = new Command("sefe-set-burn")
    .description("Set a token contract as burnable in a handler")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'ERC20 handler contract address', constants.ERC20_HANDLER_ADDRESS)
    .option('--tokenContract <address>', `Token contract to be registered`, constants.ERC20_ADDRESS)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will acts bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function (args) {
        await safeSetupParentArgs(args, args.parent.parent)

        logSafe(args,`Setting contract ${args.tokenContract} as burnable on handler ${args.handler}`);

        await safeTransactionAppoveExecute(args, 'adminSetBurnable', [args.handler, args.tokenContract])
    })

const cancelProposalCmd = new Command("cancel-proposal")
    .description("Cancel a proposal that has passed the expiry threshold")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--chainId <id>', 'Chain ID of proposal to cancel', 0)
    .option('--depositNonce <value>', 'Deposit nonce of proposal to cancel', 0)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        log(args, `Setting proposal with chain ID ${args.chainId} and deposit nonce ${args.depositNonce} status to 'Cancelled`);
        const tx = await bridgeInstance.adminCancelProposal(args.chainId, args.depositNonce);
        await waitForTx(args.provider, tx.hash)
    })

const safeCancelProposalCmd = new Command("safe-cancel-proposal")
    .description("Cancel a proposal that has passed the expiry threshold")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--chainId <id>', 'Chain ID of proposal to cancel', 0)
    .option('--depositNonce <value>', 'Deposit nonce of proposal to cancel', 0)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will acts bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function (args) {
        await safeSetupParentArgs(args, args.parent.parent)

        logSafe(args, `Setting proposal with chain ID ${args.chainId} and deposit nonce ${args.depositNonce} status to 'Cancelled`);

        await safeTransactionAppoveExecute(args, 'adminCancelProposal', [args.chainId, args.depositNonce])
    })

const queryProposalCmd = new Command("query-proposal")
    .description("Queries a proposal")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--chainId <id>', 'Source chain ID of proposal', 0)
    .option('--depositNonce <value>', 'Deposit nonce of proposal', 0)
    .option('--dataHash <value>', 'Hash of proposal metadata', constants.ERC20_PROPOSAL_HASH)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        const prop = await bridgeInstance.getProposal(args.chainId, args.depositNonce, args.dataHash)

        console.log(prop)
    })

const queryResourceId = new Command("query-resource")
    .description("Query the contract address associated with a resource ID")
    .option('--handler <address>', 'Handler contract address', constants.ERC20_HANDLER_ADDRESS)
    .option('--resourceId <address>', `ResourceID to query`, constants.ERC20_RESOURCEID)
    .action(async function(args) {
        await setupParentArgs(args, args.parent.parent)

        const handlerInstance = new ethers.Contract(args.handler, constants.ContractABIs.HandlerHelpers.abi, args.wallet)
        const address = await handlerInstance._resourceIDToTokenContractAddress(args.resourceId)
        log(args, `Resource ID ${args.resourceId} is mapped to contract ${address}`)
    })


const setupTokens = new Command('setup-tokens')
    .description("Setup multiple tokens to be bridged")
    .option('--override', 'Skip checking tokens already registered')
    .action(async function(args) {
        const config = require('./setup-tokens-config')
        const eth_provider = new ethers.providers.JsonRpcProvider(config.CBG_URL);
        const ava_provider = new ethers.providers.JsonRpcProvider(config.CBK_URL, {
            name: "custom",
            chainId: config.AVA_NETWORK_ID
        });

        const eth_gasPrice = ethers.utils.hexlify(Number(config.ETH_GAS_PRICE))
        const ava_gasPrice = ethers.utils.hexlify(Number(config.AVA_GAS_PRICE))

        const eth_wallet = new ethers.Wallet(config.CB_PK, eth_provider);
        const ava_wallet = new ethers.Wallet(config.CB_PK, ava_provider);

        const GAS_LIMIT = ethers.utils.hexlify(8000000)

        const avaBridgedTokensAddresses = []
        const ethBridgedTokensAddresses = []

        const ethBridgeInstance = new ethers.Contract(config.CBG_BRIDGE, constants.ContractABIs.Bridge.abi, eth_wallet);
        const avaBridgeInstance = new ethers.Contract(config.CBK_BRIDGE, constants.ContractABIs.Bridge.abi, ava_wallet);

        console.log('Setting up bridged ethereum tokens')
        for (let index = 0; index < config.ETH_TOKENS.length; index++) {
            const eth_token = config.ETH_TOKENS[index]
            console.log(`--- Seting up Ethereum ${eth_token.symbol}`)
            const CBG_ERC20_RID = '0x0000000000000000000000' + eth_token.address.substring(2) + '0' + config.CBG_ID
            console.log(`------ ResourceId ${CBG_ERC20_RID}`)

            const regEth = (await ethBridgeInstance._resourceIDToHandlerAddress(CBG_ERC20_RID)) !== ethers.constants.AddressZero
            const regAva = (await avaBridgeInstance._resourceIDToHandlerAddress(CBG_ERC20_RID)) !== ethers.constants.AddressZero

            // We should process the token if not registered or orverride
            if (!regEth || !regAva || args.override) {
                // 1. Deploy ERC20 in Avalanche
                const factory = new ethers.ContractFactory(constants.ContractABIs.Erc20Mintable.abi, constants.ContractABIs.Erc20Mintable.bytecode, ava_wallet);
                console.log(`------ Deploying ${eth_token.symbol} in Avalanche`)
                const ava_token = await factory.deploy(eth_token.name, eth_token.symbol, { gasPrice: ava_gasPrice, gasLimit: GAS_LIMIT});
                await ava_token.deployed();
                console.log(`-------- ${eth_token.symbol} address in Avalanche: ${ava_token.address}`)

                avaBridgedTokensAddresses.push({
                    ...eth_token,
                    avaAddress: ava_token.address,
                    ethAddress: eth_token.address,
                    resourceId: CBG_ERC20_RID
                })

                // 2. Register resource and handler on Ethereum

                const register_eth_reroudse_tx = await ethBridgeInstance.adminSetResource(config.CBG_ERC20HANDLER, CBG_ERC20_RID, eth_token.address, { gasPrice: eth_gasPrice, gasLimit: GAS_LIMIT});
                console.log(`------ Registering resource on Ethereum bridge for ${eth_token.symbol} with tx ${register_eth_reroudse_tx.hash}`)
                await register_eth_reroudse_tx.wait()
                // 3. Register resource ID on C-Ava

                const register_ava_reroudse_tx = await avaBridgeInstance.adminSetResource(config.CBK_ERC20HANDLER, CBG_ERC20_RID, ava_token.address, { gasPrice: ava_gasPrice, gasLimit: GAS_LIMIT});
                console.log(`------ Registering resource on Avalanche bridge for ${eth_token.symbol} with tx ${register_ava_reroudse_tx.hash}`)
                await register_ava_reroudse_tx.wait()

                // 4. Add the ERC20 handler as a minter on C-Ava
                const avaErc20Instance = new ethers.Contract(ava_token.address, constants.ContractABIs.Erc20Mintable.abi, ava_wallet);
                const MINTER_ROLE = await avaErc20Instance.MINTER_ROLE();

                const addMinterTx = await avaErc20Instance.grantRole(MINTER_ROLE, config.CBK_ERC20HANDLER, { gasPrice: ava_gasPrice, gasLimit: GAS_LIMIT});
                console.log(`------ Adding CBK_ERC20HANDLER as minter for ${eth_token.symbol} on Avalanche with tx ${addMinterTx.hash}`)
                await addMinterTx.wait()

                //5. Enable mint/burn on C-Ava
                const adminSetBurnableTx = await avaBridgeInstance.adminSetBurnable(config.CBK_ERC20HANDLER, ava_token.address, { gasPrice: ava_gasPrice, gasLimit: GAS_LIMIT});
                console.log(`------ Enable mint/burn on Avalanche for ${eth_token.symbol} with tx ${adminSetBurnableTx.hash}`)
                await adminSetBurnableTx.wait()
            } else {
                console.log(`------ Skipping ${config.ETH_TOKENS[index].symbol} already registered`)
            }

        }

        if (avaBridgedTokensAddresses.length) {
            console.log(`
================================================================
Bridged tokens Ethereum -> Avalanche:
${avaBridgedTokensAddresses.map(token => `${token.symbol}: Ethereum ${token.ethAddress} -> Avalanche ${token.avaAddress} - ResourceId ${token.resourceId} \n`).join('')}
================================================================
            `)

        }

        console.log('Setting up bridged Avalanche tokens')
        for (let index = 0; index < config.AVA_TOKENS.length; index++) {
            const ava_token = config.AVA_TOKENS[index]
            console.log(`--- Seting up Avalanche ${ava_token.symbol}`)
            const CBK_ERC20_RID = '0x0000000000000000000000' + ava_token.address.substring(2) + '0' + config.CBK_ID
            console.log(`------ ResourceId ${CBK_ERC20_RID}`)

            const regEth = (await ethBridgeInstance._resourceIDToHandlerAddress(CBK_ERC20_RID)) !== ethers.constants.AddressZero
            const regAva = (await avaBridgeInstance._resourceIDToHandlerAddress(CBK_ERC20_RID)) !== ethers.constants.AddressZero

            // We should process the token if not registered or orverride
            if (!regEth || !regAva || args.override) {
                // 1. Deploy ERC20 in Avalanche
                const factory = new ethers.ContractFactory(constants.ContractABIs.Erc20Mintable.abi, constants.ContractABIs.Erc20Mintable.bytecode, eth_wallet);
                console.log(`------ Deploying ERC20 in Ethereum for ${ava_token.symbol}`)
                const eth_token = await factory.deploy(ava_token.name, ava_token.symbol, { gasPrice: eth_gasPrice, gasLimit: GAS_LIMIT});
                await eth_token.deployed();
                console.log(`-------- ${ava_token.symbol} address in Ethereum: ${eth_token.address}`)

                ethBridgedTokensAddresses.push({
                    ...ava_token,
                    avaAddress: ava_token.address,
                    ethAddress: eth_token.address,
                    resourceId: CBK_ERC20_RID
                })

                // 2. Register resource and handler on Avalanche
                const register_ava_reroudse_tx = await avaBridgeInstance.adminSetResource(config.CBK_ERC20HANDLER, CBK_ERC20_RID, ava_token.address, { gasPrice: ava_gasPrice, gasLimit: GAS_LIMIT});
                console.log(`------ Registering resource on Avalanche bridge for ${ava_token.symbol} with tx ${register_ava_reroudse_tx.hash}`)
                await register_ava_reroudse_tx.wait()

                // 3. Register resource ID on Ethereum
                const register_eth_reroudse_tx = await ethBridgeInstance.adminSetResource(config.CBG_ERC20HANDLER, CBK_ERC20_RID, ava_token.address, { gasPrice: eth_gasPrice, gasLimit: GAS_LIMIT});
                console.log(`------ Registering resource on Ethereum bridge for ${ava_token.symbol} with tx ${register_eth_reroudse_tx.hash}`)
                await register_eth_reroudse_tx.wait()

                // 4. Add the ERC20 handler as a minter on Ethereum
                const ethErc20Instance = new ethers.Contract(eth_token.address, constants.ContractABIs.Erc20Mintable.abi, eth_wallet);
                const MINTER_ROLE = await ethErc20Instance.MINTER_ROLE();

                const addMinterTx = await ethErc20Instance.grantRole(MINTER_ROLE, config.CBG_ERC20HANDLER, { gasPrice: eth_gasPrice, gasLimit: GAS_LIMIT});
                console.log(`------ Adding CBK_ERC20HANDLER as minter for ${ava_token.symbol} on Ethereum with tx ${addMinterTx.hash}`)
                await addMinterTx.wait()

                //5. Enable mint/burn on Ethereum
                const adminSetBurnableTx = await ethBridgeInstance.adminSetBurnable(config.CBG_ERC20HANDLER, ava_token.address, { gasPrice: eth_gasPrice, gasLimit: GAS_LIMIT});
                console.log(`------ Enable mint/burn on Ethereum for ${ava_token.symbol} with tx ${adminSetBurnableTx.hash}`)
                await adminSetBurnableTx.wait()
            } else {
                console.log(`------ Skipping ${config.AVA_TOKENS[index].symbol} already registered`)
            }
        }

        if (ethBridgedTokensAddresses.length) {
            console.log(`
================================================================
Bridged tokens Avalanche -> Ethereum:
${ethBridgedTokensAddresses.map(token => `${token.symbol}: Avalanche ${token.avaAddress} -> Ethereum ${token.ethAddress} - ResourceId ${token.resourceId} \n`).join('')}
================================================================
            `)

        }

    })

const bridgeCmd = new Command("bridge")

bridgeCmd.addCommand(registerResourceCmd)
bridgeCmd.addCommand(safeRegisterResourceCmd)
bridgeCmd.addCommand(registerGenericResourceCmd)
bridgeCmd.addCommand(safeRegisterGenericResourceCmd)
bridgeCmd.addCommand(setBurnCmd)
bridgeCmd.addCommand(safeSetBurnCmd)
bridgeCmd.addCommand(cancelProposalCmd)
bridgeCmd.addCommand(safeCancelProposalCmd)
bridgeCmd.addCommand(queryProposalCmd)
bridgeCmd.addCommand(queryResourceId)
bridgeCmd.addCommand(setupTokens)

module.exports = bridgeCmd
