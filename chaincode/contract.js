'use strict';

const {Contract} = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

class PharmaNetContract extends Contract {

	constructor() {
        // Custom name to refer to this smart contract
        super('org.pharma-network.pharmanet');
    }

    /**Custom functions below */

    //Function to print success on initializing the smart contract
    async instantiate(ctx){
        console.log('PharmaNet smart contract Instantiated');
    }

    /*
    * Provides the organization role hierarchy level
    * @param namestr - Organization Role
    */
    static hasOrgHierarchy(nameStr) {
        allowedOrganizationHierarchy = [
            {
                org_role: 'Manufacturer',
                hierarchy_level: 1
            },
            {
                org_role:'Distributor',
                hierarchy_level: 2
            },
            {
                org_role:'Retailer',
                hierarchy_level: 3
            }
        ];
        for(let i=0;i<allowedOrganizationHierarchy.length;i++){
            if(allowedOrganizationHierarchy[i].org_role===nameStr){
                return allowedOrganizationHierarchy[i].hierarchy_level;
            }
        }
        return null;
    }

    /*
    * Registers a new Company on the ledger
    * @param ctx - The Transactional Context Object
    * @param companyCRN - Unique identifier of the company to be added to the network
    * @param companyName - Name of the company
    * @param location - location of the comapny(preferably HQ)
    * @param organisationRole - Role of the given company 
    * @returns
    */
    async registerCompany(ctx, companyCRN, companyName, location, organisationRole){
        allowedOrganisationRole = [
            'Manufacturer', 
            'Distributor', 
            'Retailer', 
            'Transporter'];
        //Create a new composite key for the new Request
        const requestEntityKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [companyCRN, companyName]);

        //Check if org is within our scope
        if (allowedOrganisationRole.indexOf(organisationRole) === -1){
        	console.log('Invalid organisationRole')
        }

        //Create new Company object to be stored in blockchain
        let newRequestObject = {
            companyID: requestEntityKey,
            name: companyName,
            location: location,
            organisationRole: organisationRole,
        }

        org_hierarchy = hasOrgHierarchy(org_hierarchy);
        if(org_hierarchy !== null){
        	newRequestobject[hierarchy_level] = org_hierarchy;
        }

        //Convert the object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(newRequestObject));
        await ctx.stub.putState(requestEntityKey, dataBuffer);

        return newRequestObject;
    }

    /*
    * Registers a new Drug on the ledger
    * @param ctx - The Transactional Context Object
    * @param drugName - Name of the drug
    * @param serialNo - Unique identifier of the drug to be added to the network
    * @param mfgDate - Manufacturing date of the drug
    * @param expDate - Expiry date of the drug
    * @param companyCRN - Unique identifier of the company to be added to the network
    */
    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN){
    	const requestCompanyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [companyCRN]);

        //Fetch Company Object from the network
        let requestCompanyBuffer = await ctx.stub
                .getState(requestCompanyKey)
                .catch(err => console.log(err));

        let requestCompanyObj = JSON.parse(requestCompanyBuffer.toString());
        //Check if drug addition is done only by manufacturer
        if(requestCompanyObj.organisationRole != 'Manufacturer'){
        	console.log('Invalid organisationRole for add drug function');
        }

        //Create a new composite key for the new Request Drug
        const requestDrugKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [serialNo, drugName]);

        //Create new Request drug object to be stored in blockchain
        let newRequestDrugObject = {
            productID: requestDrugKey,
            name: drugName,
            nanufacturer: requestCompanyKey,
            manufacturingDate: mfgDate,
            expiryDate: expDate,
            owner: requestCompanyKey,
            shipment: [],
        }

        //Convert the object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(newRequestDrugObject));
        await ctx.stub.putState(requestDrugKey, dataBuffer);

        return newRequestDrugObject;
    }

    /*
    * Registers a new Purchase Order on the ledger
    * @param ctx - The Transactional Context Object
    * @param buyerCRN - Unique identifier of the buyer 
    * @param sellerCRN - Unique identifier of the seller
    * @param drugName - Name of the drug
    * @param quantity - Quantity of drugs to be supplied
    */
    async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity){
    	const buyerCompanyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [buyerCRN]);
    	const sellerCompanyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [sellerCRN]);

    	let buyerCompanyBuffer = await ctx.stub
                .getState(buyerCompanyKey)
                .catch(err => console.log(err));

        let buyerCompanyObj = JSON.parse(buyerCompanyBuffer.toString());

        let sellerCompanyBuffer = await ctx.stub
                .getState(sellerCompanyKey)
                .catch(err => console.log(err));

        let sellerCompanyObj = JSON.parse(sellerCompanyBuffer.toString());

        //Either merchant can sell to distributor or distributor can to retailer
        if (((buyerCompanyObj.organisationRole == 'Distributor') && (sellerCompanyObj.organisationRole == 'Manufacturer'))
        	||
        	((buyerCompanyObj.organisationRole == 'Retailer') && (sellerCompanyObj.organisationRole == 'Distributor')))
        {
        	const requestPOKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchase_order', [buyerCRN, drugName]);
        	let newRequestPOObject = {
	            poID: requestPOKey,
	            drugName: drugName,
	            quantity: quantity,
	            buyer: buyerCompanyKey,
	            seller: sellerCompanyKey
	        }

	        //Convert the object to a buffer and send it to blockchain for storage
	        let dataBuffer = Buffer.from(JSON.stringify(newRequestPOObject));
	        await ctx.stub.putState(requestPOKey, dataBuffer);

	        return newRequestPOObject;
        } else {
        	console.log(`${buyerCompanyObj.organisationRole} cant buy from ${sellerCompanyObj.organisationRole}`);
        }
    }

    /*
    * Registers a new Shipment on the ledger
    * @param ctx - The Transactional Context Object
    * @param buyerCRN - Unique identifier of the buyer 
    * @param drugName - Name of the drug
    * @param listOfAssets - List of associated drugs to be sent
    * @param transporterCRN - Unique identifier of the transporter
    */
    async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN){
        shipmentStatus = ['in-transit', 'delivered'];
    	const requestPOKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchase_order', [buyerCRN, drugName]);

    	let requestPOBuffer = await ctx.stub
                .getState(requestPOKey)
                .catch(err => console.log(err));

        let requestPOObj = JSON.parse(requestPOBuffer.toString());

        // If assests list is equals to quantity mentioned in purchase order
        if(listOfAssets.length != requestPOObj.quantity){
        	console.log("Assets length does not match quantity in purchase order");
        }

        // Check for assest validity
        finListofAssests = []
        for (assets in listOfAssets){
        	let requestassetBuffer = await ctx.stub
                .getState(assets)
                .catch(err => console.log(err));

            if(requestassetBuffer !== null){
            	finListofAssests.push(assets);
            }
        }

        const transporterCompanyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [transporterCRN]);

        const requestShipmentKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment', [buyerCRN, drugName]);
        let cid = new ClientIdentity(ctx.stub);
    	let newRequestShipmentObject = {
            shipmentID: requestShipmentKey,
            creator: cid.getID(),
            assets: finListofAssests,
            transporter: transporterCompanyKey,
            status: shipmentStatus[0]
        }

        //Convert the object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(newRequestShipmentObject));
        await ctx.stub.putState(requestShipmentKey, dataBuffer);

        for (asset in listOfAssets){
        	let requestassetBuffer = await ctx.stub
                .getState(asset)
                .catch(err => console.log(err));

            if(requestassetBuffer !== null){
            	let requestassetObj = JSON.parse(requestassetBuffer.toString());

		        //Create Updated Drug object to be stored in blockchain
		        let newRequestDrugObject = {
		            productID: requestassetObj.productID,
		            name: requestassetObj.name,
		            nanufacturer: requestassetObj.manufacturer,
		            manufacturingDate: requestassetObj.manufacturingDate,
		            expiryDate: requestassetObj.expiryDate,
		            owner: transporterCompanyKey,
		            shipment: requestassetObj.shipment
		        }

		        //Convert the object to a buffer and send it to blockchain for storage
		        let dataBuffer = Buffer.from(JSON.stringify(newRequestDrugObject));
		        await ctx.stub.putState(asset, dataBuffer);
		    }
	    }

        return newRequestShipmentObject;
    }

    /*
    * Registers a updated Shipment on the ledger
    * @param ctx - The Transactional Context Object
    * @param buyerCRN - Unique identifier of the buyer 
    * @param drugName - Name of the drug
    * @param transporterCRN - Unique identifier of the transporter
    */
    async updateShipment(ctx, buyerCRN, drugName, transporterCRN){
        shipmentStatus = ['in-transit', 'delivered'];
    	const transporterCompanyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [transporterCRN]);
    	const requestShipmentKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment', [buyerCRN, drugName]);
    	const requestPurchaseOrderkey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.purchase_order', [buyerCRN, drugName]);

    	let transporterCompanyBuffer = await ctx.stub
                .getState(transporterCompanyKey)
                .catch(err => console.log(err));

        let transporterCompanyObj = JSON.parse(transporterCompanyBuffer.toString());

        // check if shipment status be changed only by transporter
        if(transporterCompanyObj.organisationRole !== 'Transporter'){
        	console.log('not a transporter');
        }

        let purchaseOrderBuffer = await ctx.stub
                .getState(requestPurchaseOrderkey)
                .catch(err => console.log(err));

        let purchaseOrderObj = JSON.parse(purchaseOrderBuffer.toString());

        let shipmentCompanyBuffer = await ctx.stub
                .getState(requestShipmentKey)
                .catch(err => console.log(err));

        let shipmentCompanyObj = JSON.parse(shipmentCompanyBuffer.toString());

        let newRequestShipmentObject = {
            shipmentID: shipmentCompanyObj.shipmentID,
            creator: shipmentCompanyObj.creator,
            assets: shipmentCompanyObj.assets,
            transporter: shipmentCompanyObj.transporter,
            status: shipmentStatus[1]
        }

        //Convert the object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(newRequestShipmentObject));
        await ctx.stub.putState(requestShipmentKey, dataBuffer);

		for (asset in shipmentCompanyObj.assets){
        	let requestassetBuffer = await ctx.stub
                .getState(asset)
                .catch(err => console.log(err));

            if(requestassetBuffer !== null){
            	let requestassetObj = JSON.parse(requestassetBuffer.toString());

		        //Create Updated Drug object to be stored in blockchain
		        let newRequestDrugObject = {
		            productID: requestassetObj.productID,
		            name: requestassetObj.name,
		            nanufacturer: requestassetObj.manufacturer,
		            manufacturingDate: requestassetObj.manufacturingDate,
		            expiryDate: requestassetObj.expiryDate,
		            owner: purchaseOrderObj.buyer,
		            shipment: requestassetObj.shipment.push(requestShipmentKey)
		        }

		        //Convert the object to a buffer and send it to blockchain for storage
		        let dataBuffer = Buffer.from(JSON.stringify(newRequestDrugObject));
		        await ctx.stub.putState(asset, dataBuffer);
		    }
	    }
    }

    /*
    * Updating drug ownership to customer on the ledger
    * @param ctx - The Transactional Context Object
    * @param drugName - Name of the drug
    * @param serialNo - Unique identifier of the drug to be added to the network
    * @param retailerCRN - Unique Identifier of retailer
    * @param customerAadhar - Adhar no of customer to be added
    */
    async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar){
    	const requestDrugKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [serialNo, drugName]);

    	let drugBuffer = await ctx.stub
                .getState(requestDrugKey)
                .catch(err => console.log(err));

        let drugObj = JSON.parse(drugBuffer.toString());

        let drugOwnerBuffer = await ctx.stub
                .getState(requestDrugKey)
                .catch(err => console.log(err));

        let drugOwnerObj = JSON.parse(drugOwnerBuffer.toString());

        // check if drug sale to customer be done only by retailer
        if(drugOwnerObj.organisationRole != 'Retailer'){
        	console.log('Not a retailer');
        }

        let newRequestDrugObject = {
            productID: drugObj.productID,
            name: drugObj.name,
            nanufacturer: drugObj.manufacturer,
            manufacturingDate: drugObj.manufacturingDate,
            expiryDate: drugObj.expiryDate,
            owner: customerAadhar,
            shipment: drugObj.shipment
        }

        //Convert the object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(newRequestDrugObject));
        await ctx.stub.putState(requestDrugKey, dataBuffer);
    }

    /*
    * Viw the history of the drug on the ledger
    * @param drugName - Name of the drug
    * @param serialNo - Unique identifier of the drug to be added to the network
    */
    async viewHistory(drugName, serialNo){
        const requestDrugKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [serialNo, drugName]);

        ctx.stub.getHistoryForKey(requestDrugKey).then((data) => {
            return data;
        });
    }

    /*
    * Viw the current state of the drug on the ledger
    * @param drugName - Name of the drug
    * @param serialNo - Unique identifier of the drug to be added to the network
    */
    async viewDrugCurrentState(drugName, serialNo){
        const requestDrugKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [serialNo, drugName]);

        let drugBuffer = await ctx.stub
                .getState(requestDrugKey)
                .catch(err => console.log(err));

        let drugObj = JSON.parse(drugBuffer.toString());

        var mfgDate = new Date(drugObj.manufacturingDate);
		var expDate = new Date(drugObj.expiryDate);
		if(expDate > mfgDate){
			return 'expired';
		}else{
			return 'not expired';
		}
    }

}

module.exports = PharmaNetContract;