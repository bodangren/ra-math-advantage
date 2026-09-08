# IM3 quadratic-formula exact grader final independent review

## Verdict

Accept the corrected two-path grader batch.

The prior acceptance is withdrawn because that version erased multiplication tokens. The corrected parser keeps `*` tokens and rejects unsupported multiplication syntax. The parent probes `1*6` and `0*2` no longer receive full credit. Tests also reject `sqrt(2)*1`, `0*1i`, and `2*(1)`.

The parser accepts a zero radicand and normalizes it before square-factor extraction. It treats `sqrt(0)` as zero, removes zero real and imaginary radical terms, and preserves any remaining rational term and shared denominator. Its digit-only radicand syntax rejects negative radicands.

The exact parser keeps rational sign semantics for signed denominators. It accepts equivalent forms such as `-4/-2` and `-1/-2`. It normalizes zero radical and zero imaginary terms without changing the value. It does not erase other syntax.

The corrected suite covers rational, radical, and complex equivalence; shared and separated denominator precedence; the source complex forms; `i` and `-i`; reversed roots; order-independent partial credit; duplicate and missing roots; repeated-root `x2`; malformed input; finite bounds; and the 160-character limit. The implementation uses bounded `bigint` arithmetic. It uses no `eval` or floating tolerance.

Independent focused result after the zero-radicand delta: 1 file and 25 tests passed. The new cases cover `sqrt(0)`, `3+sqrt(0)`, `(6+sqrt(0))/2`, and `3+i*sqrt(0)`.

This verdict covers the pure grader only. The patch does not wire it to the server submission flow.
