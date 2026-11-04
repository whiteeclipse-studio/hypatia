/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

/** Optional Markdown extensions and metadata section labels. */
export interface MarkdownParserConfiguration {
    /** Parse Obsidian-style wiki links, preserving authored destinations. Defaults to false. */
    readonly wikilinks?: boolean;
    /** Parse Obsidian-style callouts, including custom types. Defaults to false. */
    readonly callouts?: boolean;
    /** Additional localized headings, matched without regard to case or inline formatting. */
    readonly headings?: {
        /** Added to the default Copyright and licence heading. */
        readonly copyrightAndLicence?: readonly string[];
        /** Added to the default Revisions heading. */
        readonly revisions?: readonly string[];
    };
}
