# Lint Policy for IQB Projects

## Ziel

Dieses Repository ist die zentrale Quelle fuer gemeinsame ESLint-Regeln in IQB-Projekten.
Die Policy sorgt dafuer, dass Regeln teamweit einheitlich, transparent und planbar weiterentwickelt werden.

## Geltungsbereich

- Alle aktiven IQB-JavaScript- und TypeScript-Repositories, die `@iqb/eslint-config` verwenden
- Neue Projekte sollen standardmaessig auf diesem Config-Paket aufsetzen

## Rollen

- Maintainer (2-3 Personen): pflegen Regeln, priorisieren Aenderungen, verantworten Releases
- Contributors: schlagen Regel-Aenderungen vor und liefern technische Umsetzung
- Consumer Teams: melden Friktionen, testen Canaries, uebernehmen neue Versionen in ihren Anwendungen

## Entscheidungsprinzipien fuer Regeln

- `error`: Fehlerpraevention, Sicherheits-/Correctness-Risiken, klare Defekte
- `warn`: Lesbarkeit, Wartbarkeit, graduelle Qualitaetsverbesserung
- `off`: wenn Regel wenig Nutzen hat oder in IQB-Projekten systematisch Fehlalarme erzeugt

Regeln sollen bevorzugt:

- autofixbar sein
- reproduzierbar in mehreren Repos Mehrwert liefern
- nicht stark framework-spezifisch sein

## Prozess fuer Regel-Aenderungen

1. Rule-Change-Issue mit Template erstellen
2. Problem und konkrete Beispiele dokumentieren
3. Einschaetzung fuer Rollout-Risiko und SemVer angeben
4. PR mit Aenderung und Tests erstellen
5. Mindestens ein Consumer-Projekt als Canary pruefen
6. Release inkl. Changelog und Migrationshinweis veroeffentlichen
7. Adoption in Consumer-Repos nach festem Rollout-Plan

## SemVer-Regeln

- `major`: breaking changes, neue strenge Defaults, Flat-Config-/Engine-Wechsel
- `minor`: neue Regeln als `warn`, neue optionale Exports, nicht-brechende Verbesserungen
- `patch`: Bugfixes, Dokumentation, Test-/Workflow-Fixes ohne Verhaltensbruch

## Release-Rhythmus

- Regelmaessig, z. B. monatlich oder bei Bedarf
- Security- oder Build-Break-Fixes koennen ad hoc als Patch erscheinen

## Override-Policy in Consumer-Repos

- Lokale Overrides sind erlaubt, aber mit kurzer Begruendung im Projekt (`eslint.config.js` Kommentar oder ADR)
- Dauerhafte Abweichungen sollen als Rule-Change-Issue zurueck in dieses Repo gespiegelt werden

## Definition of Done fuer Regel-PRs

- Regelbegruendung und Risikoeinschaetzung dokumentiert
- Lint/Test-Workflow gruen
- Canary-Validierung in mindestens einem realen Consumer-Repo erfolgt
- Release Notes/Migrationshinweise vorbereitet (falls noetig)

## Entscheidungsmodus bei Uneinigkeit

- Wenn kein Konsens erreicht wird: Maintainer-Entscheid mit kurzer Begruendung im Issue
- Ziel ist pragmatische Einheitlichkeit statt perfekter individueller Stilpraeferenz
