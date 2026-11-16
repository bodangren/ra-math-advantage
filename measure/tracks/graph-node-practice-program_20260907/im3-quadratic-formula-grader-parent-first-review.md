# Quadratic formula grader parent review

Verdict: Reject the first frozen grader.

The parent executed two direct probes for `x² - 4 = 0`. The expected roots are 2 and -2. The discriminant is 16.

The input discriminant `1*6` received full discriminant credit. The input root `0*2` received full root credit. Both submissions received 3 of 3 points. These results are false. The normalization function removed every multiplication sign and concatenated the digits.

The initial 19-test suite and independent acceptance did not detect this defect. Withdraw that acceptance. Preserve multiplication tokens until the restricted grammar validates their positions. Do not reuse root normalization that removes operations for the discriminant.

Add regressions for numeric multiplication, multiplication after a radical, a zero coefficient before i, signed denominators, and zero radical or imaginary terms. Correct the parser before further acceptance. The grader has not been committed or connected to a route.
