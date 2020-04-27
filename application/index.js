const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

//Import all function modules
const addtoConsumerWallet = require('./addtoConsumerWallet');
const addtoDistributorWallet = require('./addtoDistributorWallet');
const addtoManufacturerWallet = require('./addtoManufacturerWallet');
const addtoRetailerWallet = require('./addtoRetailerWallet');
const addtoTransporterWallet = require('./addtoTransporterWallet');
const registerCompany = require('./registerCompany');
const addDrug = require('./addDrug');
const createPO = require('./createPO');
const createShipment = require('./createShipment');
const updateShipment = require('./updateShipment');
const retailDrug = require('./retailDrug');
const viewHistory = require('./viewHistory');
const viewDrugCurrentState = require('./viewDrugCurrentState');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.set('title', 'Pharma App');

app.get('/', (req,res) => res.send('Hola amigos'));

app.post('/addtoConsumerWallet', (req, res) => {
    addtoConsumerWallet.execute(req.body.certificationPath, req.body.privateKeyPath)
        .then(() => {
            console.log('Consumer added to wallet');
            const result = {
                status: 'success',
                message: 'Consumer added to wallet'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/addtoDistributorWallet', (req, res) => {
    addtoDistributorWallet.execute(req.body.certificationPath, req.body.privateKeyPath)
        .then(() => {
            console.log('Distributor added to wallet');
            const result = {
                status: 'success',
                message: 'Distributor added to wallet'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/addtoManufacturerWallet', (req, res) => {
    addtoManufacturerWallet.execute(req.body.certificationPath, req.body.privateKeyPath)
        .then(() => {
            console.log('Manufacturer added to wallet');
            const result = {
                status: 'success',
                message: 'Manufacturer added to wallet'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/addtoRetailerWallet', (req, res) => {
    addtoRetailerWallet.execute(req.body.certificationPath, req.body.privateKeyPath)
        .then(() => {
            console.log('Retailer added to wallet');
            const result = {
                status: 'success',
                message: 'Retailer added to wallet'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/addtoTransporterWallet', (req, res) => {
    addtoTransporterWallet.execute(req.body.certificationPath, req.body.privateKeyPath)
        .then(() => {
            console.log('Transporter added to wallet');
            const result = {
                status: 'success',
                message: 'Transporter added to wallet'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/registerCompany', (req, res) => {
    registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.location, req.body.organisationRole)
        .then(() => {
            console.log('Company is Registered');
            const result = {
                status: 'success',
                message: 'Company is Registered'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/addDrug', (req, res) => {
    addDrug.execute(req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN)
        .then(() => {
            console.log('Drug is Registered');
            const result = {
                status: 'success',
                message: 'Drug is Registered'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/createPO', (req, res) => {
    createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity)
        .then(() => {
            console.log('Purchase Order is created');
            const result = {
                status: 'success',
                message: 'Purchase Order is created'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.post('/createShipment', (req, res) => {
    createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN)
        .then(() => {
            console.log('Shipment is created');
            const result = {
                status: 'success',
                message: 'Shipment is created'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.patch('/updateShipment', (req, res) => {
    updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN)
        .then(() => {
            console.log('Shipment is updated');
            const result = {
                status: 'success',
                message: 'Shipment is updated'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.patch('/retailDrug', (req, res) => {
    retailDrug.execute(req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar)
        .then(() => {
            console.log('Drug is successfully sent to consumer');
            const result = {
                status: 'success',
                message: 'Drug is successfully sent to consumer'
            };
            res.json(result);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.get('/viewHistory', (req, res) => {
    viewHistory.execute(req.body.serialNo)
        .then((data) => {
            console.log('History of the drug');
            res.json(data);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.get('/viewDrugCurrentState', (req, res) => {
    viewDrugCurrentState.execute(req.body.serialNo)
        .then((data) => {
            console.log('Current State of the drug');
            res.json(data);
        })
        .catch((e) => {
            const result = {
                status: 'error',
                message: 'Failed',
                error: e
            };
            res.status(500).send(result);
        });
});

app.listen(port, () => console.log(`Distributed pharmacy app listening on port ${port}`));
