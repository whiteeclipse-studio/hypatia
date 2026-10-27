/* Copyright © 2026 White Eclipse. Released under the MIT License. */

/**
 * Detects ASCII controls without allowing invisible URL or filename aliases.
 *
 * @param value - Untrusted text.
 * @param includeSpace - Whether ordinary ASCII spaces are also forbidden.
 * @returns Whether a forbidden control or space occurs.
 */
export function hasControls(value: string, includeSpace = false): boolean {
    for (const character of value) {
        if (character === "\u007f" || (includeSpace ? character <= " " : character < " ")) {
            return true;
        }
    }
    return false;
}
