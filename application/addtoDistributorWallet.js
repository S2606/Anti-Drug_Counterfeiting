const fs = require('fs');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const path = require('path');

const crypto_materials = path.resolve(__dirname, '../network/crypto-config');

const distributor_wallet = new FileSystemWallet('./identity/distributor');

async function main_distributor(certificationPath, privateKeyPath){
	try{

		const certificate = fs.readFileSync(certificationPath).toString();

		const privateKey = fs.readFileSync(privateKeyPath).toString();

		const distributoridentityLabel = 'DISTRIBUTOR_ADMIN';

		const distributor_identity = X509WalletMixin.createIdentity('distributorMSP', certificate, privateKey);

		await distributor_wallet.import(distributoridentityLabel, distributor_identity);

	} catch (error) {
		console.log(`Error adding to wallet .${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

main_distributor('/Users/shagunkhemka/project/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/signcerts/Admin@distributor.pharma-network.com-cert.pem', '/Users/shagunkhemka/project/network/crypto-config/peerOrganizations/distributor.pharma-network.com/users/Admin@distributor.pharma-network.com/msp/keystore/priv_sk').then(() => {
	console.log('Distributor added to wallet');
})

module.exports.execute = main_distributor;