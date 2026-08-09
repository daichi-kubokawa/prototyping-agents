import type { Project } from '../types'
import { STAGES } from '../types'

interface S01Props {
  projects: Project[]
  onSelectActive: (project: Project) => void
  onSelectCompleted: (project: Project) => void
}

export default function S01({ projects, onSelectActive, onSelectCompleted }: S01Props) {
  const active = projects.filter((p) => p.status === 'active')
  const completed = projects.filter((p) => p.status === 'completed')

  return (
    <main style={{ flex: 1, padding: '40px 48px', maxWidth: 900 }}>
      <PageHeading>担当案件</PageHeading>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--color-fg-secondary)',
          marginTop: 4,
          marginBottom: 32,
        }}
      >
        進行中の案件を選んで判断ガイドを開く、または完了済み案件の振り返りを確認できます。
      </p>

      {/* 進行中 */}
      <SectionLabel>進行中</SectionLabel>

      {active.length === 0 ? (
        <EmptyState message="現在担当している案件はありません" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {active.map((p) => (
            <ActiveCard key={p.id} project={p} onClick={() => onSelectActive(p)} />
          ))}
        </div>
      )}

      {/* 完了済み — 0件なら非表示 */}
      {completed.length > 0 && (
        <>
          <SectionLabel>完了済み</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {completed.map((p) => (
              <CompletedCard key={p.id} project={p} onClick={() => onSelectCompleted(p)} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}

function ActiveCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const stageName = STAGES[project.currentStageIndex]

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-soft)',
        borderRadius: 6,
        padding: '16px 20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement
        btn.style.borderColor = 'rgba(44,90,160,0.4)'
        btn.style.boxShadow = '0 2px 8px rgba(44,90,160,0.08)'
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement
        btn.style.borderColor = 'var(--color-border-soft)'
        btn.style.boxShadow = 'none'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--color-fg-primary)',
            marginBottom: 6,
          }}
        >
          {project.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StagePill stage={stageName} />
          {project.hasPendingCheckpoint && <PendingBadge />}
        </div>
      </div>
      <ChevronRight />
    </button>
  )
}

function CompletedCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-soft)',
        borderRadius: 6,
        padding: '14px 20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement
        btn.style.borderColor = 'rgba(44,90,160,0.4)'
        btn.style.boxShadow = '0 2px 8px rgba(44,90,160,0.08)'
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement
        btn.style.borderColor = 'var(--color-border-soft)'
        btn.style.boxShadow = 'none'
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--color-fg-secondary)',
            marginBottom: 4,
          }}
        >
          {project.name}
        </div>
        {project.completedDate && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--color-fg-secondary)',
            }}
          >
            完了日: {project.completedDate}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 12,
            color: 'var(--color-accent)',
            fontWeight: 700,
          }}
        >
          振り返りを見る
        </span>
        <ChevronRight />
      </div>
    </button>
  )
}

function StagePill({ stage }: { stage: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        background: 'var(--color-accent-light)',
        borderRadius: 3,
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--color-accent)',
        letterSpacing: '0.02em',
      }}
    >
      {stage}
    </span>
  )
}

function PendingBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 8px',
        background: 'rgba(44,90,160,0.08)',
        border: '1px solid rgba(44,90,160,0.25)',
        borderRadius: 3,
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--color-accent)',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent)',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      確認待ち
    </span>
  )
}

function PageHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: 24,
        color: 'var(--color-fg-primary)',
        lineHeight: 1.3,
        margin: 0,
      }}
    >
      {children}
    </h1>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--color-fg-secondary)',
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: '1px solid var(--color-border-soft)',
      }}
    >
      {children}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: '32px 24px',
        background: 'var(--color-surface)',
        border: '1px dashed var(--color-border)',
        borderRadius: 6,
        textAlign: 'center',
        marginBottom: 40,
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
        {message}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          color: 'var(--color-fg-secondary)',
          margin: '8px 0 0',
          opacity: 0.7,
        }}
      >
        案件依頼の発生をお待ちください
      </p>
    </div>
  )
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0, color: 'var(--color-fg-secondary)' }}
    >
      <path
        d="M6 12L10 8L6 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
