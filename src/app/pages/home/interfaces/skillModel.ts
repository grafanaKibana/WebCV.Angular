export interface SkillGroupModel {
  name: string;
  skills: SkillModel[];
}

export interface SkillModel {
  technology: string;
  level: number;
}
