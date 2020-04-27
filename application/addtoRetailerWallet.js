const fs = require('fs');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const path = require('path');

const crypto_materials = path.resolve(__dirname, '../network/crypto-config');

const retailer_wallet = new FileSystemWallet('./identity/retailer');

async function main_retailer(certificationPath, privateKeyPath){
	try{

		const certificate = fs.readFileSync(certificationPath).toString();

		const privateKey = fs.readFileSync(privateKeyPath).toString();

		const retaileridentityLabel = 'RETAILER_ADMIN';

		const retailer_identity = X509WalletMixin.createIdentity('retailerMSP', certificate, privateKey);

		await retailer_wallet.import(retaileridentityLabel, retailer_identity);

	} catch (error) {
		console.log(`Error adding to wallet .${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

main_retailer('/Users/shagunkhemka/project/network/crypto-config/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/signcerts/Admin@retailer.pharma-network.com-cert.pem', '/Users/shagunkhemka/project/network/crypto-config/peerOrganizations/retailer.pharma-network.com/users/Admin@retailer.pharma-network.com/msp/keystore/priv_sk').then(() => {
	console.log('Retailer added to wallet');
})

module.exports.execute = main_retailer;