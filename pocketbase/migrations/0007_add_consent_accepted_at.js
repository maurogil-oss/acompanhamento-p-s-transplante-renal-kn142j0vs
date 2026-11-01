migrate(
  (app) => {
    const settingsCol = app.findCollectionByNameOrId('settings')
    if (!settingsCol.fields.getByName('consent_accepted_at')) {
      settingsCol.fields.add(
        new DateField({
          name: 'consent_accepted_at',
          required: false,
        }),
      )
      app.save(settingsCol)
    }
  },
  (app) => {
    const settingsCol = app.findCollectionByNameOrId('settings')
    const field = settingsCol.fields.getByName('consent_accepted_at')
    if (field) {
      settingsCol.fields.removeByName('consent_accepted_at')
      app.save(settingsCol)
    }
  },
)
