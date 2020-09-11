const { expect } = require("chai");

describe("TreasureChest", function() {
  let moneyToken;
  let treasureChest;
  let captain;
  let pirate1;
  let cabinBoy

  beforeEach(async () => {
    [ captain, pirate1, cabinBoy ] = await ethers.provider.listAccounts();

    const MoneyToken = await ethers.getContractFactory("MoneyToken");
    moneyToken = await MoneyToken.deploy();

    const TreasureChest = await ethers.getContractFactory("TreasureChest");
    treasureChest = await TreasureChest.deploy(moneyToken.address);

    await treasureChest.deployed();
  });

  describe('initialization', () => {
    it('should set the `tokenContained`', async () => {
      expect(await treasureChest.tokenContained()).to.equal(moneyToken.address);
    });

    it('should be buried initially', async () => {
      expect(await treasureChest.buried()).to.equal(true);
    });
  });

  describe('unbury', () => {
    it('should unbury', async () => {
      await treasureChest.unbury();

      expect(await treasureChest.buried()).to.equal(false);
    });

    it('should revert if a non-captain tries to dig up the chest', async () => {
      const [, , cabinBoySigner] = await ethers.getSigners();

      await expect(treasureChest.connect(cabinBoySigner).unbury()).to.be.revertedWith('VM Exception while processing transaction: revert Ownable: caller is not the owner');
    });
  });

  describe('open', () => {
    it('should revert if still buried', async () => {
      await expect(treasureChest.open()).to.be.revertedWith('VM Exception while processing transaction: revert treasure chest has not been found yet');
    });

    it('should revert when treasure balance is zero', async () => {
      await treasureChest.unbury();

      await expect(treasureChest.open()).to.be.revertedWith('VM Exception while processing transaction: revert treasure chest is empty');
    });

    it('should transfer the treasure to `msg.sender`', async () => {
      await moneyToken.transfer(treasureChest.address, 1000);
      const [, pirate1Signer] = await ethers.getSigners();

      await treasureChest.unbury();
      await treasureChest.connect(pirate1Signer).open();

      expect(await moneyToken.balanceOf(pirate1)).to.equal(1000);
    });
  });
});
