export interface SkillGroupModel {
  name: string;
  skills: SkillModel[];
}

export interface SkillModel {
  technology: string;
  level: number;
  /** Marks a standout "Signature Skill" — rendered with accent styling and a leading dot. */
  signature?: boolean;
}
