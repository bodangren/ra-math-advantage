# Spec: Prompt Guard Hardening

## Problem

The chatbot prompt injection defense (added in track `chatbot_prompt_guard_20260425`) has two critical vulnerabilities:

1. **Unicode/Homoglyph Bypass**: `normalizeInput` only trims whitespace. Attackers can bypass all regex patterns using:
   - Cyrillic characters that look like Latin (e.g., `а` vs `a`)
   - Fullwidth characters (e.g., `ａ` vs `a`)
   - Zero-width joiners/invisible characters
   - Mixed-script obfuscation

2. **False Positives on Common English**: The optional trailing group in regex patterns matches sentences containing common words like "ignore" or "forget" in legitimate contexts (e.g., "Don't ignore this math problem").

## Requirements

### 1. Unicode Normalization
- Normalize all input to NFC form
- Strip zero-width characters (U+200B, U+200C, U+200D, U+FEFF)
- Map Cyrillic lookalikes to Latin equivalents
- Map fullwidth characters to ASCII equivalents
- Reject inputs with mixed scripts that suggest obfuscation

### 2. Regex Restructuring
- Remove optional trailing groups that cause false positives
- Use word-boundary-aware patterns instead
- Add context-aware detection (e.g., "ignore" near system prompt keywords is suspicious; "ignore" in math context is not)
- Maintain detection of all 6 existing pattern categories

### 3. Testing
- Unit tests for Unicode normalization function
- Unit tests for false positive prevention
- Unit tests for bypass prevention (Cyrillic, fullwidth, zero-width)
- All existing prompt injection tests must still pass

## Acceptance Criteria

- [ ] `normalizeInput` handles Cyrillic, fullwidth, zero-width characters
- [ ] Regex patterns no longer flag legitimate math sentences
- [ ] All existing injection detection tests pass
- [ ] New tests cover bypass attempts and false positive cases
- [ ] IM3 and BM2 chatbot routes use updated guard
- [ ] No regression in detection rate for known injection patterns
