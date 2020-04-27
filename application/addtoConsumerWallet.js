const fs = require('fs');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const path = require('path');

const crypto_materials = path.resolve(__dirname, '../network/crypto-config');

const consumer_wallet = new FileSystemWallet('./identity/consumer');

async function main_consumer(certificationPath, privateKeyPath){
	try{

		const certificate = fs.readFileSync(certificationPath).toString();

		const privateKey = fs.readFileSync(privateKeyPath).toString();

		const consumeridentityLabel = 'CONSUMER_ADMIN';

		const consumer_identity = X509WalletMixin.createIdentity('consumerMSP', certificate, privateKey);

		await consumer_wallet.import(consumeridentityLabel, consumer_identity);

	} catch (error) {
		console.log(`Error adding to wallet .${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

main_consumer('/Users/shagunkhemka/project/network/crypto-config/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/signcerts/Admin@consumer.pharma-network.com-cert.pem', '/Users/shagunkhemka/project/network/crypto-config/peerOrganizations/consumer.pharma-network.com/users/Admin@consumer.pharma-network.com/msp/keystore/priv_sk').then(() => {
	console.log('Consumer added to wallet');
})

module.exports.execute = main_consumer;