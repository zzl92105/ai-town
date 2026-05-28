#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p \
  src/assets/ai/canal-masks/avatars \
  src/assets/ai/canal-masks/locations \
  src/assets/ai/canal-masks/clues \
  src/assets/ai/station-last-train/avatars \
  src/assets/ai/station-last-train/locations \
  src/assets/ai/station-last-train/clues

make_avatar() {
  local source="$1"
  local out="$2"
  local tint="$3"
  local label="$4"
  magick "$source" \
    -resize 768x768^ -gravity center -extent 768x768 \
    -modulate 118,112,100 \
    -sigmoidal-contrast 3,42% -gamma 0.88 \
    -unsharp 0x0.75+0.7+0.015 "$out"
}

make_location() {
  local source="$1"
  local out="$2"
  local tint="$3"
  local label="$4"
  magick "$source" \
    -resize 1600x720^ -gravity center -extent 1600x720 \
    -modulate 118,110,100 \
    -sigmoidal-contrast 3,44% -gamma 0.9 \
    -unsharp 0x0.75+0.7+0.015 "$out"
}

make_clue() {
  local source="$1"
  local out="$2"
  local tint="$3"
  local label="$4"
  magick "$source" \
    -resize 800x550^ -gravity center -extent 800x550 \
    -modulate 122,112,100 \
    -sigmoidal-contrast 3,43% -gamma 0.88 \
    -unsharp 0x0.75+0.7+0.015 "$out"
}

# Canal Masks: derive raster assets from the same AI/PNG pool used by case 1,
# then retint and reframe them for the festival/canal case.
make_avatar src/assets/ai/avatars/mayor-zhou.png src/assets/ai/canal-masks/avatars/sponsor-han.png "12,7,0" "Han Yanzhou"
make_avatar src/assets/ai/avatars/reporter-xu.png src/assets/ai/canal-masks/avatars/artist-qiao.png "8,0,12" "Qiao Wei"
make_avatar src/assets/ai/avatars/doctor-bai.png src/assets/ai/canal-masks/avatars/captain-luo.png "0,8,14" "Luo Cen"
make_avatar src/assets/ai/avatars/cafe-shen.png src/assets/ai/canal-masks/avatars/florist-yan.png "0,12,4" "Yan Tang"
make_avatar src/assets/ai/avatars/librarian-lin.png src/assets/ai/canal-masks/avatars/archivist-meng.png "4,8,12" "Meng Zhiyuan"

make_location src/assets/ai/locations/square.png src/assets/ai/canal-masks/locations/parade-square.png "12,4,10" "Parade Square"
make_location src/assets/ai/locations/cafe.png src/assets/ai/canal-masks/locations/canal-cafe.png "4,10,8" "Canal Cafe Stand"
make_location src/assets/ai/locations/clinic.png src/assets/ai/canal-masks/locations/aid-station.png "2,8,6" "First Aid Station"
make_location src/assets/ai/locations/library.png src/assets/ai/canal-masks/locations/hydro-archive.png "0,10,14" "Hydrology Archive"
make_location src/assets/ai/locations/town-hall.png src/assets/ai/canal-masks/locations/sponsor-house.png "12,8,3" "Sponsor House"

make_clue src/assets/ai/clues/archive-schedule.png src/assets/ai/canal-masks/clues/blackout-switch.png "16,8,0" "Manual blackout switch"
make_clue src/assets/ai/clues/old-bridge-article.png src/assets/ai/canal-masks/clues/float-route.png "8,4,14" "Silver float route"
make_clue src/assets/ai/clues/cafe-receipt-time.png src/assets/ai/canal-masks/clues/absinthe-receipt.png "8,12,0" "Absinthe latte receipt"
make_clue src/assets/ai/clues/reporter-wrist.png src/assets/ai/canal-masks/clues/artist-palm-cut.png "12,0,0" "Artist palm cut"
make_clue src/assets/ai/clues/old-bridge-article.png src/assets/ai/canal-masks/clues/missing-microfilm.png "0,10,16" "Missing microfilm"
make_clue src/assets/ai/clues/spare-key-log.png src/assets/ai/canal-masks/clues/key-tray-imprint.png "12,8,0" "Key tray imprint"
make_clue src/assets/ai/clues/deduction-note.png src/assets/ai/canal-masks/clues/mask-stand-paint.png "14,10,0" "Mask stand paint"
make_clue src/assets/ai/clues/archive-schedule.png src/assets/ai/canal-masks/clues/artist-backdoor-log.png "10,4,8" "Backdoor guest log"
make_clue src/assets/ai/clues/torn-ledger-page.png src/assets/ai/canal-masks/clues/canal-contract-pressure.png "10,8,4" "Canal contract notes"
make_clue src/assets/ai/clues/library-dust-gap.png src/assets/ai/canal-masks/clues/silver-feather-fragment.png "14,14,0" "Silver feather fragment"
make_clue src/assets/ai/clues/library-dust-gap.png src/assets/ai/canal-masks/clues/display-slot-dust.png "0,10,12" "Display slot dust"
make_clue src/assets/ai/clues/archive-schedule.png src/assets/ai/canal-masks/clues/guestbook-time.png "10,6,0" "Edited guestbook time"
make_clue src/assets/ai/clues/cafe-receipt-time.png src/assets/ai/canal-masks/clues/backstage-stamp.png "10,0,12" "Backstage stamp"
make_clue src/assets/ai/clues/reporter-wrist.png src/assets/ai/canal-masks/clues/sedative-red-herring.png "4,8,8" "Unused sedative box"
make_clue src/assets/ai/clues/deduction-note.png src/assets/ai/canal-masks/clues/deduction-artist-route.png "14,6,8" "Qiao's route"
make_clue src/assets/ai/clues/deduction-note.png src/assets/ai/canal-masks/clues/deduction-hidden-mask-archive.png "4,12,12" "Mask in archive"
make_clue src/assets/ai/clues/deduction-note.png src/assets/ai/canal-masks/clues/deduction-microfilm-motive.png "12,8,0" "Microfilm motive"

# Station Last Train.
make_avatar src/assets/ai/avatars/mayor-zhou.png src/assets/ai/station-last-train/avatars/stationmaster-du.png "0,8,14" "Du Heng"
make_avatar src/assets/ai/avatars/doctor-bai.png src/assets/ai/station-last-train/avatars/engineer-lu.png "0,12,8" "Lu Qi"
make_avatar src/assets/ai/avatars/cafe-shen.png src/assets/ai/station-last-train/avatars/porter-ma.png "12,8,0" "Ma Jun"
make_avatar src/assets/ai/avatars/librarian-lin.png src/assets/ai/station-last-train/avatars/vendor-song.png "8,12,0" "Song Li"
make_avatar src/assets/ai/avatars/reporter-xu.png src/assets/ai/station-last-train/avatars/reporter-chen.png "0,6,14" "Chen Ran"

make_location src/assets/ai/locations/square.png src/assets/ai/station-last-train/locations/platform.png "0,10,16" "Last Train Platform"
make_location src/assets/ai/locations/cafe.png src/assets/ai/station-last-train/locations/tea-stand.png "10,8,0" "Station Tea Stand"
make_location src/assets/ai/locations/clinic.png src/assets/ai/station-last-train/locations/rail-clinic.png "0,8,8" "Rail Clinic"
make_location src/assets/ai/locations/library.png src/assets/ai/station-last-train/locations/lost-found.png "0,8,14" "Lost and Found"
make_location src/assets/ai/locations/town-hall.png src/assets/ai/station-last-train/locations/signal-tower.png "0,12,16" "Signal Tower"

make_clue src/assets/ai/clues/archive-schedule.png src/assets/ai/station-last-train/clues/platform-clock-stopped.png "0,12,16" "Stopped platform clock"
make_clue src/assets/ai/clues/spare-key-log.png src/assets/ai/station-last-train/clues/staff-gate-record.png "0,8,14" "Staff gate record"
make_clue src/assets/ai/clues/cafe-receipt-time.png src/assets/ai/station-last-train/clues/reporter-wet-ticket.png "0,12,12" "Wet reporter ticket"
make_clue src/assets/ai/clues/cafe-receipt-time.png src/assets/ai/station-last-train/clues/stationmaster-tea-receipt.png "12,8,0" "22:47 tea receipt"
make_clue src/assets/ai/clues/librarian-sighting.png src/assets/ai/station-last-train/clues/vendor-backdoor-sighting.png "8,10,0" "Backdoor sighting"
make_clue src/assets/ai/clues/reporter-wrist.png src/assets/ai/station-last-train/clues/porter-arm-scratch.png "10,4,0" "Blue paint scratch"
make_clue src/assets/ai/clues/reporter-wrist.png src/assets/ai/station-last-train/clues/medicine-red-herring.png "0,8,8" "Untouched medicine"
make_clue src/assets/ai/clues/deduction-note.png src/assets/ai/station-last-train/clues/half-tape-box.png "0,10,16" "Half tape box"
make_clue src/assets/ai/clues/deduction-note.png src/assets/ai/station-last-train/clues/broadcast-tape-swap.png "0,8,14" "Swapped broadcast tape"
make_clue src/assets/ai/clues/archive-schedule.png src/assets/ai/station-last-train/clues/lost-found-time-edit.png "12,4,0" "Edited lost-found time"
make_clue src/assets/ai/clues/coffee-stain.png src/assets/ai/station-last-train/clues/cut-recorder-wire.png "0,10,14" "Cut recorder wire"
make_clue src/assets/ai/clues/archive-schedule.png src/assets/ai/station-last-train/clues/siding-switch-log.png "0,12,16" "Siding switch log"
make_clue src/assets/ai/clues/archive-schedule.png src/assets/ai/station-last-train/clues/altered-timetable.png "4,8,14" "Altered timetable"
make_clue src/assets/ai/clues/spare-key-log.png src/assets/ai/station-last-train/clues/missing-wire-cutter.png "10,8,0" "Missing wire cutter"
make_clue src/assets/ai/clues/deduction-note.png src/assets/ai/station-last-train/clues/deduction-stationmaster-window.png "0,8,14" "Stationmaster window"
make_clue src/assets/ai/clues/deduction-note.png src/assets/ai/station-last-train/clues/deduction-siding-motive.png "0,12,16" "Siding motive"
make_clue src/assets/ai/clues/deduction-note.png src/assets/ai/station-last-train/clues/deduction-tape-hidden-lost-found.png "4,10,12" "Tape in lost-found"
