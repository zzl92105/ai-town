import { describe, expect, it } from "vitest";
import { canalMasksCase } from "../data/casePackage";

import absintheReceiptImage from "../assets/ai/canal-masks/clues/absinthe-receipt.png";
import artistBackdoorLogImage from "../assets/ai/canal-masks/clues/artist-backdoor-log.png";
import artistPalmCutImage from "../assets/ai/canal-masks/clues/artist-palm-cut.png";
import backstageStampImage from "../assets/ai/canal-masks/clues/backstage-stamp.png";
import blackoutSwitchImage from "../assets/ai/canal-masks/clues/blackout-switch.png";
import canalContractPressureImage from "../assets/ai/canal-masks/clues/canal-contract-pressure.png";
import deductionArtistRouteImage from "../assets/ai/canal-masks/clues/deduction-artist-route.png";
import deductionHiddenMaskArchiveImage from "../assets/ai/canal-masks/clues/deduction-hidden-mask-archive.png";
import deductionMicrofilmMotiveImage from "../assets/ai/canal-masks/clues/deduction-microfilm-motive.png";
import displaySlotDustImage from "../assets/ai/canal-masks/clues/display-slot-dust.png";
import floatRouteImage from "../assets/ai/canal-masks/clues/float-route.png";
import guestbookTimeImage from "../assets/ai/canal-masks/clues/guestbook-time.png";
import keyTrayImprintImage from "../assets/ai/canal-masks/clues/key-tray-imprint.png";
import maskStandPaintImage from "../assets/ai/canal-masks/clues/mask-stand-paint.png";
import missingMicrofilmImage from "../assets/ai/canal-masks/clues/missing-microfilm.png";
import sedativeRedHerringImage from "../assets/ai/canal-masks/clues/sedative-red-herring.png";
import silverFeatherFragmentImage from "../assets/ai/canal-masks/clues/silver-feather-fragment.png";

const canalClueAssets: Record<string, string> = {
  clue_blackout_switch: blackoutSwitchImage,
  clue_float_route: floatRouteImage,
  clue_absinthe_receipt: absintheReceiptImage,
  clue_artist_palm_cut: artistPalmCutImage,
  clue_missing_microfilm: missingMicrofilmImage,
  clue_key_tray_imprint: keyTrayImprintImage,
  clue_mask_stand_paint: maskStandPaintImage,
  clue_artist_backdoor_log: artistBackdoorLogImage,
  clue_canal_contract_pressure: canalContractPressureImage,
  clue_silver_feather_fragment: silverFeatherFragmentImage,
  clue_display_slot_dust: displaySlotDustImage,
  clue_guestbook_time: guestbookTimeImage,
  clue_backstage_stamp: backstageStampImage,
  clue_sedative_red_herring: sedativeRedHerringImage,
  deduction_artist_route: deductionArtistRouteImage,
  deduction_hidden_mask_archive: deductionHiddenMaskArchiveImage,
  deduction_microfilm_motive: deductionMicrofilmMotiveImage,
};

describe("canal masks visual assets", () => {
  it("has one dedicated clue image for every clue", () => {
    const clueIds = canalMasksCase.clues.map((clue) => clue.id);
    expect(Object.keys(canalClueAssets).sort()).toEqual([...clueIds].sort());
    expect(new Set(Object.values(canalClueAssets)).size).toBe(clueIds.length);
  });
});
