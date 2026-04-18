export {
  type PhaseProgressStatus,
  type LessonCompletionStatus,
  type CellColor,
  type GradebookLesson,
  type GradebookCell,
  type GradebookRow,
  computeLessonStatus,
  computeCellColor,
  buildGradebookCell,
  sortRowsByName,
  cellBgClass,
  cellColorLabel,
  applyStudentRowUpdate,
  type RawLesson,
  type RawLessonVersion,
  type RawPhaseVersion,
  type RawLessonStandard,
  type RawStudent,
  type RawProgressRow,
  type RawCompetencyRow,
  assembleGradebookRows,
} from './teacher-reporting/gradebook.js';

export {
  type UnitColumn,
  type CourseOverviewCell,
  type CourseOverviewRow,
  type RawCOLesson,
  type RawCOLessonVersion,
  type RawCOLessonStandard,
  type RawCOStudent,
  type RawCOCompetency,
  assembleCourseOverviewRows,
} from './teacher-reporting/course-overview.js';

export {
  type CompetencyHeatmapRow,
  type CompetencyHeatmapCell,
  type CompetencyStandard,
  type CompetencyHeatmapResponse,
  type StudentCompetencyDetail,
  type StudentCompetency,
  type RawCHStudent,
  type RawCHStandard,
  type RawCHCompetency,
  type RawCHLessonStandard,
  type RawCHLessonVersion,
  type RawCHLesson,
  type CompetencyCellColor,
  computeCompetencyColor,
  assembleCompetencyHeatmapRows,
  assembleStudentCompetencyDetail,
} from './teacher-reporting/competency-heatmap.js';

export {
  type GradebookCsvOptions,
  buildGradebookCsv,
} from './teacher-reporting/gradebook-export.js';
