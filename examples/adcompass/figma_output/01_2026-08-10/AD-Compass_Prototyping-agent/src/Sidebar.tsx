import type { Project, View } from './types'
import { STAGES } from './types'

interface SidebarProps {
  view: View
  project: Project | null
  selectedStageIndex: number
  onStageSelect: (index: number) => void
  onBack: () => void
}

export default function Sidebar({
  view,
  project,
  selectedStageIndex,
  onStageSelect,
  onBack,
}: SidebarProps) {
  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border-soft)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Logotype */}
      <div
        style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--color-border-soft)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '0.04em',
            color: 'var(--color-accent)',
            display: 'block',
          }}
        >
          AD Compass
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 11,
            color: 'var(--color-fg-secondary)',
            letterSpacing: '0.02em',
          }}
        >
          AD昇格移行支援ツール
        </span>
      </div>

      {/* S01: minimal nav */}
      {view === 'S01' && (
        <div style={{ padding: '16px 0', flex: 1 }}>
          <div
            style={{
              padding: '6px 24px',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-fg-secondary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-heading)',
            }}
          >
            担当案件
          </div>
          <NavItem active label="ダッシュボード" />
        </div>
      )}

      {/* S02: project + stepper */}
      {view === 'S02' && project && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              padding: '14px 24px 12px',
              borderBottom: '1px solid var(--color-border-soft)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: 'var(--color-fg-secondary)',
                marginBottom: 4,
              }}
            >
              進行中の案件
            </div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--color-fg-primary)',
                lineHeight: 1.4,
              }}
            >
              {project.name}
            </div>
          </div>

          <div style={{ padding: '16px 0', flex: 1 }}>
            <div
              style={{
                padding: '4px 24px 8px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-fg-secondary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-heading)',
              }}
            >
              工程
            </div>
            {STAGES.map((stage, i) => {
              const isCurrent = i === project.currentStageIndex
              const isPast = i < project.currentStageIndex
              const isSelected = i === selectedStageIndex
              return (
                <button
                  key={stage}
                  onClick={() => onStageSelect(i)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0 24px',
                    minHeight: 36,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: isSelected ? 'var(--color-accent-light)' : 'transparent',
                    border: 'none',
                    borderLeft: isSelected
                      ? '3px solid var(--color-accent)'
                      : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13,
                    fontWeight: isSelected || isCurrent ? 700 : 400,
                    color: isPast && !isSelected
                      ? 'var(--color-fg-secondary)'
                      : isSelected
                      ? 'var(--color-accent)'
                      : 'var(--color-fg-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        'rgba(44,90,160,0.05)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                  }}
                >
                  <StepDot index={i} current={project.currentStageIndex} selected={isSelected} />
                  <span>{stage}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* S03: project info only */}
      {view === 'S03' && project && (
        <div style={{ flex: 1, padding: '14px 24px 12px' }}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--color-fg-secondary)',
              marginBottom: 4,
            }}
          >
            振り返り
          </div>
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 13,
              color: 'var(--color-fg-primary)',
              lineHeight: 1.4,
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
                marginTop: 6,
              }}
            >
              完了日: {project.completedDate}
            </div>
          )}
        </div>
      )}

      {/* Back button — shown when not on S01 */}
      {view !== 'S01' && (
        <div
          style={{
            borderTop: '1px solid var(--color-border-soft)',
            padding: '12px 16px',
          }}
        >
          <button
            onClick={onBack}
            style={{
              width: '100%',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: '1px solid var(--color-border-soft)',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--color-fg-secondary)',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.color = 'var(--color-fg-primary)'
              btn.style.borderColor = 'var(--color-border)'
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.color = 'var(--color-fg-secondary)'
              btn.style.borderColor = 'var(--color-border-soft)'
            }}
          >
            <ArrowLeft />
            案件一覧に戻る
          </button>
        </div>
      )}
    </aside>
  )
}

function StepDot({
  index,
  current,
  selected,
}: {
  index: number
  current: number
  selected: boolean
}) {
  const isPast = index < current
  const isCurrent = index === current

  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        flexShrink: 0,
        backgroundColor: selected
          ? 'var(--color-accent)'
          : isCurrent
          ? 'var(--color-accent)'
          : isPast
          ? 'var(--color-fg-secondary)'
          : 'var(--color-border-soft)',
        border: selected || isCurrent ? 'none' : '1.5px solid var(--color-border)',
      }}
    />
  )
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      style={{
        padding: '0 24px',
        minHeight: 36,
        display: 'flex',
        alignItems: 'center',
        borderLeft: active ? '3px solid var(--color-accent)' : '3px solid transparent',
        background: active ? 'var(--color-accent-light)' : 'transparent',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: active ? 700 : 400,
        color: active ? 'var(--color-accent)' : 'var(--color-fg-primary)',
      }}
    >
      {label}
    </div>
  )
}

function ArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9 11L5 7L9 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
