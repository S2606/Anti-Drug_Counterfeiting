const fs = require('fs');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const path = require('path');

const crypto_materials = path.resolve(__dirname, '../network/crypto-config');

const transporter_wallet = new FileSystemWallet('./identity/transporter');

async function main_transporter(certificationPath, privateKeyPath){
	try{

		const certificate = fs.readFileSync(certificationPath).toString();

		const privateKey = fs.readFileSync(privateKeyPath).toString();

		const transporteridentityLabel = 'TRANSPORTER_ADMIN';

		const transporter_identity = X509WalletMixin.createIdentity('transporterMSP', certificate, privateKey);

		await transporter_wallet.import(transporteridentityLabel, transporter_identity);

	} catch (error) {
		console.log(`Error adding to wallet .${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

main_transporter('/Users/shagunkhemka/project/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/signcerts/Admin@transporter.pharma-network.com-cert.pem', '/Users/shagunkhemka/project/network/crypto-config/peerOrganizations/transporter.pharma-network.com/users/Admin@transporter.pharma-network.com/msp/keystore/priv_sk').then(() => {
	console.log('Transporter added to wallet');
})

module.exports.execute = main_transporter;