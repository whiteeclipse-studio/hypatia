/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { createContext, useContext, useSyncExternalStore } from "react";
import type { DocumentationState, DocumentationStore } from "./store";


export const DocumentationContext = createContext<DocumentationStore | undefined>(undefined);
/**
 * React owns subscriptions; the store owns loading, persistence and worker lifetimes.
 *
 * @returns The prepared result.
 * @throws {Error} If the supplied input or current state is invalid.
 */
export function useDocumentation(): { state: DocumentationState; store: DocumentationStore } {
    const store = useContext(DocumentationContext);
    if (store === undefined) {
        throw new Error("Documentation provider is missing.");
    }
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
    return { state, store };
}
