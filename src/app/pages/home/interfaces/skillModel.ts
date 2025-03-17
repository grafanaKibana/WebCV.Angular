export interface SkillGroupModel {
  name: string,
  skills: Array<SkillModel>
}
export interface SkillModel {
  technology: string,
  level: number
}
