// The text in this file is the app's own wording for the FFT 2022 rubric structure.
// The component IDs, domain numbers, level IDs, and scores follow the FFT 2022
// framework; the wording is paraphrased for use in this app.
import type { DanielsonComponentId } from "./graph";

export const FFT_2022_RATING_LEVELS = [
  { id: "unsatisfactory", score: 1, label: "Unsatisfactory" },
  { id: "basic", score: 2, label: "Basic" },
  { id: "proficient", score: 3, label: "Proficient" },
  { id: "distinguished", score: 4, label: "Distinguished" },
] as const;

export type Fft2022RatingLevelId = (typeof FFT_2022_RATING_LEVELS)[number]["id"];

export type Fft2022RubricComponent = {
  id: DanielsonComponentId;
  domain: string;
  domainTitle: string;
  title: string;
  descriptors: Record<Fft2022RatingLevelId, string>;
};

export const FFT_2022_RUBRIC_DESCRIPTORS: Record<DanielsonComponentId, Fft2022RubricComponent> = {
  "1a": {
    id: "1a",
    domain: "Domain 1",
    domainTitle: "Planning and Readiness",
    title: "Command of Content and Teaching Methods",
    descriptors: {
      unsatisfactory:
        "The teacher does not know the subject or how to teach it well enough to support student learning.",
      basic:
        "The teacher's grasp of the subject and teaching methods only partly supports student learning.",
      proficient:
        "The teacher's grasp of the subject and teaching methods supports student learning.",
      distinguished:
        "The teacher uses deep subject and pedagogical knowledge to promote deeper learning, student agency, and habits of mind, including curiosity, reasoning, and reflection.",
    },
  },
  "1b": {
    id: "1b",
    domain: "Domain 1",
    domainTitle: "Planning and Readiness",
    title: "Understanding and Valuing Students",
    descriptors: {
      unsatisfactory:
        "The teacher knows too little about students to support their learning or development.",
      basic:
        "The teacher knows some of students' identities, strengths, and needs, and this partly supports learning and development.",
      proficient:
        "The teacher knows students well and builds on their strengths to support learning and development.",
      distinguished:
        "The teacher knows students deeply and uses that knowledge to advance their academic and personal success.",
    },
  },
  "1c": {
    id: "1c",
    domain: "Domain 1",
    domainTitle: "Planning and Readiness",
    title: "Defining Learning Goals",
    descriptors: {
      unsatisfactory: "Learning goals are missing, not rigorous, or not appropriate for the class.",
      basic: "Learning goals are moderately rigorous and suit most students in the class.",
      proficient: "Learning goals are rigorous and well suited to students.",
      distinguished:
        "Learning goals demand high-level thinking about important content and encourage autonomy, curiosity, and willingness to take intellectual risks.",
    },
  },
  "1d": {
    id: "1d",
    domain: "Domain 1",
    domainTitle: "Planning and Readiness",
    title: "Effective Selection and Use of Resources",
    descriptors: {
      unsatisfactory:
        "The teacher is unaware of available instructional materials and other resources, or uses them poorly, hindering student learning and development.",
      basic:
        "The teacher uses available instructional materials and other resources in ways that support student learning and development, yet draws on only a narrow range of what is available.",
      proficient:
        "The teacher's broad knowledge of materials and resources leads to discerning choices that support student learning and development.",
      distinguished:
        "The teacher deliberately selects instructional materials and other resources and deploys them to meet each student's needs while supporting autonomy and intellectual engagement.",
    },
  },
  "1e": {
    id: "1e",
    domain: "Domain 1",
    domainTitle: "Planning and Readiness",
    title: "Designing Coherent Lesson Sequences",
    descriptors: {
      unsatisfactory:
        "Learning experiences are not designed to engage students with important content.",
      basic:
        "Learning experiences have some structure within and across lessons and partly support students in meeting the intended outcomes.",
      proficient:
        "Learning experiences are engaging and challenging and meet student needs in this class.",
      distinguished:
        "Learning experiences put individual needs first, make sure all students can reach the intended outcomes, and support students in taking responsibility for their learning.",
    },
  },
  "1f": {
    id: "1f",
    domain: "Domain 1",
    domainTitle: "Planning and Readiness",
    title: "Assessment Design and Analysis",
    descriptors: {
      unsatisfactory:
        "No assessment plan exists, or the planned assessments will not show whether students learned the intended outcomes.",
      basic:
        "Assessments give the teacher only partial evidence of whether students are learning the intended outcomes.",
      proficient:
        "Assessments are planned throughout instruction and give teachers timely, useful information and give students feedback.",
      distinguished:
        "Through multiple and flexible assessments, students can show content mastery, set goals, and track their own progress.",
    },
  },
  "2a": {
    id: "2a",
    domain: "Domain 2",
    domainTitle: "Classroom Environment",
    title: "Building Respectful and Affirming Classrooms",
    descriptors: {
      unsatisfactory:
        "Students feel unsafe or unvalued; the environment shows negativity, disrespect, insensitivity, or unresolved conflict.",
      basic: "The learning environment shows some caring and respectful interactions.",
      proficient:
        "The learning environment is marked by positive developmental relationships that the teacher deliberately nurtures and celebrates.",
      distinguished:
        "Students actively help create a classroom community in which everyone feels safe, valued, and connected.",
    },
  },
  "2b": {
    id: "2b",
    domain: "Domain 2",
    domainTitle: "Classroom Environment",
    title: "Building a Strong Learning Culture",
    descriptors: {
      unsatisfactory: "The class culture works against both learning and development.",
      basic: "The class culture is only partly conducive to learning and development.",
      proficient:
        "The class culture reflects high expectations and advances students' learning and development.",
      distinguished:
        "Students actively help build a culture that fosters ongoing dialogue, reflection, and growth so all students can succeed.",
    },
  },
  "2c": {
    id: "2c",
    domain: "Domain 2",
    domainTitle: "Classroom Environment",
    title: "Purposeful Routines and Procedures",
    descriptors: {
      unsatisfactory:
        "Missing routines or inefficient classroom procedures hinder student learning and development.",
      basic:
        "The teacher establishes and manages most routines and procedures and teaches them explicitly, so they support student learning and development.",
      proficient:
        "Routines and procedures are efficient and mostly student-run, maximizing time for learning and development.",
      distinguished:
        "Students have a voice and actively design and adjust routines and procedures that create a respectful environment and support every member's growth.",
    },
  },
  "2d": {
    id: "2d",
    domain: "Domain 2",
    domainTitle: "Classroom Environment",
    title: "Promoting Positive Student Behavior",
    descriptors: {
      unsatisfactory:
        "The teacher rarely models, teaches, or guides positive student behavior explicitly.",
      basic: "The teacher models positive behavior and occasionally teaches it explicitly.",
      proficient:
        "Students show positive behavior, which teachers model and reinforce to prompt reflection and recalibration rather than mere compliance.",
      distinguished:
        "Students consistently show positive behavior independently and seek ways to improve the classroom community.",
    },
  },
  "2e": {
    id: "2e",
    domain: "Domain 2",
    domainTitle: "Classroom Environment",
    title: "Organizing Physical Learning Spaces",
    descriptors: {
      unsatisfactory:
        "Learning spaces are unsafe, inaccessible, or work against learning and development.",
      basic:
        "Spaces are safe and accessible; resources are arranged and used in ways that only partly support student learning and development.",
      proficient:
        "Learning spaces are carefully designed so individual learners' needs are met within shared experiences.",
      distinguished:
        "Members of the learning community co-design and adjust learning spaces as needed to meet individual needs and create collaborative, joyful places where all can learn and grow.",
    },
  },
  "3a": {
    id: "3a",
    domain: "Domain 3",
    domainTitle: "Instruction and Learning",
    title: "Clear Communication of Purpose and Content",
    descriptors: {
      unsatisfactory:
        "Purpose and content are communicated unclearly or confusingly, which hinders student learning.",
      basic:
        "Purpose and content are communicated mostly clearly and accurately, partly supporting learning.",
      proficient:
        "Purpose and content are communicated accurately and clearly; students engage actively in learning experiences, and the teacher models effective language use.",
      distinguished:
        "Purpose and content are communicated richly, with nuance and relevance; students are invited to think critically, contribute intellectually, and act with curiosity and autonomy.",
    },
  },
  "3b": {
    id: "3b",
    domain: "Domain 3",
    domainTitle: "Instruction and Learning",
    title: "Skillful Questioning and Discussion Methods",
    descriptors: {
      unsatisfactory:
        "Questioning and discussion are missing, stay at a low level, or fail to support learning and development.",
      basic:
        "The teacher mainly frames and leads questioning and discussion in support of student learning and development.",
      proficient:
        "Teacher and students frame and lead questioning and discussion that effectively builds critical thinking, reasoning, and reflection.",
      distinguished:
        "Students deliberately use questioning and discussion to grow their own and each other's thinking, reasoning, and reflection.",
    },
  },
  "3c": {
    id: "3c",
    domain: "Domain 3",
    domainTitle: "Instruction and Learning",
    title: "Active Engagement in Learning",
    descriptors: {
      unsatisfactory:
        "Learning experiences demand no active intellectual engagement from students.",
      basic:
        "Learning experiences engage students intellectually only in part; activities require some thinking.",
      proficient:
        "Learning experiences spark curiosity and exploration and promote higher-order thinking; students participate in multiple ways and express their thinking in varied forms.",
      distinguished:
        "Students take initiative to make learning experiences more challenging or complex; they think critically about varied issues, offer solutions, and suggest modifications that add meaning and relevance.",
    },
  },
  "3d": {
    id: "3d",
    domain: "Domain 3",
    domainTitle: "Instruction and Learning",
    title: "Using Assessment to Guide Learning",
    descriptors: {
      unsatisfactory:
        "Formative assessment is absent during instruction or does not serve the lesson's instructional purpose.",
      basic: "Formative assessment only partly supports student learning and development.",
      proficient:
        "Teacher and students use formative assessment to surface evidence of understanding, track progress, and give constructive feedback.",
      distinguished:
        "Students take the initiative to gauge their progress against a clear standard, work to achieve the outcome, and spot new opportunities and challenges.",
    },
  },
  "3e": {
    id: "3e",
    domain: "Domain 3",
    domainTitle: "Instruction and Learning",
    title: "Adapting Instruction to Student Needs",
    descriptors: {
      unsatisfactory:
        "The teacher adjusts learning experiences not at all, even when adjustment is warranted, and does not respond to student needs.",
      basic:
        "The teacher adjusts learning experiences somewhat and responds to student needs with only partial success.",
      proficient:
        "The teacher's adjustments and responses deepen student understanding or create new learning experiences.",
      distinguished:
        "Drawing on self-monitoring and honest reflection, students speak up about needs, ask questions, and offer suggestions that prompt adjustments, modifications, or new learning opportunities.",
    },
  },
  "4a": {
    id: "4a",
    domain: "Domain 4",
    domainTitle: "Professional Responsibility",
    title: "Reflecting on and Improving Practice",
    descriptors: {
      unsatisfactory:
        "The teacher shows no sign of reflection, cannot say whether the outcomes were achieved, or misjudges how well instruction worked.",
      basic:
        "The teacher reflects with some accuracy about how well instruction worked but does not analyze the results or change practice.",
      proficient:
        "The teacher reflects on evidence about student learning and development, accurately judges how well instruction worked, and makes specific changes and adjustments.",
      distinguished:
        "The teacher reflects consistently and thoroughly, accurately judges how well instruction worked, explores new ideas and approaches, and keeps changing practices and mindsets to support students who need it most.",
    },
  },
  "4b": {
    id: "4b",
    domain: "Domain 4",
    domainTitle: "Professional Responsibility",
    title: "Recording and Tracking Student Progress",
    descriptors: {
      unsatisfactory:
        "No system exists for tracking student progress, or the tracking system works poorly and gives little useful information to students or their supporters.",
      basic:
        "The teacher records some aspects of student progress so that students and their supporters can access it.",
      proficient:
        "The teacher tracks and celebrates progress toward mastery, focuses on learning and developmental goals, and has students and their supporters reflect on the progress.",
      distinguished:
        "Students track their own progress toward mastery and their growth toward learning and development goals; they review and discuss it with the teacher and their supporters.",
    },
  },
  "4c": {
    id: "4c",
    domain: "Domain 4",
    domainTitle: "Professional Responsibility",
    title: "Partnering with Families and Communities",
    descriptors: {
      unsatisfactory:
        "The teacher engages the community and students' families rarely, disrespectfully, or not at all.",
      basic:
        "The teacher engages families and communities in some ways and always acts respectfully.",
      proficient:
        "The teacher works with students' families and communities respectfully and with cultural responsiveness, shares information readily, and invites participation in the classroom's intellectual life.",
      distinguished:
        "The teacher engages families and communities often and continually, clearly valuing the part they play in supporting student learning and building partnerships that advance every student's academic and personal success.",
    },
  },
  "4d": {
    id: "4d",
    domain: "Domain 4",
    domainTitle: "Professional Responsibility",
    title: "Contributing to the School Community",
    descriptors: {
      unsatisfactory:
        "The teacher does not take an active role in the school community, or detracts from its learning culture and values.",
      basic:
        "The teacher contributes modestly to the school culture, backs professional learning, and upholds the school's values.",
      proficient:
        "The teacher initiates and leads events, programs, or activities that strengthen the school's learning culture and animate its values through modeling and positive action.",
      distinguished:
        "The teacher leads in defining and modeling the school's values and intellectual life, holds self and peers accountable to them, and emphasizes meeting student and family needs.",
    },
  },
  "4e": {
    id: "4e",
    domain: "Domain 4",
    domainTitle: "Professional Responsibility",
    title: "Professional Growth and Development",
    descriptors: {
      unsatisfactory:
        "The teacher does not pursue professional inquiry or learning aimed at growing knowledge, skills, and mindsets, or participates reluctantly.",
      basic:
        "The teacher pursues professional inquiry and learning to grow knowledge, skills, and mindsets alone and with colleagues, but others usually determine or direct it.",
      proficient:
        "The teacher steers their own growth through professional inquiry and learning with colleagues, showing curiosity and energy in professional conversation about knowledge, skills, and mindsets.",
      distinguished:
        "The teacher uses autonomy wisely to direct professional learning for self and colleagues, leads in the school, sets direction, and supports colleagues in inquiry and innovation.",
    },
  },
  "4f": {
    id: "4f",
    domain: "Domain 4",
    domainTitle: "Professional Responsibility",
    title: "Acting in Students' Best Interests",
    descriptors: {
      unsatisfactory:
        "The teacher acts unethically, misunderstands students' needs, and does not decide in their best interest.",
      basic:
        "The teacher acts ethically and tries to weigh what is best for students, families, and colleagues in each decision.",
      proficient:
        "The teacher visibly models high ethical standards and makes wise decisions serving students, families, and colleagues.",
      distinguished:
        "The teacher leads the school in setting and upholding high ethical standards and in modeling wise decisions that honor each student's inherent worth and dignity and put student needs first.",
    },
  },
};
