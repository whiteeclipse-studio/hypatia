/* Copyright © 2026 White Eclipse. Released under the MIT License. */
import type { ReactElement } from "react";
import { Select } from "@radix-ui/themes";
import type { DocumentationProject } from "@whiteeclipse/documentation-builder/vite";
import { pageUrl } from "../routes.ts";

/** Configured choices and current project for the project switcher. */
interface SwitcherProps {
    projects: DocumentationProject[];
    current: string | null;
}

/**
 * Names every project and navigates to its README-derived index.
 *
 * @param props - Available projects and selected repository name.
 * @param props.projects - Available validated projects.
 * @param props.current - Selected repository name.
 * @returns A labelled project selector.
 */
export function ProjectSwitcher({ projects, current }: SwitcherProps): ReactElement {
    const items = projects.map(function item(project) {
        const name = project.manifest.source.name;
        return (
            <Select.Item key={name} value={name}>
                {name}
            </Select.Item>
        );
    });
    /**
     * Opens the selected project with a normal document request.
     *
     * @param name - Configured repository name.
     */
    function selectProject(name: string): void {
        window.location.assign(pageUrl(name));
    }
    return (
        <Select.Root value={current ?? ""} onValueChange={selectProject}>
            <Select.Trigger aria-label="Documentation project" placeholder="Choose a project" className="w-full" />
            <Select.Content>{items}</Select.Content>
        </Select.Root>
    );
}
