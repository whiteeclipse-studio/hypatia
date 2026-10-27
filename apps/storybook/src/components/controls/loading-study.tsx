/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useEffect, useRef, useState, type ReactElement } from "react";

const variants = ["solid", "soft", "outline", "ghost"] as const;
const sizes = ["1", "2", "3", "4"] as const;

/**
 * Compares the rendered dimensions of matching normal and loading buttons.
 *
 * @param props - Native Radix variant and size to compare.
 * @param props.variant - Button appearance.
 * @param props.size - Native button size.
 * @returns A labelled pair and its measured size comparison.
 */
function LoadingPair(props: { variant: (typeof variants)[number]; size: (typeof sizes)[number] }): ReactElement {
    const normal = useRef<HTMLButtonElement>(null);
    const loading = useRef<HTMLButtonElement>(null);
    const [result, setResult] = useState("Measuring…");
    useEffect(() => {
        const normalButton = normal.current;
        const loadingButton = loading.current;
        if (!normalButton || !loadingButton) {
            return;
        }
        const observer = new ResizeObserver(() => {
            const before = normalButton.getBoundingClientRect();
            const after = loadingButton.getBoundingClientRect();
            const precision = 2;
            const beforeSize = `${before.width.toFixed(precision)} × ${before.height.toFixed(precision)}`;
            const afterSize = `${after.width.toFixed(precision)} × ${after.height.toFixed(precision)}`;
            setResult(`${beforeSize === afterSize ? "Stable" : "Mismatch"}: ${beforeSize} → ${afterSize}px`);
        });
        observer.observe(normalButton);
        observer.observe(loadingButton);
        return () => {
            observer.disconnect();
        };
    }, []);
    return (
        <Flex direction="column" gap="3" p="3">
            <Text as="p" size="2" weight="medium">
                {props.variant}, size {props.size}
            </Text>
            <Flex gap="4" wrap="wrap" align="center">
                <Button {...props} ref={normal}>
                    Save collection
                </Button>
                <Button {...props} ref={loading} loading>
                    Save collection
                </Button>
            </Flex>
            <Text as="p" size="1">
                {result}
            </Text>
        </Flex>
    );
}

/**
 * Covers all Core UI button variants across native Radix sizes.
 *
 * @returns Rendered loading comparisons with live dimension reports.
 */
export function LoadingStudy(): ReactElement {
    const pairs = variants.flatMap(variant =>
        sizes.map(size => <LoadingPair key={`${variant}-${size}`} variant={variant} size={size} />),
    );
    return (
        <Flex direction="column" gap="4" p="4">
            <Heading as="h1" size="5">
                Loading dimensions
            </Heading>
            <Text as="p" size="2">
                Each pair uses the same label. Measurements compare normal and loading dimensions in CSS pixels.
            </Text>
            {pairs}
        </Flex>
    );
}
