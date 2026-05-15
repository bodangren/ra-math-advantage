#!/usr/bin/env python3
"""
Validation script for curriculum files.
Checks required sections, math delimiter consistency, and source references.
"""
import sys, os, re, json, glob

REQUIRED_SECTIONS = [
    r"^# Lesson \d+-\d+ — ",
    r"^Source: \(Module \d+, Lesson \d+-\d+, Int\d_\d{4}_practice\.docx\)",
    r"^## Today's Goals",
    r"^## Vocabulary",
    r"^## Example \d+ — ",
    r"^## Mixed Exercises",
]

def validate_file(filepath, inventory_filenames):
    errors = []
    warnings = []

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        lines = content.splitlines()

    # Check required sections
    for pattern in REQUIRED_SECTIONS:
        if not re.search(pattern, content, re.MULTILINE):
            errors.append(f"Missing required section matching: {pattern}")

    # Check source reference points to real worksheet
    source_match = re.search(r"^Source: \(Module \d+, Lesson \d+-\d+, (Int\d_\d{4}_practice\.docx)\)", content, re.MULTILINE)
    if source_match:
        source_file = source_match.group(1)
        if source_file not in inventory_filenames:
            errors.append(f"Source references unknown worksheet: {source_file}")
    else:
        errors.append("Source reference malformed or missing")

    # Check math delimiter consistency
    open_brackets = content.count("\n[")
    close_brackets = content.count("]\n")
    # Allow some flexibility for inline math
    if open_brackets != close_brackets:
        warnings.append(f"Unbalanced math delimiters: {open_brackets} opening, {close_brackets} closing")

    # Check for forbidden patterns
    if "$$" in content or re.search(r"(?<!\[)\$[^$]+\$(?!\])", content):
        warnings.append("Found standard LaTeX $ delimiters; use [ ] instead")

    # Check lesson header matches filename
    basename = os.path.basename(filepath)
    header_match = re.search(r"^# Lesson (\d+-\d+)", content, re.MULTILINE)
    if header_match:
        lesson_code = header_match.group(1)
        expected = f"module-{lesson_code.replace('-', '-lesson-')}"
        if basename != expected and not basename.endswith(".md"):
            warnings.append(f"Filename '{basename}' does not match lesson code '{lesson_code}'")

    return errors, warnings


def main():
    # Load inventory
    inventory_path = os.path.join(os.path.dirname(__file__), "inventory.json")
    with open(inventory_path, "r") as f:
        inventory = json.load(f)
    inventory_filenames = {item["filename"] for item in inventory}

    courses = [
        "apps/integrated-math-1/curriculum/modules/*",
        "apps/integrated-math-2/curriculum/modules/*",
        "apps/integrated-math-3/curriculum/modules/*",
    ]

    total_errors = 0
    total_warnings = 0
    files_checked = 0

    for pattern in courses:
        for filepath in glob.glob(pattern):
            if os.path.isdir(filepath):
                continue
            if filepath.endswith(".md") and not os.path.basename(filepath).startswith("module-"):
                # Skip non-curriculum markdown files
                continue

            errors, warnings = validate_file(filepath, inventory_filenames)
            files_checked += 1

            if errors or warnings:
                rel = os.path.relpath(filepath)
                print(f"\n{rel}")
                for e in errors:
                    print(f"  ERROR: {e}")
                    total_errors += 1
                for w in warnings:
                    print(f"  WARNING: {w}")
                    total_warnings += 1

    print(f"\n{'='*60}")
    print(f"Files checked: {files_checked}")
    print(f"Errors: {total_errors}")
    print(f"Warnings: {total_warnings}")

    if total_errors > 0:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
