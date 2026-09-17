# Discriminated Unions

**Type-safe state machines and variants:**

## State Machines

```typescript
// State machine with exhaustive checking
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; error: Error };

function renderState(state: LoadingState): string {
  switch (state.status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Loaded ${state.data.length} items`;
    case 'error':
      return `Error: ${state.error.message}`;
  }
  // Exhaustiveness checking ensures all cases handled
}
```

## Action Types

```typescript
// API action types
type Action =
  | { type: 'FETCH_USER'; payload: { userId: string } }
  | { type: 'UPDATE_USER'; payload: { userId: string; data: Partial<User> } }
  | { type: 'DELETE_USER'; payload: { userId: string } }
  | { type: 'CLEAR_USERS' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_USER':
      // action.payload is { userId: string }
      return { ...state, loading: true };
    case 'UPDATE_USER':
      // action.payload is { userId: string; data: Partial<User> }
      return updateUser(state, action.payload);
    case 'DELETE_USER':
      return deleteUser(state, action.payload.userId);
    case 'CLEAR_USERS':
      // action has no payload
      return { ...state, users: [] };
  }
}
```

## Best Practices

- Always include a discriminant property (e.g., `status`, `type`)
- Use string literal types for discriminant values
- Enable `strictNullChecks` for exhaustiveness checking
- Use `never` to ensure all cases are handled
