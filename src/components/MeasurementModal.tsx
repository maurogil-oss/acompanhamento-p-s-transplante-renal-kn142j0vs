import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { measurementsService } from '@/services/measurements'
import type { MeasurementRecord, MeasurementSlot } from '@/types/database'
import { Activity, Clock, Droplets, Thermometer, Weight, FileText, Trash2 } from 'lucide-react'

interface MeasurementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dateStr: string // YYYY-MM-DD
  slot: MeasurementSlot
  existingRecord?: MeasurementRecord | null
  onSaved: () => void
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({
  open,
  onOpenChange,
  dateStr,
  slot,
  existingRecord,
  onSaved,
}) => {
  const [systolic, setSystolic] = useState<string>('')
  const [diastolic, setDiastolic] = useState<string>('')
  const [glucose, setGlucose] = useState<string>('')
  const [heartRate, setHeartRate] = useState<string>('')
  const [waterMl, setWaterMl] = useState<string>('')
  const [temperature, setTemperature] = useState<string>('')
  const [urineMl, setUrineMl] = useState<string>('')
  const [weightKg, setWeightKg] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleDelete = async () => {
    if (!existingRecord?.id) return
    if (
      !window.confirm(`Tem certeza que deseja apagar as medições do horário ${slot} deste dia?`)
    ) {
      return
    }

    setDeleting(true)
    try {
      await measurementsService.delete(existingRecord.id)
      toast({
        title: 'Medição apagada',
        description: `Dados do horário ${slot} foram removidos.`,
      })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao apagar',
        description: 'Não foi possível excluir a medição.',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (open) {
      setSystolic(existingRecord?.systolic ? String(existingRecord.systolic) : '')
      setDiastolic(existingRecord?.diastolic ? String(existingRecord.diastolic) : '')
      setGlucose(existingRecord?.glucose ? String(existingRecord.glucose) : '')
      setHeartRate(existingRecord?.heart_rate ? String(existingRecord.heart_rate) : '')
      setWaterMl(existingRecord?.water_ml ? String(existingRecord.water_ml) : '')
      setTemperature(existingRecord?.temperature ? String(existingRecord.temperature) : '')
      setUrineMl(existingRecord?.urine_ml ? String(existingRecord.urine_ml) : '')
      setWeightKg(existingRecord?.weight_kg ? String(existingRecord.weight_kg) : '')
      setNotes(existingRecord?.notes || '')
      setErrors({})
    }
  }, [open, existingRecord])

  const validate = () => {
    const errs: Record<string, string> = {}

    if (systolic) {
      const v = Number(systolic)
      if (isNaN(v) || v < 50 || v > 250) errs.systolic = 'Informe um valor entre 50 e 250'
    }
    if (diastolic) {
      const v = Number(diastolic)
      if (isNaN(v) || v < 30 || v > 150) errs.diastolic = 'Informe um valor entre 30 e 150'
    }
    if (glucose) {
      const v = Number(glucose)
      if (isNaN(v) || v < 20 || v > 600) errs.glucose = 'Informe um valor entre 20 e 600'
    }
    if (heartRate) {
      const v = Number(heartRate)
      if (isNaN(v) || v < 30 || v > 220) errs.heartRate = 'Informe um valor entre 30 e 220'
    }
    if (waterMl) {
      const v = Number(waterMl)
      if (isNaN(v) || v < 0) errs.waterMl = 'Valor não pode ser negativo'
    }
    if (temperature) {
      const v = Number(temperature)
      if (isNaN(v) || v < 30 || v > 45) errs.temperature = 'Informe um valor entre 30 e 45'
    }
    if (urineMl) {
      const v = Number(urineMl)
      if (isNaN(v) || v < 0) errs.urineMl = 'Valor não pode ser negativo'
    }
    if (weightKg && slot === '07:00') {
      const v = Number(weightKg)
      if (isNaN(v) || v < 30 || v > 300) errs.weightKg = 'Informe um valor entre 30 e 300'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload: Partial<MeasurementRecord> = {
        systolic: systolic ? Number(systolic) : undefined,
        diastolic: diastolic ? Number(diastolic) : undefined,
        glucose: glucose ? Number(glucose) : undefined,
        heart_rate: heartRate ? Number(heartRate) : undefined,
        water_ml: waterMl ? Number(waterMl) : undefined,
        temperature: temperature ? Number(temperature) : undefined,
        urine_ml: urineMl ? Number(urineMl) : undefined,
        weight_kg: slot === '07:00' && weightKg ? Number(weightKg) : undefined,
        notes: notes.trim() || undefined,
      }

      await measurementsService.upsertSlot(dateStr, slot, payload)
      toast({
        title: 'Medição salva',
        description: `Dados do horário das ${slot} registrados com sucesso.`,
      })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      console.error('Error saving measurement:', err)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível gravar a medição. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-white border border-[#E3EFED]">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E7C7B]">
            <Clock className="w-3.5 h-3.5" />
            <span>Horário {slot}</span>
          </div>
          <DialogTitle className="text-xl font-bold text-[#123332]">Lançar Medição</DialogTitle>
          <p className="text-xs text-[#5C7472]">
            Preencha os parâmetros aferidos para este período do dia.
          </p>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 mt-2">
          {/* Pressão Arterial */}
          <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-[#123332] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#0E7C7B]" />
                Pressão Arterial (PA)
              </Label>
              {systolic && diastolic && !errors.systolic && !errors.diastolic && (
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-[#D9F2F1] text-[#0A5F5E]">
                  {systolic}/{diastolic} mmHg
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="systolic" className="text-[11px] text-[#5C7472]">
                  Sistólica (máx)
                </Label>
                <Input
                  id="systolic"
                  type="number"
                  placeholder="Ex: 120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
                {errors.systolic && (
                  <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.systolic}</p>
                )}
              </div>
              <div>
                <Label htmlFor="diastolic" className="text-[11px] text-[#5C7472]">
                  Diastólica (mín)
                </Label>
                <Input
                  id="diastolic"
                  type="number"
                  placeholder="Ex: 80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
                {errors.diastolic && (
                  <p className="text-[10px] text-[#D64545] font-semibold mt-1">
                    {errors.diastolic}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Glicemia e Frequência Cardíaca */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED]">
              <Label htmlFor="glucose" className="text-xs font-bold text-[#123332]">
                Glicemia (mg/dL)
              </Label>
              <Input
                id="glucose"
                type="number"
                placeholder="Ex: 95"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                className="rounded-xl mt-1.5 h-10"
              />
              {errors.glucose && (
                <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.glucose}</p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED]">
              <Label htmlFor="heartRate" className="text-xs font-bold text-[#123332]">
                FC (bpm)
              </Label>
              <Input
                id="heartRate"
                type="number"
                placeholder="Ex: 72"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="rounded-xl mt-1.5 h-10"
              />
              {errors.heartRate && (
                <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.heartRate}</p>
              )}
            </div>
          </div>

          {/* Água e Diurese */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED]">
              <Label
                htmlFor="waterMl"
                className="text-xs font-bold text-[#123332] flex items-center gap-1"
              >
                <Droplets className="w-3.5 h-3.5 text-[#3B82F6]" />
                Água ingerida (ml)
              </Label>
              <Input
                id="waterMl"
                type="number"
                placeholder="Ex: 400"
                value={waterMl}
                onChange={(e) => setWaterMl(e.target.value)}
                className="rounded-xl mt-1.5 h-10"
              />
              {errors.waterMl && (
                <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.waterMl}</p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED]">
              <Label htmlFor="urineMl" className="text-xs font-bold text-[#123332]">
                Diurese / Urina (ml)
              </Label>
              <Input
                id="urineMl"
                type="number"
                placeholder="Ex: 350"
                value={urineMl}
                onChange={(e) => setUrineMl(e.target.value)}
                className="rounded-xl mt-1.5 h-10"
              />
              {errors.urineMl && (
                <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.urineMl}</p>
              )}
            </div>
          </div>

          {/* Temperatura e Peso */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED]">
              <Label
                htmlFor="temperature"
                className="text-xs font-bold text-[#123332] flex items-center gap-1"
              >
                <Thermometer className="w-3.5 h-3.5 text-[#F59E0B]" />
                Temperatura (°C)
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="Ex: 36.5"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="rounded-xl mt-1.5 h-10"
              />
              {errors.temperature && (
                <p className="text-[10px] text-[#D64545] font-semibold mt-1">
                  {errors.temperature}
                </p>
              )}
              {Number(temperature) >= 37.8 && (
                <p className="text-[10px] text-[#D64545] font-bold mt-1">
                  Atenção: Febre detectada (≥ 37,8°C)
                </p>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${slot === '07:00' ? 'bg-[#F6FBFA] border-[#E3EFED]' : 'bg-gray-50/70 border-gray-200'}`}
            >
              <Label
                htmlFor="weightKg"
                className="text-xs font-bold text-[#123332] flex items-center gap-1"
              >
                <Weight className="w-3.5 h-3.5 text-[#0E7C7B]" />
                Peso em jejum (kg)
              </Label>
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                placeholder="Ex: 77.9"
                value={weightKg}
                disabled={slot !== '07:00'}
                onChange={(e) => setWeightKg(e.target.value)}
                className="rounded-xl mt-1.5 h-10 disabled:opacity-50 disabled:bg-gray-100"
              />
              {slot !== '07:00' ? (
                <p className="text-[10px] text-[#5C7472] mt-1 italic">
                  Peso apenas no período das 07:00
                </p>
              ) : errors.weightKg ? (
                <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.weightKg}</p>
              ) : null}
            </div>
          </div>

          {/* Observações */}
          <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED]">
            <Label
              htmlFor="notes"
              className="text-xs font-bold text-[#123332] flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-[#5C7472]" />
              Observações
            </Label>
            <Textarea
              id="notes"
              placeholder="Ex: Acordou bem, sem queixas. Medicamentos tomados no horário."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl mt-1.5 resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E3EFED]/60">
            <div>
              {existingRecord?.id && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={deleting || saving}
                  onClick={handleDelete}
                  className="rounded-xl h-10 px-3 text-xs text-[#D64545] hover:bg-[#FDEEEE] hover:text-[#991B1B]"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Apagar lançamento
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl h-10 px-4 text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || deleting}
                className="rounded-xl h-10 px-6 bg-[#0E7C7B] hover:bg-[#0A5F5E] text-white font-bold text-xs"
              >
                {saving ? 'Salvando...' : 'Salvar medição'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
