### Steering and queuing

When Codex is already working, you can send another message without waiting for
the current run to finish:

- **Steer** adds the message to the current run. Use it to change direction, add
  a missing detail, or share new information.
- **Queue** saves the message for the next run. Use it for a follow-up that should
  wait until the current work finishes.

In the ChatGPT desktop app, choose the default under
[**Settings > General > Follow-up behavior**](https://learn.chatgpt.com/docs/reference/settings#general).
Queued messages appear above the composer, where you can edit, reorder, send, or
delete them. The setting also shows the shortcut for using the other behavior
for one message without changing your default.

In Codex CLI, press <kbd>Enter</kbd> while Codex is working to steer the current
turn, or press <kbd>Tab</kbd> to queue the message for the next turn. See the
[interactive shortcuts](https://learn.chatgpt.com/docs/developer-commands?surface=cli#cli-interactive-shortcuts)
for details.
