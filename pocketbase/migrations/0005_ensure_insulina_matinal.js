migrate(
  (app) => {
    const medsCol = app.findCollectionByNameOrId('medications')
    let matinalRec = null
    try {
      matinalRec = app.findFirstRecordByFilter('medications', "name = 'Insulina Lantus matinal'")
    } catch (_) {}

    if (!matinalRec) {
      const m = new Record(medsCol)
      m.set('name', 'Insulina Lantus matinal')
      m.set('dose', '20 UI')
      m.set('unit', 'unid')
      m.set('times', JSON.stringify(['08:00']))
      m.set('start_date', '2026-10-17 00:00:00.000Z')
      m.set('active', true)
      m.set('instructions', '20 unidades subcutânea às 08h.')
      app.save(m)
    }
  },
  (app) => {},
)
