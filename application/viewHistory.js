const fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');
const yaml = require('js-yaml');
let gateway;

async function main(drugName, serialNo){
    try {

        const pharmanetContract = await getContractInstance();

        console.log('...... Fetching Drug history');
        const drugBuffer = await pharmanetContract.submitTransaction('viewHistory', 
        drugName, serialNo);

        //process response
        console.log('...... Processing the Drug History \n\n');
        let newdrug = JSON.parse(drugBuffer.toString());
        console.log(newdrug);
        console.log('\n\n......Drug History Fetch complete!');
        return newdrug;
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