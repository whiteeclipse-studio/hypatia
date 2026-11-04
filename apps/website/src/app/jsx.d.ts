/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { ReactElement } from "react";
// rehype-react 8 names the global JSX result type; React 19 scopes its own namespace.
declare global {
    namespace JSX {
        type Element = ReactElement;
    }
}
