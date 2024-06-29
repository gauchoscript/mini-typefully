> [!NOTE]
> This repository contains a mini version of [Typefully](https://typefully.com/) to be used in coding challenges. It's a monorepo with a Vite-powered React frontend and a Django backend.


# Auto-split shaping

## Problem

Many creators repurpose their content among platforms. When repurposing from blog posts, sometimes users want to create a thread (multiple posts/atoms each one replying to each other creating a chain that reads as a whole).

Some users report being frustrated of having to do this process manually when pasting their posts in Typefully. We can help them out by offering them to split their long content for them!

## Solution

When the user pastes into Typefully, or in general when the text is exceeding the post/atom limits, we should offer an option to auto-split the text into multiple atoms. The end result should ideally be something that the user can post as-is with very few edits, so we should look into implementing some smart heuristics to split at the right points and keeping the content flowing as the original author intended.

https://whimsical.com/autosplit-for-swe-challenge-Y4q1RkTPKApiBQPdCxhvWW

> [!TIP]
> Please note that this is just a rough sketch with placeholder copy, not an exact UX to match in your implementation. We encourage you to tweak to create the best feature we can offer users.
