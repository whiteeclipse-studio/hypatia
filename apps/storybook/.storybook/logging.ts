/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { getLogger, makeDefaultLogConfigurationBuilder } from "@whiteeclipse/log";

// Both Storybook renderers load this module in their own browser context.
// Configure asynchronously without requiring top-level await in the manager bundle.
makeDefaultLogConfigurationBuilder()
    .apply()
    .then(() => {
        getLogger(["whiteeclipse", "storybook"]).debug("Initialized Storybook logging.");
    })
    .catch(reportError);
