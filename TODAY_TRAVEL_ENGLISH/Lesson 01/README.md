# Today Travel English · Lesson 01 · Packing for a Trip — Production Package v1.0 (for review)

A1 · 90 minutes · Signature experience: decision-making · Final production: My Travel Bag (plan → check → decide → update).
Built from the approved Phase 1 architecture. **Status: v1.0 for review, not FINAL until approved.**

## Before you teach
Install the fonts in `Source Files/Fonts/` (Poppins, Hanken Grotesk, JetBrains Mono; all SIL Open Font License). The deck uses these three font families and nothing else. Without them, PowerPoint will substitute fonts.

## Files
| Folder | File | What it is |
|---|---|---|
| PPTX | `TTE_L01_Packing-for-a-Trip_Student-Deck_v1.0.pptx` | Student deck: 28 slides, audio embedded on slides 9, 10 and 14, teacher notes in the speaker notes |
| PPTX | `…_Student-Deck_v1.0_preview.pdf` | Preview render for review (LibreOffice) |
| Audio | `TTE_L01_A01_Leos-Call_v1.0.mp3` | Listening, 0:58, two speakers |
| Audio | `TTE_L01_A02/A03/A04_Say-It-…_v1.0.mp3` | Pronunciation model lines, cut from A01 |
| Audio | `TTE_L01_Audio-Script_v1.0.pdf` | Transcript with timings, speaker labels, file→slide map, answer keys |
| Teacher Lesson Plan | `TTE_L01_Teacher-Lesson-Plan_v1.0.docx` / `.pdf` | Full teacher plan (editable DOCX + PDF) |
| Teacher Lesson Plan | `TTE_L01_Classroom-Materials_Print_v1.0.pdf` | Print pages 1–6: item cards, bag template, trip cards, new-information cards, weather cards, My Travel Bag list card |
| Toolkit | `TTE_L01_Travel-Toolkit_v1.0.pdf` | Student take-home Travel Toolkit (1 page) |
| Images | `Icons/SVG`, `Icons/PNG`, `Brand/` | Vocabulary and activity icon set (navy and paper versions); Today lockup |
| Source Files | `Build/`, `Print-HTML/`, `Audio/`, `Fonts/` | Generators (single data source: `Build/lesson.js`), HTML sources, 24 kHz WAV master and timing marks, fonts |

## Technical limitations
1. **No photography.** No licensed photo source could be reached from the production environment, and the brand forbids AI-generated people. Every concrete item therefore uses a bespoke line-icon set drawn to the Today icon rules (2.5 stroke, rounded ends, navy, orange as signal). The icons are consistent and editable (SVG). Editorial photos can later replace the cover and trip-card atmosphere without any layout change.
2. **Synthetic voices.** The audio uses neural text-to-speech with two distinct voices. It was checked word-for-word by a speech recogniser. Re-recording with voice actors is recommended before commercial release; the script and timing sheet are ready for that.
3. **Logo.** The official master SVG was not supplied, so the lockup was rebuilt from the vector geometry in the Master Brand Guidelines PDF (Poppins Bold glyphs plus the ring). Replace it with the official master file before release.
4. **No click animations.** The deck generator cannot create animations, so the listening answers are on a separate slide (11) instead of a click reveal.
5. **Muted text.** Secondary text uses solid caption tones #5B6088 (on paper) and #8890B5 (on navy), taken from the Today brand documents, instead of transparency, which renders unreliably outside PowerPoint.
