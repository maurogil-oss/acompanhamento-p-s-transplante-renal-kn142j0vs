import React from 'react'
import {
  Sparkles,
  ShieldAlert,
  Utensils,
  Pill,
  CalendarCheck,
  AlertTriangle,
  Info,
  Droplets,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const Cuidados: React.FC = () => {
  return (
    <div className="space-y-6 max-w-[850px] pb-12">
      {/* Header */}
      <div className="pb-2 border-b border-[#E3EFED]/60">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9F2F1] text-[#0A5F5E] text-xs font-bold mb-2">
          <HeartHandshake className="w-3.5 h-3.5 text-[#0E7C7B]" />
          Módulo Educativo de Recuperação
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123332]">
          Cuidados no Pós-Transplante
        </h1>
        <p className="text-xs sm:text-sm text-[#5C7472] mt-0.5">
          Orientações gerais, estímulos e rotinas de proteção ao novo rim
        </p>
      </div>

      {/* AVISO OBRIGATÓRIO NO TOPO DA PÁGINA */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFBEB] border-2 border-[#FDE68A] text-[#92400E] flex items-start gap-3.5 shadow-sm">
        <div className="w-9 h-9 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#B45309]">
            Aviso Importante
          </div>
          <p className="text-xs sm:text-sm leading-relaxed font-semibold">
            Este material é educativo e informativo. Ele não substitui a orientação da sua equipe
            médica.
          </p>
          <p className="text-[11px] sm:text-xs text-[#92400E]/90 leading-relaxed">
            As orientações aqui reunidas têm como objetivo reforçar os cuidados básicos e esclarecer
            dúvidas frequentes da recuperação. Em caso de dúvida, fale sempre com sua equipe de
            transplante.
          </p>
        </div>
      </div>

      {/* Accordion dos Tópicos de Cuidado */}
      <Accordion type="single" collapsible defaultValue="sinais-alerta" className="space-y-4">
        {/* Tópico 1: Sinais que exigem comunicação imediata */}
        <AccordionItem
          value="sinais-alerta"
          className="bg-white rounded-3xl border border-[#FAD2D2] shadow-card px-5 sm:px-6 overflow-hidden data-[state=open]:ring-2 data-[state=open]:ring-[#D64545]/20"
        >
          <AccordionTrigger className="hover:no-underline py-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDEEEE] text-[#D64545] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-extrabold text-[#123332]">
                  Sinais que exigem comunicação imediata com a equipe
                </div>
                <div className="text-xs text-[#D64545] font-semibold mt-0.5">
                  Febre, queda de urina, inchaço súbito ou dor no enxerto
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-4 text-xs sm:text-sm text-[#5C7472]">
            <p className="leading-relaxed">
              O organismo dá sinais quando algo precisa de avaliação clínica rápida. Nos primeiros
              meses, sua equipe de transplante costuma recomendar contato imediato ao notar qualquer
              um dos seguintes sintomas:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#FDEEEE]/50 border border-[#FAD2D2] space-y-1">
                <div className="font-bold text-[#992626] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D64545]" />
                  Febre (temperatura ≥ 37,8°C)
                </div>
                <p className="text-xs leading-relaxed text-[#992626]/90">
                  Mesmo sem outros sintomas gripais ou dor, comunique seu médico antes de tomar
                  antitérmicos por conta própria.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FDEEEE]/50 border border-[#FAD2D2] space-y-1">
                <div className="font-bold text-[#992626] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D64545]" />
                  Redução acentuada da urina
                </div>
                <p className="text-xs leading-relaxed text-[#992626]/90">
                  Queda expressiva no volume urinário diário ou diurese muito escura merece aviso
                  rápido à equipe.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FDEEEE]/50 border border-[#FAD2D2] space-y-1">
                <div className="font-bold text-[#992626] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D64545]" />
                  Dor ou inchaço no local do enxerto
                </div>
                <p className="text-xs leading-relaxed text-[#992626]/90">
                  Sensibilidade aumentada, calor ou endurecimento na região onde o novo rim foi
                  implantado.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FDEEEE]/50 border border-[#FAD2D2] space-y-1">
                <div className="font-bold text-[#992626] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D64545]" />
                  Ganho súbito de peso ou inchaço
                </div>
                <p className="text-xs leading-relaxed text-[#992626]/90">
                  Aumento rápido de peso de um dia para o outro acompanhado de inchaço nos
                  tornozelos, pernas ou rosto.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6FBFA] border border-[#E3EFED] font-semibold text-[#123332] text-xs">
              Tenha sempre à mão o telefone do plantão de transplante cadastrado em{' '}
              <strong>Ajustes</strong> ou no botão de emergência.
            </div>

            <p className="text-xs font-bold text-[#0E7C7B] italic pt-1">
              Em caso de dúvida, fale sempre com sua equipe de transplante.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Tópico 2: Medicamentos e Imunossupressores */}
        <AccordionItem
          value="medicamentos"
          className="bg-white rounded-3xl border border-[#E3EFED] shadow-card px-5 sm:px-6 overflow-hidden data-[state=open]:ring-2 data-[state=open]:ring-[#0E7C7B]/20"
        >
          <AccordionTrigger className="hover:no-underline py-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D9F2F1] text-[#0E7C7B] flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-extrabold text-[#123332]">
                  Medicamentos e rotina de imunossupressores
                </div>
                <div className="text-xs text-[#5C7472] mt-0.5">
                  Horários rigorosos, nunca pular dose e evitar interações
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-4 text-xs sm:text-sm text-[#5C7472]">
            <p className="leading-relaxed">
              Os medicamentos imunossupressores protegem o rim transplantado. Para que funcionem da
              forma esperada, recomenda-se construir uma rotina diária estável e organizada:
            </p>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0E7C7B] shrink-0 mt-0.5" />
                <span>
                  <strong>Pontualidade dos horários:</strong> costuma-se orientar tomar os
                  imunossupressores (ex: tacrolimo, ciclosporina, micofenolato) sempre nos mesmos
                  horários (intervalos exatos de 12 em 12 horas).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0E7C7B] shrink-0 mt-0.5" />
                <span>
                  <strong>Nunca pular dose:</strong> se esquecer uma dose, nunca dobre a dose
                  seguinte sem orientação expressa da sua equipe médica. Comunique o plantão para
                  saber como proceder.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0E7C7B] shrink-0 mt-0.5" />
                <span>
                  <strong>Não interromper por conta própria:</strong> mesmo se sentir efeitos
                  colaterais (tremores, dor de estômago), não pare o medicamento. A equipe pode
                  ajustar a dosagem com segurança.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#0E7C7B] shrink-0 mt-0.5" />
                <span>
                  <strong>Cuidado com chás, anti-inflamatórios e novos remédios:</strong> chás
                  medicinais (como erva-de-são-joão), anti-inflamatórios comuns e antibióticos podem
                  alterar drasticamente o nível dos imunossupressores no sangue. Avise sempre sobre
                  qualquer receita de outro profissional.
                </span>
              </li>
            </ul>

            <p className="text-xs font-bold text-[#0E7C7B] italic pt-1">
              Em caso de dúvida, fale sempre com sua equipe de transplante.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Tópico 3: Higiene e Prevenção de Infecções */}
        <AccordionItem
          value="higiene"
          className="bg-white rounded-3xl border border-[#E3EFED] shadow-card px-5 sm:px-6 overflow-hidden data-[state=open]:ring-2 data-[state=open]:ring-[#0E7C7B]/20"
        >
          <AccordionTrigger className="hover:no-underline py-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] text-[#7C5CBF] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-extrabold text-[#123332]">
                  Higiene e prevenção de infecções
                </div>
                <div className="text-xs text-[#5C7472] mt-0.5">
                  Lavar as mãos, cuidados com ambientes e proteção diária
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-4 text-xs sm:text-sm text-[#5C7472]">
            <p className="leading-relaxed">
              Como o sistema imunológico está modulado pelos medicamentos para acolher o novo rim,
              sua equipe pode recomendar medidas protetivas nos primeiros meses após a cirurgia:
            </p>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#7C5CBF] shrink-0 mt-0.5" />
                <span>
                  <strong>Higienização frequente das mãos:</strong> lave as mãos com água e sabão ou
                  use álcool em gel 70% antes das refeições, após usar o banheiro e ao chegar da
                  rua.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#7C5CBF] shrink-0 mt-0.5" />
                <span>
                  <strong>Evitar multidões e ambientes fechados:</strong> nos primeiros meses
                  pós-alta, recomenda-se evitar aglomerações e usar máscara cirúrgica ou PFF2/N95 em
                  locais de saúde ou transporte público.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#7C5CBF] shrink-0 mt-0.5" />
                <span>
                  <strong>Contato com pessoas resfriadas:</strong> solicite a familiares e visitas
                  que estejam com tosse, febre ou sintomas respiratórios que aguardem a recuperação
                  completa antes de visitá-lo.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#7C5CBF] shrink-0 mt-0.5" />
                <span>
                  <strong>Cuidado com animais e jardinagem:</strong> recomenda-se não manipular
                  fezes de animais de estimação nem mexer diretamente com terra, plantas ou adubos
                  sem luvas e máscara apropriadas.
                </span>
              </li>
            </ul>

            <p className="text-xs font-bold text-[#0E7C7B] italic pt-1">
              Em caso de dúvida, fale sempre com sua equipe de transplante.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Tópico 4: Alimentação e Hidratação */}
        <AccordionItem
          value="alimentacao"
          className="bg-white rounded-3xl border border-[#E3EFED] shadow-card px-5 sm:px-6 overflow-hidden data-[state=open]:ring-2 data-[state=open]:ring-[#0E7C7B]/20"
        >
          <AccordionTrigger className="hover:no-underline py-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF7EE] text-[#2E9E6B] flex items-center justify-center shrink-0">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-extrabold text-[#123332]">
                  Alimentação e hidratação segura
                </div>
                <div className="text-xs text-[#5C7472] mt-0.5">
                  Baixo sal, açúcar controlado, água na meta e alimentos a evitar
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-4 text-xs sm:text-sm text-[#5C7472]">
            <p className="leading-relaxed">
              A alimentação no pós-transplante busca proteger o novo rim e prevenir o ganho
              excessivo de peso e o diabetes induzido por corticoides. Orientações nutricionais
              comuns:
            </p>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E9E6B] shrink-0 mt-0.5" />
                <span>
                  <strong>Hidratação abundante conforme orientação:</strong> para manter o novo rim
                  bem perfundido, sua equipe costuma indicar uma meta de água (frequentemente de 2 a
                  3 litros/dia). Acompanhe sua meta no painel do aplicativo.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E9E6B] shrink-0 mt-0.5" />
                <span>
                  <strong>Controle de sal e sódio:</strong> o sal retém líquidos e eleva a pressão
                  arterial. Recomenda-se evitar temperos prontos, embutidos e alimentos
                  ultraprocessados.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E9E6B] shrink-0 mt-0.5" />
                <span>
                  <strong>Açúcar controlado:</strong> alguns medicamentos aumentam a glicose.
                  Prefira carboidratos integrais e evite doces concentrados ou refrigerantes.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E9E6B] shrink-0 mt-0.5" />
                <span>
                  <strong>Alimentos crus ou com risco de contaminação:</strong> evite carnes cruas
                  ou malpassadas, peixes crus (sushi), ovos moles, queijos não pasteurizados e
                  certifique-se de higienizar verduras e frutas com solução clorada própria.
                </span>
              </li>
            </ul>

            <p className="text-xs font-bold text-[#0E7C7B] italic pt-1">
              Em caso de dúvida, fale sempre com sua equipe de transplante.
            </p>
          </AccordionContent>
        </AccordionItem>

        {/* Tópico 5: Consultas e Exames */}
        <AccordionItem
          value="consultas"
          className="bg-white rounded-3xl border border-[#E3EFED] shadow-card px-5 sm:px-6 overflow-hidden data-[state=open]:ring-2 data-[state=open]:ring-[#0E7C7B]/20"
        >
          <AccordionTrigger className="hover:no-underline py-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-extrabold text-[#123332]">
                  Consultas ambulatoriais e exames laboratoriais
                </div>
                <div className="text-xs text-[#5C7472] mt-0.5">
                  Importância do seguimento contínuo e regras de coleta
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-5 space-y-4 text-xs sm:text-sm text-[#5C7472]">
            <p className="leading-relaxed">
              O comparecimento às consultas e a coleta periódica dos exames são a melhor garantia de
              vida longa para o enxerto:
            </p>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <span>
                  <strong>Não faltar às consultas agendadas:</strong> mesmo sentindo-se muito bem, o
                  médico avalia sutilezas nos exames de sangue e urina antes que qualquer sintoma
                  apareça.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <span>
                  <strong>Atenção aos dias de dosagem de imunossupressores:</strong> no dia de dosar
                  tacrolimo ou ciclosporina, o sangue deve ser colhido exatamente antes da dose da
                  manhã (nível de vale). Não tome o remédio antes da coleta; leve-o consigo para
                  tomar logo após.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <span>
                  <strong>Jejum quando solicitado:</strong> siga as horas de jejum recomendadas para
                  os exames de glicemia e lípides, mantendo apenas a ingestão leve de água pura caso
                  permitido pela equipe.
                </span>
              </li>
            </ul>

            <p className="text-xs font-bold text-[#0E7C7B] italic pt-1">
              Em caso de dúvida, fale sempre com sua equipe de transplante.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default Cuidados
