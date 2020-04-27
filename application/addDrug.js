const fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');
const yaml = require('js-yaml');
let gateway;

async function main(drugName, serialNo, mfgDate, expDate, companyCRN){
    try {

        const pharmanetContract = await getContractInstance();

        console.log('...... Adding a new Drug');
        const DrugBuffer = await pharmanetContract.submitTransaction('addDrug', 
        drugName, serialNo, mfgDate, expDate, companyCRN);

        //process response
        console.log('...... Processing the Addtiion of new drug \n\n');
        let newDrug = JSON.parse(DrugBuffer.toString());
        console.log(newDrug);
        console.log('\n\n......Drug Addition Complete!');
        return newDrug;
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

    const wallet = new FileSystemWallet('./identity/manufacturer');

    const fabricUserName = 'MANUFACTURER_ADMIN';

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