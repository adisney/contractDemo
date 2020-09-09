const { expect } = require("chai");

describe("TreasureChest", function() {
  let moneyToken;
  let treasureChest;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async () => {
    [ owner, addr1, addr2, addr3 ] = await ethers.provider.listAccounts();

    const MoneyToken = await ethers.getContractFactory("MoneyToken");
    moneyToken = await MoneyToken.deploy();

    const TreasureChest = await ethers.getContractFactory("TreasureChest");
    treasureChest = await TreasureChest.deploy(moneyToken.address);

    await treasureChest.deployed();
  });

  it('should set the `tokenContained`', async () => {
    expect(await treasureChest.tokenContained()).to.equal(moneyToken.address);
  });

  it('should be buried initially', async () => {
    expect(await treasureChest.buried()).to.equal(true);
  });

  it('should unbury', async () => {
    await treasureChest.unbury();

    expect(await treasureChest.buried()).to.equal(false);
  });

  it('should revert when treasure balance is zero', async () => {
    try {
      await treasureChest.open();

      fail();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: revert treasure chest is empty');
    }
  });

  it('should transfer the treasure to `msg.sender`', async () => {
    await moneyToken.transfer(treasureChest.address, 1000);

    const [, addr1Signer] = await ethers.getSigners();
    await treasureChest.connect(addr1Signer).open();

    expect(await moneyToken.balanceOf(addr1)).to.equal(1000);
  });
});
