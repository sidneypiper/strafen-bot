declare module 'fuzzaldrin-plus' {
    export function filter(candidates: string[], query: string): string[];
    export function score(string: string, query: string): number;
    export function match(string: string, query: string): number[];
    export function prepareQuery(query: string): any;
}
