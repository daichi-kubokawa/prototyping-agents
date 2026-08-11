import { useState, type CSSProperties, type ReactNode } from 'react'

// ---- Types ----
type ProcessId = 'alert' | 'restart' | 'batch' | 'phone' | 'handover'
type Status = '未着手' | '対応中' | '完了'
type Screen = 'S01' | 'S02' | 'S03'

interface RecordEntry {
  id: string
  processId: ProcessId
  timestamp: string
  status: Status
  rationale: string
}

interface ProcessDef {
  id: ProcessId
  name: string
  requiresApproval: boolean
  isOverseas: boolean
}

// ---- Static data ----
const PROCESSES: ProcessDef[] = [
  { id: 'alert',    name: 'アラート初動確認', requiresApproval: false, isOverseas: false },
  { id: 'restart',  name: '再起動対応',       requiresApproval: true,  isOverseas: false },
  { id: 'batch',    name: '深夜バッチ確認',   requiresApproval: false, isOverseas: false },
  { id: 'phone',    name: '緊急電話対応',     requiresApproval: false, isOverseas: true  },
  { id: 'handover', name: '引き継ぎ準備',     requiresApproval: false, isOverseas: false },
]

const STATUS_STYLE: Record<Status, { background: string; color: string }> = {
  '未着手': { background: 'rgba(108,111,119,0.22)', color: '#A9ACB3' },
  '対応中': { background: 'rgba(224,153,63,0.14)',  color: '#E0993F' },
  '完了':   { background: 'rgba(79,168,160,0.14)',  color: '#4FA8A0' },
}

function nowStr(): string {
  return new Date().toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// ---- Shared style helpers ----
const base: CSSProperties = {
  fontFamily: '"BIZ UDPGothic", "Yu Gothic UI", sans-serif',
}

const sApp: CSSProperties = {
  ...base,
  minHeight: '100vh',
  backgroundColor: 'var(--bg)',
  color: 'var(--fg)',
  display: 'flex',
  flexDirection: 'column',
  fontSize: 'var(--font-size-body)',
}

const sHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 32px',
  borderBottom: '1px solid var(--border)',
  flexShrink: 0,
  position: 'sticky',
  top: 0,
  backgroundColor: 'var(--bg)',
  zIndex: 10,
}

const sMain: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '32px',
  paddingBottom: '96px',
  maxWidth: '900px',
  width: '100%',
  margin: '0 auto',
}

const sFooter: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  padding: '12px 32px',
  borderTop: '1px solid var(--border)',
  backgroundColor: 'var(--bg)',
  gap: '12px',
  zIndex: 10,
}

function PrimaryBtn({
  children,
  onClick,
  disabled,
  style,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  style?: CSSProperties
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 'var(--target-primary-h)',
        minWidth: 'var(--target-primary-w)',
        flexShrink: 0,
        backgroundColor: disabled ? 'rgba(79,168,160,0.3)' : 'var(--accent)',
        color: disabled ? 'var(--fg-muted)' : 'var(--bg)',
        border: 'none',
        borderRadius: '4px',
        fontSize: 'var(--font-size-body)',
        fontFamily: '"BIZ UDPGothic", "Yu Gothic UI", sans-serif',
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '0 28px',
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function OutlineBtn({
  children,
  onClick,
  color,
  style,
}: {
  children: ReactNode
  onClick?: () => void
  color?: string
  style?: CSSProperties
}) {
  const c = color ?? 'var(--fg-muted)'
  const b = color ?? 'var(--border)'
  return (
    <button
      onClick={onClick}
      style={{
        height: '44px',
        minWidth: '100px',
        flexShrink: 0,
        backgroundColor: 'transparent',
        color: c,
        border: `1px solid ${b}`,
        borderRadius: '4px',
        fontSize: 'var(--font-size-body)',
        fontFamily: '"BIZ UDPGothic", "Yu Gothic UI", sans-serif',
        cursor: 'pointer',
        padding: '0 20px',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      style={{
        ...STATUS_STYLE[status],
        fontSize: 'var(--font-size-caption)',
        padding: '4px 12px',
        borderRadius: '3px',
        flexShrink: 0,
        fontWeight: status === '対応中' ? 700 : 400,
        letterSpacing: '0.02em',
      }}
    >
      {status}
    </span>
  )
}

function SectionHeading({ children, primary }: { children: ReactNode; primary?: boolean }) {
  return (
    <h2
      style={{
        fontSize: primary ? 'var(--font-size-heading)' : 'var(--font-size-body)',
        fontWeight: 700,
        letterSpacing: primary ? '0.05em' : '0.03em',
        margin: 0,
        marginBottom: primary ? '16px' : '12px',
        color: 'var(--fg)',
      }}
    >
      {children}
    </h2>
  )
}

// ---- Main App ----
export default function App() {
  const [screen, setScreen] = useState<Screen>('S01')
  const [selectedId, setSelectedId] = useState<ProcessId | null>(null)
  const [statusMap, setStatusMap] = useState<Record<ProcessId, Status>>({
    alert: '未着手',
    restart: '未着手',
    batch: '未着手',
    phone: '未着手',
    handover: '未着手',
  })
  const [records, setRecords] = useState<RecordEntry[]>([])
  const [alertAck, setAlertAck] = useState(false)
  const [serviceStopped, setServiceStopped] = useState(false)

  // S02 form state
  const [formStatus, setFormStatus] = useState<Status>('未着手')
  const [formRationale, setFormRationale] = useState('')
  const [formEnglish, setFormEnglish] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [formError, setFormError] = useState(false)

  // S03 state
  const [reportConfirmed, setReportConfirmed] = useState(false)
  const [expandedId, setExpandedId] = useState<ProcessId | null>(null)

  const selectedDef = PROCESSES.find((p) => p.id === selectedId) ?? null

  // Derived
  const allPending = PROCESSES.every((p) => statusMap[p.id] === '未着手')
  const noRecords = records.length === 0
  const showS01Empty = allPending && noRecords

  function openProcess(id: ProcessId) {
    setSelectedId(id)
    setFormStatus(statusMap[id])
    setFormRationale('')
    setFormEnglish(false)
    setFormError(false)
    setCancelDialog(false)
    setScreen('S02')
  }

  function handleStatusUpdate() {
    if (!selectedId) return
    setStatusMap((prev) => ({ ...prev, [selectedId]: formStatus }))
    setScreen('S01')
  }

  function handleConfirm() {
    if (!formRationale.trim()) {
      setFormError(true)
      return
    }
    if (!selectedId) return
    const entry: RecordEntry = {
      id: String(Date.now()),
      processId: selectedId,
      timestamp: nowStr(),
      status: formStatus,
      rationale: formRationale.trim(),
    }
    setRecords((prev) => [...prev, entry])
    setStatusMap((prev) => ({ ...prev, [selectedId]: formStatus }))
    setScreen('S01')
  }

  function handleCancel() {
    if (formRationale.trim()) {
      setCancelDialog(true)
    } else {
      setScreen('S01')
    }
  }

  // ======== S01: 当直ボード ========
  if (screen === 'S01') {
    return (
      <div style={sApp}>
        <header style={sHeader}>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body)', letterSpacing: '0.04em' }}>
            当直ボード
          </span>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--fg-muted)' }}>
            シフト残り&ensp;05:23
          </span>
        </header>

        {/* Alert banner */}
        {serviceStopped && !alertAck && (
          <div
            style={{
              margin: '16px 32px 0',
              padding: '14px 20px',
              border: '1px solid var(--accent-alert)',
              borderRadius: '4px',
              backgroundColor: 'rgba(224,153,63,0.07)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span
              style={{
                color: 'var(--accent-alert)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 700,
              }}
            >
              サービス停止5分超が発生しました。上長への報告要否を確認してください
            </span>
            <OutlineBtn
              color="var(--accent-alert)"
              onClick={() => setAlertAck(true)}
              style={{ height: '40px', minWidth: '88px', fontSize: 'var(--font-size-caption)', flexShrink: 0 }}
            >
              確認した
            </OutlineBtn>
          </div>
        )}

        <main style={sMain}>
          {/* Primary element: 工程状況一覧 */}
          <SectionHeading primary>工程状況一覧</SectionHeading>

          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {PROCESSES.map((proc, i) => (
              <button
                key={proc.id}
                onClick={() => openProcess(proc.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0 20px',
                  height: 'var(--target-choice-h)',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  background: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--fg)',
                  fontFamily: '"BIZ UDPGothic", "Yu Gothic UI", sans-serif',
                  fontSize: 'var(--font-size-body)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                }}
              >
                <span style={{ fontWeight: 700 }}>{proc.name}</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-inner)',
                    flexShrink: 0,
                  }}
                >
                  {proc.requiresApproval && (
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--accent-alert)',
                        border: '1px solid var(--accent-alert)',
                        borderRadius: '3px',
                        padding: '2px 10px',
                        flexShrink: 0,
                        letterSpacing: '0.02em',
                      }}
                    >
                      要承認（夜間単独では実行できません）
                    </span>
                  )}
                  <StatusBadge status={statusMap[proc.id]} />
                </div>
              </button>
            ))}
          </div>

          {/* Empty state */}
          {showS01Empty && (
            <p
              style={{
                marginTop: 'var(--space-outer)',
                color: 'var(--fg-muted)',
                fontSize: 'var(--font-size-body)',
                padding: '16px 0',
                borderTop: '1px solid var(--border)',
              }}
            >
              対応記録はまだありません
            </p>
          )}

          {/* Recent records summary (when records exist) */}
          {!noRecords && (
            <div style={{ marginTop: 'var(--space-outer)' }}>
              <SectionHeading>最近の対応記録</SectionHeading>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-inner)' }}>
                {records
                  .slice(-5)
                  .reverse()
                  .map((r) => {
                    const def = PROCESSES.find((p) => p.id === r.processId)
                    return (
                      <div
                        key={r.id}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '12px',
                          padding: '10px 0',
                          borderBottom: '1px solid rgba(108,111,119,0.3)',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 'var(--font-size-caption)',
                            color: 'var(--fg-muted)',
                            flexShrink: 0,
                            width: '68px',
                          }}
                        >
                          {r.timestamp}
                        </span>
                        <span
                          style={{
                            fontSize: 'var(--font-size-caption)',
                            color: 'var(--fg-muted)',
                            flexShrink: 0,
                            width: '128px',
                          }}
                        >
                          {def?.name}
                        </span>
                        <span
                          style={{
                            fontSize: 'var(--font-size-body)',
                            color: 'var(--fg)',
                          }}
                        >
                          {r.rationale}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Prototype condition panel */}
          <div
            style={{
              marginTop: '48px',
              paddingTop: 'var(--space-outer)',
              borderTop: '1px solid rgba(108,111,119,0.3)',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                color: 'var(--fg-muted)',
                marginBottom: 'var(--space-inner)',
                letterSpacing: '0.02em',
              }}
            >
              ▸ プロトタイプ：条件分岐の確認用パネル
            </p>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-inner)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-caption)',
                color: 'var(--fg-muted)',
              }}
            >
              <input
                type="checkbox"
                checked={serviceStopped}
                onChange={(e) => {
                  setServiceStopped(e.target.checked)
                  setAlertAck(false)
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-alert)' }}
              />
              サービス停止5分超が発生した（報告義務アラートを表示）
            </label>
          </div>
        </main>

        <footer style={{ ...sFooter, justifyContent: 'flex-end' }}>
          <PrimaryBtn onClick={() => setScreen('S03')}>引き継ぎ準備を開く</PrimaryBtn>
        </footer>
      </div>
    )
  }

  // ======== S02: 対応記録 ========
  if (screen === 'S02') {
    if (!selectedDef) return null
    const isOverseas = selectedDef.isOverseas

    return (
      <div style={sApp}>
        <header style={sHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-inner)' }}>
            <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--font-size-caption)' }}>
              対応記録
            </span>
            <span style={{ color: 'var(--border)' }}>›</span>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body)' }}>
              {selectedDef.name}
            </span>
          </div>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--fg-muted)' }}>
            {nowStr()}
          </span>
        </header>

        <main style={sMain}>
          <SectionHeading primary>対応記録</SectionHeading>

          {/* 対応工程 */}
          <div style={{ marginBottom: 'var(--space-outer)' }}>
            <span
              style={{
                display: 'block',
                fontSize: 'var(--font-size-caption)',
                color: 'var(--fg-muted)',
                marginBottom: 'var(--space-inner)',
              }}
            >
              対応工程
            </span>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body)' }}>
              {selectedDef.name}
            </span>
          </div>

          {/* 状態選択 */}
          <div style={{ marginBottom: 'var(--space-outer)' }}>
            <span
              style={{
                display: 'block',
                fontSize: 'var(--font-size-caption)',
                color: 'var(--fg-muted)',
                marginBottom: 'var(--space-inner)',
              }}
            >
              状態
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-inner)', flexWrap: 'wrap' }}>
              {(['未着手', '対応中', '完了'] as Status[]).map((s) => {
                const selected = formStatus === s
                return (
                  <button
                    key={s}
                    onClick={() => setFormStatus(s)}
                    style={{
                      height: 'var(--target-choice-h)',
                      minWidth: '100px',
                      flexShrink: 0,
                      backgroundColor: selected ? STATUS_STYLE[s].background : 'transparent',
                      color: selected ? STATUS_STYLE[s].color : 'var(--fg-muted)',
                      border: `1px solid ${selected ? STATUS_STYLE[s].color : 'var(--border)'}`,
                      borderRadius: '4px',
                      fontSize: 'var(--font-size-body)',
                      fontFamily: '"BIZ UDPGothic", "Yu Gothic UI", sans-serif',
                      cursor: 'pointer',
                      padding: '0 20px',
                      fontWeight: selected ? 700 : 400,
                    }}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 英語対応済み（海外拠点の緊急電話対応のみ） */}
          {isOverseas && (
            <div style={{ marginBottom: 'var(--space-outer)' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-inner)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-body)',
                }}
              >
                <input
                  type="checkbox"
                  checked={formEnglish}
                  onChange={(e) => setFormEnglish(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: 'var(--accent)',
                    flexShrink: 0,
                  }}
                />
                英語対応済み
              </label>
            </div>
          )}

          {/* 判断根拠（Primary element） */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: 'var(--font-size-heading)',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: 'var(--fg)',
                marginBottom: 'var(--space-inner)',
              }}
            >
              判断根拠
            </span>
            <textarea
              value={formRationale}
              onChange={(e) => {
                setFormRationale(e.target.value)
                setFormError(false)
              }}
              placeholder=""
              style={{
                width: '100%',
                minHeight: '200px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: formError
                  ? '1px solid var(--accent-alert)'
                  : '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--fg)',
                fontFamily: '"BIZ UDPGothic", "Yu Gothic UI", sans-serif',
                fontSize: 'var(--font-size-body)',
                padding: '14px 16px',
                resize: 'vertical',
                lineHeight: 1.7,
                outline: 'none',
              }}
            />
            {formError && (
              <span
                style={{
                  display: 'block',
                  color: 'var(--accent-alert)',
                  fontSize: 'var(--font-size-caption)',
                  marginTop: '6px',
                }}
              >
                判断根拠を入力してください
              </span>
            )}
          </div>
        </main>

        {/* Cancel confirmation dialog */}
        {cancelDialog && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.72)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            }}
          >
            <div
              style={{
                backgroundColor: '#1E2026',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '28px 32px',
                maxWidth: '400px',
                width: '90%',
              }}
            >
              <p style={{ margin: '0 0 24px', fontSize: 'var(--font-size-body)', lineHeight: 1.6 }}>
                保存されていない内容があります。破棄しますか？
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <OutlineBtn onClick={() => setCancelDialog(false)}>戻る</OutlineBtn>
                <OutlineBtn
                  color="var(--accent-alert)"
                  onClick={() => {
                    setCancelDialog(false)
                    setScreen('S01')
                  }}
                >
                  破棄する
                </OutlineBtn>
              </div>
            </div>
          </div>
        )}

        <footer style={{ ...sFooter, justifyContent: 'space-between' }}>
          <OutlineBtn onClick={handleCancel}>キャンセル</OutlineBtn>
          <div style={{ display: 'flex', gap: '12px' }}>
            <PrimaryBtn
              onClick={handleStatusUpdate}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
              }}
            >
              状態を更新する
            </PrimaryBtn>
            <PrimaryBtn onClick={handleConfirm}>記録を確定する</PrimaryBtn>
          </div>
        </footer>
      </div>
    )
  }

  // ======== S03: 引き継ぎサマリ ========
  if (screen === 'S03') {
    const incomplete = PROCESSES.filter((p) => statusMap[p.id] !== '完了')
    const showS03Empty = incomplete.length === 0

    return (
      <div style={sApp}>
        <header style={sHeader}>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body)', letterSpacing: '0.04em' }}>
            引き継ぎサマリ
          </span>
          <span style={{ fontSize: 'var(--font-size-caption)', color: 'var(--fg-muted)' }}>
            シフト残り&ensp;05:23
          </span>
        </header>

        <main style={sMain}>
          {/* Primary element: 未完了・要フォロー事項 */}
          <SectionHeading primary>未完了・要フォロー事項</SectionHeading>

          {showS03Empty ? (
            <p
              style={{
                color: 'var(--fg-muted)',
                fontSize: 'var(--font-size-body)',
                padding: '16px 0',
              }}
            >
              申し送り事項はありません
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-inner)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              {incomplete.map((proc, i) => (
                <div
                  key={proc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{proc.name}</span>
                  <StatusBadge status={statusMap[proc.id]} />
                </div>
              ))}
            </div>
          )}

          {/* 上長報告済み確認（サービス停止5分超があった場合のみ） */}
          {serviceStopped && (
            <div
              style={{
                marginTop: 'var(--space-outer)',
                padding: '16px 20px',
                border: '1px solid var(--accent-alert)',
                borderRadius: '4px',
                backgroundColor: 'rgba(224,153,63,0.06)',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-inner)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-body)',
                  color: 'var(--accent-alert)',
                }}
              >
                <input
                  type="checkbox"
                  checked={reportConfirmed}
                  onChange={(e) => setReportConfirmed(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: 'var(--accent-alert)',
                    flexShrink: 0,
                  }}
                />
                上長へ報告済み
              </label>
            </div>
          )}

          {/* 対応記録一覧 */}
          <div style={{ marginTop: 'var(--space-outer)' }}>
            <SectionHeading>対応記録一覧</SectionHeading>

            {noRecords ? (
              <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--font-size-caption)' }}>
                記録はありません
              </p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-inner)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {PROCESSES.map((proc, i) => {
                  const pRecords = records.filter((r) => r.processId === proc.id)
                  if (pRecords.length === 0) return null
                  const latest = pRecords[pRecords.length - 1]
                  const isExpanded = expandedId === proc.id
                  return (
                    <div
                      key={proc.id}
                      style={{
                        borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 20px',
                          gap: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: 700 }}>{proc.name}</span>
                          <span
                            style={{
                              fontSize: 'var(--font-size-caption)',
                              color: 'var(--fg-muted)',
                            }}
                          >
                            {latest.timestamp}&ensp;/&ensp;{latest.status}
                          </span>
                        </div>
                        <OutlineBtn
                          onClick={() => setExpandedId(isExpanded ? null : proc.id)}
                          style={{ height: '36px', minWidth: '88px', fontSize: 'var(--font-size-caption)', flexShrink: 0 }}
                        >
                          詳細を見る
                        </OutlineBtn>
                      </div>

                      {/* 段階的開示: 詳細 */}
                      {isExpanded && (
                        <div
                          style={{
                            padding: '14px 20px',
                            borderTop: '1px solid var(--border)',
                            backgroundColor: 'rgba(255,255,255,0.025)',
                          }}
                        >
                          {pRecords.map((r) => (
                            <div
                              key={r.id}
                              style={{
                                marginBottom: 'var(--space-outer)',
                                paddingBottom: 'var(--space-outer)',
                                borderBottom: '1px solid rgba(108,111,119,0.25)',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  gap: '12px',
                                  marginBottom: 'var(--space-inner)',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 'var(--font-size-caption)',
                                    color: 'var(--fg-muted)',
                                  }}
                                >
                                  {r.timestamp}
                                </span>
                                <StatusBadge status={r.status} />
                              </div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 'var(--font-size-body)',
                                  lineHeight: 1.7,
                                }}
                              >
                                {r.rationale}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>

        <footer style={{ ...sFooter, justifyContent: 'space-between' }}>
          <OutlineBtn onClick={() => setScreen('S01')}>閉じる</OutlineBtn>
          <PrimaryBtn onClick={() => setScreen('S01')}>引き継ぎを確定する</PrimaryBtn>
        </footer>
      </div>
    )
  }

  return null
}
