import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { medicationsService } from '@/services/medications'
import type { MedicationRecord, MedicationPhase } from '@/types/database'
import { MedicationModal } from '@/components/MedicationModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pill,
  Plus,
  Clock,
  Calendar,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export const Medicamentos: React.FC = () => {
  const [medications, setMedications] = useState<MedicationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('active')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<MedicationRecord | null>(null)

  const loadMedications = useCallback(async () => {
    try {
      setLoading(true)
      const list = await medicationsService.getAll()
      setMedications(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMedications()
  }, [loadMedications])

  const handleOpenCreate = () => {
    setEditingMedication(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (med: MedicationRecord) => {
    setEditingMedication(med)
    setModalOpen(true)
  }

  const handleDelete = async (med: MedicationRecord) => {
    if (!window.confirm(`Tem certeza que deseja remover o medicamento "${med.name}"?`)) {
      return
    }

    try {
      await medicationsService.delete(med.id)
      toast({
        title: 'Medicamento removido',
        description: `${med.name} foi removido com sucesso.`,
      })
      loadMedications()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível excluir o medicamento.',
        variant: 'destructive',
      })
    }
  }

  // Calculate today's dose for medications with phases (e.g., Prednisona)
  const getTodayDose = (
    med: MedicationRecord,
  ): { dose: string; details?: string; isPhase: boolean } => {
    if (!med.phases) {
      return { dose: med.dose, isPhase: false }
    }

    const phasesList: MedicationPhase[] = Array.isArray(med.phases)
      ? med.phases
      : typeof med.phases === 'string'
        ? JSON.parse(med.phases)
        : []

    if (phasesList.length === 0) {
      return { dose: med.dose, isPhase: false }
    }

    const todayStr = new Date().toISOString().split('T')[0]
    for (let i = 0; i < phasesList.length; i++) {
      const p = phasesList[i]
      const afterStart = !p.start_date || todayStr >= p.start_date
      const beforeEnd = !p.end_date || todayStr <= p.end_date
      if (afterStart && beforeEnd) {
        return { dose: p.dose, details: p.details, isPhase: true }
      }
    }

    // Default to last phase or base dose
    const last = phasesList[phasesList.length - 1]
    return { dose: last?.dose || med.dose, details: last?.details, isPhase: true }
  }

  // Filtered List
  const filteredMedications = useMemo(() => {
    return medications.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.instructions && m.instructions.toLowerCase().includes(search.toLowerCase())) ||
        (m.dose && m.dose.toLowerCase().includes(search.toLowerCase()))

      const matchesStatus =
        filterActive === 'all' ? true : filterActive === 'active' ? m.active : !m.active

      return matchesSearch && matchesStatus
    })
  }, [medications, search, filterActive])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3EFED]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123332]">
              Rotina de Medicamentos
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#D9F2F1] text-[#0A5F5E]">
              {medications.filter((m) => m.active).length} ativos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5C7472] mt-0.5">
            Prescrição médica completa, horários ajustáveis e descremento de doses
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl h-11 px-5 bg-[#0E7C7B] hover:bg-[#0A5F5E] text-white font-bold text-sm shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Medicamento
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-[#E3EFED] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#5C7472] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome, dose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl text-xs bg-[#F6FBFA] border-[#E3EFED]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterActive('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterActive === 'active'
                ? 'bg-[#0E7C7B] text-white shadow-sm'
                : 'bg-[#F6FBFA] text-[#5C7472] hover:bg-[#E3EFED]'
            }`}
          >
            Ativos ({medications.filter((m) => m.active).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterActive('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterActive === 'all'
                ? 'bg-[#0E7C7B] text-white shadow-sm'
                : 'bg-[#F6FBFA] text-[#5C7472] hover:bg-[#E3EFED]'
            }`}
          >
            Todos ({medications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterActive('inactive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterActive === 'inactive'
                ? 'bg-[#0E7C7B] text-white shadow-sm'
                : 'bg-[#F6FBFA] text-[#5C7472] hover:bg-[#E3EFED]'
            }`}
          >
            Encerrados ({medications.filter((m) => !m.active).length})
          </button>
        </div>
      </div>

      {/* List of Medications */}
      <div className="space-y-4">
        {filteredMedications.map((med) => {
          const times = Array.isArray(med.times)
            ? med.times
            : typeof med.times === 'string'
              ? JSON.parse(med.times)
              : []
          const todayInfo = getTodayDose(med)
          const hasPhases = Boolean(
            med.phases && (Array.isArray(med.phases) ? med.phases.length > 0 : true),
          )

          return (
            <div
              key={med.id}
              className={`p-5 rounded-3xl border transition-all ${
                med.active
                  ? 'bg-white border-[#E3EFED] shadow-card hover:border-[#0E7C7B]/40'
                  : 'bg-gray-50/70 border-gray-200 opacity-70'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Info Left */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-extrabold text-[#123332]">{med.name}</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#D9F2F1] text-[#0A5F5E] text-xs font-bold font-mono">
                      {todayInfo.isPhase ? `Hoje: ${todayInfo.dose}` : med.dose}
                    </span>
                    {todayInfo.details && (
                      <span className="text-[11px] text-[#5C7472] bg-[#F6FBFA] px-2 py-0.5 rounded border border-[#E3EFED]">
                        ({todayInfo.details})
                      </span>
                    )}
                    {!med.active && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-200 text-gray-700">
                        Inativo / Encerrado
                      </span>
                    )}
                  </div>

                  {/* Horários */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[#5C7472] flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#0E7C7B]" />
                      Horários:
                    </span>
                    {times.map((t: string) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-lg bg-[#F6FBFA] border border-[#E3EFED] font-mono font-bold text-[#123332]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Período / Vigência */}
                  <div className="flex items-center gap-2 text-xs text-[#5C7472]">
                    <Calendar className="w-3.5 h-3.5 text-[#5C7472]" />
                    <span>
                      {med.end_date
                        ? `De ${new Date(med.start_date || '').toLocaleDateString('pt-BR')} até ${new Date(med.end_date).toLocaleDateString('pt-BR')}`
                        : 'Uso contínuo'}
                    </span>
                  </div>

                  {/* Orientações */}
                  {med.instructions && (
                    <p className="text-xs text-[#5C7472] italic bg-[#F6FBFA] p-2.5 rounded-xl border border-[#E3EFED]/60">
                      "{med.instructions}"
                    </p>
                  )}

                  {/* Prednisona Descremento Preview */}
                  {hasPhases && (
                    <div className="mt-3 p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Info className="w-3.5 h-3.5 text-[#D97706]" />
                        <span>Descremento Programado (Desmame de Corticoide)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(Array.isArray(med.phases)
                          ? med.phases
                          : JSON.parse(med.phases as string)
                        ).map((p: MedicationPhase, pIdx: number) => {
                          const isCurrent =
                            getTodayDose(med).dose === p.dose &&
                            (!p.end_date || new Date().toISOString().split('T')[0] <= p.end_date)
                          return (
                            <span
                              key={pIdx}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-mono ${
                                isCurrent
                                  ? 'bg-[#D97706] text-white font-bold ring-2 ring-[#D97706]/40'
                                  : 'bg-white/80 border border-[#FDE68A] text-[#92400E]'
                              }`}
                            >
                              {p.dose}{' '}
                              {p.end_date ? `(até ${p.end_date.substring(5)})` : '(contínuo)'}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Right */}
                <div className="flex items-center gap-2 self-end md:self-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(med)}
                    className="rounded-xl h-9 px-3 text-xs font-bold text-[#0E7C7B] border-[#0E7C7B]/30 hover:bg-[#D9F2F1]/50"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(med)}
                    className="rounded-xl h-9 px-2.5 text-xs text-[#D64545] hover:bg-[#FDEEEE] hover:text-[#991B1B]"
                    title="Remover medicamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        {filteredMedications.length === 0 && !loading && (
          <div className="bg-white rounded-3xl p-8 border border-[#E3EFED] text-center space-y-3">
            <Pill className="w-10 h-10 text-[#5C7472] mx-auto opacity-40" />
            <h3 className="text-base font-bold text-[#123332]">Nenhum medicamento encontrado</h3>
            <p className="text-xs text-[#5C7472] max-w-sm mx-auto">
              Nenhum item corresponde à sua busca ou filtro. Clique no botão acima para adicionar um
              novo medicamento.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição */}
      <MedicationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        medication={editingMedication}
        onSaved={loadMedications}
      />
    </div>
  )
}

export default Medicamentos
