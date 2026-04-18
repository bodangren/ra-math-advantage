import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup as BS


ROOT = Path("/Users/daniel.bodanske/Desktop/ra-integrated-math-3")
SOURCE_HTML = ROOT / "curriculum" / "ALEKS-practice-problems.htm"
OUT_DIR = ROOT / "curriculum" / "aleks"
def normalize_node_text(node) -> str:
    fragment = BS(str(node), "html.parser")
    for sup in fragment.find_all("sup"):
        sup.replace_with("^" + sup.get_text("", strip=True))
    for sub in fragment.find_all("sub"):
        sub.replace_with("_" + sub.get_text("", strip=True))
    text = fragment.get_text(" ", strip=True)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+\^", "^", text)
    text = re.sub(r"\^\s+", "^", text)
    text = re.sub(r"\(\s+", "(", text)
    text = re.sub(r"\s+\)", ")", text)
    return text.strip()


def lesson_topic_map(soup: BS) -> tuple[dict[str, int], dict[str, list[str]]]:
    counts: dict[str, int] = {}
    topics: dict[str, list[str]] = {}

    for lesson_node in soup.find_all(string=re.compile(r"^Lesson \d+-\d+$")):
        lesson_id = lesson_node.strip().replace("Lesson ", "")
        header_div = lesson_node.find_parent("div")
        if header_div is None:
            continue

        header_text = normalize_node_text(header_div)
        count_match = re.search(r"\((\d+) Topics\)$", header_text)
        if not count_match:
            continue

        counts[lesson_id] = int(count_match.group(1))
        lesson_topics: list[str] = []

        for sibling in header_div.find_next_siblings("div", recursive=False):
            inner = sibling.find("div", attrs={"style": lambda value: value and "vertical-align: top" in value})
            if inner is None:
                continue
            topic = normalize_node_text(inner)
            if re.search(r"\(\d+m\)$", topic):
                lesson_topics.append(topic)

        topics[lesson_id] = lesson_topics

    return counts, topics


def flattened_lines(soup: BS) -> list[str]:
    lines = [re.sub(r"\s+", " ", text).strip() for text in soup.get_text("\n").splitlines()]
    return [line for line in lines if line]


def parse_modules(lines: list[str], lesson_counts: dict[str, int], lesson_topics: dict[str, list[str]]) -> list[dict]:
    module_count_re = re.compile(r"^\((\d+) Topics\)$")
    lesson_re = re.compile(r"^Lesson (\d+-\d+)$")
    modules: list[dict] = []

    i = 0
    while i < len(lines):
        title = lines[i]
        is_module_title = title == "Course Readiness" or title.startswith("Module ")
        if is_module_title and i + 2 < len(lines):
            module_count_match = module_count_re.match(lines[i + 1])
            if module_count_match and lines[i + 2].startswith("Estimated Time: "):
                module = {
                    "title": title,
                    "topic_count": int(module_count_match.group(1)),
                    "estimated_time": lines[i + 2].replace("Estimated Time: ", ""),
                    "lessons": [],
                    "topics": [],
                }
                i += 3

                while i < len(lines):
                    next_title = lines[i]
                    next_is_module = next_title == "Course Readiness" or next_title.startswith("Module ")
                    if next_is_module and i + 2 < len(lines):
                        next_count_match = module_count_re.match(lines[i + 1])
                        if next_count_match and lines[i + 2].startswith("Estimated Time: "):
                            break

                    lesson_match = lesson_re.match(lines[i])
                    if lesson_match and i + 1 < len(lines) and module_count_re.match(lines[i + 1]):
                        lesson_id = lesson_match.group(1)
                        module["lessons"].append(
                            {
                                "lesson": lesson_id,
                                "topic_count": lesson_counts.get(
                                    lesson_id, int(module_count_re.match(lines[i + 1]).group(1))
                                ),
                                "topics": lesson_topics.get(lesson_id, []),
                            }
                        )
                        i += 2
                        continue

                    line = lines[i]
                    if not module["lessons"] and re.search(r"\(\d+m\)$", line):
                        module["topics"].append(line)

                    i += 1

                modules.append(module)
                continue

        i += 1

    modules.sort(
        key=lambda module: (
            -1 if module["title"] == "Course Readiness" else int(re.match(r"Module (\d+):", module["title"]).group(1))
        )
    )
    return modules


def write_markdown(modules: list[dict]) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    index_lines = [
        "# ALEKS Module Exports",
        "",
        "Generated from `curriculum/ALEKS-practice-problems.htm` by rendering the ALEKS syllabus export and extracting visible module, lesson, and topic text.",
        "",
    ]

    for module in modules:
        slug = module["title"].lower().replace(": ", "-").replace(":", "-")
        slug = re.sub(r"[^a-z0-9]+", "-", slug).strip("-")
        filename = f"{slug}.md"
        path = OUT_DIR / filename

        lines = [
            f"# {module['title']}",
            "",
            "Source: `curriculum/ALEKS-practice-problems.htm`",
            "",
            f"- Total topics: {module['topic_count']}",
            f"- Estimated time: {module['estimated_time']}",
            "",
        ]

        if module["lessons"]:
            lines.extend(["## Lessons", ""])
            for lesson in module["lessons"]:
                lines.append(f"### Lesson {lesson['lesson']} ({lesson['topic_count']} Topics)")
                lines.append("")
                for topic in lesson["topics"]:
                    lines.append(f"- {topic}")
                lines.append("")
        elif module["topics"]:
            lines.extend(["## Topics", ""])
            for topic in module["topics"]:
                lines.append(f"- {topic}")
            lines.append("")

        path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
        index_lines.append(f"- [{module['title']}](./{filename})")

    (OUT_DIR / "README.md").write_text("\n".join(index_lines).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    if not sys.stdin.isatty():
        html = sys.stdin.read()
    else:
        raise SystemExit(
            "Pipe rendered DOM into this script, for example: "
            "Chrome --headless --dump-dom file:///... | python3 scripts/extract_aleks_module_md.py"
        )
    soup = BS(html, "html.parser")
    for tag in soup(["script", "style", "svg", "title", "head"]):
        tag.decompose()

    lesson_counts, lesson_topics = lesson_topic_map(soup)
    modules = parse_modules(flattened_lines(soup), lesson_counts, lesson_topics)
    write_markdown(modules)

    print(f"Wrote {len(modules)} module files to {OUT_DIR}")
    for module in modules:
        print(f"- {module['title']}: {module['topic_count']} topics, {len(module['lessons'])} lessons")


if __name__ == "__main__":
    main()
