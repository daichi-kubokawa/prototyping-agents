export const STAGES = [
  '案件依頼',
  '見積・納期設定',
  'デザイン制作',
  '確認・修正',
  '納品・リリース',
  '振り返り',
] as const

export type Stage = (typeof STAGES)[number]

export interface Project {
  id: string
  name: string
  status: 'active' | 'completed'
  currentStageIndex: number
  completedDate?: string
  hasPendingCheckpoint?: boolean
  absentRoles?: string[]
}

export interface FeedbackEntry {
  stage: Stage
  positive?: string
  improvement?: string
}

export interface JudgmentRecord {
  decision: 'consult' | 'self' | null
  memo: string
}

export type View = 'S01' | 'S02' | 'S03'
