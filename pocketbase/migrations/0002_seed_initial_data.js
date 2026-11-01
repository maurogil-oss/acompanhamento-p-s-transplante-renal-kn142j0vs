migrate(
  (app) => {
    // Helper to format Date to YYYY-MM-DD
    function formatDate(d) {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const now = new Date()
    const todayStr = formatDate(now)

    // 1. Settings (Singleton)
    const settingsCol = app.findCollectionByNameOrId('settings')
    let hasSettings = false
    try {
      const existing = app.findRecordsByFilter('settings', "id != ''", '', 1, 0)
      if (existing && existing.length > 0) hasSettings = true
    } catch (_) {}

    if (!hasSettings) {
      const transplantDate = new Date(now.getTime() - 108 * 24 * 60 * 60 * 1000)
      const dischargeDate = new Date(now.getTime() - 94 * 24 * 60 * 60 * 1000)

      const s = new Record(settingsCol)
      s.set('patient_name', 'Mauro')
      s.set('transplant_date', formatDate(transplantDate))
      s.set('discharge_date', formatDate(dischargeDate))
      s.set('baseline_weight_kg', 78.4)
      s.set('daily_water_goal_ml', 2500)
      s.set('emergency_contact_1_name', 'Plantão do Hospital — Transplante')
      s.set('emergency_contact_1_phone', '(41) 3111-2000')
      s.set('emergency_contact_2_name', 'Dra. Renata (Nefrologista)')
      s.set('emergency_contact_2_phone', '(41) 99876-5432')
      app.save(s)
    }

    // 2. Medications
    const medsCol = app.findCollectionByNameOrId('medications')
    let tacrolimoRec = null
    let micofenolatoRec = null

    try {
      tacrolimoRec = app.findFirstRecordByData('medications', 'name', 'Tacrolimo')
    } catch (_) {
      const m1 = new Record(medsCol)
      m1.set('name', 'Tacrolimo')
      m1.set('dose', '2,5 mg')
      m1.set('times', JSON.stringify(['07:00', '19:00']))
      m1.set('active', true)
      app.save(m1)
      tacrolimoRec = m1
    }

    try {
      micofenolatoRec = app.findFirstRecordByData('medications', 'name', 'Micofenolato de Sódio')
    } catch (_) {
      const m2 = new Record(medsCol)
      m2.set('name', 'Micofenolato de Sódio')
      m2.set('dose', '720 mg')
      m2.set('times', JSON.stringify(['07:00', '19:00']))
      m2.set('active', true)
      app.save(m2)
      micofenolatoRec = m2
    }

    // 3. Measurements
    const measurementsCol = app.findCollectionByNameOrId('measurements')

    // Seed past 6 days + today
    const sampleWeights = [78.2, 78.0, 77.8, 78.1, 77.9, 78.0, 77.9]
    const sampleSystolic = [124, 126, 122, 128, 125, 120, 128]
    const sampleDiastolic = [76, 78, 74, 80, 78, 76, 78]

    for (let offset = 6; offset >= 0; offset--) {
      const dayDate = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000)
      const dayStr = formatDate(dayDate)
      const dayIdx = 6 - offset

      const slots = ['07:00', '12:00', '18:00', '23:00']
      for (let sIdx = 0; sIdx < slots.length; sIdx++) {
        const slot = slots[sIdx]
        // Check if already exists
        let existingSlot = null
        try {
          existingSlot = app.findFirstRecordByFilter(
            'measurements',
            `date = '${dayStr}' && slot = '${slot}'`,
          )
        } catch (_) {}

        if (!existingSlot) {
          const m = new Record(measurementsCol)
          m.set('date', dayStr)
          m.set('slot', slot)

          if (offset > 0) {
            // Past days: all slots filled
            m.set('systolic', sampleSystolic[dayIdx] + (sIdx === 1 ? -2 : sIdx === 2 ? 2 : 0))
            m.set('diastolic', sampleDiastolic[dayIdx] + (sIdx === 2 ? 2 : 0))
            m.set('glucose', sIdx === 0 ? 94 : sIdx === 1 ? 118 : sIdx === 2 ? 122 : 108)
            m.set('heart_rate', 72 + sIdx * 2)
            m.set('water_ml', sIdx === 0 ? 450 : sIdx === 1 ? 650 : sIdx === 2 ? 700 : 400)
            m.set('temperature', 36.4 + (sIdx % 2) * 0.2)
            m.set('urine_ml', sIdx === 0 ? 350 : sIdx === 1 ? 420 : sIdx === 2 ? 400 : 380)
            if (sIdx === 0) {
              m.set('weight_kg', sampleWeights[dayIdx])
              m.set('notes', 'Aferição matinal em jejum sem queixas.')
            }
            app.save(m)
          } else {
            // Today: 07:00 and 12:00 filled, 18:00 and 23:00 empty/pending
            if (slot === '07:00') {
              m.set('systolic', 128)
              m.set('diastolic', 78)
              m.set('glucose', 96)
              m.set('heart_rate', 74)
              m.set('water_ml', 400)
              m.set('temperature', 36.5)
              m.set('urine_ml', 350)
              m.set('weight_kg', 77.9)
              m.set('notes', 'Acordou bem, sem queixas.')
              app.save(m)
            } else if (slot === '12:00') {
              m.set('systolic', 122)
              m.set('diastolic', 76)
              m.set('glucose', 112)
              m.set('heart_rate', 78)
              m.set('water_ml', 500)
              m.set('temperature', 36.6)
              m.set('urine_ml', 400)
              m.set('notes', 'Almoço leve com pouco sódio.')
              app.save(m)
            } else {
              // 18:00 and 23:00 created but pending
              app.save(m)
            }
          }
        }
      }
    }

    // 4. Medication Logs
    const medLogsCol = app.findCollectionByNameOrId('medication_logs')
    const medsList = [tacrolimoRec, micofenolatoRec]

    for (let offset = 6; offset >= 0; offset--) {
      const dayDate = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000)
      const dayStr = formatDate(dayDate)

      for (let mIdx = 0; mIdx < medsList.length; mIdx++) {
        const med = medsList[mIdx]
        if (!med) continue

        const medTimes = ['07:00', '19:00']
        for (let tIdx = 0; tIdx < medTimes.length; tIdx++) {
          const time = medTimes[tIdx]

          let existingLog = null
          try {
            existingLog = app.findFirstRecordByFilter(
              'medication_logs',
              `date = '${dayStr}' && medication = '${med.id}' && time = '${time}'`,
            )
          } catch (_) {}

          if (!existingLog) {
            const log = new Record(medLogsCol)
            log.set('date', dayStr)
            log.set('medication', med.id)
            log.set('time', time)

            if (offset > 0) {
              // Past days: all taken
              log.set('taken', true)
              const takenTime = new Date(dayDate.getTime())
              takenTime.setHours(time === '07:00' ? 7 : 19, 5, 0)
              log.set('taken_at', takenTime.toISOString().replace('T', ' ').substring(0, 19))
            } else {
              // Today: 07:00 taken, 19:00 pending
              if (time === '07:00') {
                log.set('taken', true)
                const takenTime = new Date(now.getTime())
                takenTime.setHours(7, 4, 0)
                log.set('taken_at', takenTime.toISOString().replace('T', ' ').substring(0, 19))
              } else {
                log.set('taken', false)
              }
            }
            app.save(log)
          }
        }
      }
    }

    // 5. Labs (6 records spanning ~4 months showing creatinine descending 2.8 -> 1.4 mg/dL)
    const labsCol = app.findCollectionByNameOrId('labs')
    const labData = [
      {
        daysAgo: 105,
        cr: 2.8,
        urea: 78,
        pot: 4.8,
        sod: 138,
        hb: 10.2,
        gfr: 28,
        notes: '1ª semana pós-transplante imediato.',
      },
      {
        daysAgo: 85,
        cr: 2.2,
        urea: 64,
        pot: 4.5,
        sod: 139,
        hb: 10.8,
        gfr: 37,
        notes: 'Ajuste dose de Tacrolimo.',
      },
      {
        daysAgo: 60,
        cr: 1.8,
        urea: 52,
        pot: 4.4,
        sod: 140,
        hb: 11.5,
        gfr: 48,
        notes: 'Recuperação funcional do enxerto excelente.',
      },
      {
        daysAgo: 40,
        cr: 1.6,
        urea: 45,
        pot: 4.2,
        sod: 141,
        hb: 12.1,
        gfr: 54,
        notes: 'Perfil metabólico estável.',
      },
      {
        daysAgo: 20,
        cr: 1.45,
        urea: 38,
        pot: 4.3,
        sod: 140,
        hb: 12.6,
        gfr: 60,
        notes: 'Função renal em platô ideal.',
      },
      {
        daysAgo: 5,
        cr: 1.38,
        urea: 36,
        pot: 4.2,
        sod: 142,
        hb: 12.8,
        gfr: 64,
        notes: 'Creatinina estável e TFG excelente.',
      },
    ]

    for (let i = 0; i < labData.length; i++) {
      const item = labData[i]
      const labDate = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000)
      const labDateStr = formatDate(labDate)

      let existingLab = null
      try {
        existingLab = app.findFirstRecordByFilter('labs', `exam_date = '${labDateStr}'`)
      } catch (_) {}

      if (!existingLab) {
        const l = new Record(labsCol)
        l.set('exam_date', labDateStr)
        l.set('creatinine', item.cr)
        l.set('urea', item.urea)
        l.set('potassium', item.pot)
        l.set('sodium', item.sod)
        l.set('hemoglobin', item.hb)
        l.set('gfr', item.gfr)
        l.set('notes', item.notes)
        app.save(l)
      }
    }

    // 6. Appointments
    const apptsCol = app.findCollectionByNameOrId('appointments')
    const appointmentSeed = [
      {
        offsetDays: -14,
        time: '10:00',
        title: 'Consulta de Retorno Ambulatorial M+3',
        doctor: 'Dra. Renata (Nefrologista)',
        location: 'Ambulatório de Transplante Renal - Sala 4',
        type: 'consulta',
        fasting_required: false,
        notes: 'Evolução clínica favorável, enxerto estável.',
        done: true,
      },
      {
        offsetDays: 3,
        time: '07:30',
        title: 'Exame de sangue — função renal e nível sérico de Tacrolimo',
        doctor: 'Laboratório Central',
        location: 'Unidade Central de Coleta',
        type: 'exame',
        fasting_required: true,
        notes: 'Colher em jejum de 8h e antes da dose matinal de Tacrolimo.',
        done: false,
      },
      {
        offsetDays: 18,
        time: '09:30',
        title: 'Consulta com a nefrologista — Dr. Carlos Menezes',
        doctor: 'Dr. Carlos Menezes',
        location: 'Ambulatório de Transplante - Sala 12',
        type: 'consulta',
        fasting_required: false,
        notes: 'Avaliação do 4º mês e revisão dos níveis de imunossupressores.',
        done: false,
      },
    ]

    for (let i = 0; i < appointmentSeed.length; i++) {
      const item = appointmentSeed[i]
      const apptDate = new Date(now.getTime() + item.offsetDays * 24 * 60 * 60 * 1000)
      const apptDateStr = formatDate(apptDate)

      let existingAppt = null
      try {
        existingAppt = app.findFirstRecordByFilter('appointments', `title = '${item.title}'`)
      } catch (_) {}

      if (!existingAppt) {
        const a = new Record(apptsCol)
        a.set('date', apptDateStr)
        a.set('time', item.time)
        a.set('title', item.title)
        a.set('doctor', item.doctor)
        a.set('location', item.location)
        a.set('type', item.type)
        a.set('fasting_required', item.fasting_required)
        a.set('notes', item.notes)
        a.set('done', item.done)
        app.save(a)
      }
    }
  },
  (app) => {
    // down migration
  },
)
