# Playbook: change the template

Every talk depends on `tex/yjtalk.sty`, `scripts/build.py` and
`starter/talk.tex`, so a template change is a change to all talks.

1. Read the template's `.agents/skills/talk-template-maintenance/SKILL.md`
   for how the modes are wired.
2. Colours: change `design-tokens.json` in visuals first, then
   `make tokens VISUALS=../visuals`. Do not hard-code colours in the style.
3. New output variant: jobname suffix detected in `yjtalk.sty`, entry in
   `VARIANTS` in `build.py` with a page-count rule if one holds, the Makefile,
   and the README table.
4. New check in `build.py`: add a negative test first. Break a copy of a talk
   the way the check targets and confirm the build fails with your message;
   then confirm both example talks still pass.
5. Verify: `make check` for all talks; render one page of each variant of
   both examples; scaffold, build and delete a throwaway talk to test the
   starter.
