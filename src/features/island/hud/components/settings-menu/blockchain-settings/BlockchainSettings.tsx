import React, { useContext } from "react";
import { useSelector } from "@xstate/react";

import { Button } from "components/ui/Button";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Context as GameContext } from "features/game/GameProvider";
import { MachineState } from "features/game/lib/gameMachine";
import { ModalContext } from "features/game/components/modal/ModalProvider";
import { ContentComponentProps } from "../GameOptions";
import { hasFeatureAccess } from "lib/flags";

const _farmAddress = (state: MachineState) => state.context.farmAddress ?? "";
const _state = (state: MachineState) => state.context.state;

export const BlockchainSettings: React.FC<ContentComponentProps> = ({
  onSubMenuClick,
  onClose,
}) => {
  const { t } = useAppTranslation();

  const { gameService } = useContext(GameContext);
  const { openModal } = useContext(ModalContext);

  const farmAddress = useSelector(gameService, _farmAddress);
  const state = useSelector(gameService, _state);
  const isFullUser = farmAddress !== "";
  const storeOnChain = async () => {
    openModal("STORE_ON_CHAIN");
    onClose();
  };

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={() => onSubMenuClick("deposit")}>{t("deposit")}</Button>
      {isFullUser && (
        <Button onClick={storeOnChain}>
          {t("gameOptions.blockchainSettings.storeOnChain")}
        </Button>
      )}
      {!hasFeatureAccess(state, "DISABLE_BLOCKCHAIN_ACTIONS") && (
        <Button onClick={() => onSubMenuClick("swapSFL")}>
          {t("gameOptions.blockchainSettings.swapPOLForSFL")}
        </Button>
      )}
      {isFullUser && (
        <Button onClick={() => onSubMenuClick("dequip")}>
          {t("dequipper.dequip")}
        </Button>
      )}
      {isFullUser && (
        <Button onClick={() => onSubMenuClick("transfer")}>
          {t("gameOptions.blockchainSettings.transferOwnership")}
        </Button>
      )}
    </div>
  );
};
