# Data discrepancies and review queue

1. **Mundka / PRS name variation:** Official Delhi Assembly roster/history uses `Gajender Drall`; PRS MLA Track displays `Gajender Singh Daral`. The PRS activity row is retained separately and marked `review_name_variance`; it is not silently merged.
2. **Rohtas Nagar / PRS identity conflict:** Official Assembly roster uses `Jitender Mahajan` (Assembly history page spells it `JITENER MAHAJAN`); PRS MLA Track displays `Jitender Kumar`. The PRS activity row is marked `review_identity_conflict` and is not attached to the official profile.
3. **PRS alternate labels:** Some PRS rows include aliases or formatting differences, e.g. `Kuldeep Kumar (Monu)`, `Punardeep Singh Sawhney (Sabby)`, `Ravinder Singh Negi (Ravi Negi)`, and `Veer Singh Dhingan` / `Seemapuri`. These are retained in the secondary-source table.
4. **Affidavit coverage:** No individual affidavit link is asserted in this package. The ECI portal is provided as the authoritative lookup entry point; each record still needs exact candidate/election matching, extraction and source-page review.
