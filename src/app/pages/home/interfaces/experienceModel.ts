export interface ExperienceModel {
  positionTitle: string;
  company: string;
  startMonth: string;
  startYear: string;
  endMonth: string | null;
  endYear: string | null;
  description: {
    responsibilities: string[];
    aboutProject: string;
    toolsAndTechnologies: string;
  };
}
