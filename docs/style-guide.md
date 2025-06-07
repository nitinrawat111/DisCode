# Style Guide

This style guide outlines the conventions and best practices for writing clean, safe, and maintainable TypeScript code. 
We'll try to adhere to these rules strictly to maintain consistency. But there can be exceptions, in which case we'll be documenting the reason in a comment.


### 1. 🔒 Always Use Strict Equality (`===` / `!==`)

Avoid `==` or `!=`, as they do type coercion, which can cause unexpected results.

```ts
// ✅ Correct
if (count === 0) {
  // ...
}

// ❌ Incorrect
if (count == 0) {
  // Loose equality may result in bugs
}
```

📖 **Reference**: [MDN - Equality comparisons and sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness)


### 2. Never Use `any`

Using `any` defeats the purpose of TypeScript’s static type checking.

```ts
// ❌ Bad
let data: any;

// ✅ Good
let data: unknown;

// ✅ Even Better (if structure is known)
type User = { id: string; name: string };
let data: User;
```

📖 **Reference**: [TypeScript Handbook - any](https://www.typescriptlang.org/docs/handbook/basic-types.html#any)


Prefer specific type declarations or `Record` when the shape of the object is not fixed.

```ts
// ✅ Good for unknown key/value pairs
const translations: Record<string, string> = {
  hello: "Hello",
  world: "World"
};

// ✅ Better when shape is known
type User = {
  id: string;
  name: string;
};
```

### 3. Use Explicit Type Checks (`typeof`)

Avoid truthy/falsy shorthand. Be precise in type checks.

```ts
// ✅ Correct
if (typeof value === "string") {
  // ...
}

// ❌ Bad
if (value) {
  // Might be undefined, 0, '', null, etc.
}
```

📖 **Reference**: [TypeScript Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)


### 4. Use **camelCase** for variables and function names

```ts
const userName = "John";

function fetchData() {
  // ...
}
```

### 5. Use **PascalCase** for exported variables, types, interfaces, classes (not for functions. the shoudl be camel-cased)

```ts
export const AppConfig = {};

// ✅ Good
export class UserService {}

// ✅ Good
export type UserId = string;
```

### 6. Avoid Default Exports

Named exports are easier to refactor and auto-import.

```ts
// ✅ Good
export function getUser() {}

// ❌ Bad
export default function getUser() {}
```

> ⚠️ *You may use default **imports** when required by a library (e.g. `import React from "react"`), but add a comment to explain why.*

```ts
// React requires default import
import React from "react";
```

📖 **Reference**: [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)

### 7. Use `zod` for Parsing Unknown Data

Whenever working with external or unknown inputs, parse and validate using `zod`.

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

type User = z.infer<typeof UserSchema>;

function parseUser(input: unknown): User {
  return UserSchema.parse(input); // Throws on invalid input
}
```

📖 **Reference**: [Zod Documentation](https://zod.dev/)

### 8. Avoid Magic Strings/Numbers — Use Enums or Constants

Magic strings/numbers are easy to mistype and hard to refactor. Enums and constants provide a single source of truth and better type safety.

```ts
// ✅ Good: Using enums
enum Role {
  Admin = "ADMIN",
  User = "USER",
  Moderator = "MOD"
}

function hasAccess(role: Role): boolean {
  return role === Role.Admin || role === Role.Moderator;
}

// Usage:
const myRole: Role = Role.User;

if (myRole === Role.Admin) {
  console.log("Admin access granted.");
}

// ❌ Bad: Magic string, prone to typos and fragile
if (myRole === "ADMIN") {
  console.log("Admin access granted.");
}
```

> 🔎 Enums are helpful because they give autocompletion, refactoring support, and make the valid set of values explicit.

📖 **Reference**: [TypeScript Enums](https://www.typescriptlang.org/docs/handbook/enums.html)

### 9. Use `readonly` for Immutable Properties

Use `readonly` to prevent properties from being reassigned accidentally, especially in configurations or DTOs.

```ts
type Config = {
  readonly apiKey: string;
  readonly retryCount: number;
};

const config: Config = {
  apiKey: "abc123",
  retryCount: 5
};

config.apiKey = "def456"; // ❌ Error: Cannot assign to 'apiKey' because it is a read-only property.
```

### 10. Use Optional Chaining & Nullish Coalescing

Avoid deeply nested null checks and fallback chaining with better readability and safety.

```ts
// ✅ Clean and safe
const displayName = user?.profile?.name ?? "Guest";

// ❌ Fragile and verbose
const displayName = user && user.profile && user.profile.name
  ? user.profile.name
  : "Guest";
```

📖 **Reference**: [Optional Chaining (?.)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)


### 11. Use `never` for Exhaustive Checks

The `never` type is useful in switch statements or logic where you want TypeScript to ensure all possible cases are handled.

```ts
function assertNever(x: never): never {
  throw new Error("Unexpected value: " + x);
}

type Shape = "circle" | "square";

function draw(shape: Shape) {
  switch (shape) {
    case "circle":
      return "🟠";
    case "square":
      return "🟥";
    default:
      return assertNever(shape); // ✅ Will error if a new case is added but not handled
  }
}
```

> 📌 This prevents bugs when new values are added to union types but forgotten in control flow.


## ⚠️ Exceptions

There **can be exceptions**, but:

> **Any exception to the above rules must be documented with a clear comment explaining the reasoning.**

Example:

```ts
// Exception: using default import as required by library
import React from "react";
```
