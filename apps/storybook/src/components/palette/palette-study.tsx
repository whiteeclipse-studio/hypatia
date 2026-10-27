/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Flex, Heading, Text } from "@radix-ui/themes";
import type { CSSProperties, ReactElement } from "react";
import styles from "../../styles/palette.module.css";

const steps = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

/**
 * Builds a scale sample without overlaying text on unverified colour contrasts.
 *
 * @param scale - Semantic Radix scale to display.
 * @param step - Scale step, from one to twelve.
 * @returns A colour chip and a separately labelled scale index.
 */
function swatch(scale: string, step: string): ReactElement {
    const style: CSSProperties = { backgroundColor: `var(--${scale}-${step})` };
    return (
        <li key={step}>
            <span className={styles["swatch"]} style={style} />
            <Text as="span" size="1" color="gray">
                {step}
            </Text>
        </li>
    );
}

/**
 * Shows the active neutral and accent scales for comparison in context.
 *
 * @returns Twelve-step palettes driven by the enclosing Radix Theme.
 */
export function PaletteStudy(): ReactElement {
    /**
     * Creates an accent sample for the requested step.
     *
     * @param step - Radix scale index.
     * @returns The accent chip.
     */
    function accentSwatch(step: string): ReactElement {
        return swatch("accent", step);
    }
    /**
     * Creates a neutral sample for the requested step.
     *
     * @param step - Radix scale index.
     * @returns The neutral chip.
     */
    function graySwatch(step: string): ReactElement {
        return swatch("gray", step);
    }
    const accents = steps.map(accentSwatch);
    const grays = steps.map(graySwatch);

    return (
        <section id="palette" aria-labelledby="palette-title">
            <Heading id="palette-title" as="h2" size="5" mb="4">
                Colour, in context
            </Heading>
            <Flex direction="column" gap="4">
                <div>
                    <Text as="p" size="2" mb="2">
                        Neutral scale
                    </Text>
                    <ol aria-label="Neutral scale steps" className={styles["palette"]}>
                        {grays}
                    </ol>
                </div>
                <div>
                    <Text as="p" size="2" mb="2">
                        Accent scale
                    </Text>
                    <ol aria-label="Accent scale steps" className={styles["palette"]}>
                        {accents}
                    </ol>
                </div>
            </Flex>
        </section>
    );
}
