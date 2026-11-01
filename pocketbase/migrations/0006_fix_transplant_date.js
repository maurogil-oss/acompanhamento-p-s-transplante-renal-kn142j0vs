migrate(
  (app) => {
    // Corrigir transplant_date se estiver no ano 1960 ou incorreto
    // A data correta do transplante é 17/10/2026 (paciente Mauro Gil Meger)
    try {
      const records = app.findRecordsByFilter('settings', "id != ''", '', 1, 0)
      if (records && records.length > 0) {
        const sRec = records[0]
        const currentTransplantDate = sRec.getString('transplant_date')
        if (
          !currentTransplantDate ||
          currentTransplantDate.indexOf('1960') === 0 ||
          currentTransplantDate.indexOf('2026-10-17') !== 0
        ) {
          sRec.set('transplant_date', '2026-10-17 00:00:00.000Z')
          app.save(sRec)
        }
      }
    } catch (e) {
      console.log('Erro ao atualizar transplant_date:', e)
    }
  },
  (app) => {
    // Reverter não é estritamente necessário para um backfill/fix
  },
)
