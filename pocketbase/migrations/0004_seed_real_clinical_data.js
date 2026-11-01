migrate(
  (app) => {
    // 1. Atualizar ou Criar Settings com dados reais de Mauro Gil Meger
    const settingsCol = app.findCollectionByNameOrId('settings')
    let sRec = null
    try {
      const records = app.findRecordsByFilter('settings', "id != ''", '', 1, 0)
      if (records && records.length > 0) {
        sRec = records[0]
      }
    } catch (_) {}

    if (!sRec) {
      sRec = new Record(settingsCol)
    }

    sRec.set('patient_name', 'Mauro Gil Meger')
    sRec.set('transplant_date', '2026-10-17 00:00:00.000Z')
    sRec.set('discharge_date', '2026-11-20 00:00:00.000Z')
    sRec.set('baseline_weight_kg', 94.0)
    sRec.set('daily_water_goal_ml', 2500)
    sRec.set('emergency_contact_1_name', 'Unidade de Transplante Renal - Hospital São Vicente')
    sRec.set('emergency_contact_1_phone', '(41) 3111-2000')
    sRec.set('emergency_contact_2_name', 'Equipe Médica Nefrologia')
    sRec.set('emergency_contact_2_phone', '(41) 99999-0000')
    app.save(sRec)

    // 2. Medições reais dos dias 29/11/2026 e 30/11/2026 da ficha de controle clínico
    const measurementsCol = app.findCollectionByNameOrId('measurements')

    const realMeasurements = [
      // Dia 29/11/2026
      {
        date: '2026-11-29 00:00:00.000Z',
        slot: '07:00',
        systolic: 143,
        diastolic: 68,
        heart_rate: 68,
        glucose: 95,
        temperature: 34.6,
        water_ml: 450,
        urine_ml: 300,
        weight_kg: 94.3,
        notes: 'Ficha de controle clínico - PO 1',
      },
      {
        date: '2026-11-29 00:00:00.000Z',
        slot: '12:00',
        systolic: 168,
        diastolic: 88,
        heart_rate: 75,
        glucose: 88,
        temperature: 34.8,
        water_ml: 500,
        urine_ml: 350,
        notes: 'Ficha de controle clínico',
      },
      {
        date: '2026-11-29 00:00:00.000Z',
        slot: '18:00',
        systolic: 145,
        diastolic: 84,
        heart_rate: 73,
        glucose: 157,
        temperature: 33.8,
        water_ml: 600,
        urine_ml: 350,
        notes: 'Ficha de controle clínico',
      },
      {
        date: '2026-11-29 00:00:00.000Z',
        slot: '23:00',
        systolic: 168,
        diastolic: 82,
        heart_rate: 69,
        glucose: 154,
        temperature: 35.8,
        water_ml: 400,
        urine_ml: 300, // soma total da diurese do dia = 1300 ml
        notes: 'Ficha de controle clínico (Diurese total 1300 ml, peso 94,300 kg)',
      },

      // Dia 30/11/2026
      {
        date: '2026-11-30 00:00:00.000Z',
        slot: '07:00',
        systolic: 130,
        diastolic: 80,
        heart_rate: 71,
        glucose: 72,
        temperature: 34.4,
        water_ml: 500,
        urine_ml: 450,
        weight_kg: 94.0,
        notes: 'Ficha de controle clínico - PO 2',
      },
      {
        date: '2026-11-30 00:00:00.000Z',
        slot: '12:00',
        systolic: 168,
        diastolic: 88,
        heart_rate: 67,
        glucose: 95,
        temperature: 34.8,
        water_ml: 600,
        urine_ml: 500,
        notes: 'Ficha de controle clínico',
      },
      {
        date: '2026-11-30 00:00:00.000Z',
        slot: '18:00',
        systolic: 145,
        diastolic: 84,
        heart_rate: 73,
        glucose: 71,
        temperature: 33.8,
        water_ml: 500,
        urine_ml: 450,
        notes: 'Ficha de controle clínico',
      },
      {
        date: '2026-11-30 00:00:00.000Z',
        slot: '23:00',
        systolic: 168,
        diastolic: 82,
        heart_rate: 69,
        glucose: 154,
        temperature: 35.8,
        water_ml: 500,
        urine_ml: 500, // soma total da diurese do dia = 1900 ml
        notes: 'Ficha de controle clínico (Diurese total 1900 ml, peso 94,000 kg)',
      },
    ]

    for (let i = 0; i < realMeasurements.length; i++) {
      const item = realMeasurements[i]
      const cleanDate = item.date.substring(0, 10)
      let mRec = null
      try {
        mRec = app.findFirstRecordByFilter(
          'measurements',
          `date ~ '${cleanDate}' && slot = '${item.slot}'`,
        )
      } catch (_) {}

      if (!mRec) {
        mRec = new Record(measurementsCol)
      }

      mRec.set('date', item.date)
      mRec.set('slot', item.slot)
      mRec.set('systolic', item.systolic)
      mRec.set('diastolic', item.diastolic)
      mRec.set('heart_rate', item.heart_rate)
      mRec.set('glucose', item.glucose)
      mRec.set('temperature', item.temperature)
      mRec.set('water_ml', item.water_ml)
      mRec.set('urine_ml', item.urine_ml)
      if (item.weight_kg) mRec.set('weight_kg', item.weight_kg)
      mRec.set('notes', item.notes)
      app.save(mRec)
    }

    // 3. Medicamentos reais da receita médica (14 itens)
    const medsCol = app.findCollectionByNameOrId('medications')

    const prednisonaPhases = [
      { start_date: '2026-10-17', end_date: '2026-10-21', dose: '60 mg', details: '3 cp de 20 mg' },
      {
        start_date: '2026-10-22',
        end_date: '2026-10-26',
        dose: '50 mg',
        details: '2 cp de 20 mg + 2 cp de 5 mg',
      },
      { start_date: '2026-10-27', end_date: '2026-10-31', dose: '40 mg', details: '2 cp de 20 mg' },
      {
        start_date: '2026-11-01',
        end_date: '2026-11-05',
        dose: '30 mg',
        details: '1 cp de 20 mg + 2 cp de 5 mg',
      },
      { start_date: '2026-11-06', end_date: '2026-11-10', dose: '20 mg', details: '1 cp de 20 mg' },
      { start_date: '2026-11-11', end_date: '2026-11-15', dose: '15 mg', details: '3 cp de 5 mg' },
      { start_date: '2026-11-16', end_date: '2026-11-20', dose: '10 mg', details: '2 cp de 5 mg' },
      { start_date: '2026-11-21', end_date: '', dose: '5 mg', details: '1 cp de 5 mg contínuo' },
    ]

    const realMedications = [
      {
        name: 'Prednisona (5 e 20 mg)',
        dose: '5 mg',
        unit: 'cp',
        times: ['08:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: JSON.stringify(prednisonaPhases),
        instructions: 'Descremento programado: 60mg a 5mg contínuo.',
      },
      {
        name: 'Micofenolato sódico 360 mg',
        dose: '2 cp (720 mg)',
        unit: 'cp',
        times: ['08:00', '20:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: 'Uso contínuo às 08h e 20h.',
      },
      {
        name: 'Tacrolimo 1 mg',
        dose: '3½ cp (3,5 mg)',
        unit: 'cp',
        times: ['08:00', '20:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: '3½ cp às 08h e 20h contínuo.',
      },
      {
        name: 'Bactrin 400/80 (Sulfametoxazol-trimetoprima)',
        dose: '1 cp',
        unit: 'cp',
        times: ['20:00'],
        start_date: '2026-10-22 00:00:00.000Z',
        end_date: '2027-01-20 00:00:00.000Z',
        active: true,
        phases: null,
        instructions: 'De 22/10/2026 a 20/01/2027 às 20h.',
      },
      {
        name: 'Nistatina solução oral',
        dose: '1 med (medida)',
        unit: 'medida',
        times: ['08:00', '16:00', '22:00'],
        start_date: '2026-10-22 00:00:00.000Z',
        end_date: '2027-01-20 00:00:00.000Z',
        active: true,
        phases: null,
        instructions: 'Bochechar e engolir de 22/10/2026 a 20/01/2027.',
      },
      {
        name: 'Pantoprazol 40 mg',
        dose: '1 cp',
        unit: 'cp',
        times: ['08:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: 'Tomar em jejum às 08h contínuo.',
      },
      {
        name: 'Hidralazina 50 mg',
        dose: '1 cp',
        unit: 'cp',
        times: ['08:00', '18:00', '24:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: '8h, 18h e 24h (ajustável conforme orientação médica).',
      },
      {
        name: 'Sinvastatina 20 mg',
        dose: '1 cp',
        unit: 'cp',
        times: ['22:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: '1 cp às 22h contínuo.',
      },
      {
        name: 'AAS 100 mg (Ácido Acetilsalicílico)',
        dose: '1 cp',
        unit: 'cp',
        times: ['12:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: '1 cp às 12h contínuo após o almoço.',
      },
      {
        name: 'Anlodipino 5 mg',
        dose: '2 cp (10 mg)',
        unit: 'cp',
        times: ['20:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: '2 cp às 20h contínuo.',
      },
      {
        name: 'Insulina Lantus matinal',
        dose: '20 UI',
        unit: 'unid',
        times: ['08:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: '20 unidades subcutânea às 08h.',
      },
      {
        name: 'Insulina Lantus noturna',
        dose: '10 UI',
        unit: 'unid',
        times: ['20:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: '10 unidades subcutânea às 20h.',
      },
      {
        name: 'Carvedilol 6,25 mg',
        dose: '1 cp',
        unit: 'cp',
        times: ['09:00', '20:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: '1 cp às 09h e 20h (adicionado à prescrição).',
      },
      {
        name: 'Sertralina 50 mg',
        dose: '1 cp',
        unit: 'cp',
        times: ['09:00'],
        start_date: '2026-10-17 00:00:00.000Z',
        end_date: null,
        active: true,
        phases: null,
        instructions: '1 cp às 09h pela manhã.',
      },
    ]

    for (let i = 0; i < realMedications.length; i++) {
      const item = realMedications[i]
      let medRec = null
      try {
        medRec = app.findFirstRecordByFilter('medications', `name ~ '${item.name.split(' ')[0]}'`)
      } catch (_) {}

      if (!medRec) {
        medRec = new Record(medsCol)
      }

      medRec.set('name', item.name)
      medRec.set('dose', item.dose)
      medRec.set('unit', item.unit)
      medRec.set('times', JSON.stringify(item.times))
      if (item.start_date) medRec.set('start_date', item.start_date)
      if (item.end_date) medRec.set('end_date', item.end_date)
      medRec.set('active', item.active)
      if (item.phases) medRec.set('phases', item.phases)
      if (item.instructions) medRec.set('instructions', item.instructions)
      app.save(medRec)
    }

    // 4. Seed de exemplo inicial de compartilhamento para teste rápido
    const sharedCol = app.findCollectionByNameOrId('shared_access')
    let sharedRec = null
    try {
      sharedRec = app.findFirstRecordByFilter('shared_access', "code = 'DR-SAO-VICENTE'")
    } catch (_) {}

    if (!sharedRec) {
      sharedRec = new Record(sharedCol)
      sharedRec.set('name', 'Dr. Roberto (Equipe Transplante São Vicente)')
      sharedRec.set('role', 'medico')
      sharedRec.set('code', 'DR-SAO-VICENTE')
      sharedRec.set('active', true)
      sharedRec.set('notes', 'Acesso autorizado para acompanhamento médico ambulatorial.')
      app.save(sharedRec)
    }
  },
  (app) => {
    // Reverter seed
  },
)
