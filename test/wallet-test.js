const { expect } = require("chai");

describe("Wallet", function() {
  let moneyToken;
  let moneyTokenAddress;
  let wallet;
  let captain;
  let pirate1;
  let pirate2;
  let cabinBoy;

  beforeEach(async () => {
  });

  describe('Permissioned inheritance', () => {
    it('should set captain as admin');

    it('should set captain, pirate1 and pirate2 as permitted');

    it('should not set cabinBoy as permitted');
  });

  describe.skip('balanceOf', () => {
    it('should get balance of `tokenAddress` for `holder`', async () => {
      expect(await wallet.balanceOf(captain, moneyTokenAddress)).to.equal(100);
      expect(await wallet.balanceOf(pirate1, moneyTokenAddress)).to.equal(0);
    });

    it('should have zero balance for unknown token address', async () => {
      const OtherToken = await ethers.getContractFactory("MoneyToken");
      const otherToken = await OtherToken.deploy();
      const otherTokenAddress = otherToken.address;

      expect(await wallet.balanceOf(captain, otherTokenAddress)).to.equal(0);
      expect(await wallet.balanceOf(pirate1, otherTokenAddress)).to.equal(0);
    });
  });

  describe.skip('deposit', () => {
    it('should revert if insufficient allowance', async () => {
      await expect(
        wallet.deposit(moneyTokenAddress, 100))
        .to.be.revertedWith('VM Exception while processing transaction: revert insufficient allowance');
    });

    it('should transfer tokens on behalf of depositor to wallet', async () => {
      const startingBalance = await moneyToken.balanceOf(captain);

      await moneyToken.approve(wallet.address, 50);
      await wallet.deposit(moneyTokenAddress, 50)

      expect(await moneyToken.balanceOf(captain)).to.equal(startingBalance - 50);
    });

    it('should revert if address not permitted', async () => {
      const [,,, notPermittedSigner] = await ethers.getSigners();
      const startingBalance = await moneyToken.balanceOf(cabinBoy);
      await moneyToken.connect(notPermittedSigner).approve(wallet.address, 50);

      await expect(
        wallet.connect(notPermittedSigner)
              .deposit(moneyTokenAddress, 50))
              .to.be.revertedWith('VM Exception while processing transaction: revert not a permitted address');
    });
  });

  describe.skip('withdraw', () => {
    let pirate1Signer;
    let pirate1Wallet;

    beforeEach(async () => {
      [, pirate1Signer] = await ethers.getSigners();
      pirate1Wallet = wallet.connect(pirate1Signer);

      await moneyToken.transfer(pirate1, 10);
      await moneyToken.connect(pirate1Signer).approve(wallet.address, 10);
    });

    it('should revert if insufficient balance in wallet', async () => {
      await expect(wallet.connect(pirate1Signer).withdraw(moneyToken.address, 10)).to.be.revertedWith('VM Exception while processing transaction: revert insufficient balance in wallet');
    });

    it('should send tokens from wallet to `msg.sender`', async () => {
      await pirate1Wallet.deposit(moneyToken.address, 10);
      await pirate1Wallet.withdraw(moneyToken.address, 10);

      expect(await pirate1Wallet.balanceOf(pirate1, moneyToken.address)).to.equal(0);
      expect(await moneyToken.balanceOf(pirate1)).to.equal(10);
    });
  });

  describe.skip('transfer', () => {
    let pirate1Signer;
    let pirate1Wallet;

    beforeEach(async () => {
      [, pirate1Signer] = await ethers.getSigners();
      pirate1Wallet = wallet.connect(pirate1Signer);

      await moneyToken.transfer(pirate1, 10);
      await moneyToken.connect(pirate1Signer).approve(wallet.address, 10);
    });

    it('should revert if insufficient balance in wallet', async () => {
      await expect(wallet.connect(pirate1Signer).transfer(moneyToken.address, 10, pirate2)).to.be.revertedWith('VM Exception while processing transaction: revert insufficient balance in wallet');
    });

    it('should send tokens from wallet to `destinationAddress`', async () => {
      await pirate1Wallet.deposit(moneyToken.address, 10);
      await pirate1Wallet.transfer(moneyToken.address, 10, pirate2);

      expect(await pirate1Wallet.balanceOf(pirate1, moneyToken.address)).to.equal(0);
      expect(await moneyToken.balanceOf(pirate2)).to.equal(10);
    });
  });

  describe.skip('invoke', () => {
    let doubloonToken;
    let treasureChest;

    beforeEach(async () => {
    });

    it('should revert if not permitted');

    it('should call function on target contract');
  });
});
