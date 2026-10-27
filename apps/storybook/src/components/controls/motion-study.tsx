/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Button, Flex, Heading, Switch, Text } from "@radix-ui/themes";
import { useEffect, useRef, useState, type ReactElement } from "react";

/**
 * Reports the browser's motion preference and rendered control transitions.
 *
 * @returns Interactive controls with computed transition durations for review.
 */
export function MotionStudy(): ReactElement {
    const button = useRef<HTMLButtonElement>(null);
    const toggle = useRef<HTMLButtonElement>(null);
    const [report, setReport] = useState("Reading motion preference…");
    const [checked, setChecked] = useState(false);
    useEffect(() => {
        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        /** Refreshes the browser's computed transition report. */
        const update = () => {
            const thumb = toggle.current?.querySelector(".rt-SwitchThumb");
            if (!button.current || !toggle.current || !thumb) {
                return;
            }
            const buttonDuration = getComputedStyle(button.current).transitionDuration;
            const frameDuration = getComputedStyle(toggle.current, "::before").transitionDuration;
            const thumbDuration = getComputedStyle(thumb).transitionDuration;
            setReport(
                `Reduced motion: ${preference.matches ? "on" : "off"}. Button frame: ${buttonDuration}. Switch frame: ${frameDuration}. Switch thumb: ${thumbDuration}.`,
            );
        };
        update();
        preference.addEventListener("change", update);
        return () => {
            preference.removeEventListener("change", update);
        };
    }, [checked]);
    return (
        <Flex direction="column" gap="4" p="4">
            <Heading as="h1" size="5">
                Motion preferences
            </Heading>
            <Text as="p" size="2">
                Change the browser or system motion preference, then focus or activate these controls.
            </Text>
            <Flex gap="4" align="center" wrap="wrap">
                <Button ref={button}>Focus this action</Button>
                <Text as="label" size="2">
                    <Flex gap="2" align="center">
                        <Switch ref={toggle} checked={checked} onCheckedChange={setChecked} />
                        Toggle notification updates
                    </Flex>
                </Text>
            </Flex>
            <Text as="p" size="2">
                {report}
            </Text>
        </Flex>
    );
}
