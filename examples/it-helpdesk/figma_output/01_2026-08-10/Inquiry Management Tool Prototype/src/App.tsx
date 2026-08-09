import { useState } from 'react'

// ---- Types ----
type Status = '未対応' | '対応中' | '対応済み'
type Urgency = '緊急' | '通常'
type Channel = 'Slack' | 'メール' | '口頭'
type Screen = 'list' | 'detail' | 'search'
type EntryKind = '受付' | '対応メモ' | '引き継ぎ' | '状態変更'

interface TLEntry {
  time: string
  kind: EntryKind
  content: string
  author?: string
}

interface Inquiry {
  id: string
  subject: string
  requester: string
  requesterContact: string
  channel: Channel
  status: Status
  urgency: Urgency
  assignee: string | null
  receivedAt: string
  timeline: TLEntry[]
}

// ---- Static seed data ----
const ME = '中島'
const TEAM = ['中島', '田中', '山本']

const SEED: Inquiry[] = [
  {
    id: 'IQ-001',
    subject: 'PCが起動しない',
    requester: '社員A',
    requesterContact: 'staff-a@example.internal',
    channel: 'Slack',
    status: '未対応',
    urgency: '緊急',
    assignee: null,
    receivedAt: '08-09 09:12',
    timeline: [
      {
        time: '09:12', kind: '受付',
        content: '電源を入れても画面が真っ暗なまま起動しない。昨日まで問題なく動作していた。業務に支障が出ているため早急な対応を希望。',
      },
    ],
  },
  {
    id: 'IQ-002',
    subject: 'VPNに接続できない',
    requester: '社員B',
    requesterContact: 'staff-b@example.internal',
    channel: 'メール',
    status: '対応中',
    urgency: '通常',
    assignee: '田中',
    receivedAt: '08-09 10:05',
    timeline: [
      {
        time: '10:05', kind: '受付',
        content: '自宅からVPNに接続しようとするとエラーが表示される。エラーコード: AUTH-403。社内ネットワーク接続が必要な業務のため対応を依頼したい。',
      },
      {
        time: '10:18', kind: '対応メモ',
        content: 'VPNクライアントのバージョンを v3.2.1 と確認。最新版 v3.4.0 へのアップデートを案内中。',
        author: '田中',
      },
    ],
  },
  {
    id: 'IQ-003',
    subject: '複合機のドライバインストール方法',
    requester: '社員C',
    requesterContact: 'staff-c@example.internal',
    channel: '口頭',
    status: '未対応',
    urgency: '通常',
    assignee: null,
    receivedAt: '08-09 10:43',
    timeline: [
      {
        time: '10:43', kind: '受付',
        content: '2階の複合機を初めて使用しようとしているが、PCに認識されない。ドライバのインストール手順を教えてほしい。',
      },
    ],
  },
  {
    id: 'IQ-004',
    subject: 'Officeライセンスのエラー',
    requester: '社員D',
    requesterContact: 'staff-d@example.internal',
    channel: 'メール',
    status: '対応済み',
    urgency: '通常',
    assignee: '山本',
    receivedAt: '08-08 14:22',
    timeline: [
      {
        time: '14:22', kind: '受付',
        content: 'ExcelとWordを起動するとライセンスのエラーが表示される。「ライセンス認証が必要です」というメッセージが出る。',
      },
      {
        time: '14:35', kind: '対応メモ',
        content: 'Microsoft 365 の再認証を案内。会社アカウントでサインインし直すことで解決を確認。',
        author: '山本',
      },
      {
        time: '14:50', kind: '状態変更',
        content: '「対応済み」に変更。',
        author: '山本',
      },
    ],
  },
]

// ---- Style helpers ----
const S = {
  chip: (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    height: '28px',
    padding: '0 10px',
    borderRadius: '3px',
    fontSize: '13px',
    fontWeight: active ? 500 : 400,
    border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border-light)'}`,
    background: active ? 'rgba(36,87,197,0.08)' : 'transparent',
    color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.1s',
  }),
  btn: (variant: 'primary' | 'ghost' | 'muted', small?: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: small ? '28px' : '32px',
    padding: `0 ${small ? 9 : 12}px`,
    borderRadius: '3px',
    fontSize: small ? '12px' : '13px',
    fontWeight: 500,
    border: variant === 'ghost' ? '1.5px solid var(--color-accent)' : 'none',
    background:
      variant === 'primary' ? 'var(--color-accent)'
      : variant === 'ghost' ? 'transparent'
      : 'var(--color-muted-bg)',
    color:
      variant === 'primary' ? 'var(--color-on-accent)'
      : variant === 'ghost' ? 'var(--color-accent)'
      : 'var(--color-text-secondary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
    transition: 'opacity 0.1s',
  }),
  input: (): React.CSSProperties => ({
    height: '36px',
    padding: '0 12px',
    borderRadius: '3px',
    border: '1.5px solid var(--color-border-light)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
  }),
}

// ---- Badge components ----
function StatusBadge({ status }: { status: Status }) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center',
    padding: '0 7px', height: '22px',
    borderRadius: '3px', fontSize: '12px', fontWeight: 500,
    whiteSpace: 'nowrap',
  }
  if (status === '対応中') return <span style={{ ...base, background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}>対応中</span>
  if (status === '対応済み') return <span style={{ ...base, background: 'var(--color-muted-bg)', color: 'var(--color-text-secondary)' }}>対応済み</span>
  return <span style={{ ...base, border: '1.5px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: 400 }}>未対応</span>
}

function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  if (urgency === '緊急') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '0 7px', height: '22px',
        borderRadius: '3px', fontSize: '12px', fontWeight: 600,
        background: 'var(--color-urgent)', color: 'var(--color-on-urgent)',
        whiteSpace: 'nowrap',
      }}>
        緊急
      </span>
    )
  }
  return <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>通常</span>
}

// ---- Divider ----
function Divider() {
  return <div style={{ height: '1px', background: 'var(--color-border-light)', margin: '16px 0' }} />
}

// ---- Meta row in sidebar ----
function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
        {children}
      </div>
    </div>
  )
}

// ---- Top bar ----
function TopBar({ screen, onBack, onGoSearch }: { screen: Screen; onBack: () => void; onGoSearch: () => void }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '48px', padding: '0 24px',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border-light)',
    }}>
      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
        問い合わせ管理
      </span>
      {screen === 'list' ? (
        <button style={S.btn('ghost', true)} onClick={onGoSearch}>
          過去の履歴を探す
        </button>
      ) : (
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--color-accent)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0' }}
        >
          ← 一覧へ戻る
        </button>
      )}
    </div>
  )
}

// ---- S01: 問い合わせ一覧 ----
function S01List({
  inquiries,
  onOpenDetail,
  onAssignSelf,
}: {
  inquiries: Inquiry[]
  onOpenDetail: (id: string) => void
  onAssignSelf: (id: string) => void
}) {
  const [statusFilter, setStatusFilter] = useState<Status | 'すべて'>('すべて')
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'すべて'>('すべて')
  const [keyword, setKeyword] = useState('')
  const [showResolved, setShowResolved] = useState(false)

  const visible = inquiries.filter(i => {
    if (!showResolved && i.status === '対応済み') return false
    if (statusFilter !== 'すべて' && i.status !== statusFilter) return false
    if (urgencyFilter !== 'すべて' && i.urgency !== urgencyFilter) return false
    if (keyword.trim()) {
      const kw = keyword.trim()
      if (!i.subject.includes(kw) && !i.requester.includes(kw) && !i.channel.includes(kw)) return false
    }
    return true
  })

  const colGrid = '80px 96px 1fr 100px 72px 108px 168px'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        gap: '8px', padding: '14px 24px',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border-light)',
      }}>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginRight: '4px' }}>状態</span>
          {(['すべて', '未対応', '対応中'] as const).map(v => (
            <button key={v} style={S.chip(statusFilter === v)} onClick={() => setStatusFilter(v)}>{v}</button>
          ))}
        </div>
        <div style={{ width: '1px', height: '20px', background: 'var(--color-border-light)', margin: '0 4px' }} />
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginRight: '4px' }}>緊急度</span>
          {(['すべて', '緊急', '通常'] as const).map(v => (
            <button key={v} style={S.chip(urgencyFilter === v)} onClick={() => setUrgencyFilter(v)}>{v}</button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: '180px', maxWidth: '260px', marginLeft: '4px' }}>
          <input
            type="text"
            placeholder="件名・依頼者で絞り込む"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={S.input()}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer', marginLeft: 'auto', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={e => setShowResolved(e.target.checked)}
            style={{ accentColor: 'var(--color-accent)' }}
          />
          対応済みを含める
        </label>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: colGrid,
        padding: '0 24px', gap: '0 16px',
        borderBottom: '1px solid var(--color-border-light)',
        background: 'var(--color-surface)',
      }}>
        {['緊急度', '受付', '件名', '依頼者', 'チャネル', '状態', '対応者'].map(h => (
          <div key={h} style={{
            padding: '8px 0', fontSize: '11px', fontWeight: 500,
            color: 'var(--color-text-secondary)', letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>{h}</div>
        ))}
      </div>

      {/* Table body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {visible.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '200px', color: 'var(--color-text-secondary)', fontSize: '14px', gap: '8px',
          }}>
            <div style={{ fontSize: '28px', opacity: 0.25, lineHeight: 1 }}>○</div>
            <div>対応が必要な問い合わせはありません</div>
          </div>
        ) : (
          visible.map(inq => {
            const isUrgent = inq.urgency === '緊急'
            const hasAssignee = inq.assignee !== null
            return (
              <div
                key={inq.id}
                onClick={() => onOpenDetail(inq.id)}
                style={{
                  display: 'grid', gridTemplateColumns: colGrid,
                  alignItems: 'center', gap: '0 16px',
                  padding: '0 24px',
                  minHeight: '48px',
                  borderLeft: isUrgent ? '3px solid var(--color-urgent)' : '3px solid transparent',
                  borderBottom: '1px solid var(--color-border-light)',
                  background: 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F0F2F8')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface)')}
              >
                {/* 緊急度 */}
                <div style={{ padding: '10px 0' }}>
                  <UrgencyBadge urgency={inq.urgency} />
                </div>

                {/* 受付 */}
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', padding: '10px 0' }}>
                  {inq.receivedAt}
                </div>

                {/* 件名 */}
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', padding: '10px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inq.subject}
                </div>

                {/* 依頼者 */}
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', padding: '10px 0' }}>
                  {inq.requester}
                </div>

                {/* チャネル */}
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', padding: '10px 0' }}>
                  {inq.channel}
                </div>

                {/* 状態 */}
                <div style={{ padding: '10px 0' }}>
                  <StatusBadge status={inq.status} />
                </div>

                {/* 対応者/Action */}
                <div style={{ padding: '6px 0' }} onClick={e => e.stopPropagation()}>
                  {hasAssignee ? (
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: inq.status === '対応中' ? 'var(--color-accent)' : 'var(--color-border)', display: 'inline-block', flexShrink: 0 }} />
                      対応中：{inq.assignee}
                    </span>
                  ) : (
                    <button
                      style={S.btn('primary', true)}
                      onClick={() => onAssignSelf(inq.id)}
                    >
                      対応者になる
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ---- S02: 問い合わせ詳細 ----
function S02Detail({
  inquiry,
  onUpdate,
}: {
  inquiry: Inquiry
  onUpdate: (updated: Inquiry) => void
}) {
  const [contactExpanded, setContactExpanded] = useState(false)
  const [memoText, setMemoText] = useState('')
  const [handoverOpen, setHandoverOpen] = useState(false)
  const [progressOpen, setProgressOpen] = useState(false)
  const isResolved = inquiry.status === '対応済み'

  const addMemo = () => {
    if (!memoText.trim()) return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const entry: TLEntry = { time, kind: '対応メモ', content: memoText.trim(), author: ME }
    onUpdate({ ...inquiry, timeline: [...inquiry.timeline, entry] })
    setMemoText('')
  }

  const changeStatus = (status: Status) => {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const entry: TLEntry = { time, kind: '状態変更', content: `「${status}」に変更。`, author: ME }
    onUpdate({ ...inquiry, status, timeline: [...inquiry.timeline, entry] })
  }

  const assignTo = (member: string) => {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const prev = inquiry.assignee ?? '未定'
    const entry: TLEntry = { time, kind: '引き継ぎ', content: `${prev} → ${member} に引き継ぎ。`, author: ME }
    onUpdate({
      ...inquiry,
      assignee: member,
      status: inquiry.status === '未対応' ? '対応中' : inquiry.status,
      timeline: [...inquiry.timeline, entry],
    })
    setHandoverOpen(false)
  }

  const entryColor = (kind: EntryKind): string => {
    if (kind === '受付') return 'var(--color-text-secondary)'
    if (kind === '対応メモ') return 'var(--color-accent)'
    if (kind === '引き継ぎ') return '#7B5EA7'
    return 'var(--color-border)'
  }

  const entryLabel = (kind: EntryKind): string => {
    if (kind === '受付') return '受付'
    if (kind === '対応メモ') return '対応メモ'
    if (kind === '引き継ぎ') return '引き継ぎ'
    return '状態変更'
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Main: Timeline */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px 24px 24px' }}>
        {/* Subject header */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 10px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>
            {inquiry.subject}
          </h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-light)', borderRadius: '3px', padding: '1px 6px' }}>
              {inquiry.channel}
            </span>
            <UrgencyBadge urgency={inquiry.urgency} />
            <StatusBadge status={inquiry.status} />
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{inquiry.id}</span>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--color-border-light)', margin: '20px 0' }} />

        {/* Timeline heading */}
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '20px', letterSpacing: '-0.01em' }}>
          対応の経緯
        </div>

        {/* Timeline entries */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{
            position: 'absolute', left: '59px', top: '8px', bottom: '8px',
            width: '1px', background: 'var(--color-timeline-line)',
          }} />

          {inquiry.timeline.map((entry, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: '20px', position: 'relative' }}>
              {/* Time */}
              <div style={{ width: '43px', flexShrink: 0, textAlign: 'right', fontSize: '12px', color: 'var(--color-text-secondary)', paddingTop: '2px' }}>
                {entry.time}
              </div>
              {/* Dot */}
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                background: entryColor(entry.kind),
                marginTop: '5px', position: 'relative', zIndex: 1,
              }} />
              {/* Content */}
              <div style={{ flex: 1, paddingBottom: '4px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: entryColor(entry.kind) }}>
                    {entryLabel(entry.kind)}
                  </span>
                  {entry.author && (
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{entry.author}</span>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                  {entry.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Memo input */}
        {isResolved ? (
          <div style={{
            marginTop: '8px', padding: '12px 16px',
            background: 'var(--color-muted-bg)', borderRadius: '3px',
            fontSize: '13px', color: 'var(--color-text-secondary)',
          }}>
            対応済みのため、追記・状態変更はできません。
          </div>
        ) : (
          <div style={{ marginTop: '8px', borderTop: '1px solid var(--color-border-light)', paddingTop: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.03em' }}>
              対応メモを追記
            </div>
            <textarea
              rows={3}
              placeholder="対応内容・経緯を記録する"
              value={memoText}
              onChange={e => setMemoText(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                border: '1.5px solid var(--color-border-light)',
                borderRadius: '3px', background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '14px', lineHeight: 1.6,
                fontFamily: 'inherit', outline: 'none',
              }}
            />
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{ ...S.btn('primary'), opacity: memoText.trim() ? 1 : 0.4, cursor: memoText.trim() ? 'pointer' : 'default' }}
                onClick={addMemo}
                disabled={!memoText.trim()}
              >
                メモを追記
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div style={{
        width: '272px', flexShrink: 0,
        borderLeft: '1px solid var(--color-border-light)',
        background: 'var(--color-surface)',
        overflowY: 'auto', padding: '24px 20px',
      }}>
        {/* Requester info */}
        <MetaRow label="依頼者">
          <div>{inquiry.requester}（{inquiry.channel}）</div>
          {!contactExpanded ? (
            <button
              onClick={() => setContactExpanded(true)}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: '12px', color: 'var(--color-accent)', cursor: 'pointer', fontFamily: 'inherit', marginTop: '2px', textDecoration: 'underline' }}
            >
              連絡先を表示
            </button>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              {inquiry.requesterContact}
            </div>
          )}
        </MetaRow>

        <MetaRow label="受付日時">
          {inquiry.receivedAt}
        </MetaRow>

        <Divider />

        {/* Status */}
        <MetaRow label="状態">
          {isResolved ? (
            <StatusBadge status={inquiry.status} />
          ) : (
            <select
              value={inquiry.status}
              onChange={e => changeStatus(e.target.value as Status)}
              style={{
                ...S.input(), height: '32px', paddingRight: '28px',
                appearance: 'auto', width: 'auto', minWidth: '120px',
              }}
            >
              <option value="未対応">未対応</option>
              <option value="対応中">対応中</option>
              <option value="対応済み">対応済み</option>
            </select>
          )}
        </MetaRow>

        {/* Assignee */}
        <MetaRow label="対応者">
          {inquiry.assignee ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
              {inquiry.assignee}
            </div>
          ) : (
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>未定</span>
          )}
        </MetaRow>

        <Divider />

        {/* Action buttons */}
        {!isResolved && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {inquiry.assignee ? (
              <button style={S.btn('ghost')} onClick={() => { setHandoverOpen(v => !v); setProgressOpen(false) }}>
                引き継ぐ
              </button>
            ) : (
              <button
                style={S.btn('primary')}
                onClick={() => {
                  const now = new Date()
                  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                  const entry: TLEntry = { time, kind: '引き継ぎ', content: `${ME} が対応者として着手。`, author: ME }
                  onUpdate({ ...inquiry, assignee: ME, status: '対応中', timeline: [...inquiry.timeline, entry] })
                }}
              >
                対応者になる
              </button>
            )}
            <button style={S.btn('muted')} onClick={() => { setProgressOpen(v => !v); setHandoverOpen(false) }}>
              進捗を共有する
            </button>
          </div>
        )}

        {/* Handover panel */}
        {handoverOpen && (
          <div style={{
            marginTop: '12px', padding: '12px',
            background: 'var(--color-bg)', borderRadius: '3px',
            border: '1px solid var(--color-border-light)',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '8px', letterSpacing: '0.03em' }}>
              引き継ぎ先を選択
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {TEAM.map(member => (
                <button
                  key={member}
                  style={{
                    ...S.btn(member === inquiry.assignee ? 'muted' : 'ghost', true),
                    justifyContent: 'flex-start',
                    opacity: member === inquiry.assignee ? 0.5 : 1,
                  }}
                  onClick={() => member !== inquiry.assignee && assignTo(member)}
                  disabled={member === inquiry.assignee}
                >
                  {member}{member === inquiry.assignee ? '（現在）' : ''}
                </button>
              ))}
            </div>
            <button
              style={{ ...S.btn('muted', true), marginTop: '8px', width: '100%' }}
              onClick={() => setHandoverOpen(false)}
            >
              キャンセル
            </button>
          </div>
        )}

        {/* Progress share panel */}
        {progressOpen && (
          <div style={{
            marginTop: '12px', padding: '12px',
            background: 'var(--color-bg)', borderRadius: '3px',
            border: '1px solid var(--color-border-light)',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '4px', letterSpacing: '0.03em' }}>
              依頼者への進捗共有
            </div>
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>送信先：</span>
              {inquiry.requester}（{inquiry.channel}）
            </div>
            <div style={{
              padding: '8px 10px', background: 'rgba(196,40,27,0.06)',
              borderLeft: '3px solid var(--color-urgent)', borderRadius: '2px',
              fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.6,
            }}>
              ⚠ 進捗共有メッセージの文面・送信チャネルは次回商談での確認事項です（Open Question）。
            </div>
            <button
              style={{ ...S.btn('muted', true), marginTop: '8px', width: '100%' }}
              onClick={() => setProgressOpen(false)}
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- S03: 過去対応履歴検索 ----
function S03Search({
  inquiries,
  onOpenDetail,
}: {
  inquiries: Inquiry[]
  onOpenDetail: (id: string) => void
}) {
  const [keyword, setKeyword] = useState('')
  const [searched, setSearched] = useState(false)

  const results = searched && keyword.trim()
    ? inquiries.filter(i =>
        i.subject.includes(keyword.trim()) ||
        i.requester.includes(keyword.trim()) ||
        i.timeline.some(e => e.content.includes(keyword.trim()))
      )
    : []

  const doSearch = () => {
    if (keyword.trim()) setSearched(true)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') doSearch()
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
      {/* Screen title — [第1] element */}
      <h1 style={{
        fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)',
        margin: '0 0 24px', letterSpacing: '-0.02em',
      }}>
        過去の対応履歴を検索
      </h1>

      {/* Search input — prominent */}
      <div style={{ maxWidth: '560px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="件名・依頼者・対応内容のキーワード"
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setSearched(false) }}
            onKeyDown={handleKey}
            style={{
              ...S.input(),
              height: '44px',
              fontSize: '15px',
              border: '1.5px solid var(--color-border)',
              flex: 1,
            }}
            autoFocus
          />
          <button style={{ ...S.btn('primary'), height: '44px', padding: '0 20px', fontSize: '14px' }} onClick={doSearch}>
            検索
          </button>
        </div>
      </div>

      {/* Results or states */}
      {!searched ? (
        <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          キーワードを入力して検索してください。対応済みを含む全件が対象です。
        </div>
      ) : results.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '32px', gap: '8px' }}>
          <div style={{ fontSize: '28px', opacity: 0.2, lineHeight: 1 }}>◯</div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            該当する過去の対応履歴が見つかりませんでした
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            別のキーワードで試してみてください。
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '720px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            {results.length} 件が見つかりました
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {results.map(inq => {
              const matchEntry = inq.timeline.find(e => e.content.includes(keyword.trim()))
              return (
                <div
                  key={inq.id}
                  onClick={() => onOpenDetail(inq.id)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-border-light)',
                    background: 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                    borderRadius: '0',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F0F2F8')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface)')}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {inq.subject}
                        </span>
                        <StatusBadge status={inq.status} />
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', gap: '12px' }}>
                        <span>依頼者：{inq.requester}</span>
                        <span>{inq.channel}</span>
                        <span>{inq.receivedAt}</span>
                        {inq.assignee && <span>対応：{inq.assignee}</span>}
                      </div>
                      {matchEntry && (
                        <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                          {matchEntry.content.length > 80 ? matchEntry.content.slice(0, 80) + '…' : matchEntry.content}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--color-accent)', marginTop: '2px', whiteSpace: 'nowrap' }}>詳細を見る →</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Root ----
export default function App() {
  const [screen, setScreen] = useState<Screen>('list')
  const [inquiries, setInquiries] = useState<Inquiry[]>(SEED)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedInquiry = inquiries.find(i => i.id === selectedId) ?? null

  const openDetail = (id: string) => {
    setSelectedId(id)
    setScreen('detail')
  }

  const assignSelf = (id: string) => {
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const entry: TLEntry = { time, kind: '引き継ぎ', content: `${ME} が対応者として着手。`, author: ME }
    setInquiries(prev => prev.map(i =>
      i.id === id
        ? { ...i, assignee: ME, status: i.status === '未対応' ? '対応中' : i.status, timeline: [...i.timeline, entry] }
        : i
    ))
  }

  const updateInquiry = (updated: Inquiry) => {
    setInquiries(prev => prev.map(i => i.id === updated.id ? updated : i))
  }

  const goBack = () => setScreen('list')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <TopBar
        screen={screen}
        onBack={goBack}
        onGoSearch={() => setScreen('search')}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {screen === 'list' && (
          <S01List
            inquiries={inquiries}
            onOpenDetail={openDetail}
            onAssignSelf={assignSelf}
          />
        )}
        {screen === 'detail' && selectedInquiry && (
          <S02Detail
            inquiry={selectedInquiry}
            onUpdate={updateInquiry}
          />
        )}
        {screen === 'search' && (
          <S03Search
            inquiries={inquiries}
            onOpenDetail={id => { openDetail(id) }}
          />
        )}
      </div>
    </div>
  )
}
