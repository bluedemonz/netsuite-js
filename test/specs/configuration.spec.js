'use strict';

var _ = require('lodash'),
  nock = require('nock'),
  should = require('should'),
  NetSuite = require('../../'),
  MockNetSuiteService = require('../mockNetSuiteService');

var credentials = {
  email: 'test@test.com',
  password: 'password',
  account: 123456
};

var mockWsdlUrl = 'https://webservices.netsuite.com';
var mockWsdlUrlService;

describe('NetSuite.Configuration', function() {
  beforeEach(function(done) {
    mockWsdlUrlService = nock('https://rest.netsuite.com')
      .get('/rest/roles')
      .reply(200, [{
        'account': {
          'internalId': '123456',
          'name': 'Test Company'
        },
        'role': {
          'internalId': 3,
          'name': 'Administrator'
        },
        'dataCenterURLs': {
          // 'restDomain': 'https://rest.na1.netsuite.com',
          // 'systemDomain': 'https://system.na1.netsuite.com',
          'webservicesDomain': mockWsdlUrl
        }
      }]);

    MockNetSuiteService
      .mockWsdl(mockWsdlUrl)
      .then(function() {
        done();
      });
  });

  it('should exist in the NetSuite package', function() {
    should.exist(NetSuite.Configuration);
  });

  it('should NOT populate role auth header if not specified', function() {
    var authHeader = NetSuite.Configuration.createAuthHeader(credentials);
    should.not.exist(authHeader['platformMsgs:passport']['platformCore:role']);
  });

  it('should populate role auth header if specified', function() {
    var credsWithRole = _.assign({
      role: 3
    }, credentials);


    var authHeader = NetSuite.Configuration.createAuthHeader(credsWithRole);
    authHeader['platformMsgs:passport']['platformCore:role'].attributes.internalId.should.equal(3);
  });

  // TODO: make this test not connect to the actual NetSuit endpoint
  it('should connect to a (mock) NetSuite wsdl', function(done) {
    var config = new NetSuite.Configuration(credentials);
    config
      .createConnection()
      .then(function(client) {
        config._webservicesDomain.should.equal(mockWsdlUrl);
        done();
      })
      .catch(function(err) {
        should.fail('Promise rejected', err);
        done();
      });
  });

});