import { describe, expect, it } from "vitest";
import { stationLastTrainCase } from "../data/casePackage";

import alteredTimetableImage from "../assets/ai/station-last-train/clues/altered-timetable.png";
import broadcastTapeSwapImage from "../assets/ai/station-last-train/clues/broadcast-tape-swap.png";
import cutRecorderWireImage from "../assets/ai/station-last-train/clues/cut-recorder-wire.png";
import deductionSidingMotiveImage from "../assets/ai/station-last-train/clues/deduction-siding-motive.png";
import deductionStationmasterWindowImage from "../assets/ai/station-last-train/clues/deduction-stationmaster-window.png";
import deductionTapeHiddenLostFoundImage from "../assets/ai/station-last-train/clues/deduction-tape-hidden-lost-found.png";
import halfTapeBoxImage from "../assets/ai/station-last-train/clues/half-tape-box.png";
import lostFoundTimeEditImage from "../assets/ai/station-last-train/clues/lost-found-time-edit.png";
import medicineRedHerringImage from "../assets/ai/station-last-train/clues/medicine-red-herring.png";
import missingWireCutterImage from "../assets/ai/station-last-train/clues/missing-wire-cutter.png";
import platformClockStoppedImage from "../assets/ai/station-last-train/clues/platform-clock-stopped.png";
import porterArmScratchImage from "../assets/ai/station-last-train/clues/porter-arm-scratch.png";
import reporterWetTicketImage from "../assets/ai/station-last-train/clues/reporter-wet-ticket.png";
import sidingSwitchLogImage from "../assets/ai/station-last-train/clues/siding-switch-log.png";
import staffGateRecordImage from "../assets/ai/station-last-train/clues/staff-gate-record.png";
import stationmasterTeaReceiptImage from "../assets/ai/station-last-train/clues/stationmaster-tea-receipt.png";
import vendorBackdoorSightingImage from "../assets/ai/station-last-train/clues/vendor-backdoor-sighting.png";

const stationClueAssets: Record<string, string> = {
  clue_platform_clock_stopped: platformClockStoppedImage,
  clue_staff_gate_record: staffGateRecordImage,
  clue_reporter_wet_ticket: reporterWetTicketImage,
  clue_stationmaster_tea_receipt: stationmasterTeaReceiptImage,
  clue_vendor_backdoor_sighting: vendorBackdoorSightingImage,
  clue_porter_arm_scratch: porterArmScratchImage,
  clue_medicine_red_herring: medicineRedHerringImage,
  clue_half_tape_box: halfTapeBoxImage,
  clue_broadcast_tape_swap: broadcastTapeSwapImage,
  clue_lost_found_time_edit: lostFoundTimeEditImage,
  clue_cut_recorder_wire: cutRecorderWireImage,
  clue_siding_switch_log: sidingSwitchLogImage,
  clue_altered_timetable: alteredTimetableImage,
  clue_missing_wire_cutter: missingWireCutterImage,
  deduction_stationmaster_window: deductionStationmasterWindowImage,
  deduction_siding_motive: deductionSidingMotiveImage,
  deduction_tape_hidden_lost_found: deductionTapeHiddenLostFoundImage,
};

describe("station last train visual assets", () => {
  it("has one dedicated clue image for every clue", () => {
    const clueIds = stationLastTrainCase.clues.map((clue) => clue.id);
    expect(Object.keys(stationClueAssets).sort()).toEqual([...clueIds].sort());
    expect(new Set(Object.values(stationClueAssets)).size).toBe(clueIds.length);
  });
});
