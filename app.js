
const WETH_ADDRESS = "0xc778417e063141139fce010982780140aa0cd5ab"; // The wrapped ETH token contract
const ZRX_ADDRESS = "0xa8e9fa8f91e5ae138c74648c9c304f1c75003a8d"; // The ZRX token contract
// The Exchange.sol address (0x exchange smart contract)
const EXCHANGE_ADDRESS = "0x479cc461fecd078f766ecc58533d6f69580cf3ac";

window.onload = function(){
	web3.version.getNetwork((err, netId) => {
	//	startApp(netId);
	});
}


function startApp(netId){
	config = {
		networkId: parseInt(netId)
	};
	const zeroEx = new ZeroEx.ZeroEx(web3.currentProvider, config); 
	//generateOrder(zeroEx);
	fillOrder(zeroEx);
}

function fillOrder(zeroEx){
	var order = JSON.parse(localStorage.getItem('order'));
	const shouldThrowOnInsufficientBalanceOrAllowance = true;
	const fillTakerTokenAmount = new BigNumber(0.3);


	const signedOrder = {
		    maker: order.maker,
		    taker: ZeroEx.ZeroEx.NULL_ADDRESS,
		    feeRecipient: ZeroEx.ZeroEx.NULL_ADDRESS,
		    makerTokenAddress: ZRX_ADDRESS,
		    takerTokenAddress: WETH_ADDRESS,
		    exchangeContractAddress: EXCHANGE_ADDRESS,
		    salt: order.salt,
		    makerFee: new BigNumber(0),
		    takerFee: new BigNumber(0),
		    makerTokenAmount: new BigNumber(0.2),  // Base 18 decimals
		    takerTokenAmount: new BigNumber(0.3), // Base 18 decimals
		    expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000), 
		    ecSignature: order.ecSignature
		};

	console.log(fillTakerTokenAmount);
	(async () => { 
		const accounts = await zeroEx.getAvailableAddressesAsync();
		const txHash = await zeroEx.exchange.fillOrderAsync(
		    signedOrder,
		   new BigNumber(0.3),
		);
		const txReceipt = await zeroEx.awaitTransactionMinedAsync(txHash);
		console.log('FillOrder transaction receipt: ', txReceipt);
    })();
}

function generateOrder(zeroEx){
	const DECIMALS = 18;
	// Addresses
	

	(async () => {  
		const accounts = await zeroEx.getAvailableAddressesAsync();
		const [makerAddress, takerAddress] = [accounts[0], ZeroEx.ZeroEx.NULL_ADDRESS];
		//const setMakerAllowTxHash = await zeroEx.token.setUnlimitedProxyAllowanceAsync(ZRX_ADDRESS, makerAddress);
		//await zeroEx.awaitTransactionMinedAsync(setMakerAllowTxHash);

		// Generate order
		const order = {
		    maker: makerAddress,
		    taker: ZeroEx.ZeroEx.NULL_ADDRESS,
		    feeRecipient: ZeroEx.ZeroEx.NULL_ADDRESS,
		    makerTokenAddress: ZRX_ADDRESS,
		    takerTokenAddress: WETH_ADDRESS,
		    exchangeContractAddress: EXCHANGE_ADDRESS,
		    salt: ZeroEx.ZeroEx.generatePseudoRandomSalt(),
		    makerFee: new BigNumber(0),
		    takerFee: new BigNumber(0),
		    makerTokenAmount: new BigNumber(0.2),  // Base 18 decimals
		    takerTokenAmount: new BigNumber(0.3), // Base 18 decimals
		    expirationUnixTimestampSec: new BigNumber(Date.now() + 3600000), // Valid for up to an hour
		};
		const orderHash = ZeroEx.ZeroEx.getOrderHashHex(order);
		const shouldAddPersonalMessagePrefix = false;
		const ecSignature = await zeroEx.signOrderHashAsync(orderHash, makerAddress, true);
		console.log(ecSignature);
		// Append signature to order
		const signedOrder = {
		    ...order,
		    ecSignature,
		};

		localStorage.setItem('order', JSON.stringify(signedOrder));

	})();

}