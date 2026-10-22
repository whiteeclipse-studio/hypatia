/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** Application-owned identity of a configured public documentation repository. */
export interface RepositoryConfiguration {
    name: string;
    title: string;
    url: string;
    prepare?: DocumentationPreparer;
}

/** Pinned source provenance recorded in every deployable build manifest. */
export interface RepositorySnapshot {
    name: string;
    url: string;
    commit: string;
}

/** Inputs exposed to trusted, explicitly imported preparation code. */
export interface DocumentationPreparation {
    source: RepositorySnapshot;
    docsRoot: string;
    /**
     * Reads an explicitly requested file from the same immutable repository snapshot.
     *
     * @param path - Repository-relative source path.
     * @returns Bounded source bytes, without executing filters or repository code.
     * @rejects If the path is unsafe, not a regular tracked file, or exceeds the limit.
     */
    readSource(path: string): Promise<Buffer>;
    signal: AbortSignal;
}

/** Application-controlled generation stage; repository-supplied scripts are never discovered or executed. */
export type DocumentationPreparer =
    /**
     * Generates publication inputs inside the staged docs tree before catalogue validation.
     *
     * @param context - Pinned source reader, writable docs staging, and processing deadline.
     * @returns Completion after generated inputs have been written.
     * @rejects If preparation fails or its deadline is exceeded.
     */
    (context: DocumentationPreparation) => Promise<void>;

/** Prepared documentation tree with no dependency on mutable remote refs. */
export interface LoadedRepository {
    configuration: RepositoryConfiguration;
    source: RepositorySnapshot;
    docsRoot: string;
}
