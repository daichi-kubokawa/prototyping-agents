import { useState } from 'react'
import type { Project, JudgmentRecord } from '../types'
import { STAGES } from '../types'
import { CHECKPOINTS, CONSULTANTS } from '../data'

interface S02Props {
  project: Project
  selectedStageIndex: number
  judgmentRecords: Record<string, JudgmentRecord>
  onRecordSave: (key: string, record: JudgmentRecord) => void
  onGoToS03: () => void
}

export default function S02({
  project,
  selectedStageIndex,
  judgmentRecords,
  onRecordSave,
  onGoToS03,
}: S02Props) {
  const stage = STAGES[selectedStageIndex]
  const checkpoints = CHECKPOINTS[stage]
  const isViburi = selectedStageIndex === 5
  const recordKey = `${project.id}-${selectedStageIndex}`
  const record = judgmentRecords[recordKey] ?? { decision: null, memo: '' }

  return (
    <main style={{ flex: 1, padding: '40px 48px', maxWidth: 860 }}>
      <div
        style={{
          marginBottom: 6,
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'var(--color-fg-secondary)',
          letterSpacing: '0.04em',
        }}
      >
        工程別判断ガイド
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 22,
          color: 'var(--color-fg-primary)',
          margin: '0 0 2px',
          lineHeight: 1.35,
        }}
      >
        {stage}
      </h1>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--color-fg-secondary)',
          marginBottom: 32,
        }}
      >
        {project.name}
      </div>

      {/* 振り返り工程では判断ガイドではなくS03へ誘導 */}
      {isViburi ? (
        <ViburiRedirect onGoToS03={onGoToS03} />
      ) : (
        <>
          <CheckpointsSection stage={stage} checkpoints={checkpoints} />

          <div
            style={{
              borderTop: '1px solid var(--color-border-soft)',
              marginTop: 36,
              paddingTop: 32,
            }}
          />

          <ConsultantsSection absentRoles={project.absentRoles ?? []} />

          <div
            style={{
              borderTop: '1px solid var(--color-border-soft)',
              marginTop: 36,
              paddingTop: 32,
            }}
          />

          <JudgmentRecordSection
            record={record}
            onSave={(updated) => onRecordSave(recordKey, updated)}
          />
        </>
      )}
    </main>
  )
}

function CheckpointsSection({
  stage,
  checkpoints,
}: {
  stage: string
  checkpoints: string[] | undefined
}) {
  return (
    <section>
      <SectionHeading>見積・納期の妥当性を確認する</SectionHeading>

      {!checkpoints || checkpoints.length === 0 ? (
        <EmptyCheckpoints />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {checkpoints.map((point, i) => (
            <CheckpointItem key={i} index={i + 1} text={point} />
          ))}
        </div>
      )}
    </section>
  )
}

function CheckpointItem({ index, text }: { index: number; text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-soft)',
        borderRadius: 6,
        padding: '16px 20px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 13,
          color: 'var(--color-accent)',
          minWidth: 24,
          paddingTop: 1,
          lineHeight: 1.6,
          flexShrink: 0,
        }}
      >
        {index}
      </span>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--color-fg-primary)',
          margin: 0,
          lineHeight: 1.7,
        }}
      >
        {text}
      </p>
    </div>
  )
}

function EmptyCheckpoints() {
  return (
    <div
      style={{
        marginTop: 16,
        padding: '24px 20px',
        background: 'var(--color-surface)',
        border: '1px dashed var(--color-border)',
        borderRadius: 6,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--color-fg-secondary)',
          margin: 0,
        }}
      >
        この工程の判断チェックポイントは準備中です
      </p>
    </div>
  )
}

function ConsultantsSection({ absentRoles }: { absentRoles: string[] }) {
  const visible = CONSULTANTS.filter((c) => !absentRoles.includes(c.role))

  return (
    <section>
      <SectionHeading>相談先候補</SectionHeading>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--color-fg-secondary)',
          margin: '4px 0 16px',
        }}
      >
        今、誰に・何を確認すべきか。役割ごとの適した論点を参考に相談の要否を判断してください。
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map((c) => (
          <div
            key={c.role}
            style={{
              display: 'flex',
              gap: 16,
              padding: '13px 18px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-soft)',
              borderRadius: 6,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--color-fg-primary)',
                minWidth: 112,
                flexShrink: 0,
                paddingTop: 1,
                lineHeight: 1.6,
              }}
            >
              {c.role}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                color: 'var(--color-fg-secondary)',
                lineHeight: 1.6,
              }}
            >
              {c.description}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function JudgmentRecordSection({
  record,
  onSave,
}: {
  record: JudgmentRecord
  onSave: (r: JudgmentRecord) => void
}) {
  const [local, setLocal] = useState<JudgmentRecord>(record)
  const [saved, setSaved] = useState(false)

  const handleDecision = (decision: 'consult' | 'self') => {
    setLocal((prev) => ({ ...prev, decision }))
    setSaved(false)
  }

  const handleMemo = (memo: string) => {
    setLocal((prev) => ({ ...prev, memo }))
    setSaved(false)
  }

  const handleSave = () => {
    onSave(local)
    setSaved(true)
  }

  return (
    <section>
      <SectionHeading>自己判断の記録</SectionHeading>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--color-fg-secondary)',
          margin: '4px 0 16px',
        }}
      >
        この工程での判断方針と根拠を記録しておくことで、次回案件の参考にできます。
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <DecisionButton
          label="相談する"
          selected={local.decision === 'consult'}
          onClick={() => handleDecision('consult')}
        />
        <DecisionButton
          label="自己判断で進める"
          selected={local.decision === 'self'}
          onClick={() => handleDecision('self')}
        />
      </div>

      <label
        style={{
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--color-fg-secondary)',
          marginBottom: 6,
        }}
      >
        判断の根拠・メモ
      </label>
      <textarea
        value={local.memo}
        onChange={(e) => handleMemo(e.target.value)}
        placeholder="判断の根拠や気になった点を自由に書いてください"
        rows={4}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 14px',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--color-fg-primary)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-soft)',
          borderRadius: 4,
          resize: 'vertical',
          lineHeight: 1.6,
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-accent)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border-soft)'
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 12,
        }}
      >
        <button
          onClick={handleSave}
          disabled={local.decision === null}
          style={{
            padding: '8px 20px',
            background: local.decision !== null ? 'var(--color-accent)' : 'var(--color-border-soft)',
            color: local.decision !== null ? '#FFFFFF' : 'var(--color-fg-secondary)',
            border: 'none',
            borderRadius: 4,
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            fontWeight: 700,
            cursor: local.decision !== null ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            if (local.decision !== null)
              (e.currentTarget as HTMLButtonElement).style.background = '#234d8a'
          }}
          onMouseLeave={(e) => {
            if (local.decision !== null)
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'
          }}
        >
          記録する
        </button>
        {saved && (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--color-fg-secondary)',
            }}
          >
            記録しました
          </span>
        )}
      </div>
    </section>
  )
}

function DecisionButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        minHeight: 36,
        background: selected ? 'var(--color-accent-light)' : 'var(--color-surface)',
        border: selected
          ? '1.5px solid var(--color-accent)'
          : '1px solid var(--color-border-soft)',
        borderRadius: 4,
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: selected ? 700 : 400,
        color: selected ? 'var(--color-accent)' : 'var(--color-fg-secondary)',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

function ViburiRedirect({ onGoToS03 }: { onGoToS03: () => void }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-soft)',
        borderRadius: 6,
        padding: '32px 28px',
        maxWidth: 560,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 16,
          color: 'var(--color-fg-primary)',
          marginBottom: 10,
        }}
      >
        振り返りのフェーズです
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--color-fg-secondary)',
          margin: '0 0 24px',
          lineHeight: 1.75,
        }}
      >
        この工程は判断の場ではなく、完了案件のAD業務を振り返り、次回に活かす改善点を受け取るフェーズです。
        フィードバック画面で確認してください。
      </p>
      <button
        onClick={onGoToS03}
        style={{
          padding: '10px 20px',
          background: 'var(--color-accent)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 4,
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#234d8a'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'
        }}
      >
        フィードバックを見る
      </button>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: 15,
        color: 'var(--color-fg-primary)',
        margin: '0 0 0',
        lineHeight: 1.4,
      }}
    >
      {children}
    </h2>
  )
}
