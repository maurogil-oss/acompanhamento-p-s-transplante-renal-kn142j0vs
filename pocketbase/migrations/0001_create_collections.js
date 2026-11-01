migrate(
  (app) => {
    // 1. measurements
    const measurements = new Collection({
      name: 'measurements',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'date', type: 'date', required: true },
        {
          name: 'slot',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['07:00', '12:00', '18:00', '23:00'],
        },
        { name: 'systolic', type: 'number', min: 50, max: 250 },
        { name: 'diastolic', type: 'number', min: 30, max: 150 },
        { name: 'glucose', type: 'number', min: 20, max: 600 },
        { name: 'heart_rate', type: 'number', min: 30, max: 220 },
        { name: 'water_ml', type: 'number', min: 0 },
        { name: 'temperature', type: 'number', min: 30, max: 45 },
        { name: 'urine_ml', type: 'number', min: 0 },
        { name: 'weight_kg', type: 'number', min: 30, max: 300 },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_measurements_date_slot ON measurements (date, slot)',
        'CREATE INDEX idx_measurements_date ON measurements (date)',
      ],
    })
    app.save(measurements)

    // 2. medications
    const medications = new Collection({
      name: 'medications',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'dose', type: 'text', required: true },
        { name: 'times', type: 'json', required: true },
        { name: 'active', type: 'bool' }, // bool fields must not be required
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(medications)

    const medicationsId = app.findCollectionByNameOrId('medications').id

    // 3. medication_logs
    const medicationLogs = new Collection({
      name: 'medication_logs',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'date', type: 'date', required: true },
        {
          name: 'medication',
          type: 'relation',
          required: true,
          collectionId: medicationsId,
          maxSelect: 1,
          cascadeDelete: false,
        },
        { name: 'time', type: 'text', required: true },
        { name: 'taken', type: 'bool' }, // bool field, not required
        { name: 'taken_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_med_logs_date_med_time ON medication_logs (date, medication, time)',
        'CREATE INDEX idx_med_logs_date ON medication_logs (date)',
      ],
    })
    app.save(medicationLogs)

    // 4. labs
    const labs = new Collection({
      name: 'labs',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'exam_date', type: 'date', required: true },
        { name: 'creatinine', type: 'number' },
        { name: 'urea', type: 'number' },
        { name: 'potassium', type: 'number' },
        { name: 'sodium', type: 'number' },
        { name: 'hemoglobin', type: 'number' },
        { name: 'gfr', type: 'number' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_labs_exam_date ON labs (exam_date)'],
    })
    app.save(labs)

    // 5. appointments
    const appointments = new Collection({
      name: 'appointments',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'doctor', type: 'text' },
        { name: 'location', type: 'text' },
        {
          name: 'type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['consulta', 'exame'],
        },
        { name: 'fasting_required', type: 'bool' },
        { name: 'notes', type: 'text' },
        { name: 'done', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_appointments_date ON appointments (date)'],
    })
    app.save(appointments)

    // 6. settings
    const settings = new Collection({
      name: 'settings',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'patient_name', type: 'text', required: true },
        { name: 'transplant_date', type: 'date', required: true },
        { name: 'discharge_date', type: 'date', required: true },
        { name: 'baseline_weight_kg', type: 'number', required: true },
        { name: 'daily_water_goal_ml', type: 'number', required: true },
        { name: 'emergency_contact_1_name', type: 'text', required: true },
        { name: 'emergency_contact_1_phone', type: 'text', required: true },
        { name: 'emergency_contact_2_name', type: 'text', required: true },
        { name: 'emergency_contact_2_phone', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(settings)
  },
  (app) => {
    const toDelete = [
      'settings',
      'appointments',
      'labs',
      'medication_logs',
      'medications',
      'measurements',
    ]
    for (let i = 0; i < toDelete.length; i++) {
      try {
        const col = app.findCollectionByNameOrId(toDelete[i])
        app.delete(col)
      } catch (_) {}
    }
  },
)
