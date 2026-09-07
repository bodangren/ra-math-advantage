import type { GeneratorOutput } from "@math-platform/knowledge-space-practice";

export type Interval = readonly [number, number];

export interface Topic11IntervalGraphPoint {
  readonly x: number;
  readonly y: number;
}

export interface Topic11IntervalGraphVariant {
  readonly seed: number;
  readonly domain: Interval;
  readonly changePoints: readonly [number, number];
  readonly points: readonly Topic11IntervalGraphPoint[];
  readonly increasingIntervals: readonly Interval[];
  readonly decreasingIntervals: readonly Interval[];
  readonly constantIntervals: readonly Interval[];
}

function seededValue(seed: number): () => number {
  let state = seed % 2147483647;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

function buildVariant(
  seed: number,
  domainStart: number,
  firstChange: number,
  secondChange: number,
  domainEnd: number,
  startHeight: number,
  secondHeight: number,
  thirdHeight: number,
  finalHeight: number,
): Topic11IntervalGraphVariant {
  const points = [
    { x: domainStart, y: startHeight },
    { x: firstChange, y: secondHeight },
    { x: secondChange, y: thirdHeight },
    { x: domainEnd, y: finalHeight },
  ] as const;
  const increasingIntervals: Interval[] = [];
  const decreasingIntervals: Interval[] = [];
  const constantIntervals: Interval[] = [];
  for (let index = 0; index < points.length - 1; index++) {
    const interval: Interval = [points[index]!.x, points[index + 1]!.x];
    if (points[index]!.y < points[index + 1]!.y)
      increasingIntervals.push(interval);
    else if (points[index]!.y > points[index + 1]!.y)
      decreasingIntervals.push(interval);
    else constantIntervals.push(interval);
  }
  return {
    seed,
    domain: [domainStart, domainEnd],
    changePoints: [firstChange, secondChange],
    points,
    increasingIntervals,
    decreasingIntervals,
    constantIntervals,
  };
}

export function generateTopic11IntervalGraph(
  seed: number,
): Topic11IntervalGraphVariant {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new RangeError("seed must be a non-negative integer");
  }

  if (seed === 0) {
    return buildVariant(0, 0, 3, 7, 9, 1, 7, 2, 6);
  }

  const random = seededValue(seed);
  const domainStart = Math.floor(random() * 3);
  const firstChange = domainStart + 2 + Math.floor(random() * 3);
  const secondChange = firstChange + 2 + Math.floor(random() * 3);
  const domainEnd = secondChange + 2 + Math.floor(random() * 3);
  const startHeight = 1 + Math.floor(random() * 5);
  const peakHeight = startHeight + 2 + Math.floor(random() * 5);
  const valleyHeight =
    seed % 3 === 2 ? peakHeight : peakHeight - 2 - Math.floor(random() * 5);
  const finalHeight =
    seed % 3 === 2
      ? valleyHeight - 2
      : valleyHeight + 2 + Math.floor(random() * 5);

  return buildVariant(
    seed,
    domainStart,
    firstChange,
    secondChange,
    domainEnd,
    startHeight,
    peakHeight,
    valleyHeight,
    finalHeight,
  );
}

const NODE_ID =
  "math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs";

export function generateTopic11IntervalGraphOutput(
  seed: number,
): GeneratorOutput {
  const variant = generateTopic11IntervalGraph(seed);
  const prompt = `Identify the intervals where the graph increases, decreases, and stays constant on the domain [${variant.domain[0]}, ${variant.domain[1]}]. Give each segment by its endpoint x-values. Parentheses or brackets are accepted.`;
  const rendererProps = {
    prompt,
    domain: variant.domain,
    changePoints: variant.changePoints,
    points: variant.points,
    presentationMode: "independent_practice",
  };
  const expectedAnswer = {
    increasingIntervals: variant.increasingIntervals,
    decreasingIntervals: variant.decreasingIntervals,
    constantIntervals: variant.constantIntervals,
  };

  const formatIntervals = (intervals: readonly Interval[]) =>
    intervals.length === 0
      ? "none"
      : intervals.map(([start, end]) => `[${start},${end}]`).join(" ∪ ");
  const segmentNames = ["first", "middle", "final"];
  const segmentSteps = variant.points.slice(0, -1).map((point, index) => {
    const next = variant.points[index + 1]!;
    const behavior =
      point.y < next.y
        ? "rises"
        : point.y > next.y
          ? "falls"
          : "stays constant";
    return {
      description: `Classify the ${segmentNames[index]} segment.`,
      expression: `The graph ${behavior} from x=${point.x} to x=${next.x}.`,
    };
  });
  return {
    prompt,
    data: {
      seed,
      domain: variant.domain,
      changePoints: variant.changePoints,
      points: variant.points,
      rendererProps,
    },
    expectedAnswer,
    solutionSteps: [
      {
        description: "Read the graph from left to right.",
        expression: `The domain is [${variant.domain[0]}, ${variant.domain[1]}].`,
      },
      ...segmentSteps,
      {
        description: "State the interval answers.",
        expression: `Increasing: ${formatIntervals(variant.increasingIntervals)}; decreasing: ${formatIntervals(variant.decreasingIntervals)}; constant: ${formatIntervals(variant.constantIntervals)}.`,
      },
    ],
    gradingMetadata: {
      partAnswers: expectedAnswer,
      partMaxScores: {
        increasingIntervals: 1,
        decreasingIntervals: 1,
        constantIntervals: 1,
      },
      partGradingRules: {
        increasingIntervals: "custom",
        decreasingIntervals: "custom",
        constantIntervals: "custom",
      },
    },
  };
}

export { NODE_ID as TOPIC11_INTERVAL_GRAPH_NODE_ID };
