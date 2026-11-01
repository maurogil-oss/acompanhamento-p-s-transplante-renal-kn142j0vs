import React, { useState } from 'react'
import {
  ShieldCheck,
  HeartPulse,
  Share2,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
  Trash2,
  RefreshCw,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LgpdConsentModalProps {
  open: boolean
  onAccept: () => void
  loading?: boolean
}

export const LgpdConsentModal: React.FC<LgpdConsentModalProps> = ({
  open,
  onAccept,
  loading = false,
}) => {
  const [showRights, setShowRights] = useState(false)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-[#0E2726]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E3EFED] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header destaque de saúde */}
        <div className="bg-gradient-to-r from-[#0E7C7B] to-[#125857] text-white p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 text-white mb-1">
                Privacidade & Dados de Saúde • Art. 11 LGPD
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
                Termo de Consentimento Livre e Esclarecido
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-white/90 mt-3 leading-relaxed">
            Seja bem-vindo(a) ao <strong>Modelo de Acompanhamento Pós-Transplante Renal</strong>.
            Antes de começar, precisamos da sua autorização expressa e destacada para tratar seus
            dados pessoais sensíveis de saúde, com total transparência e respeito aos seus direitos.
          </p>
        </div>

        {/* Corpo com finalidades separadas */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5C7472] mb-3">
              Finalidades específicas do tratamento dos seus dados:
            </h3>

            <div className="space-y-3">
              {/* Finalidade A */}
              <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#D9F2F1] text-[#0E7C7B] flex items-center justify-center shrink-0 mt-0.5">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#123332]">
                    (a) Registrar o dia a dia da sua recuperação
                  </div>
                  <p className="text-xs text-[#5C7472] leading-relaxed">
                    Armazenamento seguro de aferições diárias (pressão arterial, glicemia,
                    temperatura, diurese e ingestão de água), rotina de medicamentos
                    imunossupressores e histórico de exames laboratoriais e consultas médicas.
                  </p>
                </div>
              </div>

              {/* Finalidade B */}
              <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#D9F2F1] text-[#0E7C7B] flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#123332]">
                    (b) Compartilhamento voluntário sob o seu controle
                  </div>
                  <p className="text-xs text-[#5C7472] leading-relaxed">
                    Você decide se quer e com quem quer compartilhar seus dados (médicos da equipe,
                    familiares ou cuidadores). Cada acesso é gerado individualmente por você e pode
                    ser revogado a qualquer instante na página <strong>Compartilhamento</strong>.
                  </p>
                </div>
              </div>

              {/* Finalidade C */}
              <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#D9F2F1] text-[#0E7C7B] flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#123332]">
                    (c) Exibição exclusiva para quem você autorizar
                  </div>
                  <p className="text-xs text-[#5C7472] leading-relaxed">
                    A visualização em tempo real só ocorre mediante o código de acesso exclusivo
                    emitido por você. Sem anúncios, sem venda de dados e sem repasse a terceiros não
                    autorizados.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Destaque importante: autonomia do titular */}
          <div className="p-4 rounded-2xl bg-[#EBF7F6] border border-[#BCE4E2] text-xs text-[#0A5F5E] space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#0E7C7B]" />
              Sua total liberdade e autonomia
            </div>
            <p className="leading-relaxed">
              Você pode usar o aplicativo normalmente{' '}
              <strong>sem compartilhar seus dados com ninguém</strong>. Além disso, pode revogar
              acessos a qualquer momento na página <strong>Compartilhamento</strong> e solicitar a
              exclusão definitiva dos seus dados na página <strong>Ajustes</strong>.
            </p>
          </div>

          {/* Seção retrátil: Direitos do Titular LGPD */}
          <div className="border border-[#E3EFED] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRights(!showRights)}
              className="w-full p-3.5 sm:p-4 bg-white hover:bg-[#F6FBFA] flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0E7C7B]">
                <FileText className="w-4 h-4" />
                <span>Ler mais sobre seus direitos (Lei Geral de Proteção de Dados)</span>
              </div>
              {showRights ? (
                <ChevronUp className="w-4 h-4 text-[#0E7C7B]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#0E7C7B]" />
              )}
            </button>

            {showRights && (
              <div className="p-4 bg-[#F6FBFA] border-t border-[#E3EFED] space-y-3 text-xs text-[#5C7472]">
                <p className="leading-relaxed">
                  Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), você é o
                  único titular dos seus dados e tem os seguintes direitos garantidos em linguagem
                  simples:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E3EFED] space-y-1">
                    <div className="font-bold text-[#123332] flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#0E7C7B]" />
                      Direito de Acesso e Confirmação
                    </div>
                    <p className="text-[11px]">
                      Você visualiza todos os dados registrados a qualquer instante nas telas do
                      aplicativo.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E3EFED] space-y-1">
                    <div className="font-bold text-[#123332] flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-[#0E7C7B]" />
                      Direito de Correção
                    </div>
                    <p className="text-[11px]">
                      Pode editar e retificar qualquer medição, dose de medicamento ou exame a
                      qualquer hora.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E3EFED] space-y-1">
                    <div className="font-bold text-[#123332] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#0E7C7B]" />
                      Revogação do Consentimento
                    </div>
                    <p className="text-[11px]">
                      Você pode interromper o compartilhamento ou desativar acessos compartilhados
                      imediatamente.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E3EFED] space-y-1">
                    <div className="font-bold text-[#123332] flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-[#D64545]" />
                      Exclusão e Eliminação
                    </div>
                    <p className="text-[11px]">
                      Pode requerer a eliminação completa dos seus dados armazenados em Ajustes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com botão único de aceite */}
        <div className="p-4 sm:p-6 bg-[#F6FBFA] border-t border-[#E3EFED] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-[#5C7472] text-center sm:text-left">
            Ao clicar, seu aceite com data e hora fica registrado de forma segura.
          </div>
          <Button
            type="button"
            onClick={onAccept}
            disabled={loading}
            className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-[#0E7C7B] hover:bg-[#0A5F5E] text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            {loading ? 'Registrando...' : 'Aceito e quero continuar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
