import React, { useState, useEffect, useCallback } from 'react'
import { sharedAccessService } from '@/services/sharedAccess'
import type { SharedAccessRecord, SharedAccessRole } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Share2,
  Plus,
  Copy,
  Check,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  Users,
  Eye,
  Trash2,
  Power,
  ExternalLink,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export const Compartilhamento: React.FC = () => {
  const [invites, setInvites] = useState<SharedAccessRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [role, setRole] = useState<SharedAccessRole>('medico')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const loadInvites = useCallback(async () => {
    try {
      setLoading(true)
      const data = await sharedAccessService.getAll()
      setInvites(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvites()
  }, [loadInvites])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome do médico, familiar ou autorizado.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const created = await sharedAccessService.create({
        name: name.trim(),
        role,
        notes: notes.trim(),
      })
      toast({
        title: 'Convite criado',
        description: `Código ${created.code} gerado para ${created.name}.`,
      })
      setName('')
      setNotes('')
      setRole('medico')
      setModalOpen(false)
      loadInvites()
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao criar convite',
        description: 'Não foi possível gerar o código de acesso.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (invite: SharedAccessRecord) => {
    try {
      const nextActive = !invite.active
      await sharedAccessService.toggleActive(invite.id, nextActive)
      toast({
        title: nextActive ? 'Acesso ativado' : 'Acesso revogado',
        description: `O link para ${invite.name} agora está ${nextActive ? 'ativo' : 'desativado'}.`,
      })
      loadInvites()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (invite: SharedAccessRecord) => {
    if (!window.confirm(`Remover definitivamente o acesso de ${invite.name}?`)) return
    try {
      await sharedAccessService.delete(invite.id)
      toast({
        title: 'Acesso excluído',
        description: `O convite de ${invite.name} foi removido.`,
      })
      loadInvites()
    } catch (err) {
      console.error(err)
    }
  }

  const getShareUrl = (code: string) => {
    return `${window.location.origin}/acesso/${code}`
  }

  const handleCopyLink = (code: string) => {
    const url = getShareUrl(code)
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    toast({
      title: 'Link copiado!',
      description: 'Envie o link para a pessoa autorizada.',
    })
    setTimeout(() => setCopiedCode(null), 2500)
  }

  return (
    <div className="space-y-6 max-w-[860px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E3EFED]/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123332]">
              Compartilhamento Seguro
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#D9F2F1] text-[#0A5F5E]">
              Sem login
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5C7472] mt-0.5">
            Gere links com visão somente leitura para médicos, familiares e pessoas autorizadas
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-2xl h-11 px-5 bg-[#0E7C7B] hover:bg-[#0A5F5E] text-white font-bold text-sm shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Convite
        </Button>
      </div>

      {/* Explanatory Banner */}
      <div className="bg-[#EAF7EE] p-4 sm:p-5 rounded-3xl border border-[#C5ECD0] flex items-start gap-3.5 text-xs text-[#1E6B48]">
        <ShieldCheck className="w-5 h-5 text-[#2E9E6B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-sm">Privacidade e controle total</p>
          <p>
            O destinatário recebe um link exclusivo para consultar o acompanhamento clínico em modo{' '}
            <strong>somente leitura</strong> (sem botões de alteração ou exclusão). Você pode
            desativar ou revogar o acesso a qualquer instante.
          </p>
        </div>
      </div>

      {/* Active Invites List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#123332] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0E7C7B]" />
          Convites e Autorizações ({invites.length})
        </h2>

        <div className="grid grid-cols-1 gap-3.5">
          {invites.map((invite) => {
            const roleBadge =
              invite.role === 'medico'
                ? { label: 'Médico', bg: 'bg-[#EDE9FE] text-[#7C5CBF]', icon: Stethoscope }
                : invite.role === 'familiar'
                  ? { label: 'Familiar', bg: 'bg-[#D9F2F1] text-[#0A5F5E]', icon: Users }
                  : { label: 'Autorizado', bg: 'bg-amber-100 text-amber-800', icon: UserCheck }
            const RoleIcon = roleBadge.icon
            const url = getShareUrl(invite.code)

            return (
              <div
                key={invite.id}
                className={`p-5 rounded-3xl border transition-all ${
                  invite.active
                    ? 'bg-white border-[#E3EFED] shadow-card'
                    : 'bg-gray-50/70 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-extrabold text-[#123332]">{invite.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${roleBadge.bg}`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {roleBadge.label}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          invite.active
                            ? 'bg-[#EAF7EE] text-[#2E9E6B]'
                            : 'bg-[#FDEEEE] text-[#D64545]'
                        }`}
                      >
                        {invite.active ? 'Ativo' : 'Revogado'}
                      </span>
                    </div>

                    <div className="text-xs text-[#5C7472] flex items-center gap-2 pt-0.5 font-mono">
                      <span>
                        Código: <strong>{invite.code}</strong>
                      </span>
                      {invite.notes && (
                        <span className="italic font-sans text-gray-500">• {invite.notes}</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(invite.code)}
                      className="rounded-xl h-9 px-3 text-xs font-bold text-[#0E7C7B] border-[#0E7C7B]/30 hover:bg-[#D9F2F1]/50"
                    >
                      {copiedCode === invite.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5 text-[#2E9E6B]" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          Copiar Link
                        </>
                      )}
                    </Button>

                    <a
                      href={`/acesso/${invite.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl h-9 px-3 text-xs font-semibold text-[#5C7472] hover:text-[#123332] hover:bg-gray-100 border border-[#E3EFED]"
                      title="Testar visão pública"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Visualizar
                    </a>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(invite)}
                      className={`rounded-xl h-9 px-2.5 text-xs font-semibold ${
                        invite.active
                          ? 'text-[#D64545] hover:bg-[#FDEEEE]'
                          : 'text-[#2E9E6B] hover:bg-[#EAF7EE]'
                      }`}
                      title={invite.active ? 'Revogar acesso' : 'Reativar acesso'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(invite)}
                      className="rounded-xl h-9 px-2 text-xs text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Excluir convite"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Direct Link Preview Bar */}
                <div className="mt-3 pt-3 border-t border-[#E3EFED]/60 flex items-center justify-between text-[11px] text-[#5C7472]">
                  <span className="truncate max-w-[85%] font-mono select-all">{url}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    Somente Leitura
                  </span>
                </div>
              </div>
            )
          })}

          {invites.length === 0 && !loading && (
            <div className="bg-white rounded-3xl p-8 border border-[#E3EFED] text-center space-y-3">
              <Share2 className="w-10 h-10 text-[#5C7472] mx-auto opacity-40" />
              <h3 className="text-base font-bold text-[#123332]">Nenhum acesso compartilhado</h3>
              <p className="text-xs text-[#5C7472] max-w-sm mx-auto">
                Crie um convite para permitir que seu médico ou familiares acompanhem suas medições
                e rotinas sem necessidade de cadastro.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Convite */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 rounded-3xl bg-white border border-[#E3EFED]">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold text-[#123332]">
              Novo Convite de Acesso
            </DialogTitle>
            <p className="text-xs text-[#5C7472]">
              Gere um código exclusivo para compartilhar seu prontuário em modo leitura.
            </p>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="invName" className="text-xs font-bold text-[#123332]">
                Nome da Pessoa ou Instituição *
              </Label>
              <Input
                id="invName"
                placeholder="Ex: Dra. Mariana, Hospital São Vicente, Família..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl mt-1 h-11"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-[#123332] block">Perfil de Relação *</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {[
                  {
                    value: 'medico' as SharedAccessRole,
                    label: 'Médico / Equipe',
                    desc: 'Acesso total a exames',
                  },
                  {
                    value: 'familiar' as SharedAccessRole,
                    label: 'Familiar',
                    desc: 'Painel e rotinas',
                  },
                  { value: 'outro' as SharedAccessRole, label: 'Outro', desc: 'Resumo geral' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRole(item.value)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      role === item.value
                        ? 'bg-[#0E7C7B] text-white border-[#0E7C7B] shadow-sm font-bold'
                        : 'bg-[#F6FBFA] border-[#E3EFED] text-[#123332] hover:bg-white'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${role === item.value ? 'text-white/80' : 'text-[#5C7472]'}`}
                    >
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="invNotes" className="text-xs font-bold text-[#123332]">
                Observações (Opcional)
              </Label>
              <Textarea
                id="invNotes"
                placeholder="Ex: Consulta de retorno dia 15..."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl mt-1 text-xs resize-none"
              />
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
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
                {saving ? 'Gerando...' : 'Gerar Convite'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Compartilhamento
