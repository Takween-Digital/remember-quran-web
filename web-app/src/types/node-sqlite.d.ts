/**
 * Minimal ambient types for `node:sqlite` — added in Node 22.5, not yet
 * covered by this project's pinned `@types/node@^20`. Only the surface
 * `src/lib/db/local-sqlite.ts` actually calls.
 */
declare module "node:sqlite" {
  export interface StatementResultingChanges {
    lastInsertRowid: number | bigint
    changes: number | bigint
  }

  export class StatementSync {
    run(...params: unknown[]): StatementResultingChanges
    all(...params: unknown[]): unknown[]
    get(...params: unknown[]): unknown
    setReturnArrays(enabled: boolean): void
  }

  export class DatabaseSync {
    constructor(path: string, options?: Record<string, unknown>)
    exec(sql: string): void
    prepare(sql: string): StatementSync
    close(): void
  }
}
