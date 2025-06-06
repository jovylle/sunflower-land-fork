import Decimal from "decimal.js-light";
import { TEST_FARM } from "features/game/lib/constants";
import { GameState } from "features/game/types/game";
import { buyFloatingShopItem } from "./buyFloatingShopItem";

describe("buyFloatingShopItem", () => {
  const mockState: GameState = {
    ...TEST_FARM,
    inventory: {
      "Love Charm": new Decimal(200),
    },
    wardrobe: {},
  };

  const mockDate = new Date("2024-08-01T00:00:00Z").getTime();

  it("throws an error if the item is not found in the Love Reward Shop", () => {
    expect(() =>
      buyFloatingShopItem({
        state: mockState,
        action: {
          type: "floatingShopItem.bought",
          name: "Non-existent Item" as any,
        },
        createdAt: mockDate,
      }),
    ).toThrow("Item not found in the Love Reward Shop");
  });

  it("throws an error if the player doesn't have enough Love Charm", () => {
    const poorState: GameState = {
      ...mockState,
      inventory: {
        "Love Charm": new Decimal(5),
      },
      floatingIsland: {
        schedule: [],
        shop: {
          "Bronze Love Box": {
            type: "collectible",
            name: "Bronze Love Box",
            cost: {
              items: {
                "Love Charm": 100,
              },
            },
          },
        },
      },
    };
    expect(() =>
      buyFloatingShopItem({
        state: poorState,
        action: {
          type: "floatingShopItem.bought",
          name: "Bronze Love Box",
        },
        createdAt: mockDate,
      }),
    ).toThrow("Insufficient Love Charm");
  });

  it("subtracts Love Charm when buying an item", () => {
    const result = buyFloatingShopItem({
      state: {
        ...mockState,
        floatingIsland: {
          schedule: [],
          shop: {
            "Bronze Love Box": {
              type: "collectible",
              name: "Bronze Love Box",
              cost: {
                items: {
                  "Love Charm": 100,
                },
              },
            },
          },
        },
      },
      action: {
        type: "floatingShopItem.bought",
        name: "Bronze Love Box",
      },
      createdAt: mockDate,
    });

    expect(result.inventory["Love Charm"]).toEqual(new Decimal(100));
  });

  it("successfully buys a collectible item", () => {
    const result = buyFloatingShopItem({
      state: {
        ...mockState,
        floatingIsland: {
          schedule: [],
          shop: {
            "Basic Bear": {
              type: "collectible",
              name: "Basic Bear",
              cost: {
                items: {
                  "Love Charm": 50,
                },
              },
            },
          },
        },
      },
      action: {
        type: "floatingShopItem.bought",
        name: "Basic Bear",
      },
      createdAt: mockDate,
    });
    expect(result.inventory["Basic Bear"]).toEqual(new Decimal(1));
    expect(result.inventory["Love Charm"]).toEqual(new Decimal(150));
  });

  it("successfully buys a wearable item", () => {
    const result = buyFloatingShopItem({
      state: {
        ...mockState,
        floatingIsland: {
          schedule: [],
          shop: {
            "Red Farmer Shirt": {
              type: "wearable",
              name: "Red Farmer Shirt",
              cost: {
                items: {
                  "Love Charm": 20,
                },
              },
            },
          },
        },
      },
      action: {
        type: "floatingShopItem.bought",
        name: "Red Farmer Shirt",
      },
      createdAt: mockDate,
    });

    expect(result.wardrobe["Red Farmer Shirt"]).toEqual(1);
    expect(result.inventory["Love Charm"]).toEqual(new Decimal(180));
  });
});
