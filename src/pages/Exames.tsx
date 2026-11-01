import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { labsService } from '@/services/labs'
import type { LabRecord } from '@/types/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import {
  Plus,
  FileText,
  TrendingDown,
  TrendingUp,
  Trash2,
  Calendar,
  AlertCircle,
  Activity,
} from 'lucide-react'

// Responsive SVG Line Chart Component
interface SvgChartProps {
  data: Array<{ date: string; value: number }>
  color: string
  unit: string
  title: string
  minZero?: boolean
}

const SvgLineChart: React.FC<SvgChartProps> = ({ data, color, unit, title, minZero = false }) => {
  if (data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-[#5C7472] border border-dashed border-[#E3EFED] rounded-2xl">
        Sem dados para {title}
      </div>
    )
  }

  const values = data.map((d) => d.value)
  const minVal = minZero ? 0 : Math.min(...values) * 0.9
  const maxVal = Math.max(...values) * 1.1 || 1
  const range = maxVal - minVal || 1

  const width = 500
  const height = 180
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }

  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartW
    const y = padding.top + chartH - ((d.value - minVal) / range) * chartH
    return { x, y, ...d }
  })

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')

  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    padding.top + chartH
  } L ${points[0].x} ${padding.top + chartH} Z`

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#123332]">{title}</span>
        <span className="text-xs font-mono font-bold text-[#5C7472]">
          Último: {values[values.length - 1]} {unit}
        </span>
      </div>

      <div className="relative w-full aspect-[2.6/1] bg-[#F6FBFA] rounded-2xl border border-[#E3EFED] p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="#E3EFED"
            strokeDasharray="3 3"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH / 2}
            x2={width - padding.right}
            y2={padding.top + chartH / 2}
            stroke="#E3EFED"
            strokeDasharray="3 3"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH}
            x2={width - padding.right}
            y2={padding.top + chartH}
            stroke="#E3EFED"
          />

          {/* Area under curve */}
          <path d={areaD} fill={`url(#grad-${title})`} />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#FFFFFF"
                stroke={color}
                strokeWidth="2.5"
                className="transition-all hover:r-6 cursor-pointer"
              />
              <title>{`${p.date}: ${p.value} ${unit}`}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

const Exames: React.FC = () => {
  const [labs, setLabs] = useState<LabRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Form State
  const [examDate, setExamDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [creatinine, setCreatinine] = useState<string>('')
  const [urea, setUrea] = useState<string>('')
  const [potassium, setPotassium] = useState<string>('')
  const [sodium, setSodium] = useState<string>('')
  const [hemoglobin, setHemoglobin] = useState<string>('')
  const [gfr, setGfr] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadLabs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await labsService.getAll()
      setLabs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLabs()
  }, [loadLabs])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!examDate) errs.examDate = 'A data do exame é obrigatória'
    if (creatinine && isNaN(Number(creatinine))) errs.creatinine = 'Valor numérico inválido'
    if (urea && isNaN(Number(urea))) errs.urea = 'Valor numérico inválido'
    if (potassium && isNaN(Number(potassium))) errs.potassium = 'Valor numérico inválido'
    if (sodium && isNaN(Number(sodium))) errs.sodium = 'Valor numérico inválido'
    if (hemoglobin && isNaN(Number(hemoglobin))) errs.hemoglobin = 'Valor numérico inválido'
    if (gfr && isNaN(Number(gfr))) errs.gfr = 'Valor numérico inválido'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await labsService.create({
        exam_date: examDate,
        creatinine: creatinine ? Number(creatinine) : undefined,
        urea: urea ? Number(urea) : undefined,
        potassium: potassium ? Number(potassium) : undefined,
        sodium: sodium ? Number(sodium) : undefined,
        hemoglobin: hemoglobin ? Number(hemoglobin) : undefined,
        gfr: gfr ? Number(gfr) : undefined,
        notes: notes.trim() || undefined,
      })

      toast({
        title: 'Exame adicionado',
        description: 'Os pontos dos gráficos foram atualizados imediatamente.',
      })

      // Reset form
      setCreatinine('')
      setUrea('')
      setPotassium('')
      setSodium('')
      setHemoglobin('')
      setGfr('')
      setNotes('')
      setModalOpen(false)

      await loadLabs()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível gravar o exame. Verifique os dados.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este exame?')) {
      try {
        await labsService.delete(id)
        toast({ title: 'Exame excluído com sucesso.' })
        loadLabs()
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Prepare chart series
  const sortedLabs = useMemo(() => {
    return [...labs].sort((a, b) => a.exam_date.localeCompare(b.exam_date))
  }, [labs])

  const creatinineSeries = useMemo(() => {
    return sortedLabs
      .filter((l) => l.creatinine !== undefined && l.creatinine !== null)
      .map((l) => ({
        date: new Date(l.exam_date.split('T')[0]).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        value: Number(l.creatinine),
      }))
  }, [sortedLabs])

  const ureaSeries = useMemo(() => {
    return sortedLabs
      .filter((l) => l.urea !== undefined && l.urea !== null)
      .map((l) => ({
        date: new Date(l.exam_date.split('T')[0]).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        value: Number(l.urea),
      }))
  }, [sortedLabs])

  const potSeries = useMemo(() => {
    return sortedLabs
      .filter((l) => l.potassium !== undefined && l.potassium !== null)
      .map((l) => ({
        date: new Date(l.exam_date.split('T')[0]).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        value: Number(l.potassium),
      }))
  }, [sortedLabs])

  const sodSeries = useMemo(() => {
    return sortedLabs
      .filter((l) => l.sodium !== undefined && l.sodium !== null)
      .map((l) => ({
        date: new Date(l.exam_date.split('T')[0]).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        value: Number(l.sodium),
      }))
  }, [sortedLabs])

  const hbSeries = useMemo(() => {
    return sortedLabs
      .filter((l) => l.hemoglobin !== undefined && l.hemoglobin !== null)
      .map((l) => ({
        date: new Date(l.exam_date.split('T')[0]).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        value: Number(l.hemoglobin),
      }))
  }, [sortedLabs])

  const gfrSeries = useMemo(() => {
    return sortedLabs
      .filter((l) => l.gfr !== undefined && l.gfr !== null)
      .map((l) => ({
        date: new Date(l.exam_date.split('T')[0]).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        value: Number(l.gfr),
      }))
  }, [sortedLabs])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3EFED]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123332]">
            Evolução Laboratorial
          </h1>
          <p className="text-xs sm:text-sm text-[#5C7472] mt-0.5">
            Acompanhamento contínuo da função do enxerto renal e eletrólitos
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-2xl h-10 px-4 bg-[#0E7C7B] hover:bg-[#0A5F5E] text-white font-bold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Adicionar Exame
        </Button>
      </div>

      {/* Main Creatinine Chart (Primary Highlight) */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#123332]">Curva de Creatinina Sérica (mg/dL)</h2>
            <p className="text-xs text-[#5C7472]">
              Marcador principal da função do rim transplantado (valores menores indicam melhor
              filtração)
            </p>
          </div>
        </div>

        <SvgLineChart
          data={creatinineSeries}
          color="#0E7C7B"
          unit="mg/dL"
          title="Creatinina"
          minZero={true}
        />
      </section>

      {/* Grid of Secondary Lab Curves */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ureia */}
        <div className="bg-white rounded-3xl p-5 border border-[#E3EFED] shadow-card">
          <SvgLineChart data={ureaSeries} color="#F59E0B" unit="mg/dL" title="Ureia" />
        </div>

        {/* Potássio */}
        <div className="bg-white rounded-3xl p-5 border border-[#E3EFED] shadow-card">
          <SvgLineChart data={potSeries} color="#7C5CBF" unit="mEq/L" title="Potássio" />
        </div>

        {/* Sódio */}
        <div className="bg-white rounded-3xl p-5 border border-[#E3EFED] shadow-card">
          <SvgLineChart data={sodSeries} color="#3B82F6" unit="mEq/L" title="Sódio" />
        </div>

        {/* Hemoglobina */}
        <div className="bg-white rounded-3xl p-5 border border-[#E3EFED] shadow-card">
          <SvgLineChart data={hbSeries} color="#F97362" unit="g/dL" title="Hemoglobina" />
        </div>

        {/* TFG Estimada */}
        <div className="bg-white rounded-3xl p-5 border border-[#E3EFED] shadow-card md:col-span-2 lg:col-span-2">
          <SvgLineChart
            data={gfrSeries}
            color="#34A853"
            unit="mL/min"
            title="Taxa de Filtração Glomerular Estimada (TFG)"
          />
        </div>
      </section>

      {/* Past Exams Table */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#123332]">Histórico de Exames</h2>
          <p className="text-xs text-[#5C7472]">
            Todos os resultados cadastrados em ordem cronológica
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E3EFED] text-[#5C7472] font-extrabold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pr-3">Data</th>
                <th className="pb-3 px-3">Creatinina</th>
                <th className="pb-3 px-3">Ureia</th>
                <th className="pb-3 px-3">Potássio</th>
                <th className="pb-3 px-3">Sódio</th>
                <th className="pb-3 px-3">Hb</th>
                <th className="pb-3 px-3">TFG</th>
                <th className="pb-3 px-3">Observações</th>
                <th className="pb-3 pl-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3EFED]/60">
              {sortedLabs.map((l) => {
                const dateStr = new Date(l.exam_date.split('T')[0]).toLocaleDateString('pt-BR')
                return (
                  <tr key={l.id} className="hover:bg-[#F6FBFA] transition-colors">
                    <td className="py-3 pr-3 font-bold text-[#123332] whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#0E7C7B]">
                      {l.creatinine !== undefined ? `${l.creatinine} mg/dL` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {l.urea !== undefined ? `${l.urea} mg/dL` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {l.potassium !== undefined ? `${l.potassium} mEq/L` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {l.sodium !== undefined ? `${l.sodium} mEq/L` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {l.hemoglobin !== undefined ? `${l.hemoglobin} g/dL` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#2E9E6B]">
                      {l.gfr !== undefined ? `${l.gfr} mL/min` : '—'}
                    </td>
                    <td className="py-3 px-3 text-[#5C7472] max-w-[200px] truncate">
                      {l.notes || '—'}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(l.id)}
                        className="text-[#D64545] hover:bg-[#FDEEEE] rounded-xl h-8 w-8 p-0"
                        title="Excluir exame"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Exam Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl bg-white border border-[#E3EFED]">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold text-[#123332]">
              Adicionar Exame de Sangue
            </DialogTitle>
            <p className="text-xs text-[#5C7472]">
              Lançamento dos resultados laboratoriais de rotina
            </p>
          </DialogHeader>

          <form onSubmit={handleCreateLab} className="space-y-3 mt-3">
            <div>
              <Label htmlFor="examDate" className="text-xs font-bold text-[#123332]">
                Data do Exame *
              </Label>
              <Input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="rounded-xl mt-1 h-10"
              />
              {errors.examDate && (
                <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.examDate}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="creatinine" className="text-xs font-bold text-[#0E7C7B]">
                  Creatinina (mg/dL)
                </Label>
                <Input
                  id="creatinine"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 1.35"
                  value={creatinine}
                  onChange={(e) => setCreatinine(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
                {errors.creatinine && (
                  <p className="text-[10px] text-[#D64545] font-semibold mt-1">
                    {errors.creatinine}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="urea" className="text-xs font-bold text-[#123332]">
                  Ureia (mg/dL)
                </Label>
                <Input
                  id="urea"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 38"
                  value={urea}
                  onChange={(e) => setUrea(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
                {errors.urea && (
                  <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.urea}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="potassium" className="text-xs font-bold text-[#123332]">
                  Potássio (mEq/L)
                </Label>
                <Input
                  id="potassium"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 4.2"
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
                {errors.potassium && (
                  <p className="text-[10px] text-[#D64545] font-semibold mt-1">
                    {errors.potassium}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="sodium" className="text-xs font-bold text-[#123332]">
                  Sódio (mEq/L)
                </Label>
                <Input
                  id="sodium"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 140"
                  value={sodium}
                  onChange={(e) => setSodium(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
                {errors.sodium && (
                  <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.sodium}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hemoglobin" className="text-xs font-bold text-[#123332]">
                  Hemoglobina (g/dL)
                </Label>
                <Input
                  id="hemoglobin"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 12.5"
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
                {errors.hemoglobin && (
                  <p className="text-[10px] text-[#D64545] font-semibold mt-1">
                    {errors.hemoglobin}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="gfr" className="text-xs font-bold text-[#2E9E6B]">
                  TFG (mL/min)
                </Label>
                <Input
                  id="gfr"
                  type="number"
                  step="1"
                  placeholder="Ex: 62"
                  value={gfr}
                  onChange={(e) => setGfr(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
                {errors.gfr && (
                  <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.gfr}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs font-bold text-[#123332]">
                Observações
              </Label>
              <Textarea
                id="notes"
                placeholder="Ex: Nível sérico de Tacrolimo dentro da meta."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl mt-1 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-xl h-10 px-4"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl h-10 px-6 bg-[#0E7C7B] hover:bg-[#0A5F5E] text-white font-bold"
              >
                {saving ? 'Gravando...' : 'Adicionar ao Histórico'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Exames
