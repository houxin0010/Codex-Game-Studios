# Contributing

Discuss substantial workflow changes in an issue. Keep domain ownership and gate
verdict contracts; disclose missing evidence. Add portable skill metadata and
native TOML roles, update the catalog and bilingual README counts, and run:

```bash
python3 tools/validate_studio.py
python3 -m unittest discover -s tests/studio -v
node --test tests/wechat/*.test.js
```

Do not commit credentials, generated engine exports or local DevTools config.
Tests using wx mocks do not prove device compatibility. Preserve MIT attribution.
