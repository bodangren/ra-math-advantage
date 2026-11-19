import { describe, it, expect } from "vitest";
import type {
  ActivityComponentProps,
  ActivityRegistration,
  Activity,
  GradingConfig,
} from "../types";
import type { ActivityMode } from "@math-platform/activity-runtime/modes";

describe("ActivityComponentProps type", () => {
  it("should accept nested form with activity object", () => {
    const props: ActivityComponentProps = {
      activity: {
        _id: "act-1",
        componentKey: "comprehension-quiz",
        displayName: "Quiz",
        props: { questions: [] },
      },
      mode: "teaching",
      onSubmit: () => {},
      onComplete: () => {},
    };
    expect(props.activity._id).toBe("act-1");
    expect(props.mode).toBe("teaching");
  });

  it("should support all ActivityMode values", () => {
    const modes: ActivityMode[] = ["teaching", "guided", "practice"];
    modes.forEach((mode) => {
      const props: ActivityComponentProps = {
        activity: {
          _id: "act-1",
          componentKey: "test",
          displayName: "Test",
          props: {},
        },
        mode,
      };
      expect(props.mode).toBe(mode);
    });
  });

  it("should allow optional onSubmit and onComplete", () => {
    const props: ActivityComponentProps = {
      activity: {
        _id: "act-1",
        componentKey: "test",
        displayName: "Test",
        props: {},
      },
      mode: "guided",
    };
    expect(props.onSubmit).toBeUndefined();
    expect(props.onComplete).toBeUndefined();
  });
});

describe("Activity type", () => {
  it("should support full Activity with gradingConfig", () => {
    const activity: Activity = {
      _id: "act-1",
      componentKey: "fill-in-the-blank",
      displayName: "Fill in the Blank",
      description: "A fill in the blank activity",
      props: { template: "Hello {{blank:name}}", blanks: [] },
      gradingConfig: {
        autoGrade: true,
        passingScore: 80,
        partialCredit: true,
        rubric: [{ criteria: "Correct spelling", points: 10 }],
      },
      standardId: "CCSS.ELA.1",
    };
    expect(activity._id).toBe("act-1");
    expect(activity.gradingConfig?.autoGrade).toBe(true);
  });

  it("should support minimal Activity without optional fields", () => {
    const activity: Activity = {
      _id: "act-2",
      componentKey: "test",
      displayName: "Test",
      props: {},
    };
    expect(activity.description).toBeUndefined();
    expect(activity.gradingConfig).toBeUndefined();
    expect(activity.standardId).toBeUndefined();
  });
});

describe("GradingConfig type", () => {
  it("should require autoGrade and partialCredit", () => {
    const config: GradingConfig = {
      autoGrade: false,
      partialCredit: false,
    };
    expect(config.autoGrade).toBe(false);
  });
});

describe("ActivityRegistration type", () => {
  it("should define registration with componentKey and lazyLoad", () => {
    const registration: ActivityRegistration = {
      componentKey: "comprehension-quiz",
      lazyLoad: async () => ({ default: () => null }),
    };
    expect(registration.componentKey).toBe("comprehension-quiz");
    expect(typeof registration.lazyLoad).toBe("function");
  });
});
