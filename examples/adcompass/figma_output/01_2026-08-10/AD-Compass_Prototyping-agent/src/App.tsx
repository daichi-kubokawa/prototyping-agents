import { useState } from 'react'
import type { View, Project, JudgmentRecord } from './types'
import { PROJECTS, FEEDBACKS } from './data'
import Sidebar from './Sidebar'
import S01 from './screens/S01'
import S02 from './screens/S02'
import S03 from './screens/S03'

export default function App() {
  const [view, setView] = useState<View>('S01')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedStageIndex, setSelectedStageIndex] = useState(0)
  const [judgmentRecords, setJudgmentRecords] = useState<Record<string, JudgmentRecord>>({})
  const [memos, setMemos] = useState<Record<string, string>>({})

  const handleSelectActive = (project: Project) => {
    setSelectedProject(project)
    setSelectedStageIndex(project.currentStageIndex)
    setView('S02')
  }

  const handleSelectCompleted = (project: Project) => {
    setSelectedProject(project)
    setView('S03')
  }

  const handleBack = () => {
    setView('S01')
    setSelectedProject(null)
  }

  const handleStageSelect = (index: number) => {
    setSelectedStageIndex(index)
  }

  const handleGoToS03 = () => {
    setView('S03')
  }

  const handleRecordSave = (key: string, record: JudgmentRecord) => {
    setJudgmentRecords((prev) => ({ ...prev, [key]: record }))
  }

  const handleMemoChange = (projectId: string, memo: string) => {
    setMemos((prev) => ({ ...prev, [projectId]: memo }))
  }

  const feedbacks = selectedProject ? (FEEDBACKS[selectedProject.id] ?? []) : []
  const memo = selectedProject ? (memos[selectedProject.id] ?? '') : ''

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <Sidebar
        view={view}
        project={selectedProject}
        selectedStageIndex={selectedStageIndex}
        onStageSelect={handleStageSelect}
        onBack={handleBack}
      />

      {view === 'S01' && (
        <S01
          projects={PROJECTS}
          onSelectActive={handleSelectActive}
          onSelectCompleted={handleSelectCompleted}
        />
      )}

      {view === 'S02' && selectedProject && (
        <S02
          project={selectedProject}
          selectedStageIndex={selectedStageIndex}
          judgmentRecords={judgmentRecords}
          onRecordSave={handleRecordSave}
          onGoToS03={handleGoToS03}
        />
      )}

      {view === 'S03' && selectedProject && (
        <S03
          project={selectedProject}
          feedbacks={feedbacks}
          memo={memo}
          onMemoChange={(m) => handleMemoChange(selectedProject.id, m)}
        />
      )}
    </div>
  )
}
