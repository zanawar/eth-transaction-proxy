pragma solidity ^0.4.23;

contract TestBed
{
  // Simple enum for test
  enum TestEnumValues { EnumValue1, EnumValue2, EnumValue3, EnumValue4 }

  // Simple struct for test
  struct TestStruct {
    uint randomNumber;
    bool randomBoolean;
    string randomText;
  }

  // Storing all base types for tests
  bool testBool;
  int8 testInt8;
  int256 testInt256;
  uint8 testUint8;
  uint256 testUint256;
  bytes1 testBytes1;
  bytes32 testBytes32;
  bytes testRandomBytes;
  string testString;
  mapping (uint => bool) testMapping;
  mapping (address => string) testAddressMapping;

  // Enum and struct
  TestEnumValues testEnumValue;
  TestStruct testStruct;

  constructor() public {
    testBool = true;
    testInt8 = -17;
    testInt256 = -28358258;
    testUint8 = 33;
    testUint256 = 3423646;
    testBytes1 = bytes1(8);
    testBytes32 = bytes32(4723842384);
    bytes memory tempBytes = new bytes(88);
    for(uint i = 0; i < tempBytes.length; i++) {
      uint someByte = i >> (i + 1);
      tempBytes[i] = bytes1(someByte);
    }
    testRandomBytes = tempBytes;

    testStruct = TestStruct(47, false, "this is text");
    testString = "This is a default string for some reason";
    testEnumValue = TestEnumValues.EnumValue3;

    for (uint j = 0; j < 153; j++){
      testMapping[j] = ((j % 3) == (j % 4));
    }
  }

  function addAddressMapping(address addr, string str) public {
    testAddressMapping[addr] = str;
  }

  function getAddressMappingString(address addr) public view returns (string) {
    return testAddressMapping[addr];
  }

  function updateStructText(string sometext) public {
    testStruct = TestStruct(47, false, sometext);
  }
  
  function getStructText() public view returns (string) {
    return testStruct.randomText;
  }

  function getMappedBool(uint value) public view returns(bool) {
    return testMapping[value];
  }

  function modifyBool(bool value) public {
    testBool = value;
  }

  function getBool() public view  returns (bool) {
    return testBool;
  }

  function modifyint8(int8 value) public {
    testInt8 = value;
  }

  function getint8() public view  returns (int8) {
    return testInt8;
  }

  function modifyint256(int256 value) public {
    testInt256 = value;
  }

  function getint256() public view  returns (int256) {
    return testInt256;
  }

  function modifyuint8(uint8 value) public {
    testUint8 = value;
  }

  function getuint8() public view  returns (uint8) {
    return testUint8;
  }

  function modifyuint256(uint256 value) public {
    testUint256 = value;
  }

  function getuint256() public view  returns (uint256) {
    return testUint256;
  }

  function modifybytes1(bytes1 value) public {
    testBytes1 = value;
  }

  function getbytes1() public view  returns (bytes1) {
    return testBytes1;
  }

  function modifybytes32(bytes32 value) public {
    testBytes32 = value;
  }

  function getbytes32() public view  returns (bytes32) {
    return testBytes32;
  }

  function modifybytes(bytes value) public {
    testRandomBytes = value;
  }

  function getRandomBytes() public view  returns (bytes) {
    return testRandomBytes;
  }

  function getArbitraryAddressBalance(address addr) public view returns (uint) {
    return addr.balance;
  }

  function getSenderAddressBalance() public view returns (uint) {
    return msg.sender.balance;
  }

  function testOverload(uint256 value, uint256 other) public returns (uint) {
    testUint256 = other;
    return value;
  }

  function testOverload(uint256 value, uint8 other) public returns (uint) {
    testUint8 = other;
    return value;
  }

  function testOverload(uint8 value, uint256 other) public returns (uint) {
    testUint8 = value;
    return other;
  }

  // events
  event TestEventWithUint(uint);
  event TestEventWithAddress(address);

  function testSpawnEventUint(uint value) public {
    emit TestEventWithUint(value);
  }

  function testSpawnEventWithAddress() public {
    emit TestEventWithAddress(msg.sender);
  }
}
