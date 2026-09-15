# Building an AI Interviewer That Actually Listens

We built InterviewOS to mock-interview engineers like a real senior would: listen in real time, tolerate messy out-loud thinking, and grade answers fairly. This post is the architecture behind it — and, more importantly, the parts that nearly broke.

## The Core Tension

A static interviewer asks question 3 after question 2, regardless of what the candidate just said. A *real* interviewer adapts: the candidate mumbles a confusing answer, so the interviewer asks a clarifying follow-up; they confidently say "I don't know," so the interviewer moves on. That adaptation is the whole product, and it forces the system to be **fast and stateful at the same time**, which is a hard combo to pull off.

## Problem 1: The 5-Second Pause

Anyone who's talked to a voice assistant knows the awkward gap before it replies. In an interview, a 5-second gap after every sentence *breaks the illusion*. The candidate stops talking, the silence drags, and the flow dies.

The fix is to stop waiting for the candidate to finish a full sentence. Instead, stream the audio and start transcribing before they're done:

```text
Microphone
   |
   +--> streaming ASR (word by word, as they speak)
   |
   +--> the interviewer model gets partial text in real time
   |
   +--> it can start formulating a response while the
         candidate is still finishing
```

The latency budget that makes it feel live is tight:

| Stage | Budget |
|-------|--------|
| Audio chunked and sent | ~100 ms |
| Streaming transcription | ~200–400 ms |
| LLM response started | first token < ~600 ms |
| TTS begins speaking | ~1 s from end of their sentence |

The trick is that the expensive model work *starts early*. You don't transcribe the full sentence, then think, then speak. You transcribe as-you-go and pipeline it.

## Problem 2: Messy Out-Loud Thinking

Candidates don't answer in clean sentences. They say "um, well, I think you'd probably...", correct themselves, trail off, then restart. A naive system that treats the transcript as a finished statement will misunderstand constantly.

Two things help:

- **Wait for a silence window, not punctuation.** A period is not a signal they're done. A short pause (say 700 ms of silence) is. Use that to delimit a turn.
- **Give the model the correction.** When a candidate backtracks ("actually, no, wait, I meant..."), feed the whole thing including the backtrack. The correction *is* the answer.

## Problem 3: Grading Fairly (The "Panel of Judges")

The biggest design decision. One big model grading "how good was this answer?" produces a mushy number — it weights fluency and substance and confidence all together, and you can't tell which one moved the score.

We split it into a **panel of specialized judges**, each looking at one thing:

- **Correctness judge** — is the technical content right?
- **Communication judge** — can you actually follow their reasoning?
- **Honesty / cheat judge** — did they recite an answer, or do they genuinely understand it?

Each judge returns its own score *and a short reason*. The panel's outputs are combined into a report, and — critically — the candidate sees the reasons, not just a grade. "You said the answer but couldn't explain why it works" is actionable. "Score: 6.2" is not.

## The Architecture, End to End

```text
Candidate's mic
   |
   +-->(streaming ASR)--> partial transcript
   |
   +--> Interviewer model  <--- (conversation state, question plan)
   |
   +--> TTS --> back to the candidate
   |
   +--> when the interview ends:
          panel of judges --> per-dimension scores + reasons
                              --> structured report
```

The interviewer model holds **conversation state** (what's been covered, what's left in the question plan), so it can steer back to unaddressed areas instead of rambling.

## What We'd Get Wrong On Purpose Next Time

- **Over-engineering the judges.** Three focused judges beat one grand "evaluate everything" model that's hard to debug.
- **Grading from the transcript alone.** Tone and hesitation carry signal. The audio track matters for the honesty judge, and throwing it away loses that.
- **Forgetting the report.** The score is the easy part. The *explainable* breakdown is what makes a candidate actually learn something from the mock.

## Key Takeaways

- Live feels live only if expensive work starts *early* — pipeline transcription, thinking, and speech instead of chaining them.
- Delimit turns on **silence**, not punctuation, and keep the backtrack — it's part of the answer.
- Split grading into a **panel of single-minded judges**, each with a reason, and show the reasons to the candidate.
- The conversation state that steers unasked areas is the difference between an interviewer and a Q&A bot.
