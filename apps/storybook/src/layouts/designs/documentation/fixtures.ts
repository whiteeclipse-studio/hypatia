/* Copyright © 2026 White Eclipse. Released under the MIT License. */
export type ProjectId = "hypatia" | "ryugu";
export type PageId = "overview" | "guides" | "getting-started" | "authoring";
export type ArticleId = "getting-started" | "authoring";

export const projectNames: Record<ProjectId, string> = { hypatia: "Hypatia", ryugu: "Ryugu" };
export const articleIds: ArticleId[] = ["getting-started", "authoring"];
export const sections = ["orientation", "structure", "next"] as const;

/** Current fixture navigation state and local selection actions. */
export interface NavigationProps {
    project: ProjectId;
    page: PageId;
    onProject(project: ProjectId): void;
    onPage(page: PageId): void;
}

/**
 * Resolves the document's navigation labels and category.
 *
 * @param page - The selected fixture page.
 * @returns Its breadcrumb, category, and directory state.
 */
export function pagePresentation(page: PageId): { breadcrumb: string; category: string; directory: boolean } {
    if (page === "overview") {
        return { breadcrumb: "pages.overview.title", category: "common.documentation", directory: true };
    }
    return { breadcrumb: "pages.guides.title", category: "common.guide", directory: page === "guides" };
}
