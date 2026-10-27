/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Badge, Blockquote, Card, Code, Flex, Heading, Text } from "@radix-ui/themes";
import type { ReactElement } from "react";
import styles from "../../styles/reading.module.css";

/**
 * Places display type, reading text, and monospace annotations in context.
 *
 * @returns A reading sample and contrasting project summary.
 */
export function ReadingStudy(): ReactElement {
    return (
        <div className={styles["readingGrid"]}>
            <Card size="4" variant="surface">
                <Flex gap="2" align="center" mb="4">
                    <Badge color="gray">Field notes</Badge>
                    <Text size="1" color="gray">
                        4 min read
                    </Text>
                </Flex>
                <Heading as="h2" size="6" mb="3">
                    Clarity is a useful starting point.
                </Heading>
                <Text as="p" size="3" mb="3">
                    Good tools make space for the work. A legible page, a familiar control, and a little room between
                    ideas can turn a complex task into a comfortable routine.
                </Text>
                <Text as="p" size="3" color="gray" mb="4">
                    These foundations should feel connected across a quiet reading surface and a busy workspace. Details
                    bring character; content sets the pace.
                </Text>
                <Blockquote size="3">
                    Make the important things easy to find, and the next step easy to understand.
                </Blockquote>
            </Card>
            <Card size="4" variant="classic" className={styles["projectCard"]}>
                <Text as="p" size="1" className={styles["eyebrow"]}>
                    In progress
                </Text>
                <Heading as="h2" size="5" mt="4" mb="3">
                    A shared foundation
                </Heading>
                <Text as="p" size="2" color="gray" mb="5">
                    Small decisions, made consistently. Explore the relationship between colour, type, and space.
                </Text>
                <Flex direction="column" gap="3">
                    <Text size="2">
                        Status{" "}
                        <Badge color="green" ml="2">
                            On track
                        </Badge>
                    </Text>
                    <Text size="2">
                        Milestone <Code size="1">UI / 001</Code>
                    </Text>
                    <Text size="2" color="gray">
                        Updated 26 October 2026
                    </Text>
                </Flex>
            </Card>
        </div>
    );
}
