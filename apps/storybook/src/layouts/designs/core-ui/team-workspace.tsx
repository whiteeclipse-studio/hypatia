/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import { useState, type ChangeEvent, type ReactElement } from "react";
import { Avatar, Badge, Card, Heading, Progress, Separator, Table, Tabs, Text, TextField } from "@radix-ui/themes";
import { useLocale, useTranslation } from "@whiteeclipse/i18next";
import { initialTasks, NewTaskDialog, TaskRow, type Task } from "./workspace-tasks";

const percent = 100;

/**
 * Composes project tasks, summary panels, and a review table into a responsive workspace.
 *
 * @returns The exploratory team workspace layout.
 */
export function TeamWorkspace(): ReactElement {
    const { t } = useTranslation("core-ui");
    const { locale } = useLocale();
    const [tasks, setTasks] = useState(initialTasks);
    const [query, setQuery] = useState("");
    const completed = tasks.filter(isComplete).length;
    const progress = (completed / tasks.length) * percent;
    /**
     * Identifies completed tasks for the progress summary.
     *
     * @param task - A task in the local collection.
     * @returns Whether the task is complete.
     */
    function isComplete(task: Task): boolean {
        return task.done;
    }
    /**
     * Toggles one task without modifying the fixture collection.
     *
     * @param id - The selected task identifier.
     */
    function toggle(id: string): void {
        /**
         * Updates only the selected task.
         *
         * @param task - An existing task.
         * @returns The updated or unchanged task.
         */
        function update(task: Task): Task {
            if (task.id === id) {
                return { ...task, done: !task.done };
            }
            return task;
        }
        setTasks(tasks.map(update));
    }
    /**
     * Adds an in-memory task to the current preview.
     *
     * @param title - The validated task title.
     */
    function add(title: string): void {
        setTasks([...tasks, { id: `task-${tasks.length}`, title, custom: true, team: "design", done: false }]);
    }
    /**
     * Checks the search query against a task's title and team.
     *
     * @param task - A task in the local collection.
     * @returns Whether it matches the search query.
     */
    function matches(task: Task): boolean {
        let title = task.title;
        if (task.custom !== true) {
            title = t(task.title);
        }
        return `${title} ${t(`teams.${task.team}`)}`
            .toLocaleLowerCase(locale)
            .includes(query.toLocaleLowerCase(locale));
    }
    /**
     * Composes one controlled row outside the page's JSX.
     *
     * @param task - A visible task.
     * @returns Its interactive row.
     */
    function renderTask(task: Task): ReactElement {
        return <TaskRow key={task.id} task={task} onToggle={toggle} />;
    }
    const rows = tasks.filter(matches).map(renderTask);
    /**
     * Filters the task collection as the search field changes.
     *
     * @param event - The native text input change.
     */
    function changeQuery(event: ChangeEvent<HTMLInputElement>): void {
        setQuery(event.currentTarget.value);
    }

    return (
        <main lang={locale} className="core-ui-background min-h-dvh p-4 sm:p-8 lg:p-12">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-(--gray-6) pb-5">
                    <Text size="2" weight="medium">
                        White Eclipse <span className="mx-2 text-(--gray-11)">/</span> {t("common.studio")}
                    </Text>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline">{t("workspace.cycle")}</Badge>
                        <Avatar size="2" fallback="WE" />
                    </div>
                </header>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
                    <div className="max-w-xl">
                        <Text size="1" color="gray" className="uppercase tracking-widest">
                            {t("workspace.eyebrow")}
                        </Text>
                        <Heading as="h1" size={{ initial: "7", sm: "8" }} mt="3" mb="3">
                            {t("workspace.title")}
                        </Heading>
                        <Text as="p" color="gray">
                            {t("workspace.description")}
                        </Text>
                    </div>
                    <NewTaskDialog onAdd={add} />
                </div>
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <Card className="min-w-0" size={{ initial: "2", sm: "3" }}>
                        <Tabs.Root defaultValue="tasks">
                            <Tabs.List>
                                <Tabs.Trigger value="tasks">{t("workspace.tasks")}</Tabs.Trigger>
                                <Tabs.Trigger value="reviews">{t("workspace.reviews")}</Tabs.Trigger>
                            </Tabs.List>
                            <Tabs.Content value="tasks" className="pt-6">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                    <Heading as="h2" size="4">
                                        {t("workspace.thisCycle")}{" "}
                                        <Text color="gray" size="2">
                                            / {tasks.length}
                                        </Text>
                                    </Heading>
                                    <TextField.Root
                                        aria-label={t("workspace.search")}
                                        placeholder={t("workspace.searchPlaceholder")}
                                        value={query}
                                        onChange={changeQuery}
                                        className="w-full sm:max-w-56"
                                    >
                                        <TextField.Slot aria-hidden="true">⌕</TextField.Slot>
                                    </TextField.Root>
                                </div>
                                <ul className="m-0 list-none p-0">{rows}</ul>
                                {rows.length === 0 && (
                                    <Text as="p" color="gray" className="py-8" role="status">
                                        {t("workspace.noResults")}
                                    </Text>
                                )}
                            </Tabs.Content>
                            <Tabs.Content value="reviews" className="pt-6">
                                <Heading as="h2" size="4" mb="4">
                                    {t("workspace.upcoming")}
                                </Heading>
                                <div
                                    className="overflow-x-auto"
                                    role="region"
                                    aria-label={t("workspace.schedule")}
                                    tabIndex={0}
                                >
                                    <Table.Root className="min-w-100">
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.ColumnHeaderCell>{t("workspace.review")}</Table.ColumnHeaderCell>
                                                <Table.ColumnHeaderCell>{t("workspace.team")}</Table.ColumnHeaderCell>
                                                <Table.ColumnHeaderCell>{t("workspace.status")}</Table.ColumnHeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            <Table.Row>
                                                <Table.RowHeaderCell>
                                                    {t("workspace.navigationReview")}
                                                </Table.RowHeaderCell>
                                                <Table.Cell>{t("teams.design")}</Table.Cell>
                                                <Table.Cell>
                                                    <Badge color="green">{t("workspace.ready")}</Badge>
                                                </Table.Cell>
                                            </Table.Row>
                                            <Table.Row>
                                                <Table.RowHeaderCell>
                                                    {t("workspace.keyboardReview")}
                                                </Table.RowHeaderCell>
                                                <Table.Cell>{t("teams.quality")}</Table.Cell>
                                                <Table.Cell>
                                                    <Badge color="amber">{t("workspace.inProgress")}</Badge>
                                                </Table.Cell>
                                            </Table.Row>
                                            <Table.Row>
                                                <Table.RowHeaderCell>
                                                    {t("workspace.releaseReview")}
                                                </Table.RowHeaderCell>
                                                <Table.Cell>{t("teams.engineering")}</Table.Cell>
                                                <Table.Cell>
                                                    <Badge color="gray">{t("common.draft")}</Badge>
                                                </Table.Cell>
                                            </Table.Row>
                                        </Table.Body>
                                    </Table.Root>
                                </div>
                            </Tabs.Content>
                        </Tabs.Root>
                    </Card>
                    <aside
                        className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-1"
                        aria-label={t("workspace.context")}
                    >
                        <Card size="3">
                            <Text size="1" color="gray" className="uppercase tracking-widest">
                                {t("workspace.progress")}
                            </Text>
                            <Heading as="h2" size="6" mt="3" mb="4">
                                {t("workspace.completion", { count: completed, total: tasks.length })}
                            </Heading>
                            <Progress value={progress} aria-label={t("workspace.completionLabel")} />
                            <Text as="p" size="2" color="gray" mt="4">
                                {t("workspace.nextReview")}
                            </Text>
                        </Card>
                        <Card size="3">
                            <Badge variant="outline" mb="4">
                                {t("workspace.noteBadge")}
                            </Badge>
                            <Heading as="h2" size="4" mb="3">
                                {t("workspace.noteTitle")}
                            </Heading>
                            <Text as="p" size="2" color="gray">
                                {t("workspace.noteBody")}
                            </Text>
                            <Separator size="4" my="5" />
                            <Text as="p" size="1" color="gray">
                                {t("workspace.teams")}
                            </Text>
                        </Card>
                    </aside>
                </div>
                <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-(--gray-6) pt-5">
                    <Text size="1" color="gray">
                        {t("workspace.footer")}
                    </Text>
                    <Text size="1" color="gray">
                        {t("common.disclaimer")}
                    </Text>
                </footer>
            </div>
        </main>
    );
}
