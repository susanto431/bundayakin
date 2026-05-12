export type SurveyAnswer = {
  value: string
  freeText?: string
  isDealbreaker: boolean
  /** Popup follow-up answers keyed by `${triggerValue}_${questionIndex}` */
  popupAnswers?: Record<string, string>
}

export type SurveyAnswers = Record<string, SurveyAnswer>

export type MatchingScore = {
  scoreOverall: number
  scoreDomainA: number
  scoreDomainB: number
  scoreDomainC: number
  aspectBreakdown: Record<string, number>
  matchHighlights: string[]
  mismatchAreas: string[]
  negotiationPoints: string[]
  tipsForParent: string[]
  tipsForNanny: string[]
}
