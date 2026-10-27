/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Badge, Box, Flex, Heading, Separator, Text, Theme, useThemeContext, type ThemeProps } from "@radix-ui/themes";
import type { ReactElement } from "react";
import { ComponentBench } from "../../components/controls/component-bench";
import { ReadingStudy } from "./reading-study";
import { PaletteStudy } from "../../components/palette/palette-study";
import styles from "../../styles/reference-layout.module.css";

/** Controls for comparing upstream themes and application layout proposals. */
export interface ReferenceLayoutProps {
    accentColor: NonNullable<ThemeProps["accentColor"]>;
    grayColor: NonNullable<ThemeProps["grayColor"]>;
    radius: NonNullable<ThemeProps["radius"]>;
    scaling: NonNullable<ThemeProps["scaling"]>;
    density: "comfortable" | "compact";
    composition: "sidebar" | "stacked";
    typography: "brand" | "system";
}

/**
 * Renders an exploratory workspace using Radix components directly.
 *
 * @param props - Theme and layout values selected in Storybook controls.
 * @returns A responsive reference page, including interactive controls and colour samples.
 */
export function ReferenceLayout(props: ReferenceLayoutProps): ReactElement {
    const { accentColor, grayColor, radius, scaling, density, composition, typography } = props;

    const { appearance } = useThemeContext();

    return (
        <Theme accentColor={accentColor} grayColor={grayColor} radius={radius} scaling={scaling}>
            <div
                className={`${styles["workspace"]} core-ui-background`}
                data-density={density}
                data-composition={composition}
                data-typography={typography}
            >
                <a className={styles["skipLink"]} href="#main-content">
                    Skip to content
                </a>
                <header className={styles["header"]}>
                    <Flex align="center" gap="3">
                        <img src={`./favicon/icon-${appearance}.svg`} width="44" height="44" alt="" />
                        <div>
                            <Text as="p" className={styles["wordmark"]}>
                                White Eclipse
                            </Text>
                            <Text as="p" size="1" color="gray">
                                A place for considered work
                            </Text>
                        </div>
                    </Flex>
                    <Badge variant="outline" color="gray">
                        Design study · 01
                    </Badge>
                </header>
                <div className={styles["shell"]}>
                    <aside className={styles["sidebar"]}>
                        <Text as="p" size="1" color="gray" className={styles["eyebrow"]}>
                            Workspace
                        </Text>
                        <nav aria-label="Study sections" className={styles["navigation"]}>
                            <a href="#overview">
                                Overview <span>01</span>
                            </a>
                            <a href="#components">
                                Components <span>02</span>
                            </a>
                            <a href="#palette">
                                Colour system <span>03</span>
                            </a>
                        </nav>
                        <Separator size="4" />
                        <Box pt="4">
                            <Text as="p" size="2" color="gray">
                                Shared foundations.
                                <br />
                                Individual possibilities.
                            </Text>
                        </Box>
                    </aside>
                    <main id="main-content" className={styles["main"]} tabIndex={-1}>
                        <section id="overview" aria-labelledby="overview-title">
                            <Text as="p" size="1" color="gray" className={styles["eyebrow"]}>
                                White Eclipse / Foundations
                            </Text>
                            <Flex justify="between" align="center" gap="3" wrap="wrap" mb="4">
                                <Heading id="overview-title" as="h1" size="8">
                                    Room to think.
                                    <br />
                                    Tools to make.
                                </Heading>
                                <Badge color="gray" variant="soft">
                                    Exploring the everyday
                                </Badge>
                            </Flex>
                            <Text as="p" size="3" color="gray" className={styles["intro"]}>
                                A working canvas for clear ideas, thoughtful details, and the things we build together.
                            </Text>
                        </section>
                        <ReadingStudy />
                        <ComponentBench />
                        <PaletteStudy />
                        <footer className={styles["footer"]}>
                            <Text size="1" color="gray">
                                White Eclipse · Core UI
                            </Text>
                            <Text size="1" color="gray">
                                Exploratory proposal / 2026
                            </Text>
                        </footer>
                    </main>
                </div>
            </div>
        </Theme>
    );
}
