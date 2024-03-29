process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require("../index.js");
let should = chai.should();

chai.use(chaiHttp);

// Test Template for Width Tests - Chai and JSON level
function test_RateByWidths(w, w_u, done, rstatus, rrate = null){
    let envelopeProperties = {
        length : 200, 
        length_unit : "mm",
        width: w,
        width_unit: w_u,
        weight: 15,
        weight_unit: "g"
    };
    chai.request(server)
    .post("/rate")
    .send(envelopeProperties)
    .end((err,res) => {
        // Assert status
        res.should.have.status(rstatus)
        // Assert rate, if needed
        if(rrate !== null){
            res.body.should.have.property("rate").equal(rrate);
        }
        // Indicate test is complete
        done();
    });
}

// Test Template for Width Tests - Mocha level
function loggedTest_RateByWidths(wid, wid_unit, desc_expectedRes, resStatus, resRate = null){
    describe("POST /rate with " + wid + " " + wid_unit + " width", () => {
        let description = "it should yield a " + desc_expectedRes;
        if(resRate !== null){
            description = description + " with rate at " + resRate;
        }
        it(description, (done) => {
            test_RateByWidths(wid,wid_unit,done,resStatus,resRate)
        });
    });
}

// Mocha Test Parent for all tests in this file
describe("Test /rate POST, varying sent width properties", () =>{

    // Out of bounds: negative mm is not possible
    loggedTest_RateByWidths(-1,"mm","Bad request response status",400);
    // Non-standard envelope widths in mm
    loggedTest_RateByWidths(0,"mm","OK response status", 200, 0.98);
    loggedTest_RateByWidths(1,"mm","OK response status", 200, 0.98);
    loggedTest_RateByWidths(89,"mm","OK response status", 200, 0.98);
    // Standard envelope widths in mm
    loggedTest_RateByWidths(90,"mm","OK response status", 200, 0.49);
    loggedTest_RateByWidths(91,"mm","OK response status", 200, 0.49);
    loggedTest_RateByWidths(155,"mm","OK response status", 200, 0.49);
    loggedTest_RateByWidths(156,"mm","OK response status", 200, 0.49);
    // Non-standard envelope widths in mm
    loggedTest_RateByWidths(157,"mm","OK response status", 200, 0.98);
    loggedTest_RateByWidths(269,"mm","OK response status", 200, 0.98);
    loggedTest_RateByWidths(270,"mm","OK response status", 200, 0.98);
    // Out of bounds: oversized envelope: we assume 380mm is limit.
    loggedTest_RateByWidths(271,"mm","Bad request response status", 400);
    // Out of bounds: negative inches in possible
    loggedTest_RateByWidths(-1,"inch","Bad request response status", 400);
    // Non-standard envelope widths in inches
    loggedTest_RateByWidths(0,"inch","OK response status", 200, 0.98);
    loggedTest_RateByWidths(1,"inch","OK response status", 200, 0.98);
    // Standard envelope size in inches
    loggedTest_RateByWidths(5,"inch","OK response status", 200, 0.49);
    // Non-standard envelope widths in inches
    loggedTest_RateByWidths(8,"inch","OK response status", 200, 0.98);
    // Out of bounds: oversized envelope: we assume 380mm is limit.
    loggedTest_RateByWidths(12,"inch","Bad request response status", 400);
    // Bad payload: invalid unit of width
    loggedTest_RateByWidths(1,"asdf","Bad request response status", 400);
    // Bad Payload: non-numeric width
    loggedTest_RateByWidths("asdf","inch","Bad request response status", 400);

});