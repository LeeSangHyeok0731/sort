---
name: design
description: Use before starting a large feature or a change with room to choose an approach ("~ 만들자", "~ 기능 넣고 싶어", or when it touches several layers or adds a new screen, state or dependency). Clarifies requirements through questions, compares approaches and recommends one, writes a design doc in docs/specs/ and gets approval. Does not implement before approval.
---

# Design

The goal is agreement with the user on "what, why, and how". Do not write code.

## 1. Know before starting

- Check that you are on a work branch (`git branch --show-current`). If it is main or another task's branch, create a branch with `/start-task` first. The design doc is committed on that branch too.
- Read the related code and `docs/ARCHITECTURE.md`. Make a first guess at the FSD layer and slice the feature belongs to.
- If `docs/specs/` has a similar design, read it. Do not contradict earlier decisions.
- Do not ask about facts you can check in the code; check them yourself.

## 2. Ask questions

- Ask **one at a time**. Do not ask several at once.
- For a choice, give 2–4 options. If you have a recommendation, put it first with a one-line reason.
- What to ask: the behavior the user actually wants, the scope (what is not in this round), fixed constraints. Do not ask about what is already decided, such as desktop-only.
- When answered, restate your understanding in a line or two and move on.

## 3. Compare approaches

- Set out 2–3 approaches and briefly compare their trade-offs (complexity, performance, fit with the existing structure, testability).
- **Recommend one and say why.** Do not just list them without choosing.
- When the user picks, write the document for that approach.

## 4. Design document

Write `docs/specs/YYYY-MM-DD-<english-name>-design.md` from the [template.md](template.md) skeleton.
- Write it in Korean like the existing design docs in this repo, in short sentences with lists and tables.
- Do not mix what is decided with what is not yet decided (open questions).
- Code snippets go only as far as interfaces (types, function signatures). Implementation happens in `/plan` and `/implement`.

## 5. Get approval

1. Make a `docs: <기능> 설계` commit with `/commit`.
2. Show the user the document path and the 3–5 key decisions, and ask for a review.
3. **Do not implement before approval.** If changes are requested, fix the document in a new commit and ask again.
4. Once approved, move on to `/plan`.

Ask the user whether the design doc gets its own PR or stays on the same branch as the implementation. For a large feature, recommend opening the design PR first for review.
