#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
BASE_URL="https://visit-salt-lake-proposal-tool.vercel.app"
PAGE="/proposal"
SCREENSHOT_DIR="$(cd "$(dirname "$0")/../screenshots" && pwd)"
AB="npx agent-browser"
SESSION="smoke-$$"

PASS=0
FAIL=0
RESULTS=()

# ─── Seed data ───────────────────────────────────────────────────────────────
# The Proposal page reads from localStorage key "estimate-app-state".
# Pages must match the sitemap template + MODULE_CATEGORIES for filters to work.
SEED_STATE=$(cat <<'ENDJSON'
{
  "pages": [
    { "id": "p-home",      "name": "Home",      "order": 0 },
    { "id": "p-about",     "name": "About",     "order": 1 },
    { "id": "p-contact",   "name": "Contact",   "order": 2 },
    { "id": "p-dashboard", "name": "Dashboard", "order": 3 },
    { "id": "p-analytics", "name": "Analytics", "order": 4 },
    { "id": "p-reports",   "name": "Reports",   "order": 5 },
    { "id": "p-settings",  "name": "Settings",  "order": 6 },
    { "id": "p-profile",   "name": "Profile",   "order": 7 },
    { "id": "p-billing",   "name": "Billing",   "order": 8 }
  ],
  "screenshots": [
    { "id": "ss-1", "pageId": "p-home",    "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/58BAwAI/AL+hc2rNAAAAABJRU5ErkJggg==", "videoSource": "", "timestamp": 0, "order": 0 },
    { "id": "ss-2", "pageId": "p-dashboard", "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/58BAwAI/AL+hc2rNAAAAABJRU5ErkJggg==", "videoSource": "", "timestamp": 0, "order": 0 },
    { "id": "ss-3", "pageId": "p-settings", "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/58BAwAI/AL+hc2rNAAAAABJRU5ErkJggg==", "videoSource": "", "timestamp": 0, "order": 0 }
  ],
  "annotations": [
    { "id": "a-1", "screenshotId": "ss-1", "x": 10, "y": 10, "width": 100, "height": 50, "label": "Hero", "designHours": 8, "frontendHours": 12, "backendHours": 4 },
    { "id": "a-2", "screenshotId": "ss-2", "x": 10, "y": 10, "width": 100, "height": 50, "label": "Charts", "designHours": 6, "frontendHours": 16, "backendHours": 20 },
    { "id": "a-3", "screenshotId": "ss-3", "x": 10, "y": 10, "width": 100, "height": 50, "label": "Form", "designHours": 4, "frontendHours": 8, "backendHours": 10 }
  ]
}
ENDJSON
)

# ─── Helpers ─────────────────────────────────────────────────────────────────
pass() {
  PASS=$((PASS + 1))
  RESULTS+=("  ✓ $1")
  echo "  ✓ $1"
}

fail() {
  FAIL=$((FAIL + 1))
  RESULTS+=("  ✗ $1")
  echo "  ✗ $1"
}

check_text() {
  local label="$1"
  local search="$2"
  local output
  output=$($AB --session "$SESSION" get text "body" 2>/dev/null || echo "")
  if echo "$output" | grep -qF "$search"; then
    pass "$label"
  else
    fail "$label"
  fi
}

click_and_screenshot() {
  local selector="$1"
  local filename="$2"
  local label="$3"
  if $AB --session "$SESSION" click "$selector" 2>/dev/null; then
    sleep 1
    $AB --session "$SESSION" screenshot --full "$SCREENSHOT_DIR/$filename" 2>/dev/null
    pass "$label"
  else
    fail "$label"
  fi
}

cleanup() {
  $AB --session "$SESSION" close 2>/dev/null || true
}
trap cleanup EXIT

# ─── Main ────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║     Proposal Page — Visual Smoke Test            ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# 1. Open the app root first to seed localStorage, then navigate to /proposal
echo "→ Seeding project data into localStorage..."
$AB --session "$SESSION" open "${BASE_URL}"
$AB --session "$SESSION" wait 2000

# Inject seed data into localStorage and reload to /proposal
ESCAPED_STATE=$(echo "$SEED_STATE" | tr -d '\n' | sed "s/'/\\\\'/g")
$AB --session "$SESSION" eval "localStorage.setItem('estimate-app-state', '$ESCAPED_STATE')"
echo "  Data seeded."

echo "→ Opening ${BASE_URL}${PAGE}..."
$AB --session "$SESSION" open "${BASE_URL}${PAGE}"
$AB --session "$SESSION" wait 3000
echo ""

# 2. Full-page baseline screenshot
echo "→ Taking baseline screenshot..."
$AB --session "$SESSION" screenshot --full "$SCREENSHOT_DIR/01-baseline.png"
pass "Baseline screenshot captured"
echo ""

# 3. Verify all 6 collapsible sections exist
echo "→ Checking collapsible sections..."
check_text "Section: Scenarios"              "Scenarios"
check_text "Section: Sitemap"                "Sitemap"
check_text "Section: Screens & Annotations"  "Screens & Annotations"
check_text "Section: Approach"               "Approach"
check_text "Section: Project Timeline"       "Project Timeline"
check_text "Section: Project Estimate"       "Project Estimate"
echo ""

# 4. Click through scenario filter tabs and screenshot each
echo "→ Testing scenario filter tabs..."
click_and_screenshot '[data-id="2026"]' "02-scenario-2026.png" "Scenario: Launch in 2026"
click_and_screenshot '[data-id="2027"]' "03-scenario-2027.png" "Scenario: Launch in 2027"
echo ""

# 5. Click through module filter tabs and screenshot each
echo "→ Testing module filter tabs..."
click_and_screenshot '[data-id="marketing"]' "04-module-marketing.png" "Module: Marketing Website"
click_and_screenshot '[data-id="cms"]'       "05-module-cms.png"       "Module: CMS"
click_and_screenshot '[data-id="crm"]'       "06-module-crm.png"       "Module: CRM"
click_and_screenshot '[data-id="all"]'       "07-module-all.png"       "Module: All"
echo ""

# 6. Annotated screenshot for AI-readable verification
echo "→ Capturing annotated screenshot..."
$AB --session "$SESSION" screenshot --full --annotate "$SCREENSHOT_DIR/08-annotated.png"
pass "Annotated screenshot captured"
echo ""

# ─── Summary ─────────────────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════╗"
echo "║  Results                                         ║"
echo "╠══════════════════════════════════════════════════╣"
for r in "${RESULTS[@]}"; do
  echo "║ $r"
done
echo "╠══════════════════════════════════════════════════╣"
TOTAL=$((PASS + FAIL))
echo "║  $PASS/$TOTAL passed"
if [ "$FAIL" -gt 0 ]; then
  echo "║  $FAIL FAILED"
fi
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Screenshots listing
echo "Screenshots saved to: $SCREENSHOT_DIR/"
ls -1 "$SCREENSHOT_DIR"/*.png 2>/dev/null | while read -r f; do
  echo "  $(basename "$f")"
done
echo ""

# Exit with failure if any checks failed
if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
