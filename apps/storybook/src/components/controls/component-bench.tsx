/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import {
    Badge,
    Button,
    Callout,
    Card,
    Checkbox,
    Dialog,
    Flex,
    Heading,
    RadioGroup,
    Switch,
    Tabs,
    Text,
    TextField,
} from "@radix-ui/themes";
import type { ReactElement } from "react";
import styles from "../../styles/controls.module.css";
import { ControlStates } from "./control-states";

/**
 * Supplies labelled inputs, action states, feedback, tabs, and a portalled dialog.
 *
 * @returns Interactive Radix controls for visual and keyboard review.
 */
export function ComponentBench(): ReactElement {
    return (
        <section id="components" aria-labelledby="components-title">
            <Flex justify="between" align="center" mb="4" gap="3" wrap="wrap">
                <Heading id="components-title" as="h2" size="5">
                    The everyday details
                </Heading>
                <Text size="1" color="gray">
                    Inputs, actions & feedback
                </Text>
            </Flex>
            <Card size="4">
                <Text as="p" size="2" color="gray" mb="4">
                    Try editing the fields and changing the preferences. Changes stay in this preview.
                </Text>
                <Tabs.Root defaultValue="preferences">
                    <Tabs.List aria-label="Component examples">
                        <Tabs.Trigger value="preferences">Preferences</Tabs.Trigger>
                        <Tabs.Trigger value="feedback">Feedback & states</Tabs.Trigger>
                        <Tabs.Trigger value="controls">Control states</Tabs.Trigger>
                        <Tabs.Trigger value="archived" disabled>
                            Archived
                        </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="preferences">
                        <div className={styles["controlsGrid"]}>
                            <Flex direction="column" gap="4">
                                <Text as="label" size="2" weight="medium">
                                    Collection name
                                    <TextField.Root
                                        mt="2"
                                        placeholder="e.g. Field notes"
                                        defaultValue="Design foundations"
                                    />
                                </Text>
                                <Text as="label" size="2" weight="medium">
                                    Description
                                    <TextField.Root mt="2" placeholder="What belongs here?" />
                                </Text>
                                <Text as="p" size="1" color="gray">
                                    A short name helps everyone find their way.
                                </Text>
                            </Flex>
                            <Flex direction="column" gap="4">
                                <Text as="label" size="2">
                                    <Flex align="center" gap="2">
                                        <Switch defaultChecked />
                                        Notify me about updates
                                    </Flex>
                                </Text>
                                <Text as="label" size="2">
                                    <Flex align="center" gap="2">
                                        <Checkbox defaultChecked />
                                        Include in workspace search
                                    </Flex>
                                </Text>
                                <RadioGroup.Root defaultValue="team" aria-label="Collection visibility">
                                    <RadioGroup.Item value="team">Visible to the team</RadioGroup.Item>
                                    <RadioGroup.Item value="private">Only me</RadioGroup.Item>
                                </RadioGroup.Root>
                            </Flex>
                        </div>
                        <Flex gap="3" wrap="wrap" mt="5" align="center">
                            <Dialog.Root>
                                <Dialog.Trigger>
                                    <Button>Create collection</Button>
                                </Dialog.Trigger>
                                <Dialog.Content maxWidth="420px">
                                    <Dialog.Title>A new place for your ideas</Dialog.Title>
                                    <Dialog.Description mb="4">
                                        This is a preview of the shared dialog styling. No collection will be saved.
                                    </Dialog.Description>
                                    <Text as="label" size="2">
                                        Collection name
                                        <TextField.Root mt="2" defaultValue="Design foundations" />
                                    </Text>
                                    <Flex gap="3" justify="end" mt="5">
                                        <Dialog.Close>
                                            <Button variant="soft" color="gray">
                                                Cancel
                                            </Button>
                                        </Dialog.Close>
                                        <Dialog.Close>
                                            <Button>Done</Button>
                                        </Dialog.Close>
                                    </Flex>
                                </Dialog.Content>
                            </Dialog.Root>
                            <Button variant="soft" className="w-full sm:w-auto">
                                Secondary action
                            </Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost" disabled>
                                Unavailable
                            </Button>
                        </Flex>
                    </Tabs.Content>
                    <Tabs.Content value="feedback">
                        <Flex direction="column" gap="4" pt="5">
                            <Callout.Root color="green">
                                <Callout.Text>Your workspace is up to date.</Callout.Text>
                            </Callout.Root>
                            <Callout.Root color="amber">
                                <Callout.Text>This collection has unsaved changes.</Callout.Text>
                            </Callout.Root>
                            <Callout.Root color="red">
                                <Callout.Text>
                                    This collection could not be saved. Choose a different name and try again.
                                </Callout.Text>
                            </Callout.Root>
                            <Text as="label" size="2">
                                Collection name
                                <TextField.Root
                                    mt="2"
                                    color="red"
                                    aria-invalid="true"
                                    aria-describedby="name-error"
                                    defaultValue=""
                                />
                            </Text>
                            <Text id="name-error" size="2" color="red">
                                Enter a name for this collection.
                            </Text>
                            <Flex gap="3" wrap="wrap">
                                <Badge color="green">Ready</Badge>
                                <Badge color="amber">In review</Badge>
                                <Badge color="red">Needs attention</Badge>
                                <Button loading>Saving</Button>
                                <Button disabled>Disabled</Button>
                            </Flex>
                        </Flex>
                    </Tabs.Content>
                    <Tabs.Content value="controls">
                        <ControlStates />
                    </Tabs.Content>
                </Tabs.Root>
            </Card>
        </section>
    );
}
