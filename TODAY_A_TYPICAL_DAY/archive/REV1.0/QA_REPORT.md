# A Typical Day — QA report

**Deliverables:** `01_Today_A_Typical_Day_Student.pptx` (17 slides, teacher notes in the speaker notes) · `02_Today_A_Typical_Day_Student.pdf` (6 pages) · `03_Today_A_Typical_Day_Teacher_Lesson_Plan.pdf` (5 pages). Editable sources are in `source/`.

## How it was checked
- **Automated:** a script extracted the text of all three files and checked it for:
  - third-person errors, an auxiliary followed by an -s verb, "I am + verb" and "he/she don't";
  - placeholder text;
  - stage timings in the speaker notes;
  - shapes outside the safe margin;
  - colours and fonts used.
  The PPTX also passed OOXML validation.
- **Visual:** every slide and page was rendered and inspected. The slides were rendered with LibreOffice, not PowerPoint.

## Pedagogical issues found and resolved
1. **Round 1 of "Doctor vs. Doctor" had no clear subject.** The blueprint names only "a fictional doctor", and Dr. Lucas's facts are already on screen, so interviewing him would have no information gap. I added **Dr. Ben**, a hospital night doctor whose facts appear only in the teacher plan. His profile also contrasts with Dr. Lucas, Dr. Sarah and the student.
2. **Round 3 must remove the prompts.** It has its own clean slide (15), so the deck is **17 slides** instead of about 16.
3. **Discovery before confirmation.** Slide 7 shows the sentence pairs with no highlighting. Slide 8 confirms the pattern only after the student has stated it.
4. **No answers shown before they're needed.** The answers for Right or Wrong, Dr. Sarah and Dr. Ben are in the speaker notes and the teacher plan only. Dr. Sarah's six facts appear on screen as "?".
5. **Delayed correction uses real errors.** Slide 16 is editable. The notes tell the teacher to replace the example sentences with 3–5 real errors from the error log (teacher plan, Appendix C) during Round 3.
6. **The student PDF isn't a copy of the deck.** Its accuracy check (page 6) uses new items, and page 4 has note boxes the student fills in during stages 6 and 8.
7. **Timings match everywhere.** Stages 1–10 total 55 minutes, and each stage's time in the speaker notes matches the plan.

## Language issues found and resolved
- All flagged "errors" are the lesson's deliberate error examples (slides 8, 9 and 16, and the plan), or question frames with a gap for does. No unintended errors.
- Apostrophes normalised to typographic ’.
- The brand fonts have no "ɪ" glyph, so the sound is written **/iz/** in all materials.
- "Arrive at the clinic" (from the blueprint's Doctor's Day) isn't in the blueprint vocabulary list. The plan now lists it as Doctor's-Day-only vocabulary.
- All 18 vocabulary items appear in both the deck and the student PDF.

## Visual issues found and resolved
- Removed floating brand signature words that had no teaching function ("Really?", "Exactly.", "Where?"). "Try again." stays on the correction slide.
- Removed a "NIGHTS?" label that gave away a Round 1 answer.
- Replaced three off-palette greys with library colours. The final palette is exactly #0B1440, #141E52, #F44904, #FAF7F2, #F3EFE6, #5B6088, #DDD6C7 and #B7AFA0.
- Fixed characters (→, ↔, ɪ) that fell back to a serif font in the PDFs. The PDFs now embed only Poppins, Hanken Grotesk and JetBrains Mono.
- Moved timeline, day-line and card elements inside a 0.55 in safe margin and fixed card text crowding.
- Rebuilt the teacher plan as a flowing document with running footers; before, it left half-empty spill pages.

## Remaining limitations
1. **No photographs.** No photo source could be reached from the production environment, and the brand forbids AI-generated people. The library's photos show real Today people who are not doctors, so presenting them as doctors would be misleading.
   - **Instead:** the brand's own graphic language. The hero is a typographic cover with a precision-tick day line (the brand's surviving texture). The Doctor's Day is a coherent icon timeline. Each fictional doctor has a consistent monogram ID card.
   - A real editorial doctor photo can be placed on slide 1 or 4 without any layout change.
2. **The official logo is a 200 px JPEG** (the library notes that no vector wordmark exists). I only removed its background to make it transparent; the logo itself is not redrawn. It's used small, but a high-resolution master should replace it.
3. **Fonts aren't embedded in the PPTX.** Install Poppins (ExtraBold, SemiBold, Bold), Hanken Grotesk (Regular, Medium) and JetBrains Mono (Medium) on the presenting machine.
4. **Slide 16 needs live editing.** The teacher types the student's real errors into it during the lesson.
5. **Rendering was checked in LibreOffice and Chromium, not in PowerPoint itself.**
