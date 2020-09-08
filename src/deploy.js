#!/usr/bin/env node

/**
 * Module dependencies.
 */

const child_process = require('child_process');
const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8546"));

/**
 * Constants.
 */

const fromAddress = "0xa44f8cce3611ca899e7737d59705f6b42dd63d9e";

/**
 * Deploy the contract.
 */

async function deployContract(transaction, gasAmount) {
  function deploy(done, error) {
    transaction
      .send({
        from: fromAddress,
        gas: gasAmount
      })
      .on('transactionHash', function(hash) {
        console.log("Contract deployment transaction hash: " + hash);
      })
      .on('receipt', function(receipt) {
        const contractAddress = receipt.contractAddress;
        console.log("Transaction mined. Contract is located at address: " + contractAddress);
        console.log('');

        done(contractAddress);
      })
      .on('error', function(error, receipt) {
        console.error(error);
        if (receipt) {
          console.error("Transaction receipt:");
          console.error(receipt);
        }

        error();
      });
  }

  return new Promise(deploy);
}

/**
 * Get the ABI and deploy the function
 */

async function main() {
  const { abi, bytecode } = JSON.parse(fs.readFileSync('./artifacts/MoneyToken.json', 'utf8'));
  const MoneyTokenContract = new web3.eth.Contract(abi, null, {from: fromAddress});

  const transaction = MoneyTokenContract.deploy({data: bytecode});
  const gasEstimate = await transaction.estimateGas()

  const deployedAddress = await deployContract(transaction, gasEstimate);
  MoneyTokenContract.options.address = deployedAddress;

  const balance = await MoneyTokenContract.methods.balanceOf(fromAddress).call()
  console.log(`Minted ${balance} ${await MoneyTokenContract.methods.symbol().call()} tokens at deployer address (${fromAddress})`);
}

main()
.then(() => {
  console.log('');
  console.log('Contract deployment successful');

  web3.eth.currentProvider.connection.close();
})
.catch(error => {
  console.log('There was an error deploying the contract');
  console.log('error', error);
});

