/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { Button, Checkbox, Flex, Heading, RadioGroup, Select, Switch, Text, TextField } from "@radix-ui/themes";
import { useEffect, useId, useRef, useState, type ReactElement } from "react";
import styles from "../../styles/controls.module.css";

/**
 * Renders additional states for visual, keyboard, and loading review.
 *
 * @returns Interactive control-state examples.
 */
export function ControlStates(): ReactElement {
    const selectId = useId();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const saveButton = useRef<HTMLButtonElement>(null);
    const [buttonSize, setButtonSize] = useState("");
    useEffect(() => {
        const button = saveButton.current;
        if (!button) {
            return;
        }
        const precision = 2;
        const observer = new ResizeObserver(() => {
            const bounds = button.getBoundingClientRect();
            setButtonSize(`${bounds.width.toFixed(precision)} × ${bounds.height.toFixed(precision)}px`);
        });
        observer.observe(button);
        return () => {
            observer.disconnect();
        };
    }, []);
    let saveStatus = saved ? "Collection saved." : "No save in progress.";
    if (saving) {
        saveStatus = "Saving collection…";
    }

    return (
        <Flex direction="column" gap="5" pt="5">
            <div className={styles["controlsGrid"]}>
                <Flex direction="column" gap="4">
                    <Heading as="h3" size="3">
                        Fields and menus
                    </Heading>
                    <Text as="label" size="2">
                        Read-only collection ID
                        <TextField.Root mt="2" readOnly value="WE-001" />
                    </Text>
                    <Text as="label" size="2">
                        Disabled collection name
                        <TextField.Root mt="2" disabled defaultValue="Archived collection" />
                    </Text>
                    <Flex direction="column" gap="2">
                        <Text as="label" size="2" htmlFor={selectId}>
                            Sort collections
                        </Text>
                        <Select.Root defaultValue="updated">
                            <Select.Trigger id={selectId} />
                            <Select.Content>
                                <Select.Item value="updated">Recently updated</Select.Item>
                                <Select.Item value="name">Name</Select.Item>
                                <Select.Item value="created">Date created</Select.Item>
                                <Select.Item value="restricted" disabled>
                                    Restricted order
                                </Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </Flex>
                    <Select.Root defaultValue="updated" disabled>
                        <Select.Trigger aria-label="Disabled sort order" />
                        <Select.Content>
                            <Select.Item value="updated">Recently updated</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>
                <Flex direction="column" gap="4">
                    <Heading as="h3" size="3">
                        Selection states
                    </Heading>
                    <Text as="label" size="2">
                        <Flex gap="2" align="center">
                            <Checkbox defaultChecked="indeterminate" />
                            Some collections selected
                        </Flex>
                    </Text>
                    <Text as="label" size="2">
                        <Flex gap="2" align="center">
                            <Checkbox disabled />
                            Disabled unchecked
                        </Flex>
                    </Text>
                    <Text as="label" size="2">
                        <Flex gap="2" align="center">
                            <Checkbox disabled defaultChecked />
                            Disabled checked
                        </Flex>
                    </Text>
                    <Text as="label" size="2">
                        <Flex gap="2" align="center">
                            <Checkbox disabled checked="indeterminate" />
                            Disabled mixed
                        </Flex>
                    </Text>
                    <Text as="label" size="2">
                        <Flex gap="2" align="center">
                            <Switch disabled />
                            Disabled switch off
                        </Flex>
                    </Text>
                    <Text as="label" size="2">
                        <Flex gap="2" align="center">
                            <Switch disabled defaultChecked />
                            Disabled switch on
                        </Flex>
                    </Text>
                    <RadioGroup.Root disabled defaultValue="selected" aria-label="Disabled visibility choices">
                        <RadioGroup.Item value="selected">Disabled selected</RadioGroup.Item>
                        <RadioGroup.Item value="unselected">Disabled unselected</RadioGroup.Item>
                    </RadioGroup.Root>
                </Flex>
            </div>
            <Heading as="h3" size="3">
                Action variants
            </Heading>
            <Flex gap="3" wrap="wrap" align="center">
                <Button>Primary</Button>
                <Button variant="soft">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
            </Flex>
            <Flex gap="3" wrap="wrap" align="center">
                <Button disabled>Primary disabled</Button>
                <Button variant="soft" disabled>
                    Secondary disabled
                </Button>
                <Button variant="outline" disabled>
                    Outline disabled
                </Button>
                <Button variant="ghost" disabled>
                    Ghost disabled
                </Button>
            </Flex>
            <Heading as="h3" size="3">
                Loading
            </Heading>
            <Text as="p" size="2" color="gray">
                Start and finish a local save to compare the button size, disabled state, and announcement.
            </Text>
            <Flex gap="3" wrap="wrap" align="center">
                <Button
                    ref={saveButton}
                    loading={saving}
                    aria-busy={saving}
                    onClick={() => {
                        setSaved(false);
                        setSaving(true);
                    }}
                >
                    Save collection
                </Button>
                <Button
                    variant="outline"
                    disabled={!saving}
                    onClick={() => {
                        setSaving(false);
                        setSaved(true);
                    }}
                >
                    Finish preview save
                </Button>
            </Flex>
            <Text as="p" size="2" role="status">
                {saveStatus}
            </Text>
            <Text as="p" size="1" color="gray">
                Save button size: {buttonSize}
            </Text>
            <Flex gap="3" wrap="wrap" align="center">
                <Button loading>Primary loading</Button>
                <Button variant="soft" loading>
                    Secondary loading
                </Button>
                <Button variant="outline" loading>
                    Outline loading
                </Button>
                <Button variant="ghost" loading>
                    Ghost loading
                </Button>
            </Flex>
        </Flex>
    );
}
