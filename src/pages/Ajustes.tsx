import React, { useState, useEffect } from 'react'
import { useAppSettings } from '@/contexts/SettingsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import {
  User,
  Calendar,
  Weight,
  Droplets,
  Phone,
  Save,
  ShieldCheck,
  HeartPulse,
  Trash2,
  Lock,
  Mail,
  HelpCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const Ajustes: React.FC = () => {
  const { settings, updateSettings } = useAppSettings()

  const [patientName, setPatientName] = useState('')
  const [transplantDate, setTransplantDate] = useState('')
  const [dischargeDate, setDischargeDate] = useState('')
  const [baselineWeightKg, setBaselineWeightKg] = useState('')
  const [dailyWaterGoalMl, setDailyWaterGoalMl] = useState('')
  const [contact1Name, setContact1Name] = useState('')
  const [contact1Phone, setContact1Phone] = useState('')
  const [contact2Name, setContact2Name] = useState('')
  const [contact2Phone, setContact2Phone] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (settings) {
      setPatientName(settings.patient_name || '')
      setTransplantDate(settings.transplant_date ? settings.transplant_date.split('T')[0] : '')
      setDischargeDate(settings.discharge_date ? settings.discharge_date.split('T')[0] : '')
      setBaselineWeightKg(settings.baseline_weight_kg ? String(settings.baseline_weight_kg) : '')
      setDailyWaterGoalMl(settings.daily_water_goal_ml ? String(settings.daily_water_goal_ml) : '')
      setContact1Name(settings.emergency_contact_1_name || '')
      setContact1Phone(settings.emergency_contact_1_phone || '')
      setContact2Name(settings.emergency_contact_2_name || '')
      setContact2Phone(settings.emergency_contact_2_phone || '')
    }
  }, [settings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome do paciente.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      await updateSettings({
        patient_name: patientName.trim(),
        transplant_date: transplantDate,
        discharge_date: dischargeDate,
        baseline_weight_kg: Number(baselineWeightKg) || 78.4,
        daily_water_goal_ml: Number(dailyWaterGoalMl) || 2500,
        emergency_contact_1_name: contact1Name.trim(),
        emergency_contact_1_phone: contact1Phone.trim(),
        emergency_contact_2_name: contact2Name.trim(),
        emergency_contact_2_phone: contact2Phone.trim(),
      })

      toast({
        title: 'Ajustes salvos',
        description: 'Suas configurações pessoais foram atualizadas com sucesso.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível gravar os ajustes.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-[760px]">
      {/* Header */}
      <div className="pb-2 border-b border-[#E3EFED]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123332]">Ajustes do Paciente</h1>
        <p className="text-xs sm:text-sm text-[#5C7472] mt-0.5">
          Parâmetros basais de alta, metas diárias e telefones de emergência
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identificação e Datas */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#123332]">
            <User className="w-4 h-4 text-[#0E7C7B]" />
            <span>Dados do Paciente e Transplante</span>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="patientName" className="text-xs font-bold text-[#123332]">
                Nome do Paciente
              </Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="rounded-xl mt-1 h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="transplantDate" className="text-xs font-bold text-[#123332]">
                  Data do Transplante
                </Label>
                <Input
                  id="transplantDate"
                  type="date"
                  value={transplantDate}
                  onChange={(e) => setTransplantDate(e.target.value)}
                  className="rounded-xl mt-1 h-11"
                />
              </div>

              <div>
                <Label htmlFor="dischargeDate" className="text-xs font-bold text-[#123332]">
                  Data da Alta Hospitalar
                </Label>
                <Input
                  id="dischargeDate"
                  type="date"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  className="rounded-xl mt-1 h-11"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Metas e Basais */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#123332]">
            <HeartPulse className="w-4 h-4 text-[#0E7C7B]" />
            <span>Metas e Referências Clínicas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="baselineWeight"
                className="text-xs font-bold text-[#123332] flex items-center gap-1.5"
              >
                <Weight className="w-3.5 h-3.5 text-[#0E7C7B]" />
                Peso Basal de Alta (kg)
              </Label>
              <Input
                id="baselineWeight"
                type="number"
                step="0.1"
                value={baselineWeightKg}
                onChange={(e) => setBaselineWeightKg(e.target.value)}
                className="rounded-xl mt-1 h-11"
              />
              <p className="text-[11px] text-[#5C7472] mt-1">
                Referência para cálculo do delta de peso diário.
              </p>
            </div>

            <div>
              <Label
                htmlFor="waterGoal"
                className="text-xs font-bold text-[#123332] flex items-center gap-1.5"
              >
                <Droplets className="w-3.5 h-3.5 text-[#3B82F6]" />
                Meta Diária de Água (ml)
              </Label>
              <Input
                id="waterGoal"
                type="number"
                step="100"
                value={dailyWaterGoalMl}
                onChange={(e) => setDailyWaterGoalMl(e.target.value)}
                className="rounded-xl mt-1 h-11"
              />
              <p className="text-[11px] text-[#5C7472] mt-1">
                Volume recomendado pela equipe médica (ex: 2.500 ml).
              </p>
            </div>
          </div>
        </section>

        {/* Contatos de Emergência */}
        <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#123332]">
            <Phone className="w-4 h-4 text-[#D64545]" />
            <span>Contatos de Emergência (Plantão / Médico)</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E7C7B]">
                Contato Principal
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="c1Name" className="text-xs text-[#5C7472]">
                    Nome ou Identificação
                  </Label>
                  <Input
                    id="c1Name"
                    placeholder="Ex: Plantão do Hospital — Transplante"
                    value={contact1Name}
                    onChange={(e) => setContact1Name(e.target.value)}
                    className="rounded-xl mt-1 h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="c1Phone" className="text-xs text-[#5C7472]">
                    Telefone de Discagem Rápida
                  </Label>
                  <Input
                    id="c1Phone"
                    placeholder="Ex: (41) 3111-2000"
                    value={contact1Phone}
                    onChange={(e) => setContact1Phone(e.target.value)}
                    className="rounded-xl mt-1 h-10 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E7C7B]">
                Contato Secundário
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="c2Name" className="text-xs text-[#5C7472]">
                    Nome ou Especialista
                  </Label>
                  <Input
                    id="c2Name"
                    placeholder="Ex: Dra. Renata (Nefrologista)"
                    value={contact2Name}
                    onChange={(e) => setContact2Name(e.target.value)}
                    className="rounded-xl mt-1 h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="c2Phone" className="text-xs text-[#5C7472]">
                    Telefone de Discagem Rápida
                  </Label>
                  <Input
                    id="c2Phone"
                    placeholder="Ex: (41) 99876-5432"
                    value={contact2Phone}
                    onChange={(e) => setContact2Phone(e.target.value)}
                    className="rounded-xl mt-1 h-10 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Persistence Note */}
        <div className="p-4 rounded-2xl bg-[#D9F2F1]/50 border border-[#BCE4E2] flex items-center gap-3 text-xs text-[#0A5F5E]">
          <ShieldCheck className="w-5 h-5 shrink-0 text-[#0E7C7B]" />
          <span>
            App pessoal sob a LGPD (Art. 11) — seus dados ficam armazenados de forma restrita e você
            tem controle total sobre compartilhamento e eliminação.
          </span>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="rounded-2xl h-12 px-8 bg-[#0E7C7B] hover:bg-[#0A5F5E] text-white font-bold text-sm shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Gravando ajustes...' : 'Salvar Ajustes'}
          </Button>
        </div>
      </form>

      {/* Privacidade e Direitos LGPD - Exclusão de Dados */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E3EFED] shadow-card space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[#123332]">
          <Lock className="w-4 h-4 text-[#0E7C7B]" />
          <span>Privacidade e Gestão de Dados (LGPD)</span>
        </div>

        <p className="text-xs text-[#5C7472] leading-relaxed">
          Como titular dos dados de saúde registrados neste aplicativo, você pode exercer a qualquer
          momento seu direito de solicitar a eliminação definitiva de todos os registros
          armazenados.
        </p>

        <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FFF5F5] border border-[#FAD2D2]">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-[#992626] flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-[#D64545]" />
              Exclusão definitiva das informações
            </div>
            <div className="text-[11px] text-[#992626]/80">
              Remove todas as medições, exames, medicamentos e acessos compartilhados.
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteModalOpen(true)}
            className="rounded-xl h-9 px-4 text-xs font-bold border-[#FAD2D2] text-[#D64545] hover:bg-[#FDEEEE] bg-white self-stretch sm:self-auto"
          >
            Solicitar exclusão dos meus dados
          </Button>
        </div>
      </section>

      {/* Modal explicativo de solicitação de exclusão */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-[#FDEEEE] text-[#D64545] flex items-center justify-center mb-2">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-extrabold text-[#123332]">
              Solicitar exclusão dos meus dados
            </DialogTitle>
            <DialogDescription className="text-xs text-[#5C7472] leading-relaxed pt-1">
              Em conformidade com a Lei Geral de Proteção de Dados (Art. 18, VI da LGPD), você tem o
              direito de requerer a eliminação completa e irreversível dos dados tratados neste
              aplicativo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs text-[#5C7472]">
            <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-2">
              <div className="font-bold text-[#123332] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#0E7C7B]" />
                Como funciona o processo de exclusão:
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-[11px] leading-relaxed">
                <li>
                  Você pode primeiro <strong>revogar todos os compartilhamentos ativos</strong>{' '}
                  imediatamente na página <strong>Compartilhamento</strong>.
                </li>
                <li>
                  Para a exclusão completa do banco de dados do seu paciente, entre em contato com o
                  canal de privacidade do projeto:
                </li>
              </ul>
              <div className="p-2.5 rounded-xl bg-white border border-[#E3EFED] flex items-center gap-2 font-mono text-[11px] text-[#0E7C7B]">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="font-bold">privacidade@postransplante.app.br</span>
              </div>
              <p className="text-[11px] text-[#5C7472]">
                Informando o nome do paciente (
                <strong>{settings?.patient_name || 'Paciente'}</strong>). A exclusão dos registros
                no banco é processada em até 5 dias úteis.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-xl h-10 w-full sm:w-auto text-xs font-bold"
            >
              Fechar
            </Button>
            <Button
              type="button"
              onClick={() => {
                toast({
                  title: 'Orientações enviadas',
                  description: 'Siga os passos acima ou utilize o canal de privacidade indicado.',
                })
                setDeleteModalOpen(false)
              }}
              className="rounded-xl h-10 w-full sm:w-auto bg-[#0E7C7B] hover:bg-[#0A5F5E] text-white text-xs font-bold"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Ajustes
