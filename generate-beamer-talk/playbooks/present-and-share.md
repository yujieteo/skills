# Playbook: rehearse, present, share

- **Rehearse:** print `talk-script.pdf` or read it on a tablet; one page per
  frame with the slide thumbnail and notes.
- **Pick light or dark:** light (`talk-slides.pdf`) for bright rooms and
  projectors that wash out; dark (`talk-dark.pdf`) for dim rooms and screens.
- **Present:** `make present TALK=<slug>` runs
  `pdfpc --notes=right talks/<slug>/build/talk-notes.pdf`: slides on the
  projector, notes, timer and next slide on your screen. Without pdfpc, show
  `talk-slides.pdf` and keep the script beside you.
- **Share before:** `talk-handout.pdf` (overlays collapsed, room to write).
- **Share after:** `talk-article.pdf` for readers who were not there, and
  `talk-slides.pdf` or `talk-trans.pdf`.
- **Keep private** unless the user says otherwise: `talk-notes.pdf` and
  `talk-script.pdf` contain the presenter notes.
- **Publish** only when asked. PDFs are reproducible from source, so publish
  from a clean `python3 scripts/build.py --check` and include
  `build/SHA256SUMS`; CI uploads the same files as the `talks` artifact.
