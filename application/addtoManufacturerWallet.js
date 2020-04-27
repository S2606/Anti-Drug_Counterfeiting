const fs = require('fs');
const { FileSystemWallet, X509WalletMixin } = require('fabric-network');
const path = require('path');

const crypto_materials = path.resolve(__dirname, '../network/crypto-config');

const manufacturer_wallet = new FileSystemWallet('./identity/manufacturer');

async function main_manufacturer(certificationPath, privateKeyPath){
	try{

		const certificate = fs.readFileSync(certificationPath).toString();

		const privateKey = fs.readFileSync(privateKeyPath).toString();

		const manufactureridentityLabel = 'MANUFACTURER_ADMIN';

		const manufacturer_identity = X509WalletMixin.createIdentity('manufacturerMSP', certificate, privateKey);

		await manufacturer_wallet.import(manufactureridentityLabel, manufacturer_identity);

	} catch (error) {
		console.log(`Error adding to wallet .${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

main_manufacturer('/Users/shagunkhemka/project/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/signcerts/Admin@manufacturer.pharma-network.com-cert.pem', '/Users/shagunkhemka/project/network/crypto-config/peerOrganizations/manufacturer.pharma-network.com/users/Admin@manufacturer.pharma-network.com/msp/keystore/priv_sk').then(() => {
	console.log('Manufacturer added to wallet');
})

module.exports.execute = main_manufacturer;