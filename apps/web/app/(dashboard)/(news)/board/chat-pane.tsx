export type ChatTurn = { role: 'user' | 'assistant'; text: string }

export function ChatPane({ turns }: { turns: ChatTurn[] }) {
  if (turns.length === 0)
    return (
      <p className="text-muted-foreground text-sm" data-testid="chat-empty">
        Ask about this board. Advice is not a trade. Use Commands to change the table.
      </p>
    )
  return (
    <ul className="flex flex-col gap-3" data-testid="chat-transcript">
      {turns.map((turn, index) => (
        <li
          key={`${turn.role}-${index}`}
          data-role={turn.role}
          className="text-sm whitespace-pre-wrap"
        >
          {turn.text}
        </li>
      ))}
    </ul>
  )
}
