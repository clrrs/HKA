#!/usr/bin/env python3
"""Write nvda-default.dic with UTF-8 BOM. Run from repo root: python3 scripts/build_nvda_default_dic.py"""
from __future__ import annotations

import pathlib

# NVDA: pattern \t replacement \t case \t type — type 1 = EntryType.REGEXP
# case 0 = not case sensitive (bool False)

def main() -> None:
    root = pathlib.Path(__file__).resolve().parent.parent
    out_path = root / "nvda-default.dic"

    blocks: list[tuple[str, list[tuple[str, str]]]] = [
        (
            "exhibit-specific phrase suppressions — must come before broad role/word rules",
            [
                # Match the full phrase only; "helen keller" or "helen" alone are still spoken.
                (r"\bhelen keller archives document\b", ""),
            ],
        ),
        (
            "container / structural roles",
            [
                (r"\b(grouping|group)\b", ""),
                (
                    r"\b(region|banner|complementary|content info|main landmark|navigation landmark|landmark)\b",
                    "",
                ),
                (r"\bdocument\b", ""),
                (r"\bapplication\b", ""),
                (r"\bframe\b", ""),
                (r"\bsection\b", ""),
                (r"\barticle\b", ""),
                (r"\btoolbar\b", ""),
                (r"\bseparator\b", ""),
            ],
        ),
        (
            "text-block roles",
            [
                (r"\bparagraph\b", ""),
                (r"\bblock quote\b", ""),
                (r"\bheading( level( [1-6])?)?\b", ""),
                (r"\bheading [1-6]\b", ""),
            ],
        ),
        (
            "interactive control roles",
            [
                (r"\bbutton\b", ""),
                (r"\blink\b", ""),
                (r"\bedit(able)?( text)?\b", ""),
                (r"\bcombo box\b", ""),
                (r"\blist box\b", ""),
                (r"\bcheck box\b", ""),
                (r"\bradio button\b", ""),
                (r"\bslider\b", ""),
                (r"\bspin button\b", ""),
                (r"\b(menu|menu bar|menu item|menu button)\b", ""),
                (r"\b(tab|tab list|tab panel)\b", ""),
            ],
        ),
        (
            "list roles (no generic N items — can false-positive exhibit text)",
            [
                (r"\blist( with [0-9]+ items)?\b", ""),
                (r"\blist end\b", ""),
                (r"\bout of list\b", ""),
                (r"\blist item\b", ""),
            ],
        ),
        (
            "table roles",
            [
                (r"\b(table|row|column|cell|column header|row header)\b", ""),
            ],
        ),
        (
            "modal / live region role words",
            [
                (r"\bdialog\b", ""),
                (r"\balert\b", ""),
                (r"\bstatus\b", ""),
            ],
        ),
        (
            "state words — trim file if any line eats exhibit copy",
            [
                (r"\bclickable\b", ""),
                (r"\bfocused\b", ""),
                (r"\bfocusable\b", ""),
                (r"\bselected\b", ""),
                (r"\bnot selected\b", ""),
                (r"\bpressed\b", ""),
                (r"\bnot pressed\b", ""),
                (r"\bexpanded\b", ""),
                (r"\bcollapsed\b", ""),
                (r"\bdisabled\b", ""),
                (r"\bunavailable\b", ""),
                (r"\brequired\b", ""),
                (r"\binvalid entry\b", ""),
                (r"\bbusy\b", ""),
                (r"\bread only\b", ""),
                (r"\b(has popup|has auto complete)\b", ""),
            ],
        ),
        (
            "post-process after stripping",
            [
                (r"[ \t]{2,}", " "),
                (r"^[ ,.;:]+", ""),
            ],
        ),
    ]

    lines: list[str] = []
    lines.append("# HKA kiosk: suppress NVDA role/state chatter (default speech dictionary).")
    lines.append("# Kiosk-only: applies to all apps under this NVDA user profile. Do not use on a general PC.")
    lines.append("# pattern<TAB>replacement<TAB>case(0=ignore case)<TAB>type(1=regex = NVDA EntryType.REGEXP)")
    lines.append("")

    for block_title, items in blocks:
        lines.append(f"# --- {block_title} ---")
        for pat, rep in items:
            lines.append(f"{pat}\t{rep}\t0\t1")
        lines.append("")

    text = "\r\n".join(lines) + "\r\n"
    out_path.write_text(text, encoding="utf-8-sig")
    print(f"Wrote {out_path} ({len(text)} bytes, utf-8-sig)")


if __name__ == "__main__":
    main()
