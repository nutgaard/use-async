# use-async

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Travis](https://img.shields.io/travis/nutgaard/use-async.svg)](https://travis-ci.org/nutgaard/use-async)
[![codecov](https://codecov.io/gh/nutgaard/use-async/branch/master/graph/badge.svg)](https://codecov.io/gh/nutgaard/use-async)
[![dependencies Status](https://david-dm.org/nutgaard/use-async/status.svg)](https://david-dm.org/nutgaard/use-async)

### Installation

```
npm install @nutgaard/use-async --save
```

### Usage
The library exposes one hook `useAsync`, and three utility-functions to help use the result (`isPending`, `hasData` and `hasError`).

```typescript
import React from 'react';
import useAsync, { isPending, hasError } from '@nutgaard/use-async';

const source = React.useCallback((isRerun) => Promise.resolve("your data here"), []);
const result = useAsync(source);

if (isPending(result)) {
  return <Spinner />;
} else if (hasError(result)) {
  return <Error />
} 

return <pre>{result.data}</pre>
``` 

### useAsync API

| Argument  | Type | Optional | Default |
| ------------- | ------------- | ------------- | ------------- |
| `source`  | `(isRerun) => Promise<DATA>` | No | - |
| `lazy`  | `boolean`  | Yes | `false` |
| `dependencyList`  | `Array<any>`  | Yes | `undefiend` |

In cases where `dependencyList` is defined it is passed on to `useEffect` instead of `source`.  
This allows a greater control of when the effect should run in cases where the `source` does
not necessarily change.

#### Types
Full documentation of types can be seen [here](https://www.utgaard.xyz/use-async/), or in the 80-ish lines of code.

## Credits

Made using the awesome [typescript library starter](https://github.com/alexjoverm/typescript-library-starter) 

