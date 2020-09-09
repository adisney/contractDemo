const { expect } = require("chai");

describe("Wallet", function() {
  let moneyToken;
  let wallet;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let moneyTokenAddress;

  beforeEach(async () => {
    [ owner, addr1, addr2, addr3 ] = await ethers.provider.listAccounts();

    const MoneyToken = await ethers.getContractFactory("MoneyToken");
    moneyToken = await MoneyToken.deploy();

    moneyTokenAddress = moneyToken.address;

    const Wallet = await ethers.getContractFactory("Wallet");
    wallet = await Wallet.deploy();

    await wallet.deployed();

    await moneyToken.approve(wallet.address, 100);
    await wallet.deposit(moneyTokenAddress, 100)
  });

  it('should get balance of `tokenAddress` for `holder`', async () => {
    expect(await wallet.balanceOf(owner, moneyTokenAddress)).to.equal(100);
    expect(await wallet.balanceOf(addr1, moneyTokenAddress)).to.equal(0);
  });

  it('should have zero balance for unknown token address', async () => {
    const OtherToken = await ethers.getContractFactory("MoneyToken");
    const otherToken = await OtherToken.deploy();
    const otherTokenAddress = otherToken.address;

    expect(await wallet.balanceOf(owner, otherTokenAddress)).to.equal(0);
    expect(await wallet.balanceOf(addr1, otherTokenAddress)).to.equal(0);
  });

  it('should revert with message if insufficient allowance', async () => {
    try {
      await wallet.deposit(moneyTokenAddress, 100)

      fail();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: revert insufficient allowance');
    }
  });

  it('should transfer tokens on behalf of depositor to contractor', async () => {
    const startingBalance = await moneyToken.balanceOf(owner);

    await moneyToken.approve(wallet.address, 50);
    await wallet.deposit(moneyTokenAddress, 50)

    expect(await moneyToken.balanceOf(owner)).to.equal(startingBalance - 50);
  });

  it('should call function on address', async () => {
    const DubloonToken = await ethers.getContractFactory("DubloonToken");
    const dubloonToken = await DubloonToken.deploy();

    const TreasureChest = await ethers.getContractFactory("TreasureChest");
    const treasureChest = await TreasureChest.deploy(dubloonToken.address);
    await treasureChest.deployed();

    // Fill the treasure chest
    await dubloonToken.transfer(treasureChest.address, 75);
    // Verify the treasure chest is filled
    expect(await dubloonToken.balanceOf(treasureChest.address)).to.equal(75);

    // X marks the spot
    await treasureChest.unbury();

    // Prepare the function call encoded as hex string
    const abi = ["function open()"];
    const iface = new ethers.utils.Interface(abi);
    const data = iface.encodeFunctionData("open", [])

    // Have addr1 open the chest and reap the rewards
    const [, addr1Signer] = await ethers.getSigners();
    await wallet.connect(addr1Signer).invokeContractFunction(treasureChest.address, data);

    expect(await dubloonToken.balanceOf(treasureChest.address)).to.equal(0);
    expect(await dubloonToken.balanceOf(wallet.address)).to.equal(75);
  });
});
