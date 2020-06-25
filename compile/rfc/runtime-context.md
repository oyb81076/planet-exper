# runtime context
```ts
interface SSRContext {
  urls: {
    pathname: string;
    file: string;
    query: Record<string, string|string[]|number|number[]|boolean|boolean[]|Date|Date[]>
    queryString: string;
  }
}
interface ClientContext {
  urls: {
    domain: string;
    pathname: string;
    file: string;
    query: Record<string, string|string[]|number|number[]|boolean|boolean[]|Date|Date[]>
    queryString: string;
    hash: string;
  }
}
```
