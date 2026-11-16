// App-owned copy of the school-supplied Danielson Framework for Teaching 2022 descriptor data.
// Source file: danielson-2022-rubric-descriptors.json.
import type { DanielsonComponentId } from './graph';

export const FFT_2022_RATING_LEVELS = [
  { id: "unsatisfactory", score: 1, label: "Unsatisfactory" },
  { id: "basic", score: 2, label: "Basic" },
  { id: "proficient", score: 3, label: "Proficient" },
  { id: "distinguished", score: 4, label: "Distinguished" },
] as const;

export type Fft2022RatingLevelId = (typeof FFT_2022_RATING_LEVELS)[number]['id'];

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
    domainTitle: "Planning and Preparation",
    title: "Applying Knowledge of Content and Pedagogy",
    descriptors: {
      unsatisfactory: "The teacher lacks sufficient knowledge of content and pedagogy to support student learning of the content.",
      basic: "The teacher’s understanding of content and pedagogy partially supports student learning of the content.",
      proficient: "The teacher’s understanding of content and pedagogy supports student learning of the content.",
      distinguished: "The teacher’s understanding of content and pedagogy fosters deeper learning, student agency, and intellectual dispositions such as curiosity, reasoning, and reflection.",
    },
  },
  "1b": {
    id: "1b",
    domain: "Domain 1",
    domainTitle: "Planning and Preparation",
    title: "Knowing and Valuing Students",
    descriptors: {
      unsatisfactory: "The teacher lacks sufficient knowledge of students to support student learning or development.",
      basic: "The teacher’s knowledge of students’ identities, as well as their strengths and needs, partially supports learning and development.",
      proficient: "The teacher’s knowledge of students supports learning and development, and enables the teacher to build upon student assets.",
      distinguished: "The teacher’s knowledge of students is extensive and fosters student learning and development to support academic and personal success.",
    },
  },
  "1c": {
    id: "1c",
    domain: "Domain 1",
    domainTitle: "Planning and Preparation",
    title: "Setting Instructional Outcomes",
    descriptors: {
      unsatisfactory: "Instructional outcomes are not identified, are not rigorous, or are inappropriate.",
      basic: "Instructional outcomes are moderately rigorous and are appropriate for most students in the class.",
      proficient: "Instructional outcomes are rigorous and appropriate for students.",
      distinguished: "Instructional outcomes represent high-level learning of important content and support student autonomy, curiosity, and intellectual risk-taking.",
    },
  },
  "1d": {
    id: "1d",
    domain: "Domain 1",
    domainTitle: "Planning and Preparation",
    title: "Using Resources Effectively",
    descriptors: {
      unsatisfactory: "The teacher is not aware of, or does not appropriately or effectively use, instructional materials and other resources to support student learning and development.",
      basic: "The teacher understands and uses instructional materials and other resources to support student learning and development, but these resources represent only a narrow band of what is available.",
      proficient: "The teacher’s knowledge of instructional materials and other resources leads to discerning choices to support student learning and development.",
      distinguished: "The teacher makes deliberate decisions in the use of instructional materials and other resources to meet individual student needs and support student autonomy and intellectual engagement.",
    },
  },
  "1e": {
    id: "1e",
    domain: "Domain 1",
    domainTitle: "Planning and Preparation",
    title: "Planning Coherent Instruction",
    descriptors: {
      unsatisfactory: "The design of learning experiences does not support student engagement with important content.",
      basic: "Learning experiences are somewhat coherent in structure, within and across lessons, partially supporting students to meet the intended outcomes.",
      proficient: "Learning experiences are challenging and engaging; they are designed to meet the needs of students in the class.",
      distinguished: "Learning experiences prioritize the needs of individual students, ensure all students can meet the intended outcomes, and support student assumption of responsibility for learning.",
    },
  },
  "1f": {
    id: "1f",
    domain: "Domain 1",
    domainTitle: "Planning and Preparation",
    title: "Designing and Analyzing Assessments",
    descriptors: {
      unsatisfactory: "There is no plan for assessment, or the assessments will not provide evidence that students have learned the intended outcomes.",
      basic: "Assessments will partially help the teacher determine whether students have learned or are learning the intended outcomes.",
      proficient: "Assessments are planned throughout the instructional process and provide timely and valuable information to teachers and feedback to students.",
      distinguished: "Students will have the opportunity to demonstrate mastery of content, set goals, and analyze their own progress through multiple, flexible assessments.",
    },
  },
  "2a": {
    id: "2a",
    domain: "Domain 2",
    domainTitle: "Learning Environments",
    title: "Cultivating Respectful and Affirming Environments",
    descriptors: {
      unsatisfactory: "Students do not feel safe and valued; learning environments are characterized by negativity, disrespect, inappropriateness, insensitivity, and/or unresolved conflict.",
      basic: "Learning environments are partially characterized by caring and respectful interactions.",
      proficient: "Learning environments are characterized by positive developmental relationships that are intentionally nurtured and celebrated.",
      distinguished: "Students play an active role in creating learning environments characterized by a sense of community, where each member feels safe, valued, and connected.",
    },
  },
  "2b": {
    id: "2b",
    domain: "Domain 2",
    domainTitle: "Learning Environments",
    title: "Fostering a Culture for Learning",
    descriptors: {
      unsatisfactory: "The culture of the class is not conducive to learning and does not support development.",
      basic: "The culture of the class is partially conducive to learning and development.",
      proficient: "The culture of the class is characterized by high expectations and supports students’ learning and development.",
      distinguished: "Students play an active role in establishing a culture that consistently fosters dialogue, reflection, and growth, allowing all students to experience success.",
    },
  },
  "2c": {
    id: "2c",
    domain: "Domain 2",
    domainTitle: "Learning Environments",
    title: "Maintaining Purposeful Environments",
    descriptors: {
      unsatisfactory: "Student learning and development are hindered by a lack of routines or inefficient classroom procedures.",
      basic: "Classroom routines and procedures, established or managed primarily by the teacher and taught explicitly to students, support opportunities for student learning and development.",
      proficient: "Shared routines and efficient procedures are largely student-directed and maximize opportunities for student learning and development.",
      distinguished: "Students have a voice and play an active role in designing and adjusting routines and procedures that actively create a respectful learning environment and support the growth of each community member.",
    },
  },
  "2d": {
    id: "2d",
    domain: "Domain 2",
    domainTitle: "Learning Environments",
    title: "Supporting Positive Student Behavior",
    descriptors: {
      unsatisfactory: "There is little evidence of explicit modeling, instruction, or guidance related to positive student behaviors.",
      basic: "Positive behaviors are modeled by the teacher and occasionally taught explicitly.",
      proficient: "Students display positive behaviors, which are modeled by teachers and reinforced to promote reflection and recalibration rather than compliance.",
      distinguished: "Students consistently and independently display positive behaviors and seek opportunities to build a better classroom community.",
    },
  },
  "2e": {
    id: "2e",
    domain: "Domain 2",
    domainTitle: "Learning Environments",
    title: "Organizing Spaces for Learning",
    descriptors: {
      unsatisfactory: "Learning spaces are unsafe, inaccessible, and/or not conducive to learning and development.",
      basic: "Learning spaces are safe and accessible; the arrangement and use of resources partially support student learning and development.",
      proficient: "Learning spaces are thoughtfully designed to address the needs of individual learners within the context of shared experiences.",
      distinguished: "Learning spaces are thoughtfully co-designed and modified as needed by members of the learning community to address the needs of individuals and create collaborative, joyful spaces for all to learn and grow.",
    },
  },
  "3a": {
    id: "3a",
    domain: "Domain 3",
    domainTitle: "Learning Experiences",
    title: "Communicating About Purpose and Content",
    descriptors: {
      unsatisfactory: "Communication about purpose and content is unclear or confusing and hinders student learning.",
      basic: "Communication about purpose and content is mostly clear and accurate; it partially supports learning.",
      proficient: "Communication about purpose and content is accurate and clear to students; it supports their active engagement in learning experiences and models effective use of language.",
      distinguished: "Communication about purpose and content is rich, nuanced, and relevant to students, inviting them to think critically and contribute intellectually; it encourages curiosity and supports student autonomy.",
    },
  },
  "3b": {
    id: "3b",
    domain: "Domain 3",
    domainTitle: "Learning Experiences",
    title: "Using Questioning and Discussion Techniques",
    descriptors: {
      unsatisfactory: "Questioning and discussion are absent, low-level, or do not support learning and development.",
      basic: "Questioning and discussion, primarily framed and led by the teacher, are used to support student learning and development.",
      proficient: "Questioning and discussion, framed or led by the teacher and students, effectively support critical thinking, reasoning, and reflection.",
      distinguished: "Students intentionally use questioning and discussion to develop their own and others’ thinking, reasoning skills, and habits of reflection.",
    },
  },
  "3c": {
    id: "3c",
    domain: "Domain 3",
    domainTitle: "Learning Experiences",
    title: "Engaging Students in Learning",
    descriptors: {
      unsatisfactory: "Learning experiences do not require active intellectual engagement by students.",
      basic: "Learning experiences partially engage students intellectually; the activities require students to do some thinking.",
      proficient: "Learning experiences support curiosity and exploration and encourage higher-order thinking; students engage in multiple ways and represent their ideas and responses through multiple means.",
      distinguished: "Students take initiative to increase the challenge or complexity of learning experiences; they think critically about a variety of issues and offer solutions; and they make suggestions for modifications that increase meaning and relevance.",
    },
  },
  "3d": {
    id: "3d",
    domain: "Domain 3",
    domainTitle: "Learning Experiences",
    title: "Using Assessment for Learning",
    descriptors: {
      unsatisfactory: "Formative assessment is not used during instruction or is not aligned to the instructional purpose of the lesson.",
      basic: "Formative assessment partially supports student learning and development.",
      proficient: "The teacher and students use formative assessments to elicit evidence of understanding, analyze progress, and provide constructive feedback.",
      distinguished: "Students take initiative to analyze their own progress against a clear standard in order to achieve the outcome and identify new opportunities and challenges.",
    },
  },
  "3e": {
    id: "3e",
    domain: "Domain 3",
    domainTitle: "Learning Experiences",
    title: "Responding Flexibly to Student Needs",
    descriptors: {
      unsatisfactory: "The teacher makes no adjustments to learning experiences, even when warranted, and is not responsive to student needs.",
      basic: "The teacher makes some adjustments to learning experiences and is responsive to student needs with partial success.",
      proficient: "The teacher’s adjustments and responsiveness lead to deeper understanding for students and/or new learning experiences.",
      distinguished: "Based on self-monitoring and reflection, students voice their needs, ask questions, and make suggestions that lead to adjustments and modifications or spark new learning opportunities.",
    },
  },
  "4a": {
    id: "4a",
    domain: "Domain 4",
    domainTitle: "Principled Teaching",
    title: "Engaging in Reflective Practice",
    descriptors: {
      unsatisfactory: "The teacher does not appear to engage in reflective practice, does not know whether students achieved the outcomes, or misjudges the success of instruction.",
      basic: "The teacher’s reflective practice leads to some accurate assessment of student success of instruction but does not follow through with analysis and changes to practice.",
      proficient: "The teacher’s reflective practice, based on consideration of evidence of student learning and development, leads to an accurate assessment of the success of instruction and results in specific changes and adjustments.",
      distinguished: "The teacher consistently engages in reflective practice that leads to a thorough and accurate assessment of the success of instruction, exploration of new ideas and approaches, and ongoing changes to practices and mindsets focused on supporting students who need it most.",
    },
  },
  "4b": {
    id: "4b",
    domain: "Domain 4",
    domainTitle: "Principled Teaching",
    title: "Documenting Student Progress",
    descriptors: {
      unsatisfactory: "There is no system for documenting student progress, the system is ineffective and inefficient, or it does not provide relevant information to students and those who support them.",
      basic: "The teacher documents some aspects of student progress in a manner that is accessible to students and those who support them.",
      proficient: "The teacher documents and celebrates student progress toward mastery, focusing on the attainment of learning and developmental goals; students and those who support them engage in reflection on their progress.",
      distinguished: "Students monitor progress toward mastery and their own attainment of learning and development goals; they analyze and discuss their progress with the teacher and those who support them.",
    },
  },
  "4c": {
    id: "4c",
    domain: "Domain 4",
    domainTitle: "Principled Teaching",
    title: "Engaging Families and Communities",
    descriptors: {
      unsatisfactory: "The teacher does not engage students’ families or the community, engages them infrequently, or does so disrespectfully.",
      basic: "The teacher makes some efforts to engage families and communities and does so in a respectful manner.",
      proficient: "The teacher engages students’ families and communities in a respectful and culturally responsive manner, making information readily available and inviting participation in the intellectual life of the classroom.",
      distinguished: "The teacher’s frequent and ongoing engagement of families and communities demonstrates a clear value for the role they play in student learning and is focused on forging partnerships that further the academic and personal success of each and every student.",
    },
  },
  "4d": {
    id: "4d",
    domain: "Domain 4",
    domainTitle: "Principled Teaching",
    title: "Contributing to School Community and Culture",
    descriptors: {
      unsatisfactory: "The teacher is not an active member of the school community or contributes negatively to the culture of learning and values of the school.",
      basic: "The teacher makes modest contributions to the school culture, supporting professional learning and upholding the values of the school.",
      proficient: "The teacher takes initiative in contributing to and leading events, programs, or activities that further the culture of learning in the school and bring the values of the school to life through modeling and positive action.",
      distinguished: "The teacher takes a leadership role in defining, modeling, and holding self and peers accountable to the values and intellectual life of the school, leading with an emphasis on meeting the needs of students and families.",
    },
  },
  "4e": {
    id: "4e",
    domain: "Domain 4",
    domainTitle: "Principled Teaching",
    title: "Growing and Developing Professionally",
    descriptors: {
      unsatisfactory: "The teacher does not engage in professional inquiry or learning focused on developing knowledge, skills, and mindsets, or does so reluctantly.",
      basic: "The teacher engages in professional inquiry and learning focused on developing knowledge, skills, and mindsets individually and with colleagues that is often determined or directed by others.",
      proficient: "The teacher directs their own professional inquiry and learning in collaboration with colleagues and demonstrates curiosity and energy for professional conversations and growth focused on developing knowledge, skills, and mindsets.",
      distinguished: "The teacher appropriately exercises autonomy to direct professional learning for themselves and their colleagues, taking a leadership role in the school, setting direction, and supporting colleagues to engage in inquiry and innovation.",
    },
  },
  "4f": {
    id: "4f",
    domain: "Domain 4",
    domainTitle: "Principled Teaching",
    title: "Acting in Service of Students",
    descriptors: {
      unsatisfactory: "The teacher acts unethically and does not understand the needs of students or make decisions in their best interest.",
      basic: "The teacher acts ethically and attempts to make deliberate decisions in the best interest of students, families, and colleagues.",
      proficient: "The teacher models high standards of ethical practice and wise decision-making on behalf of students, families, and colleagues.",
      distinguished: "The teacher is a leader in the school in defining and upholding high standards of ethical practice and modeling wise decision-making that honors the inherent worth and dignity of each and every student and prioritizes their needs.",
    },
  },
};
