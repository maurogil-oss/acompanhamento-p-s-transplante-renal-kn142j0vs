migrate(
  (app) => {
    // 1. Atualizar a coleção medications adicionando start_date, end_date, unit, phases, instructions
    const medsCol = app.findCollectionByNameOrId('medications')
    if (!medsCol.fields.getByName('unit')) {
      medsCol.fields.add(new TextField({ name: 'unit' }))
    }
    if (!medsCol.fields.getByName('start_date')) {
      medsCol.fields.add(new DateField({ name: 'start_date' }))
    }
    if (!medsCol.fields.getByName('end_date')) {
      medsCol.fields.add(new DateField({ name: 'end_date' }))
    }
    if (!medsCol.fields.getByName('phases')) {
      medsCol.fields.add(new JSONField({ name: 'phases', maxSize: 50000 }))
    }
    if (!medsCol.fields.getByName('instructions')) {
      medsCol.fields.add(new TextField({ name: 'instructions' }))
    }
    app.save(medsCol)

    // 2. Criar coleção shared_access
    const sharedAccess = new Collection({
      name: 'shared_access',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'role',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['medico', 'familiar', 'outro'],
        },
        { name: 'code', type: 'text', required: true },
        { name: 'active', type: 'bool' }, // bool field, not required
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_shared_access_code ON shared_access (code)'],
    })
    app.save(sharedAccess)
  },
  (app) => {
    try {
      const sharedCol = app.findCollectionByNameOrId('shared_access')
      app.delete(sharedCol)
    } catch (_) {}

    try {
      const medsCol = app.findCollectionByNameOrId('medications')
      medsCol.fields.removeByName('instructions')
      medsCol.fields.removeByName('phases')
      medsCol.fields.removeByName('end_date')
      medsCol.fields.removeByName('start_date')
      medsCol.fields.removeByName('unit')
      app.save(medsCol)
    } catch (_) {}
  },
)
