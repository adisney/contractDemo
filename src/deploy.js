#!/usr/bin/env node

const colors = require('colors');

/**
 * Deploy MoneyToken.
 */

async function deployMoneyToken() {
  console.log('Beginning deployment of MoneyToken...');

  const MoneyToken = await ethers.getContractFactory('MoneyToken');
  const moneyToken = await MoneyToken.deploy();

  await moneyToken.deployed();
  console.log(`MoneyToken deployed at ${moneyToken.address}`.yellow);
  console.log('');

  return moneyToken;
}

/**
 * Deploy Wallet contract;
 */

async function deployWallet(captain, pirate1, pirate2) {
  console.log('Beginning deployment of the Wallet...');

  const Wallet = await ethers.getContractFactory('Wallet');
  // Deploy the wallet with the list of permitted addresses.
  const wallet = await Wallet.deploy([captain, pirate1, pirate2]);

  await wallet.deployed();
  console.log(`Wallet deployed at ${wallet.address}`.yellow);
  console.log('');

  return wallet;
}

/**
 * Deploy free real estate.
 */

async function deployDoubloonToken() {
  console.log('Beginning deployment of the Spanish Doubloon...');

  const DoubloonToken = await ethers.getContractFactory('DoubloonToken');
  const doubloonToken = await DoubloonToken.deploy();

  await doubloonToken.deployed();
  console.log(`DoubloonToken deployed at ${doubloonToken.address}`.yellow);
  console.log('');

  return doubloonToken;
}

/**
 * Deploy TreasureChest contract.
 */

async function deployTreasureChest(doubloonToken) {
  console.log('Beginning deployment of the TreasureChest...');

  // Ensure doubloonToken to definitely deployed so we can get the `address` of it.
  const TreasureChest = await ethers.getContractFactory('TreasureChest');
  // Deploy the treasure chest and tell it to hold Spanish Doubloons.
  const treasureChest = await TreasureChest.deploy(doubloonToken.address);

  await treasureChest.deployed();
  console.log(`TreasureChest deployed at ${treasureChest.address}`.yellow);
  console.log('');

  return treasureChest;
}

/**
 * Output an executable slice of code for use in a buidler console.
 */

function initConsoleScript(moneyTokenAddress, walletAddress, doubloonTokenAddress, treasureChestAddress) {
  console.log('');
  console.log('**************************************************************'.green);
  console.log('Copy/paste this code into a console to initialize your session'.green);
  console.log('**************************************************************'.green);
  console.log(`
[captain, pirate1, pirate2, cabinBoy] = await ethers.provider.listAccounts();
[captainSigner, pirate1Signer, pirate2Signer, cabinBoySigner] = await ethers.getSigners();
MoneyToken = await ethers.getContractFactory('MoneyToken')
moneyToken = await MoneyToken.attach('${moneyTokenAddress}');
Wallet = await ethers.getContractFactory('Wallet')
wallet = await Wallet.attach('${walletAddress}');
DoubloonToken = await ethers.getContractFactory('DoubloonToken')
doubloonToken = await DoubloonToken.attach('${doubloonTokenAddress}');
TreasureChest = await ethers.getContractFactory('TreasureChest')
treasureChest = await TreasureChest.attach('${treasureChestAddress}');
  `)
  console.log('**************************************************************'.green);
  console.log('Copy/paste this code into a console to initialize your session'.green);
  console.log('**************************************************************'.green);
}

/**
 * Deploy the pirate contracts.
 */

async function main() {
  const accounts = await ethers.provider.listAccounts();
  const [ captain, pirate1, pirate2, cabinBoy ] = accounts;
  console.log('');

  const moneyToken = await deployMoneyToken();
  const wallet = await deployWallet(captain, pirate1, pirate2);
  const doubloonToken = await deployDoubloonToken();
  const treasureChest = await deployTreasureChest(doubloonToken);

  console.log('*******************'.blue);
  console.log('Deployment complete'.blue);
  console.log('*******************'.blue);

  console.log('');
  console.log(`Minted ${(await moneyToken.balanceOf(captain)).toString().green} MoneyTokens (${('symbol: ' + (await moneyToken.symbol()).toString()).yellow}) tokens for the captain (${captain.blue})`);
  console.log(`Minted ${(await doubloonToken.balanceOf(captain)).toString().green} DoubloonTokens (${('symbol: ' + (await doubloonToken.symbol()).toString()).yellow}) tokens for the captain (${captain.blue})`);

  initConsoleScript(moneyToken.address, wallet.address, doubloonToken.address, treasureChest.address);
}

/**
 * Run the program.
 */

main()
.then(() => {
  console.log('');
  console.log('Contract deployment successful'.yellow);
})
.catch(error => {
  console.log('There was an error deploying the contract'.red);
  console.log('error', error);
});

