const fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');
const yaml = require('js-yaml');
let gateway;

async function main(drugName, serialNo, retailerCRN, customerAadhar){
    try {

        const pharmanetContract = await getContractInstance();

        console.log('...... Sending drug to a consumer');
        const retailBuffer = await pharmanetContract.submitTransaction('retailDrug', 
        drugName, serialNo, retailerCRN, customerAadhar);

        //process response
        console.log('...... Processing the drug ownership to consumer \n\n');
        let newRetail = JSON.parse(retailBuffer.toString());
        console.log(newRetail);
        console.log('\n\n......drug ownership to consumer updation complete!');
        return newRetail;
    } catch (error) {
		console.log(`\n\n${error}\n\n`);
		console.log(error.stack);
		throw new Error(error);
	} finally {
        console.log('.... Disconnecting Gateway');
        gateway.disconnect();
    }
}

async function getContractInstance() {

    gateway = new Gateway();

    const wallet = new FileSystemWallet('./identity/retailer');

    const fabricUserName = 'RETAILER_ADMIN';

    let connectionProfile = yaml.safeLoad(fs.readFileSync('./connection-profile-manufacturer.yml', 'utf8'));

    let connectionOptions = {
        wallet: wallet,
        indentity: fabricUserName,
        discovery: {enabled: false, asLocalhost: true}
    };

    console.log('...... Connecting to Fabric gateway');
    await gateway.connect(connectionProfile, connectionOptions);

    console.log('...... Connecting to channel- pharmachannel');
    const channel = await gateway.getNetwork('pharmachannel');

    console.log('...... Connecting to PharmNet Smart Contract');
    return channel.getContract('pharmnet', 'org.pharma-network.pharmanet');
}

module.exports.execute = main;