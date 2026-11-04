/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */
import type { PublicProject } from "../../../app/configuration";
import type { PreparedProject } from "../domain/types";


export type WorkerRequest =
    { type: "start"; project: PublicProject; force?: boolean } | { type: "update"; force: boolean } | { type: "close" };
export type WorkerResponse =
    | { type: "project"; generation: string; data: PreparedProject }
    | { type: "status"; updating: boolean; error?: string; restart?: boolean };
