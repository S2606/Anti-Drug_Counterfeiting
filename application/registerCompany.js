const fs = require('fs');
const { FileSystemWallet, Gateway } = require('fabric-network');
const yaml = require('js-yaml');
let gateway;

async function main(companyCRN, companyName, location, organisationRole){
    try {

        const pharmanetContract = await getContractInstance();

        console.log('...... Create a new Company account');
        const companyBuffer = await pharmanetContract.submitTransaction('registerCompany', 
        companyCRN, companyName, location, organisationRole);

        //process response
        console.log('...... Processing Company account \n\n');
        let newCompany = JSON.parse(companyBuffer.toString());
        console.log(newCompany);
        console.log('\n\n......Company Creation Transaction Complete!');
        return newCompany;
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

    const wallet = new FileSystemWallet('./identity/distributor');

    const fabricUserName = 'DISTRIBUTOR_ADMIN';

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