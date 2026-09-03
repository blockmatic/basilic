#!/usr/bin/env python3
"""Validate the structural invariants of the FIRST documentation set."""

from __future__ import annotations

import re
import sys
from pathlib import Path


root = Path(__file__).resolve().parents[1]
stations = [
    "PRODUCT",
    "JOURNEYS",
    "DESIGN",
    "ARCHITECTURE",
    "DATA",
    "API",
    "DOCUMENTATION",
    "WORKFLOW",
    "PIPELINES",
    "QUALITY",
    "SECURITY",
    "OPERATIONS",
]
rootFiles = ["README.md", "ABOUT.md", "AGENTS.md"]
principleHeadings = [
    "Principle",
    "Statement",
    "Outcome",
    "Artifacts",
    "Minimum Useful Artifact",
    "Recipe",
    "Validation",
    "Definition of Done",
    "Agent Prompt",
    "Notes",
]
articleHeadings = [
    "Principle",
    "The Case",
    "Product Leverage",
    "Engineering Leverage",
    "In an Agentic System",
    'What "First" Does Not Mean',
    "Spec",
    "Further Reading",
]
linkPattern = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


def section(text: str, heading: str) -> str | None:
    match = re.search(
        rf"^## {re.escape(heading)}\n\n(.+?)(?=\n\n## |\Z)",
        text,
        flags=re.MULTILINE | re.DOTALL,
    )
    return match.group(1).strip() if match else None


def validate() -> list[str]:
    errors: list[str] = []

    for name in rootFiles:
        if not (root / name).is_file():
            errors.append(f"missing root file: {name}")

    expected = {f"{name}.md" for name in stations}
    for folder in ("articles", "principles"):
        actual = {path.name for path in (root / folder).glob("*.md")}
        for name in sorted(expected - actual):
            errors.append(f"missing {folder} pair: {folder}/{name}")
        for name in sorted(actual - expected):
            errors.append(f"unexpected station file: {folder}/{name}")

    for name in stations:
        articlePath = root / "articles" / f"{name}.md"
        principlePath = root / "principles" / f"{name}.md"
        if not articlePath.is_file() or not principlePath.is_file():
            continue

        article = articlePath.read_text(encoding="utf-8")
        principle = principlePath.read_text(encoding="utf-8")

        frontMatter = re.match(r"\A---\n(.+?)\n---\n", article, re.DOTALL)
        if not frontMatter:
            errors.append(f"missing front matter: {articlePath.relative_to(root)}")
        else:
            metadata = frontMatter.group(1)
            for key in ("title", "status", "description"):
                if not re.search(rf"^{key}:\s+.+$", metadata, re.MULTILINE):
                    errors.append(
                        f"missing front-matter key {key}: {articlePath.relative_to(root)}"
                    )

            expectedTitle = f"{name.title() if name != 'API' else 'API'} First"
            titleMatch = re.search(r"^title:\s+(.+)$", metadata, re.MULTILINE)
            statusMatch = re.search(r"^status:\s+(.+)$", metadata, re.MULTILINE)
            if titleMatch and titleMatch.group(1) != expectedTitle:
                errors.append(f"wrong title: {articlePath.relative_to(root)}")
            if statusMatch and statusMatch.group(1) not in {"draft", "stable"}:
                errors.append(f"invalid status: {articlePath.relative_to(root)}")

        for heading in articleHeadings:
            if section(article, heading) is None:
                errors.append(
                    f"missing heading '{heading}': {articlePath.relative_to(root)}"
                )

        for heading in principleHeadings:
            if section(principle, heading) is None:
                errors.append(
                    f"missing heading '{heading}': {principlePath.relative_to(root)}"
                )

        articlePrinciple = section(article, "Principle")
        operationalPrinciple = section(principle, "Principle")
        if articlePrinciple != operationalPrinciple:
            errors.append(f"principle mismatch: {name}.md")

        if f"../principles/{name}.md" not in article:
            errors.append(f"missing operational-spec link: {articlePath.relative_to(root)}")
        if f"../articles/{name}.md" not in principle:
            errors.append(f"missing human-essay link: {principlePath.relative_to(root)}")

    for name in ("README.md", "ABOUT.md"):
        path = root / name
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        catalog = section(text, "The twelve") or ""
        pattern = (
            r"^\|\s*\d+\s*\|\s*([^|]+?)\s*\|"
            if name == "README.md"
            else r"^\d+\.\s+\*\*([^*]+)\*\*"
        )
        listed = [item.upper() for item in re.findall(pattern, catalog, re.MULTILINE)]
        if listed != stations:
            errors.append(f"canonical station list or order is wrong: {name}")

    markdownFiles = list(root.glob("*.md"))
    markdownFiles += list((root / "articles").glob("*.md"))
    markdownFiles += list((root / "principles").glob("*.md"))
    for path in markdownFiles:
        text = path.read_text(encoding="utf-8")
        for href in linkPattern.findall(text):
            if href.startswith(("http://", "https://", "#", "mailto:")):
                continue
            targetText = href.split("#", 1)[0]
            target = (path.parent / targetText).resolve()
            if not target.exists():
                errors.append(
                    f"broken local link in {path.relative_to(root)}: {href}"
                )

    return errors


def main() -> int:
    errors = validate()
    if errors:
        print("FIRST documentation validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        "FIRST documentation validation passed: "
        "12 essay/spec pairs, required structure, parity, order, and local links."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
