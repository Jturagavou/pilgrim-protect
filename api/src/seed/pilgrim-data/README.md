# Pilgrim Field Data Bundle

This folder contains a normalized, repo-friendly copy of the field data from `/Users/jonaturagavou/Downloads/Data`.

The original folder includes CSV/XLSX datasets plus DOCX/PDF data collection instruments. The structured datasets were normalized into JSON so the app can import them repeatably without depending on local spreadsheet files.

## Files

- `manifest.json` - generation metadata, source files, reference forms, and row counts.
- `schools.json` - canonical school records with coordinates, enrollment-derived student counts, IRS-derived room counts, and source provenance.
- `enrollment.json` - school enrollment records from Amuria and Soroti.
- `malaria-cases.json` - monthly retrospective malaria case summaries.
- `irs-structure-rows.json` - row-level IRS structure/spray data.
- `irs-spray-events.json` - app-level spray report events aggregated from IRS structure rows.
- `environment-assessments.json` - Soroti school environment/living-condition assessments.
- `irs-iptsc-timelines.json` - IRS and IPTsc timeline rows.
- `operator-summary.json` - spray operator structure summary rows.
- `collection-log.json` - data collection tracking log.
- `raw-summary-workbooks.json` - lightly normalized summary workbook rows that do not map cleanly to app models yet.

## Importing Into MongoDB

From `api/`, run:

```bash
npm run import:pilgrim-data -- --dry-run
npm run import:pilgrim-data
```

Useful flags:

- `--dry-run` previews create/update counts without writing.
- `--reset` deletes prior `pilgrim-data` schools and Pilgrim-import spray reports before importing.
- `--schools-only` imports only schools.
- `--reports-only` imports only spray reports for already-imported schools.

The current app schema stores schools and spray reports directly. The remaining normalized JSON files preserve the full dataset for future analytics/admin screens or new Mongo models.
