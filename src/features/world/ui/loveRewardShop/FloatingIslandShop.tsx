import classNames from "classnames";
import { Label } from "components/ui/Label";
import { ModalOverlay } from "components/ui/ModalOverlay";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import React, { useState, useEffect } from "react";

import { isAlreadyBought, ItemsList } from "./components/ItemsList";
import { ItemDetail } from "./components/ItemDetail";
import { ITEM_IDS } from "features/game/types/bumpkin";
import { ITEM_DETAILS } from "features/game/types/images";
import { getImageUrl } from "lib/utils/getImageURLS";
import { BuffLabel } from "features/game/types";
import { BUMPKIN_ITEM_BUFF_LABELS } from "features/game/types/bumpkinItemBuffs";
import { COLLECTIBLE_BUFF_LABELS } from "features/game/types/collectibleItemBuffs";
import { OPEN_SEA_WEARABLES } from "metadata/metadata";
import { GameState } from "features/game/types/game";
import { isFloatingShopCollectible } from "features/game/events/landExpansion/buyFloatingShopItem";
import { FloatingShopItem } from "features/game/types/floatingIsland";
import { CloseButtonPanel } from "features/game/components/CloseablePanel";
import { useGame } from "features/game/GameProvider";
import { NPC_WEARABLES } from "lib/npcs";
import { secondsTillReset } from "features/helios/components/hayseedHank/HayseedHankV2";
import { CountdownLabel } from "components/ui/CountdownLabel";

export const getItemImage = (item: FloatingShopItem | null): string => {
  if (!item) return "";

  if (!isFloatingShopCollectible(item)) {
    return getImageUrl(ITEM_IDS[item.name]);
  }

  return ITEM_DETAILS[item.name].image;
};

export const getItemBuffLabel = (
  item: FloatingShopItem | null,
  state: GameState,
): BuffLabel[] | undefined => {
  if (!item) return;

  if (!isFloatingShopCollectible(item)) {
    return BUMPKIN_ITEM_BUFF_LABELS[item.name];
  }

  return COLLECTIBLE_BUFF_LABELS(state)[item.name];
};
export const getItemDescription = (item: FloatingShopItem | null): string => {
  if (!item) return "";

  if (!isFloatingShopCollectible(item)) {
    return OPEN_SEA_WEARABLES[item.name].description;
  }

  return ITEM_DETAILS[item.name].description;
};

export const FloatingIslandShop: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const { gameState } = useGame();
  const state = gameState.context.state;
  const [selectedItem, setSelectedItem] = useState<FloatingShopItem | null>(
    null,
  );
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (selectedItem && !isVisible) {
      setIsVisible(true);
    }
  }, [selectedItem, isVisible]);

  const handleClickItem = (item: FloatingShopItem) => {
    setSelectedItem(item);
  };

  const { t } = useAppTranslation();

  const shopItems = Object.values(state.floatingIsland.shop);

  return (
    <>
      <ModalOverlay
        show={!!selectedItem}
        onBackdropClick={() => setSelectedItem(null)}
      >
        <ItemDetail
          isVisible={isVisible}
          item={selectedItem}
          image={getItemImage(selectedItem)}
          buff={getItemBuffLabel(selectedItem, state)}
          isWearable={
            selectedItem ? !isFloatingShopCollectible(selectedItem) : false
          }
          onClose={() => {
            setSelectedItem(null);
          }}
          isBought={isAlreadyBought({
            name: selectedItem?.name,
            game: state,
          })}
        />
      </ModalOverlay>
      <CloseButtonPanel
        bumpkinParts={NPC_WEARABLES["rocket man"]}
        onClose={onClose}
      >
        <div className="flex justify-between px-2 flex-wrap pb-1">
          <Label type="default" className="mb-1">
            {"Reward Shop"}
          </Label>
        </div>
        <div
          className={classNames(
            "flex flex-col p-2 pt-1 max-h-[300px] overflow-y-auto scrollable ",
          )}
        >
          <span className="text-xs pb-1 mb-2">{t("rewardShop.msg1")}</span>
          <ItemsList items={shopItems} onItemClick={handleClickItem} />
        </div>
        <div className=" ml-2 mb-2">
          <p className="text-xs pb-1 mb-1">{t("rewardShop.msg2")}</p>
          <CountdownLabel timeLeft={secondsTillReset()} />
        </div>
      </CloseButtonPanel>
    </>
  );
};
