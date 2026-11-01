import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { medicationsService } from '@/services/medications'
import type { MedicationRecord, MedicationPhase } from '@/types/database'
import { Plus, Trash2, Clock, Calendar, AlertCircle } from 'lucide-react'

interface MedicationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medication?: MedicationRecord | null
  onSaved: () => void
}

export const MedicationModal: React.FC<MedicationModalProps> = ({
  open,
  onOpenChange,
  medication,
  onSaved,
}) => {
  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [unit, setUnit] = useState('cp')
  const [times, setTimes] = useState<string[]>(['08:00'])
  const [newTime, setNewTime] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isContinuous, setIsContinuous] = useState(true)
  const [active, setActive] = useState(true)
  const [instructions, setInstructions] = useState('')
  const [phases, setPhases] = useState<MedicationPhase[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (medication) {
        setName(medication.name || '')
        setDose(medication.dose || '')
        setUnit(medication.unit || 'cp')
        setTimes(
          Array.isArray(medication.times)
            ? medication.times
            : typeof medication.times === 'string'
              ? JSON.parse(medication.times)
              : ['08:00'],
        )
        setStartDate(medication.start_date ? medication.start_date.split('T')[0] : '')
        setEndDate(medication.end_date ? medication.end_date.split('T')[0] : '')
        setIsContinuous(!medication.end_date)
        setActive(medication.active ?? true)
        setInstructions(medication.instructions || '')

        let parsedPhases: MedicationPhase[] = []
        if (medication.phases) {
          if (typeof medication.phases === 'string') {
            try {
              parsedPhases = JSON.parse(medication.phases)
            } catch {
              parsedPhases = []
            }
          } else if (Array.isArray(medication.phases)) {
            parsedPhases = medication.phases
          }
        }
        setPhases(parsedPhases)
      } else {
        setName('')
        setDose('')
        setUnit('cp')
        setTimes(['08:00'])
        setStartDate(new Date().toISOString().split('T')[0])
        setEndDate('')
        setIsContinuous(true)
        setActive(true)
        setInstructions('')
        setPhases([])
      }
      setNewTime('')
    }
  }, [open, medication])

  const handleAddTime = () => {
    if (!newTime) return
    const formatted = newTime.length === 5 ? newTime : `${newTime.padStart(2, '0')}:00`
    if (!times.includes(formatted)) {
      setTimes([...times, formatted].sort())
    }
    setNewTime('')
  }

  const handleRemoveTime = (t: string) => {
    setTimes(times.filter((item) => item !== t))
  }

  const handleAddPhase = () => {
    const lastPhase = phases[phases.length - 1]
    const nextStart = lastPhase?.end_date || startDate || new Date().toISOString().split('T')[0]
    setPhases([
      ...phases,
      {
        start_date: nextStart,
        end_date: '',
        dose: '5 mg',
        details: 'Dose ajustada',
      },
    ])
  }

  const handleUpdatePhase = (index: number, field: keyof MedicationPhase, value: string) => {
    const updated = [...phases]
    updated[index] = { ...updated[index], [field]: value }
    setPhases(updated)
  }

  const handleRemovePhase = (index: number) => {
    setPhases(phases.filter((_, idx) => idx !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome do medicamento.',
        variant: 'destructive',
      })
      return
    }

    if (times.length === 0) {
      toast({
        title: 'Horário necessário',
        description: 'Adicione pelo menos um horário de tomada.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const payload: Partial<MedicationRecord> = {
        name: name.trim(),
        dose: dose.trim(),
        unit: unit.trim(),
        times,
        start_date: startDate ? `${startDate} 00:00:00.000Z` : undefined,
        end_date: !isContinuous && endDate ? `${endDate} 00:00:00.000Z` : undefined,
        active,
        instructions: instructions.trim(),
        phases: phases.length > 0 ? phases : undefined,
      }

      if (medication?.id) {
        await medicationsService.update(medication.id, payload)
        toast({
          title: 'Medicamento atualizado',
          description: `${name} foi atualizado com sucesso.`,
        })
      } else {
        await medicationsService.create(payload)
        toast({
          title: 'Medicamento cadastrado',
          description: `${name} foi adicionado à rotina.`,
        })
      }

      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao salvar',
        description: 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white border border-[#E3EFED]">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-xl font-bold text-[#123332]">
            {medication ? 'Editar Medicamento' : 'Novo Medicamento'}
          </DialogTitle>
          <p className="text-xs text-[#5C7472]">
            Configure dose, horários e períodos de vigência ou desmame.
          </p>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 mt-2">
          {/* Nome e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="medName" className="text-xs font-bold text-[#123332]">
                Nome do Medicamento *
              </Label>
              <Input
                id="medName"
                placeholder="Ex: Prednisona, Tacrolimo, etc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl mt-1 h-10 font-semibold"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-[#123332] block">Status</Label>
              <div className="flex items-center gap-2 mt-2">
                <Switch checked={active} onCheckedChange={setActive} />
                <span className="text-xs font-semibold text-[#123332]">
                  {active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          {/* Dose e Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="medDose" className="text-xs font-bold text-[#123332]">
                Dose *
              </Label>
              <Input
                id="medDose"
                placeholder="Ex: 5 mg, 1 cp, 20 UI"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="rounded-xl mt-1 h-10"
                required
              />
            </div>

            <div>
              <Label htmlFor="medUnit" className="text-xs font-bold text-[#123332]">
                Unidade / Apresentação
              </Label>
              <Input
                id="medUnit"
                placeholder="Ex: cp, medida, unid"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="rounded-xl mt-1 h-10"
              />
            </div>
          </div>

          {/* Horários */}
          <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-2">
            <Label className="text-xs font-bold text-[#123332] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0E7C7B]" />
              Horários de Tomada ({times.length})
            </Label>
            <div className="flex flex-wrap gap-2 items-center">
              {times.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E3EFED] shadow-sm text-xs font-mono font-bold text-[#123332]"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(t)}
                    className="text-[#D64545] hover:text-[#991B1B] font-bold ml-1"
                    title="Remover horário"
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1.5">
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-28 h-8 rounded-xl text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTime}
                  className="rounded-xl h-8 px-2.5 text-xs font-bold text-[#0E7C7B]"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Período / Vigência */}
          <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-[#123332] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0E7C7B]" />
                Período de Vigência
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#5C7472]">Uso contínuo:</span>
                <Switch checked={isContinuous} onCheckedChange={setIsContinuous} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate" className="text-[11px] text-[#5C7472]">
                  Data de Início
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl mt-1 h-9"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-[11px] text-[#5C7472]">
                  Data de Término
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  disabled={isContinuous}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl mt-1 h-9 disabled:opacity-40"
                  placeholder={isContinuous ? 'Contínuo' : ''}
                />
              </div>
            </div>
          </div>

          {/* Etapas de Descremento / Fases (ex: Prednisona) */}
          <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-[#123332] block">
                  Etapas / Descremento (Desmame)
                </Label>
                <p className="text-[10px] text-[#5C7472]">
                  Defina faixas de datas com doses decrescentes (ex.: Prednisona).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPhase}
                className="rounded-xl h-8 px-2.5 text-xs font-bold text-[#0E7C7B]"
              >
                <Plus className="w-3 h-3 mr-1" />
                Nova Etapa
              </Button>
            </div>

            {phases.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {phases.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-[#E3EFED] flex flex-col sm:flex-row sm:items-center gap-2 text-xs"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                      <div>
                        <span className="text-[10px] text-[#5C7472] block">Início</span>
                        <input
                          type="date"
                          value={p.start_date || ''}
                          onChange={(e) => handleUpdatePhase(idx, 'start_date', e.target.value)}
                          className="w-full text-xs p-1 border rounded-md"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5C7472] block">Fim</span>
                        <input
                          type="date"
                          value={p.end_date || ''}
                          onChange={(e) => handleUpdatePhase(idx, 'end_date', e.target.value)}
                          placeholder="Contínuo"
                          className="w-full text-xs p-1 border rounded-md"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5C7472] block">Dose</span>
                        <input
                          type="text"
                          value={p.dose || ''}
                          onChange={(e) => handleUpdatePhase(idx, 'dose', e.target.value)}
                          placeholder="Ex: 20 mg"
                          className="w-full text-xs p-1 border rounded-md font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5C7472] block">Detalhes</span>
                        <input
                          type="text"
                          value={p.details || ''}
                          onChange={(e) => handleUpdatePhase(idx, 'details', e.target.value)}
                          placeholder="Ex: 1 cp 20mg"
                          className="w-full text-xs p-1 border rounded-md"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePhase(idx)}
                      className="text-[#D64545] hover:text-[#991B1B] p-1.5 self-end sm:self-center"
                      title="Remover etapa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orientações */}
          <div>
            <Label htmlFor="medInst" className="text-xs font-bold text-[#123332]">
              Orientações Médicas / Observações
            </Label>
            <Textarea
              id="medInst"
              placeholder="Ex: Tomar com água em jejum, ou após o almoço..."
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="rounded-xl mt-1 text-xs resize-none"
            />
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 px-4"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl h-10 px-6 bg-[#0E7C7B] hover:bg-[#0A5F5E] text-white font-bold"
            >
              {saving ? 'Salvando...' : medication ? 'Atualizar' : 'Salvar Medicamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
