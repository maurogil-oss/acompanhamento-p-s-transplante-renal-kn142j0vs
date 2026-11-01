import React from 'react'
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Users,
  Compass,
  FileCheck2,
  Lock,
  UserCheck,
  RefreshCw,
  Trash2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const SobreModelo: React.FC = () => {
  return (
    <div className="space-y-8 max-w-[900px] pb-12">
      {/* Top Banner / Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E7C7B] via-[#0D6D6C] to-[#123332] text-white p-6 sm:p-10 shadow-lg">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-white border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-[#A5F3FC]" />
            Novo Posicionamento de Cuidado
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Modelo de Acompanhamento Pós-Transplante
          </h1>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-2xl">
            Um{' '}
            <strong>
              documento vivo de estímulo e preocupação diária com os detalhes da recuperação
            </strong>
            . Mais do que um prontuário, um companheiro que acolhe, organiza a rotina e fortalece a
            parceria entre o paciente transplantado, sua família e a equipe de saúde.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link to="/cuidados">
              <Button
                type="button"
                className="rounded-2xl h-11 px-5 bg-white hover:bg-white/90 text-[#0E7C7B] font-extrabold text-xs sm:text-sm shadow-md"
              >
                Explorar Guia de Cuidados
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/compartilhamento">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl h-11 px-5 bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold text-xs sm:text-sm"
              >
                Gerenciar Compartilhamento
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-32 top-0 w-48 h-48 rounded-full bg-[#3B82F6]/10 blur-2xl pointer-events-none" />
      </section>

      {/* Visão do Produto & O que é o Modelo */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EFED] shadow-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D9F2F1] text-[#0E7C7B] flex items-center justify-center shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#123332]">
              O que é o Modelo de Acompanhamento?
            </h2>
            <p className="text-xs sm:text-sm text-[#5C7472]">
              O propósito que guia cada funcionalidade desta ferramenta
            </p>
          </div>
        </div>

        <p className="text-sm text-[#5C7472] leading-relaxed">
          O transplante renal marca o início de uma nova jornada que exige disciplina, atenção
          afetuosa aos sinais do corpo e uma rotina rigorosa de imunossupressão. O{' '}
          <strong>Modelo de Acompanhamento</strong>
          nasceu para transformar a ansiedade pós-alta em segurança e clareza, oferecendo ao
          transplantado um painel simples para registrar aferições (pressão, glicemia, temperatura,
          água e urina), sem burocracia e com foco absoluto na continuidade do enxerto.
        </p>

        <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#0E7C7B] shrink-0 mt-0.5" />
          <p className="text-xs text-[#5C7472] leading-relaxed">
            <strong>Lembrete permanente:</strong> Este documento tem caráter informativo, educativo
            e de apoio ao autocuidado. Ele{' '}
            <em>
              nunca diagnostica, prescreve ou substitui as consultas presenciais e a orientação
              soberana da sua equipe médica
            </em>
            . Em caso de qualquer dúvida ou alteração, fale sempre com sua equipe de transplante.
          </p>
        </div>
      </section>

      {/* Os 3 Princípios Fundamentais */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#123332]">
            Princípios Fundamentais do Modelo
          </h2>
          <p className="text-xs sm:text-sm text-[#5C7472]">
            Os pilares éticos e práticos que sustentam a aplicação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Princípio 1 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E3EFED] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D9F2F1] text-[#0E7C7B] flex items-center justify-center font-extrabold text-base">
              1
            </div>
            <h3 className="text-base font-extrabold text-[#123332]">
              Documenta e estimula, nunca diagnostica
            </h3>
            <p className="text-xs text-[#5C7472] leading-relaxed">
              O aplicativo apoia o paciente a manter a rotina diária sem esquecimentos e a notar
              oscilações com antecedência. Não emite diagnósticos nem sugere trocas de dose; indica
              com respeito quando um valor merece comunicação imediata com o médico.
            </p>
          </div>

          {/* Princípio 2 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E3EFED] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] text-[#7C5CBF] flex items-center justify-center font-extrabold text-base">
              2
            </div>
            <h3 className="text-base font-extrabold text-[#123332]">
              O paciente no controle soberano dos dados
            </h3>
            <p className="text-xs text-[#5C7472] leading-relaxed">
              Privacidade em primeiro lugar. O usuário é o titular absoluto de todas as suas
              medições de saúde. Pode usar o app de forma totalmente isolada ou decidir com quem
              deseja compartilhar seus registros, revogando qualquer acesso com um único clique.
            </p>
          </div>

          {/* Princípio 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E3EFED] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF7EE] text-[#2E9E6B] flex items-center justify-center font-extrabold text-base">
              3
            </div>
            <h3 className="text-base font-extrabold text-[#123332]">
              A família e cuidadores como aliados
            </h3>
            <p className="text-xs text-[#5C7472] leading-relaxed">
              O pós-transplante é um esforço coletivo de amor e cumplicidade. O modelo possibilita
              que pessoas de confiança acompanhem a evolução e os horários dos remédios através de
              links seguros de leitura, fortalecendo a rede de suporte.
            </p>
          </div>
        </div>
      </section>

      {/* Fases do Modelo */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EFED] shadow-card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D9F2F1] text-[#0E7C7B] flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#123332]">
              Fases de Evolução do Projeto
            </h2>
            <p className="text-xs sm:text-sm text-[#5C7472]">
              O caminho planejado para transformar este modelo em referência universal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#EBF7F6] border-2 border-[#0E7C7B] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#0E7C7B] text-white">
                Fase Atual
              </span>
              <FileCheck2 className="w-4 h-4 text-[#0E7C7B]" />
            </div>
            <h4 className="text-sm font-bold text-[#123332]">Fase 1: Pós-Transplante Renal</h4>
            <p className="text-xs text-[#5C7472] leading-relaxed">
              Piloto completo e focado nos primeiros meses e anos após a cirurgia do rim: controle
              de 4 slots de medições diárias, rotina de imunossupressores, alertas preventivos e
              acompanhamento laboratorial.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-2 opacity-90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E3EFED] text-[#5C7472]">
                Em Planejamento
              </span>
              <Users className="w-4 h-4 text-[#5C7472]" />
            </div>
            <h4 className="text-sm font-bold text-[#123332]">Fase 2: Pré-Transplante Renal</h4>
            <p className="text-xs text-[#5C7472] leading-relaxed">
              Acolhimento aos pacientes em diálise e lista de espera, com preparação de exames
              periódicos, controle de peso interdialítico, vacinação e prontidão para a convocação
              cirúrgica.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-2 opacity-90">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E3EFED] text-[#5C7472]">
                Visão Futura
              </span>
              <Sparkles className="w-4 h-4 text-[#5C7472]" />
            </div>
            <h4 className="text-sm font-bold text-[#123332]">Fase 3: Plataforma Universal</h4>
            <p className="text-xs text-[#5C7472] leading-relaxed">
              Expansão multi-paciente acessível e gratuita aos pacientes através de parcerias com
              centros hospitalares e entidades de apoio à saúde renal no Brasil.
            </p>
          </div>
        </div>
      </section>

      {/* Seção Direitos do Titular LGPD */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EFED] shadow-card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EAF7EE] text-[#2E9E6B] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#123332]">
              Seus Direitos como Titular de Dados de Saúde (LGPD)
            </h2>
            <p className="text-xs sm:text-sm text-[#5C7472]">
              Transparência total sob o Artigo 11 da Lei nº 13.709/2018
            </p>
          </div>
        </div>

        <p className="text-sm text-[#5C7472] leading-relaxed">
          Seus dados de saúde são classificados como dados pessoais sensíveis. Nós tratamos essas
          informações com o mais alto rigor ético e técnico, assegurando a você os seguintes
          direitos fundamentais garantidos pela lei:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-1.5">
            <div className="text-sm font-bold text-[#123332] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#0E7C7B]" />
              Direito de Acesso e Confirmação
            </div>
            <p className="text-xs text-[#5C7472] leading-relaxed">
              Você tem acesso visual irrestrito a todos os dados armazenados a qualquer momento
              diretamente no app.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-1.5">
            <div className="text-sm font-bold text-[#123332] flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#0E7C7B]" />
              Direito de Correção
            </div>
            <p className="text-xs text-[#5C7472] leading-relaxed">
              Você pode editar, corrigir e atualizar qualquer medição, dose ou data registrada de
              forma rápida.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-1.5">
            <div className="text-sm font-bold text-[#123332] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0E7C7B]" />
              Revogação do Consentimento
            </div>
            <p className="text-xs text-[#5C7472] leading-relaxed">
              Na aba <strong>Compartilhamento</strong>, você pode desativar o link de qualquer
              pessoa autorizada a qualquer instante, cortando o acesso imediatamente.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] space-y-1.5">
            <div className="text-sm font-bold text-[#123332] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#D64545]" />
              Direito de Exclusão dos Dados
            </div>
            <p className="text-xs text-[#5C7472] leading-relaxed">
              Na aba <strong>Ajustes</strong>, você encontra a opção clara para solicitar a exclusão
              de todos os seus dados.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SobreModelo
