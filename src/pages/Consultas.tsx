import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { appointmentsService } from '@/services/appointments'
import type { AppointmentRecord, AppointmentType } from '@/types/database'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  UtensilsCrossed,
  CheckCircle2,
  Trash2,
} from 'lucide-react'

const Consultas: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState<string>('09:00')
  const [title, setTitle] = useState<string>('')
  const [doctor, setDoctor] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [type, setType] = useState<AppointmentType>('consulta')
  const [fastingRequired, setFastingRequired] = useState<boolean>(false)
  const [notes, setNotes] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const data = await appointmentsService.getAll()
      setAppointments(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'O título é obrigatório'
    if (!date) errs.date = 'A data é obrigatória'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await appointmentsService.create({
        date,
        time: time || undefined,
        title: title.trim(),
        doctor: doctor.trim() || undefined,
        location: location.trim() || undefined,
        type,
        fasting_required: fastingRequired,
        notes: notes.trim() || undefined,
        done: false,
      })

      toast({
        title: 'Consulta/Exame agendado',
        description: 'Compromisso registrado com sucesso.',
      })

      setTitle('')
      setDoctor('')
      setLocation('')
      setNotes('')
      setFastingRequired(false)
      setModalOpen(false)

      await loadAppointments()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao agendar',
        description: 'Não foi possível gravar o compromisso.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleDone = async (id: string, currentDone: boolean) => {
    try {
      await appointmentsService.toggleDone(id, !currentDone)
      toast({
        title: !currentDone ? 'Marcada como realizada' : 'Marcada como pendente',
      })
      loadAppointments()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja excluir este agendamento?')) {
      try {
        await appointmentsService.delete(id)
        toast({ title: 'Agendamento removido' })
        loadAppointments()
      } catch (err) {
        console.error(err)
      }
    }
  }

  // Split into Upcoming and Done
  const upcomingAppointments = useMemo(() => {
    return appointments.filter((a) => !a.done)
  }, [appointments])

  const doneAppointments = useMemo(() => {
    return appointments.filter((a) => a.done)
  }, [appointments])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3EFED]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123332]">Consultas e Exames</h1>
          <p className="text-xs sm:text-sm text-[#5C7472] mt-0.5">
            Acompanhamento ambulatorial e lembretes de exames
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-2xl h-10 px-4 bg-[#0E7C7B] hover:bg-[#0A5F5E] text-white font-bold text-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nova Consulta / Exame
        </Button>
      </div>

      {/* Próximas */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-[#123332] flex items-center gap-2">
          <span>Próximas</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#D9F2F1] text-[#0A5F5E] font-bold">
            {upcomingAppointments.length}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingAppointments.map((appt) => {
            const apptDate = new Date(appt.date.split('T')[0])
            const formattedDate = apptDate.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })

            return (
              <div
                key={appt.id}
                className="p-5 rounded-3xl bg-white border border-[#E3EFED] shadow-card flex flex-col justify-between space-y-3 transition-all hover:shadow-card-hover"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                        appt.type === 'exame'
                          ? 'bg-[#EDE9FE] text-[#7C5CBF]'
                          : 'bg-[#D9F2F1] text-[#0A5F5E]'
                      }`}
                    >
                      {appt.type}
                    </span>

                    <span className="text-xs font-bold text-[#0E7C7B] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {appt.time || 'Horário livre'}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#123332]">{appt.title}</h3>

                  <div className="space-y-1 text-xs text-[#5C7472]">
                    <div className="flex items-center gap-1.5 capitalize font-medium text-[#123332]">
                      <Calendar className="w-3.5 h-3.5 text-[#0E7C7B]" />
                      {formattedDate}
                    </div>

                    {appt.doctor && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#5C7472]" />
                        {appt.doctor}
                      </div>
                    )}

                    {appt.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#5C7472]" />
                        {appt.location}
                      </div>
                    )}
                  </div>

                  {appt.fasting_required && (
                    <div className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs font-semibold flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-[#D97706] shrink-0" />
                      <span>Atenção: jejum de 8h obrigatório antes da coleta</span>
                    </div>
                  )}

                  {appt.notes && (
                    <p className="text-xs text-[#5C7472] italic bg-[#F6FBFA] p-2.5 rounded-xl border border-[#E3EFED]">
                      "{appt.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E3EFED]/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleDone(appt.id, appt.done)}
                    className="rounded-xl h-8 px-3 text-xs font-bold text-[#0E7C7B] hover:bg-[#D9F2F1]/50 border-[#0E7C7B]/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Marcar como realizada
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(appt.id)}
                    className="text-[#D64545] hover:bg-[#FDEEEE] rounded-xl h-8 w-8 p-0"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}

          {upcomingAppointments.length === 0 && (
            <div className="col-span-full p-8 rounded-3xl bg-white border border-dashed border-[#E3EFED] text-center text-xs text-[#5C7472]">
              Nenhuma consulta ou exame pendente no momento.
            </div>
          )}
        </div>
      </section>

      {/* Realizadas */}
      {doneAppointments.length > 0 && (
        <section className="space-y-3 pt-4">
          <h2 className="text-base font-bold text-[#5C7472] flex items-center gap-2">
            <span>Realizadas</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-[#5C7472] font-bold">
              {doneAppointments.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-75">
            {doneAppointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 rounded-2xl bg-white border border-[#E3EFED] flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-[#123332] line-through">{appt.title}</div>
                  <div className="text-[#5C7472] text-[11px]">
                    {new Date(appt.date.split('T')[0]).toLocaleDateString('pt-BR')} —{' '}
                    {appt.doctor || appt.location || 'Concluída'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleDone(appt.id, appt.done)}
                    className="rounded-xl h-8 px-2 text-[11px] text-[#5C7472]"
                  >
                    Desfazer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(appt.id)}
                    className="text-[#D64545] rounded-xl h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Create Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl bg-white border border-[#E3EFED]">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold text-[#123332]">
              Nova Consulta ou Exame
            </DialogTitle>
            <p className="text-xs text-[#5C7472]">
              Cadastre o compromisso na sua agenda de acompanhamento
            </p>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3 mt-3">
            <div>
              <Label htmlFor="title" className="text-xs font-bold text-[#123332]">
                Título do Compromisso *
              </Label>
              <Input
                id="title"
                placeholder="Ex: Consulta com o nefrologista"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl mt-1 h-10"
              />
              {errors.title && (
                <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date" className="text-xs font-bold text-[#123332]">
                  Data *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
                {errors.date && (
                  <p className="text-[10px] text-[#D64545] font-semibold mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="time" className="text-xs font-bold text-[#123332]">
                  Horário
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="doctor" className="text-xs font-bold text-[#123332]">
                  Médico / Especialista
                </Label>
                <Input
                  id="doctor"
                  placeholder="Ex: Dr. Carlos Menezes"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="rounded-xl mt-1 h-10"
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-xs font-bold text-[#123332]">
                  Tipo
                </Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as AppointmentType)}
                  className="w-full rounded-xl border border-[#E3EFED] bg-white px-3 py-2 text-xs font-medium text-[#123332] mt-1 h-10 focus:outline-none focus:ring-2 focus:ring-[#0E7C7B]"
                >
                  <option value="consulta">Consulta</option>
                  <option value="exame">Exame</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-xs font-bold text-[#123332]">
                Local
              </Label>
              <Input
                id="location"
                placeholder="Ex: Ambulatório de Transplante - Sala 12"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl mt-1 h-10"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#123332]">Jejum Obrigatório</div>
                <div className="text-[11px] text-[#5C7472]">
                  Ativar lembrete de jejum (ex: exame de sangue)
                </div>
              </div>
              <Switch checked={fastingRequired} onCheckedChange={setFastingRequired} />
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs font-bold text-[#123332]">
                Observações
              </Label>
              <Textarea
                id="notes"
                placeholder="Ex: Levar exames anteriores e lista de medicamentos."
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
                {saving ? 'Gravando...' : 'Salvar Compromisso'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Consultas
