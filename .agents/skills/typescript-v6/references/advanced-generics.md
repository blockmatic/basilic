# Advanced Generics

**Generic constraints and inference:**

## Basic Constraints

```typescript
// Constrain to objects with specific keys
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'John', age: 30 };
const name = getProperty(user, 'name');  // Type: string
// const invalid = getProperty(user, 'invalid');  // Error

// Multiple constraints
function merge<T extends object, U extends object>(
  obj1: T,
  obj2: U
): T & U {
  return { ...obj1, ...obj2 };
}
```

## Generic Inference

```typescript
// Infer from function implementation
function createAction<T extends string, P>(
  type: T,
  payload: P
) {
  return { type, payload };
}

const action = createAction('UPDATE_USER', { id: 1, name: 'John' });
// Type: { type: 'UPDATE_USER'; payload: { id: number; name: string } }

// Infer generic types from usage
function useState<S>(
  initialState: S | (() => S)
): [S, (newState: S) => void] {
  // Implementation
}

const [count, setCount] = useState(0);  // S inferred as number
const [user, setUser] = useState({ name: 'John' });  // S inferred as { name: string }
```

## Higher-Kinded Types Pattern

```typescript
// Type-safe data structures
interface Functor<F> {
  map<A, B>(fa: F extends { value: any } ? F : never, f: (a: A) => B): any;
}

interface Box<T> {
  value: T;
}

const boxFunctor: Functor<Box<any>> = {
  map<A, B>(fa: Box<A>, f: (a: A) => B): Box<B> {
    return { value: f(fa.value) };
  }
};
```

## Conditional Generic Types

```typescript
// Return type varies based on parameter
type ApiResponse<T extends string> =
  T extends 'json' ? object :
  T extends 'text' ? string :
  T extends 'blob' ? Blob :
  never;

async function fetch<T extends 'json' | 'text' | 'blob'>(
  url: string,
  type: T
): Promise<ApiResponse<T>> {
  // Implementation
}

const json = await fetch('/api', 'json');    // Type: object
const text = await fetch('/api', 'text');    // Type: string
const blob = await fetch('/api', 'blob');    // Type: Blob
```
