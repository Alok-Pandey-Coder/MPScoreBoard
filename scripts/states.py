"""State registry for the multi-state pipeline.

Every pipeline step loops over STATES (or one state chosen with --state KEY).
A state's file keys keep the existing Delhi names working
(prs.delhi.*, sansad.members.delhi.*, masterlist.delhi.json, mplads.delhi.*).

identity_master:
  "masterlist" - a reviewed transcription of an official government roster in
                 data/raw/masterlist.<key>.json is the identity master; Digital
                 Sansad and PRS confirm it (Delhi).
  "sansad"     - the latest Digital Sansad member API capture
                 data/raw/sansad.members.<key>.<date>.json is the identity master
                 (official Lok Sabha source); PRS confirms it. Used where no reviewed
                 state government roster exists (Goa, see docs/decisions.md).
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass, field


@dataclass(frozen=True)
class State:
    key: str                      # file key and slug suffix, e.g. "delhi"
    name: str                     # display name used in records, e.g. "Delhi"
    sansad_state: str             # state name in the Digital Sansad API
    identity_master: str          # "masterlist" or "sansad"
    seats: int                    # Lok Sabha seats in the state (completeness check)
    mplads_source: bool = False   # an MPLADS capture is cleared for this state
    roster_page_glob: str | None = None  # dated captures of an official roster page
    roster_page_name: str | None = None
    roster_fetcher: str | None = None    # script that captures that page (change detection only)
    roster_source: str | None = None     # its label in the refresh report
    # Reviewed ADR/MyNeta affidavit pack (CSV keyed by constituency), relative to the repo root.
    affidavit_pack: str | None = None
    # Reviewed election-result intake (JSON list keyed by slug), relative to the repo root.
    election_intake: str | None = None
    # Why a block stays pending for this state (written into normalisation notes).
    pending_notes: dict[str, str] = field(default_factory=dict)


STATES: tuple[State, ...] = (
    State(
        key="delhi",
        name="Delhi",
        sansad_state="NCT of Delhi",
        identity_master="masterlist",
        seats=7,
        mplads_source=True,
        roster_page_glob="delhi_members.*.html",
        roster_page_name="Delhi MP list page",
        roster_fetcher="01_fetch_masterlist.py",
        roster_source="Govt of NCT of Delhi MP list (official)",
        affidavit_pack="data/reference_packs/officials_enriched_pack/data/mp_affidavit_enrichment.csv",
        election_intake="data/raw/delhi_7mp_custom_enrichment.json",
    ),
    State(
        key="goa",
        name="Goa",
        sansad_state="Goa",
        identity_master="sansad",
        seats=2,
        pending_notes={
            "mplads": "MPLADS pending: the only work-level source (Empowered Indian) is not cleared for automated access "
            "(docs/decisions.md); no Goa MPLADS figures were fetched.",
            "affidavit": "Affidavit pending: no compliant source has been captured for Goa. ADR/MyNeta reuse terms for "
            "publication are not confirmed and no official ECI affidavit capture exists yet; no values were guessed.",
            "election": "Election result pending: the official ECI 2024 results pages for Goa returned HTTP 404 on "
            "2026-11-01 (data/raw/eci.results.goa.fetch_log.2026-11-01.json); no values were guessed.",
        },
    ),
)

BY_KEY = {state.key: state for state in STATES}


def get(key: str) -> State:
    try:
        return BY_KEY[key]
    except KeyError:
        raise SystemExit(f"unknown state '{key}'; known: {', '.join(BY_KEY)}") from None


def selected(argv: list[str] | None = None, description: str | None = None) -> tuple[State, ...]:
    """States chosen on the command line (--state KEY, repeatable); all states by default."""
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--state", action="append", choices=list(BY_KEY), help="state key (default: all states)")
    args = parser.parse_args(argv)
    return tuple(get(key) for key in args.state) if args.state else STATES
