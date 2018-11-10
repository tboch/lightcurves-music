# lightcurves-music
Music from light curves data - ADASS 2018 hackathon

### Catalogue data retrieval

```sql
% Gaia fundamental parameters
SELECT source_id, ra, dec, pmra, pmdec, parallax FROM "I/345/gaia2" where source_id in (select source_id from "I/345/transits")

% cepheids
select source_id, pf from "I/345/cepheid"
```
