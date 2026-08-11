import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Channel = 'Slack' | 'メール' | '口頭'
type Priority = '緊急' | '通常' | null
type InquiryStatus = '未着手' | '対応中' | '対応済み'

interface HistoryEntry {
  id: string
  timestamp: string
  author: string
  content: string
}

interface Inquiry {
  id: string
  subject: string
  requester: string
  channel: Channel
  priority: Priority
  status: InquiryStatus
  assignee: string
  receivedAt: string
  history: HistoryEntry[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ASSIGNEES = ['担当 甲', '担当 乙', '担当 丙'] as const

const SIMILAR_PAST = [
  {
    id: 's1',
    date: '2026-06-03',
    subject: 'VPN接続不可（証明書更新後に発生）',
    resolution: '証明書の再配布により解消。クライアント再起動後に接続確認済み。',
  },
  {
    id: 's2',
    date: '2026-04-15',
    subject: 'リモートアクセス不可（VPNクライアント起動せず）',
    resolution: 'クライアントの再インストールにより解消。',
  },
]

const INIT: Inquiry[] = [
  {
    id: '001',
    subject: 'VPN接続ができない（在宅勤務中）',
    requester: '依頼者 甲',
    channel: 'Slack',
    priority: '緊急',
    status: '対応中',
    assignee: '担当 甲',
    receivedAt: '2026-08-11 09:14',
    history: [
      {
        id: 'h1',
        timestamp: '2026-08-11 09:20',
        author: '担当 甲',
        content: 'VPNクライアントの再起動を依頼。改善されない場合は証明書を確認する予定。',
      },
      {
        id: 'h2',
        timestamp: '2026-08-11 09:45',
        author: '担当 甲',
        content: '証明書の有効期限切れを確認。更新作業を実施中。完了次第、依頼者へ再接続テストを依頼する。',
      },
    ],
  },
  {
    id: '002',
    subject: '共有フォルダへのアクセス権限追加依頼',
    requester: '依頼者 乙',
    channel: 'メール',
    priority: '通常',
    status: '未着手',
    assignee: '未割り当て',
    receivedAt: '2026-08-11 10:02',
    history: [],
  },
  {
    id: '003',
    subject: '3階 複合機の印刷エラー（エラーコード: E-22）',
    requester: '依頼者 丙',
    channel: '口頭',
    priority: null,
    status: '未着手',
    assignee: '未割り当て',
    receivedAt: '2026-08-11 10:30',
    history: [],
  },
  {
    id: '004',
    subject: 'Teams会議中に音声が出力されない',
    requester: '依頼者 丁',
    channel: 'Slack',
    priority: '緊急',
    status: '対応済み',
    assignee: '担当 乙',
    receivedAt: '2026-08-10 16:45',
    history: [
      {
        id: 'h3',
        timestamp: '2026-08-10 16:50',
        author: '担当 乙',
        content: 'オーディオドライバの再インストールにより解消。依頼者に完了を報告済み。',
      },
    ],
  },
  {
    id: '005',
    subject: '受信メールの添付ファイルが開けない',
    requester: '依頼者 戊',
    channel: 'メール',
    priority: '通常',
    status: '対応中',
    assignee: '担当 甲',
    receivedAt: '2026-08-11 11:15',
    history: [
      {
        id: 'h4',
        timestamp: '2026-08-11 11:30',
        author: '担当 甲',
        content: 'セキュリティポリシーによるブロックを確認。上長の承認後に設定を解除予定。',
      },
    ],
  },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function nowStr(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const fontJP: CSSProperties = { fontFamily: "'IBM Plex Sans JP', sans-serif" }
const fontMono: CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" }

const btnBase: CSSProperties = {
  ...fontJP,
  cursor: 'pointer',
  border: '1px solid var(--border)',
  backgroundColor: 'transparent',
  color: 'var(--fg)',
  flexShrink: 0,
  lineHeight: 1,
}

const btnPrimary: CSSProperties = {
  ...btnBase,
  height: 'var(--target-primary-h)',
  minWidth: 'var(--target-primary-w)',
  fontSize: 'var(--font-size-body)',
  padding: '0 16px',
}

const btnChoice: CSSProperties = {
  ...btnBase,
  height: 'var(--target-choice-h)',
  minWidth: 'var(--target-choice-w)',
  fontSize: 'var(--font-size-caption)',
  padding: '0 12px',
}

const inputBase: CSSProperties = {
  ...fontJP,
  border: '1px solid var(--border)',
  backgroundColor: 'transparent',
  color: 'var(--fg)',
  fontSize: 'var(--font-size-body)',
  padding: '0 10px',
  height: 36,
  width: '100%',
  boxSizing: 'border-box',
}

const textareaBase: CSSProperties = {
  ...fontJP,
  border: '1px solid var(--border)',
  backgroundColor: 'transparent',
  color: 'var(--fg)',
  fontSize: 'var(--font-size-body)',
  padding: '8px 10px',
  width: '100%',
  resize: 'vertical',
  boxSizing: 'border-box',
  lineHeight: 1.7,
}

const STATUS_STYLE: Record<InquiryStatus, CSSProperties> = {
  '未着手': { color: 'var(--fg-secondary)', fontWeight: 400 },
  '対応中': { color: 'var(--fg)', fontWeight: 600 },
  '対応済み': { color: 'var(--fg-secondary)', fontWeight: 400 },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === '緊急') {
    return (
      <span
        style={{
          display: 'inline-block',
          backgroundColor: 'var(--accent)',
          color: 'var(--accent-fg)',
          fontSize: 12,
          padding: '2px 8px',
          fontWeight: 600,
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
      >
        緊急
      </span>
    )
  }
  if (priority === '通常') {
    return (
      <span
        style={{
          display: 'inline-block',
          border: '1px solid var(--border)',
          color: 'var(--fg-secondary)',
          fontSize: 12,
          padding: '2px 8px',
          flexShrink: 0,
        }}
      >
        通常
      </span>
    )
  }
  return null
}

function StatusText({ status }: { status: InquiryStatus }) {
  return <span style={STATUS_STYLE[status]}>{status}</span>
}

function SectionHead({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontSize: 'var(--font-size-caption)',
        color: 'var(--fg-secondary)',
        fontWeight: 500,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        margin: '0 0 var(--space-inner)',
      }}
    >
      {children}
    </p>
  )
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.32)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          ...fontJP,
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--border)',
          padding: 'var(--space-outer)',
          width: 480,
          maxWidth: '92vw',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function InqRow({ q, onClick }: { q: Inquiry; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        backgroundColor: hover ? '#ECEAE7' : 'transparent',
        transition: 'background-color 0.1s',
      }}
    >
      <td style={{ padding: '13px 10px', fontWeight: 500 }}>{q.subject}</td>
      <td
        style={{
          padding: '13px 10px',
          color: 'var(--fg-secondary)',
          fontSize: 'var(--font-size-caption)',
          whiteSpace: 'nowrap',
        }}
      >
        {q.requester}
      </td>
      <td
        style={{
          padding: '13px 10px',
          fontSize: 'var(--font-size-caption)',
          color: 'var(--fg-secondary)',
          whiteSpace: 'nowrap',
        }}
      >
        {q.channel}
      </td>
      <td style={{ padding: '13px 10px' }}>
        <PriorityBadge priority={q.priority} />
      </td>
      <td style={{ padding: '13px 10px', whiteSpace: 'nowrap' }}>
        <StatusText status={q.status} />
      </td>
      <td
        style={{
          padding: '13px 10px',
          color: 'var(--fg-secondary)',
          fontSize: 'var(--font-size-caption)',
          whiteSpace: 'nowrap',
        }}
      >
        {q.assignee}
      </td>
    </tr>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<'list' | 'detail'>('list')
  const [selId, setSelId] = useState<string | null>(null)
  const [items, setItems] = useState<Inquiry[]>(INIT)

  // S01 filter state
  const [kw, setKw] = useState('')
  const [chFilter, setChFilter] = useState<Channel | 'すべて'>('すべて')
  const [showDone, setShowDone] = useState(false)

  // S02 state
  const [memo, setMemo] = useState('')
  const [showHandover, setShowHandover] = useState(false)
  const [hAssignee, setHAssignee] = useState<string>(ASSIGNEES[1])
  const [hMemo, setHMemo] = useState('')
  const [showSimilar, setShowSimilar] = useState(false)

  // New inquiry modal state
  const [showNew, setShowNew] = useState(false)
  const [nSubj, setNSubj] = useState('')
  const [nReq, setNReq] = useState('')
  const [nCh, setNCh] = useState<Channel>('Slack')
  const [nPri, setNPri] = useState<Priority>('通常')

  const sel = items.find((q) => q.id === selId) ?? null

  const filtered = items.filter((q) => {
    if (!showDone && q.status === '対応済み') return false
    if (chFilter !== 'すべて' && q.channel !== chFilter) return false
    if (kw && !q.subject.includes(kw) && !q.requester.includes(kw)) return false
    return true
  })

  const openDetail = (id: string) => {
    setSelId(id)
    setScreen('detail')
    setMemo('')
    setShowSimilar(false)
  }

  const changeStatus = (status: InquiryStatus) =>
    setItems((prev) => prev.map((q) => (q.id === selId ? { ...q, status } : q)))

  const submitMemo = () => {
    if (!memo.trim() || !selId) return
    const entry: HistoryEntry = {
      id: `h${Date.now()}`,
      timestamp: nowStr(),
      author: '担当 甲',
      content: memo.trim(),
    }
    setItems((prev) =>
      prev.map((q) => (q.id === selId ? { ...q, history: [...q.history, entry] } : q))
    )
    setMemo('')
  }

  const openHandover = () => {
    if (!sel) return
    const available = ASSIGNEES.filter((a) => a !== sel.assignee)
    setHAssignee(available[0] ?? ASSIGNEES[0])
    setShowHandover(true)
  }

  const submitHandover = () => {
    if (!selId) return
    const note = hMemo.trim()
    const entry: HistoryEntry = {
      id: `h${Date.now()}`,
      timestamp: nowStr(),
      author: '担当 甲',
      content: `【引き継ぎ】${hAssignee} へ担当を変更。${note ? `メモ: ${note}` : ''}`,
    }
    setItems((prev) =>
      prev.map((q) =>
        q.id === selId ? { ...q, assignee: hAssignee, history: [...q.history, entry] } : q
      )
    )
    setShowHandover(false)
    setHMemo('')
  }

  const submitNew = () => {
    if (!nSubj.trim() || !nReq.trim()) return
    const newItem: Inquiry = {
      id: `n${Date.now()}`,
      subject: nSubj.trim(),
      requester: nReq.trim(),
      channel: nCh,
      priority: nPri,
      status: '未着手',
      assignee: '未割り当て',
      receivedAt: nowStr(),
      history: [],
    }
    setItems((prev) => [newItem, ...prev])
    setShowNew(false)
    setNSubj('')
    setNReq('')
    setNCh('Slack')
    setNPri('通常')
  }

  const headerStyle: CSSProperties = {
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    padding: '0 var(--space-outer)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    zIndex: 10,
  }

  // ── S01: 問い合わせ一覧 ──────────────────────────────────────────────────────

  if (screen === 'list') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--fg)', ...fontJP }}>
        <header style={headerStyle}>
          <h1
            style={{
              fontSize: 'var(--font-size-heading)',
              fontWeight: 600,
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            問い合わせ一覧
          </h1>
          <button style={btnPrimary} onClick={() => setShowNew(true)}>
            新規登録
          </button>
        </header>

        {/* Filter bar */}
        <div
          style={{
            borderBottom: '1px solid var(--border)',
            padding: '10px var(--space-outer)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-outer)',
          }}
        >
          {/* Keyword search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-inner)' }}>
            <label
              htmlFor="kw"
              style={{
                fontSize: 'var(--font-size-caption)',
                color: 'var(--fg-secondary)',
                flexShrink: 0,
              }}
            >
              検索
            </label>
            <input
              id="kw"
              type="text"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              style={{ ...inputBase, width: 200, height: 34 }}
            />
          </div>

          {/* Channel filter chips */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['すべて', 'Slack', 'メール', '口頭'] as const).map((ch) => {
              const active = chFilter === ch
              return (
                <button
                  key={ch}
                  style={{
                    ...btnChoice,
                    backgroundColor: active ? 'var(--fg)' : 'transparent',
                    color: active ? 'var(--bg)' : 'var(--fg)',
                    border: active ? '1px solid var(--fg)' : '1px solid var(--border)',
                  }}
                  onClick={() => setChFilter(ch)}
                >
                  {ch}
                </button>
              )
            })}
          </div>

          {/* Show completed toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-inner)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-caption)',
              color: 'var(--fg-secondary)',
              flexShrink: 0,
            }}
          >
            <input
              type="checkbox"
              checked={showDone}
              onChange={(e) => setShowDone(e.target.checked)}
            />
            対応済みを含む
          </label>
        </div>

        {/* Main content */}
        <main style={{ padding: 'var(--space-outer)' }}>
          {filtered.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                padding: '64px 0',
                color: 'var(--fg-secondary)',
                margin: 0,
                fontSize: 'var(--font-size-body)',
              }}
            >
              進行中の問い合わせはありません
            </p>
          ) : (
            <table
              style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-body)' }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['件名', '依頼者', 'チャネル', '優先度', '対応状況', '担当者'].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '6px 10px',
                        fontSize: 'var(--font-size-caption)',
                        color: 'var(--fg-secondary)',
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <InqRow key={q.id} q={q} onClick={() => openDetail(q.id)} />
                ))}
              </tbody>
            </table>
          )}
        </main>

        {/* New inquiry modal */}
        {showNew && (
          <Overlay onClose={() => setShowNew(false)}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-outer)',
              }}
            >
              <h2 style={{ margin: 0, fontSize: 'var(--font-size-heading)', fontWeight: 600 }}>
                新規登録
              </h2>
              <button
                onClick={() => setShowNew(false)}
                style={{ ...btnBase, border: 'none', fontSize: 20, padding: '4px 8px', minWidth: 0 }}
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label
                  htmlFor="nsubj"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--fg-secondary)',
                    marginBottom: 6,
                  }}
                >
                  件名
                </label>
                <input
                  id="nsubj"
                  type="text"
                  value={nSubj}
                  onChange={(e) => setNSubj(e.target.value)}
                  style={inputBase}
                />
              </div>
              <div>
                <label
                  htmlFor="nreq"
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--fg-secondary)',
                    marginBottom: 6,
                  }}
                >
                  依頼者
                </label>
                <input
                  id="nreq"
                  type="text"
                  value={nReq}
                  onChange={(e) => setNReq(e.target.value)}
                  style={inputBase}
                />
              </div>
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--fg-secondary)',
                    marginBottom: 8,
                  }}
                >
                  チャネル
                </legend>
                <div style={{ display: 'flex', gap: 20 }}>
                  {(['Slack', 'メール', '口頭'] as Channel[]).map((ch) => (
                    <label
                      key={ch}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontSize: 'var(--font-size-body)',
                      }}
                    >
                      <input
                        type="radio"
                        name="nch"
                        value={ch}
                        checked={nCh === ch}
                        onChange={() => setNCh(ch)}
                      />
                      {ch}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--fg-secondary)',
                    marginBottom: 8,
                  }}
                >
                  優先度
                </legend>
                <div style={{ display: 'flex', gap: 20 }}>
                  {(['緊急', '通常'] as const).map((p) => (
                    <label
                      key={p}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        flexShrink: 0,
                        fontSize: 'var(--font-size-body)',
                      }}
                    >
                      <input
                        type="radio"
                        name="npri"
                        value={p}
                        checked={nPri === p}
                        onChange={() => setNPri(p)}
                      />
                      {p}
                    </label>
                  ))}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      flexShrink: 0,
                      fontSize: 'var(--font-size-body)',
                    }}
                  >
                    <input
                      type="radio"
                      name="npri"
                      value="none"
                      checked={nPri === null}
                      onChange={() => setNPri(null)}
                    />
                    設定なし
                  </label>
                </div>
              </fieldset>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 'var(--space-outer)',
              }}
            >
              <button style={{ ...btnChoice, minWidth: 80 }} onClick={() => setShowNew(false)}>
                キャンセル
              </button>
              <button
                style={{
                  ...btnPrimary,
                  minWidth: 120,
                  backgroundColor:
                    nSubj.trim() && nReq.trim() ? 'var(--fg)' : 'var(--border)',
                  color: 'var(--bg)',
                  opacity: nSubj.trim() && nReq.trim() ? 1 : 0.55,
                }}
                onClick={submitNew}
              >
                登録する
              </button>
            </div>
          </Overlay>
        )}
      </div>
    )
  }

  // ── S02: 問い合わせ詳細 ──────────────────────────────────────────────────────

  if (!sel) return null

  const handoverAvailable = ASSIGNEES.filter((a) => a !== sel.assignee)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--fg)', ...fontJP }}>
      <header style={{ ...headerStyle, position: 'relative' }}>
        {/* Left: back */}
        <button
          onClick={() => setScreen('list')}
          style={{
            ...btnBase,
            border: 'none',
            fontSize: 'var(--font-size-body)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            minWidth: 0,
            padding: '0 16px 0 0',
            color: 'var(--fg-secondary)',
            flexShrink: 0,
          }}
        >
          ← 一覧へ戻る
        </button>

        {/* Center: title */}
        <h1
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            margin: 0,
            fontSize: 'var(--font-size-heading)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          問い合わせ詳細
        </h1>

        {/* Right: actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {sel.status !== '対応済み' && (
            <button style={btnPrimary} onClick={openHandover}>
              引き継ぐ
            </button>
          )}
        </div>
      </header>

      <main
        style={{
          padding: 'var(--space-outer)',
          display: 'grid',
          gridTemplateColumns: '1fr 288px',
          gap: 48,
          maxWidth: 1100,
          alignItems: 'start',
        }}
      >
        {/* ── Left column ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* 問い合わせ概要 */}
          <section>
            <SectionHead>問い合わせ概要</SectionHead>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-inner)' }}>
              <dl
                style={{
                  display: 'grid',
                  gridTemplateColumns: '72px 1fr',
                  rowGap: 12,
                  columnGap: 20,
                  margin: 0,
                }}
              >
                <dt
                  style={{
                    fontSize: 'var(--font-size-caption)',
                    color: 'var(--fg-secondary)',
                    paddingTop: 2,
                    alignSelf: 'baseline',
                  }}
                >
                  件名
                </dt>
                <dd style={{ fontWeight: 500, lineHeight: 1.5 }}>{sel.subject}</dd>

                <dt style={{ fontSize: 'var(--font-size-caption)', color: 'var(--fg-secondary)' }}>
                  依頼者
                </dt>
                <dd>{sel.requester}</dd>

                <dt style={{ fontSize: 'var(--font-size-caption)', color: 'var(--fg-secondary)' }}>
                  チャネル
                </dt>
                <dd>{sel.channel}</dd>

                <dt style={{ fontSize: 'var(--font-size-caption)', color: 'var(--fg-secondary)' }}>
                  受信日時
                </dt>
                <dd style={{ ...fontMono, fontSize: 'var(--font-size-caption)' }}>
                  {sel.receivedAt}
                </dd>
              </dl>
            </div>
          </section>

          {/* 対応履歴・メモ */}
          <section>
            <SectionHead>対応履歴・メモ</SectionHead>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-inner)' }}>
              {sel.history.length === 0 ? (
                <p
                  style={{
                    color: 'var(--fg-secondary)',
                    margin: '16px 0',
                    fontSize: 'var(--font-size-body)',
                  }}
                >
                  まだ記録はありません
                </p>
              ) : (
                <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {sel.history.map((h, i) => (
                    <li
                      key={h.id}
                      style={{
                        paddingBottom: 'var(--space-outer)',
                        marginBottom:
                          i < sel.history.length - 1 ? 'var(--space-outer)' : 0,
                        borderBottom:
                          i < sel.history.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 16, marginBottom: 6 }}>
                        <span
                          style={{
                            ...fontMono,
                            fontSize: 'var(--font-size-caption)',
                            color: 'var(--fg-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          {h.timestamp}
                        </span>
                        <span
                          style={{
                            fontSize: 'var(--font-size-caption)',
                            color: 'var(--fg-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          {h.author}
                        </span>
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.7 }}>{h.content}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>

          {/* 類似の過去問い合わせ（段階的開示） */}
          {showSimilar && (
            <section>
              <SectionHead>類似の過去問い合わせ</SectionHead>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-inner)' }}>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {SIMILAR_PAST.map((s, i) => (
                    <li
                      key={s.id}
                      style={{
                        paddingBottom: 'var(--space-outer)',
                        marginBottom:
                          i < SIMILAR_PAST.length - 1 ? 'var(--space-outer)' : 0,
                        borderBottom:
                          i < SIMILAR_PAST.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <span
                        style={{
                          ...fontMono,
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--fg-secondary)',
                          display: 'block',
                          marginBottom: 6,
                        }}
                      >
                        {s.date}
                      </span>
                      <p style={{ margin: '0 0 5px', fontWeight: 500 }}>{s.subject}</p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 'var(--font-size-caption)',
                          color: 'var(--fg-secondary)',
                          lineHeight: 1.6,
                        }}
                      >
                        {s.resolution}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          )}

          {/* 対応メモ入力 */}
          <section>
            <SectionHead>対応メモ</SectionHead>
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--space-inner)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-inner)',
              }}
            >
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={4}
                style={textareaBase}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  style={{
                    ...btnPrimary,
                    minWidth: 120,
                    opacity: memo.trim() ? 1 : 0.45,
                  }}
                  onClick={submitMemo}
                >
                  記録する
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <aside
          style={{
            position: 'sticky',
            top: 76,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-outer)',
          }}
        >
          {/* [第1] 対応状況 — most prominent element */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-outer)' }}>
            <SectionHead>対応状況</SectionHead>
            <p
              style={{
                margin: 0,
                fontSize: 28,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                ...STATUS_STYLE[sel.status],
              }}
            >
              {sel.status}
            </p>
          </div>

          {/* 担当者 */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-outer)' }}>
            <SectionHead>担当者</SectionHead>
            <p style={{ margin: 0, fontWeight: 500 }}>{sel.assignee}</p>
          </div>

          {/* 対応状況を変更 */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-outer)' }}>
            <SectionHead>対応状況を変更</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(['未着手', '対応中', '対応済み'] as InquiryStatus[]).map((s) => (
                <label
                  key={s}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    flexShrink: 0,
                    fontSize: 'var(--font-size-body)',
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={sel.status === s}
                    onChange={() => changeStatus(s)}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* 類似履歴を検索 */}
          <button
            style={{
              ...btnPrimary,
              width: '100%',
              minWidth: 0,
              backgroundColor: showSimilar ? 'var(--fg)' : 'transparent',
              color: showSimilar ? 'var(--bg)' : 'var(--fg)',
            }}
            onClick={() => setShowSimilar((v) => !v)}
          >
            類似履歴を検索
          </button>
        </aside>
      </main>

      {/* 引き継ぎモーダル */}
      {showHandover && (
        <Overlay onClose={() => setShowHandover(false)}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-outer)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: 'var(--font-size-heading)', fontWeight: 600 }}>
              引き継ぐ
            </h2>
            <button
              onClick={() => setShowHandover(false)}
              style={{ ...btnBase, border: 'none', fontSize: 20, padding: '4px 8px', minWidth: 0 }}
              aria-label="閉じる"
            >
              ×
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-caption)',
                  color: 'var(--fg-secondary)',
                  marginBottom: 8,
                }}
              >
                引き継ぎ先
              </legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {handoverAvailable.map((a) => (
                  <label
                    key={a}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      flexShrink: 0,
                      fontSize: 'var(--font-size-body)',
                    }}
                  >
                    <input
                      type="radio"
                      name="ha"
                      value={a}
                      checked={hAssignee === a}
                      onChange={() => setHAssignee(a)}
                    />
                    {a}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label
                htmlFor="hmemo"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-caption)',
                  color: 'var(--fg-secondary)',
                  marginBottom: 6,
                }}
              >
                引き継ぎメモ
              </label>
              <textarea
                id="hmemo"
                value={hMemo}
                onChange={(e) => setHMemo(e.target.value)}
                rows={3}
                style={textareaBase}
              />
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 'var(--space-outer)',
            }}
          >
            <button
              style={{ ...btnChoice, minWidth: 80 }}
              onClick={() => setShowHandover(false)}
            >
              キャンセル
            </button>
            <button
              style={{
                ...btnPrimary,
                minWidth: 120,
                backgroundColor: 'var(--fg)',
                color: 'var(--bg)',
              }}
              onClick={submitHandover}
            >
              引き継ぐ
            </button>
          </div>
        </Overlay>
      )}
    </div>
  )
}
