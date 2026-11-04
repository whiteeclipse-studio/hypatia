/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import { configuration } from "./configuration";
import type { Bootstrap } from "../modules/documentation/domain/types";


/**
 * Selects a module by an explicit local override or the configured landing host.
 *
 * @param hostname The incoming request hostname without its port.
 * @returns The website module to serve.
 */
export function websiteModule(hostname: string): Bootstrap["module"] {
    const override = process.env["WEBSITE_MODULE"];
    if (override === "landing" || override === "documentation") {
        return override;
    }
    return hostname === new URL(configuration.landingOrigin).hostname ? "landing" : "documentation";
}
