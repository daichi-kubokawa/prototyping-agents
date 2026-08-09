import type { Project, Stage, FeedbackEntry } from './types'

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: '春季カタログリニューアル',
    status: 'active',
    currentStageIndex: 1,
    hasPendingCheckpoint: true,
    absentRoles: [],
  },
  {
    id: 'p2',
    name: 'BtoB サービス紹介資料',
    status: 'active',
    currentStageIndex: 2,
    hasPendingCheckpoint: false,
    absentRoles: ['AD'],
  },
  {
    id: 'p3',
    name: '展示会パネルデザイン',
    status: 'active',
    currentStageIndex: 3,
    hasPendingCheckpoint: false,
    absentRoles: [],
  },
  {
    id: 'p4',
    name: '年末キャンペーン販促物',
    status: 'completed',
    currentStageIndex: 5,
    completedDate: '2025年3月14日',
    absentRoles: [],
  },
]

export const CHECKPOINTS: Partial<Record<Stage, string[]>> = {
  '見積・納期設定': [
    '類似規模・類似内容の過去案件と比較して、見積工数に大きな乖離はないか',
    '修正・確認のやり取りにかかる時間を、納期の中に見込めているか',
    'この見積・納期は、自分ひとりの経験だけで判断してよい規模か、それとも第三者の目が必要な規模か',
  ],
}

export const CONSULTANTS = [
  {
    role: '営業',
    description: 'クライアント・設営業者との窓口。対外条件に関わる論点はここへ',
  },
  {
    role: 'コーディネーター',
    description: 'デザイン室所属・PM的役割。進行管理・スケジュールに関わる論点はここへ',
  },
  {
    role: 'AD',
    description: '本来の管理・判断役。デザイン品質・判断基準そのものに迷ったときはここへ',
  },
  {
    role: 'センターマネージャー',
    description: 'デザイン室の統括。個別工程を超えた体制・負荷の相談はここへ',
  },
]

export const FEEDBACKS: Record<string, FeedbackEntry[]> = {
  p4: [
    {
      stage: '見積・納期設定',
      positive:
        '見積・納期設定における過去案件との比較検討は、工数根拠を明示した点で適切でした。',
      improvement:
        '見積・納期設定では修正ラウンドの想定が1回分少なく、後半に日程圧迫が生じました。次回は確認工程ごとにバッファ日を1日見込むと、納期遅延リスクが低減できます。',
    },
    {
      stage: 'デザイン制作',
      positive:
        'デザイン制作におけるトンマナの統一判断は、過去のブランドガイドラインを積極参照した点で適切でした。',
      improvement: undefined,
    },
  ],
}
