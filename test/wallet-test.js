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
    [ owner, addr1, addr2, notPermittedAddress ] = await ethers.provider.listAccounts();

    const MoneyToken = await ethers.getContractFactory("MoneyToken");
    moneyToken = await MoneyToken.deploy();

    moneyTokenAddress = moneyToken.address;

    const Wallet = await ethers.getContractFactory("Wallet");
    wallet = await Wallet.deploy([owner, addr1, addr2]);

    await wallet.deployed();

    await moneyToken.approve(wallet.address, 100);
    await wallet.deposit(moneyTokenAddress, 100)
  });

  describe('balanceOf', () => {
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
  });

  describe('deposit', () => {
    it('should revert with message if insufficient allowance', async () => {
      try {
        await wallet.deposit(moneyTokenAddress, 100)

        fail();
      } catch (error) {
        expect(error.message).to.equal('VM Exception while processing transaction: revert insufficient allowance');
      }
    });

    it('should transfer tokens on behalf of depositor to wallet', async () => {
      const startingBalance = await moneyToken.balanceOf(owner);

      await moneyToken.approve(wallet.address, 50);
      await wallet.deposit(moneyTokenAddress, 50)

      expect(await moneyToken.balanceOf(owner)).to.equal(startingBalance - 50);
    });

    it('should revert if address not permitted', async () => {
      const [,,, notPermittedSigner] = await ethers.getSigners();
      const startingBalance = await moneyToken.balanceOf(notPermittedAddress);
      await moneyToken.connect(notPermittedSigner).approve(wallet.address, 50);

      try {
        await wallet.connect(notPermittedSigner).deposit(moneyTokenAddress, 50)

        fail();
      } catch (error) {
        expect(error.message).to.equal('VM Exception while processing transaction: revert not a permitted address');
      }
    });
  });

  describe('withdraw', () => {
    let addr1Signer;
    let addr1Wallet;

    beforeEach(async () => {
      [, addr1Signer] = await ethers.getSigners();
      addr1Wallet = wallet.connect(addr1Signer);

      await moneyToken.transfer(addr1, 10);
      await moneyToken.connect(addr1Signer).approve(wallet.address, 10);
    });

    it('should revert if insufficient balance in wallet', async () => {
      try {
        await wallet.connect(addr1Signer).withdraw(moneyToken.address, 10);

        fail();
      } catch (error) {
        expect(error.message).to.equal('VM Exception while processing transaction: revert insufficient balance in wallet');
      }
    });

    it('should send tokens from wallet to `msg.sender`', async () => {
      await addr1Wallet.deposit(moneyToken.address, 10);
      await addr1Wallet.withdraw(moneyToken.address, 10);

      expect(await addr1Wallet.balanceOf(addr1, moneyToken.address)).to.equal(0);
      expect(await moneyToken.balanceOf(addr1)).to.equal(10);
    });
  });

  describe('transfer', () => {
    let addr1Signer;
    let addr1Wallet;

    beforeEach(async () => {
      [, addr1Signer] = await ethers.getSigners();
      addr1Wallet = wallet.connect(addr1Signer);

      await moneyToken.transfer(addr1, 10);
      await moneyToken.connect(addr1Signer).approve(wallet.address, 10);
    });

    it('should revert if insufficient balance in wallet', async () => {
      try {
        await wallet.connect(addr1Signer).transfer(moneyToken.address, 10, addr2);

        fail();
      } catch (error) {
        expect(error.message).to.equal('VM Exception while processing transaction: revert insufficient balance in wallet');
      }
    });

    it('should send tokens from wallet to `destinationAddress`', async () => {
      await addr1Wallet.deposit(moneyToken.address, 10);
      await addr1Wallet.transfer(moneyToken.address, 10, addr2);

      expect(await addr1Wallet.balanceOf(addr1, moneyToken.address)).to.equal(0);
      expect(await moneyToken.balanceOf(addr2)).to.equal(10);
    });
  });

  describe('invoke', () => {
    let dubloonToken;
    let treasureChest;

    beforeEach(async () => {
      const DubloonToken = await ethers.getContractFactory("DubloonToken");
      dubloonToken = await DubloonToken.deploy();

      const TreasureChest = await ethers.getContractFactory("TreasureChest");
      treasureChest = await TreasureChest.deploy(dubloonToken.address);
      await treasureChest.deployed();

      // Fill the treasure chest
      await dubloonToken.transfer(treasureChest.address, 75);
      // Verify the treasure chest is filled
      expect(await dubloonToken.balanceOf(treasureChest.address)).to.equal(75);

      // X marks the spot
      await treasureChest.unbury();
    });

    it('should call function on address', async () => {
      // Prepare the function call encoded as hex string
      const abi = ["function open()"];
      const iface = new ethers.utils.Interface(abi);
      const data = iface.encodeFunctionData("open", [])

      // Have addr1 open the chest and reap the rewards
      const [, addr1Signer] = await ethers.getSigners();
      await wallet.connect(addr1Signer).invokeContractFunction(treasureChest.address, data);

      // Treasure chest should be empty
      expect(await dubloonToken.balanceOf(treasureChest.address)).to.equal(0);
      // Rewarded funds live in the wallet
      expect(await dubloonToken.balanceOf(wallet.address)).to.equal(75);
    });

    it('should revert if not permitted', async () => {
      // Prepare the function call encoded as hex string
      const abi = ["function open()"];
      const iface = new ethers.utils.Interface(abi);
      const data = iface.encodeFunctionData("open", [])

      // Have addr1 open the chest and reap the rewards
      const [, , , notPermittedSigner] = await ethers.getSigners();

      try {
        await wallet.connect(notPermittedSigner).invokeContractFunction(treasureChest.address, data);
      } catch (error) {
        expect(error.message).to.equal('VM Exception while processing transaction: revert not a permitted address');
      }
    });
  });
});
