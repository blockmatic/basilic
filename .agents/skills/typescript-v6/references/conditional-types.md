# Conditional Types

**Type selection based on conditions:**

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// Extract function return types
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

type Fn = () => { name: string; age: number };
type Result = ReturnTypeOf<Fn>;  // { name: string; age: number }

// Extract array element types
type ElementOf<T> = T extends (infer E)[] ? E : never;

type Items = ElementOf<string[]>;  // string
```

## Use Cases
- Type transformation and extraction
- Conditional API responses based on request types
- Generic utility type creation
- Framework integration types
