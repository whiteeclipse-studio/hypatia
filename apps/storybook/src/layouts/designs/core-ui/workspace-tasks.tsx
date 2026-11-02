/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useState, type SubmitEvent, type ReactElement } from "react";
import {
    Avatar,
    Badge,
    Button,
    Checkbox,
    Dialog,
    DropdownMenu,
    IconButton,
    Text,
    TextField,
    Tooltip,
} from "@radix-ui/themes";

import { useTranslation } from "@whiteeclipse/i18next";

/** Synthetic tasks for an interactive workspace study. */
export interface Task {
    id: string;
    title: string;
    team: "design" | "quality" | "engineering";
    custom?: boolean;
    done: boolean;
}

export const initialTasks: Task[] = [
    { id: "navigation", title: "tasks.navigation", team: "design", done: true },
    { id: "keyboard", title: "tasks.keyboard", team: "quality", done: false },
    { id: "reading", title: "tasks.reading", team: "design", done: false },
    { id: "handoff", title: "tasks.handoff", team: "engineering", done: false },
];

/** One controlled task and its local action. */
interface TaskRowProps {
    task: Task;
    onToggle(id: string): void;
}

/**
 * Shows a task with an accessible checkbox and an equivalent contextual action.
 *
 * @param props - The task and parent update callback.
 * @returns A responsive task row.
 */
export function TaskRow(props: TaskRowProps): ReactElement {
    const { task } = props;
    const { t } = useTranslation("core-ui");
    let title = task.title;
    if (task.custom !== true) {
        title = t(task.title);
    }
    let checkboxLabel = "tasks.markComplete";
    let actionLabel = "tasks.completeAction";
    let titleClass = "";
    if (task.done) {
        checkboxLabel = "tasks.markIncomplete";
        actionLabel = "tasks.reopen";
        titleClass = "text-(--gray-11) line-through";
    }
    const team = t(`teams.${task.team}`);
    /** Toggles this task's completion. */
    function toggle(): void {
        props.onToggle(task.id);
    }
    return (
        <li className="flex items-start gap-3 border-b border-(--gray-5) py-5 last:border-0">
            <Checkbox
                checked={task.done}
                onCheckedChange={toggle}
                aria-label={t(checkboxLabel, { title })}
                className="mt-1 shrink-0"
            />
            <div className="min-w-0 flex-1">
                <Text as="p" size="2" className={titleClass}>
                    {title}
                </Text>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Avatar size="1" fallback={team.slice(0, 1)} />
                    <Text size="1" color="gray">
                        {team}
                    </Text>
                    {task.done && (
                        <Badge color="green" size="1">
                            {t("tasks.complete")}
                        </Badge>
                    )}
                </div>
            </div>
            <DropdownMenu.Root>
                <Tooltip content={t("tasks.actions", { title })}>
                    <DropdownMenu.Trigger>
                        <IconButton size="1" variant="ghost" aria-label={t("tasks.actions", { title })}>
                            ⋯
                        </IconButton>
                    </DropdownMenu.Trigger>
                </Tooltip>
                <DropdownMenu.Content>
                    <DropdownMenu.Item onSelect={toggle}>{t(actionLabel)}</DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </li>
    );
}

/** Callback for adding a synthetic task to the current preview. */
interface NewTaskProps {
    onAdd(title: string): void;
}

/**
 * Adds a task through a modal form without contacting external services.
 *
 * @param props - The parent task-creation callback.
 * @returns The new-task button and dialog.
 */
export function NewTaskDialog(props: NewTaskProps): ReactElement {
    const { t } = useTranslation("core-ui");
    const [invalid, setInvalid] = useState(false);
    const [open, setOpen] = useState(false);
    let nameError: string | undefined;
    if (invalid) {
        nameError = "task-name-error";
    }
    /**
     * Validates and creates a task using localized feedback.
     *
     * @param event - The submitted dialog form.
     */
    function submit(event: SubmitEvent<HTMLFormElement>): void {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get("title");
        let title = "";
        if (typeof value === "string") {
            title = value.trim();
        }
        setInvalid(title === "");
        if (title !== "") {
            props.onAdd(title);
            setOpen(false);
        }
    }
    /**
     * Clears stale validation feedback when the dialog opens or closes.
     *
     * @param next - The dialog's next open state.
     */
    function changeOpen(next: boolean): void {
        setOpen(next);
        setInvalid(false);
    }
    /** Clears feedback as the task title is edited. */
    function editName(): void {
        setInvalid(false);
    }
    return (
        <Dialog.Root open={open} onOpenChange={changeOpen}>
            <Dialog.Trigger>
                <Button>
                    {t("tasks.new")} <span aria-hidden="true">＋</span>
                </Button>
            </Dialog.Trigger>
            <Dialog.Content maxWidth="440px">
                <Dialog.Title>{t("tasks.dialogTitle")}</Dialog.Title>
                <Dialog.Description size="2" mb="5">
                    {t("tasks.dialogDescription")}
                </Dialog.Description>
                <form noValidate onSubmit={submit} className="grid gap-5">
                    <label className="grid gap-2">
                        <Text size="2" weight="medium">
                            {t("tasks.name")}
                        </Text>
                        <TextField.Root
                            name="title"
                            onChange={editName}
                            required
                            maxLength={120}
                            placeholder={t("tasks.placeholder")}
                            aria-invalid={invalid}
                            aria-describedby={nameError}
                        />
                    </label>
                    {invalid && (
                        <Text id="task-name-error" size="2" color="red" role="alert">
                            {t("validation.taskName")}
                        </Text>
                    )}
                    <div className="flex flex-wrap justify-end gap-3">
                        <Dialog.Close>
                            <Button type="button" variant="outline">
                                {t("common.cancel")}
                            </Button>
                        </Dialog.Close>
                        <Button type="submit">{t("tasks.add")}</Button>
                    </div>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}
