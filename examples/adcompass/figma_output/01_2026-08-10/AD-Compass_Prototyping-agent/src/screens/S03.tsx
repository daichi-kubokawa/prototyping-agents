import { useState } from 'react'
import type { Project, FeedbackEntry } from '../types'

interface S03Props {
  project: Project
  feedbacks: FeedbackEntry[]
  memo: string
  onMemoChange: (memo: string) => void
}

export default function S03({ project, feedbacks, memo, onMemoChange }: S03Props) {
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
        完了後フィードバック
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
        {project.name}
      </h1>
      {project.completedDate && (
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--color-fg-secondary)',
            marginBottom: 32,
          }}
        >
          完了日: {project.completedDate}
        </div>
      )}

      {/* フィードバックセクション */}
      <section style={{ marginBottom: 40 }}>
        <SectionLabel>この案件のAD業務について</SectionLabel>

        {feedbacks.length === 0 ? (
          <div
            style={{
              padding: '28px 24px',
              background: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: 6,
              textAlign: 'center',
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
              この案件のフィードバックは準備中です
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {feedbacks.map((entry) => (
              <FeedbackCard key={entry.stage} entry={entry} />
            ))}
          </div>
        )}
      </section>

      {/* 申し送りメモ */}
      <section>
        <SectionLabel>次の案件に活かしたいこと</SectionLabel>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--color-fg-secondary)',
            margin: '4px 0 12px',
          }}
        >
          フィードバックを踏まえて、次回の案件で試したいことや気づきを書き留めてください。
        </p>
        <textarea
          value={memo}
          onChange={(e) => onMemoChange(e.target.value)}
          placeholder="次の案件に活かしたいことを自由に書いてください"
          rows={5}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 16px',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--color-fg-primary)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-soft)',
            borderRadius: 4,
            resize: 'vertical',
            lineHeight: 1.7,
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
      </section>
    </main>
  )
}

function FeedbackCard({ entry }: { entry: FeedbackEntry }) {
  const [open, setOpen] = useState(true)

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-soft)',
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          borderBottom: open ? '1px solid var(--color-border-soft)' : 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(44,90,160,0.03)'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--color-fg-primary)',
          }}
        >
          {entry.stage}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {entry.positive && (
            <FeedbackBlock variant="positive" text={entry.positive} />
          )}
          {entry.improvement && (
            <FeedbackBlock variant="improvement" text={entry.improvement} />
          )}
        </div>
      )}
    </div>
  )
}

function FeedbackBlock({
  variant,
  text,
}: {
  variant: 'positive' | 'improvement'
  text: string
}) {
  const isPositive = variant === 'positive'
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: isPositive ? '#2A7D4F' : 'var(--color-accent)',
          marginBottom: 6,
        }}
      >
        {isPositive ? '良かった点' : '改善点'}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--color-fg-primary)',
          margin: 0,
          lineHeight: 1.75,
          paddingLeft: 12,
          borderLeft: `2px solid ${isPositive ? '#2A7D4F' : 'var(--color-accent)'}`,
        }}
      >
        {text}
      </p>
    </div>
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
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: '1px solid var(--color-border-soft)',
      }}
    >
      {children}
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{
        color: 'var(--color-fg-secondary)',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
        flexShrink: 0,
      }}
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
