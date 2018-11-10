# lightcurves-music
Music from light curves data - ADASS 2018 hackathon

### Catalogue data retrieval

SELECT source_id, ra, dec, pmra, pmdec, parallax FROM "I/345/gaia2" where source_id in (select source_id from "I/345/transits")

