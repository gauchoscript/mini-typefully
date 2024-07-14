> [!NOTE]
> This brnach contains my solution to the code challenge described in the [`main`](https://github.com/gauchoscript/mini-typefully/tree/main) branch.

# My approach

## Analysis
This task appears to be a straightforward text-splitting problem. 

The implementation seems to be primarily frontend work. 

The frontend uses Tiptap for the editor, which itself is a framework built on ProseMirror, and it also utilizes Radix-UI and Tailwind for building and styling UI components. Additionally, TypeScript is used instead of plain JSX. 

Among these, I'm only familiar with Tailwind, so the most challenging part will be understanding these libraries and working efficiently with TypeScript.

## Implementation plan

### Hooking the paste event

- I'll need to hook into the paste event on the editor.
- Check if the pasted text exceeds the standard tweet limit (280 characters). If it does, trigger the logic to split the text.

### Splitting logic

- A simple approach is to split the text by sentences, looking for periods.
- Loop through the sentences, combining them if the combined length is less than the maximum character limit.
- This merging logic should continue, so sentences are combined not just with the adjacent sentence but also with subsequent ones if they fit within the character limit, resulting in more than two sentences merged.

### Tiptap framework handling

- I'll create a new array of these merged sentences.
- Loop through this array to create new AtomNode components.
- Finally, find a way to insert these nodes back into the Editor.

### Possible additional features

- [ ] Show an icon/button when the text exceeds the maximum limit, allowing users to trigger the split manually if they change their minds after declining the initial prompt or if they just get inspired and write a lot of content themselves.
- [ ] Use an LLMS to make text splitting smarter.

# Final conclusions after the challenge
As expected, it took me a couple of hours to understand how ProseMirror works and how Tiptap wraps it. The trickiest part was realizing that the paste event was handled by ProseMirror, not Tiptap. I had to adjust the code and use closures to make the Tiptap editor available inside the ProseMirror function.

Once this was clear, the implementation was straightforward. However, I encountered some issues with TypeScript since I'm not very familiar with it.

> [!IMPORTANT]
> The current solution creates new nodes instead of filling the existing one, which isn't ideal. To fix this, I need to analyze the node where the paste occurs and possibly use it as the starting node. [^2]

[^2]: A simpler approach might have been to read the current node's content, prepend it to the pasted text, and replace the entire editor content. I tried this, but it faced issues with Tiptap's `setContent` method not triggering the `update` logic, which prevented updates from being saved and thumbnails from being updated without manual intervention from the user. I didn't find a method in the editor API to manually trigger an editor update, so the trade-off between effort and time in pursuing this approach would likely be unproductive.
