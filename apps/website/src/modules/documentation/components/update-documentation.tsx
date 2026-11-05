/*
 * Copyright © 2026 - White Eclipse
 * Released under the MIT Licence.
 */

import { type ReactElement, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { CheckIcon, UpdateIcon } from "@radix-ui/react-icons";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { useTranslation } from "@whiteeclipse/i18next";
import { useDocumentation } from "../store/use-documentation";


const fullTurn = 360;
const spinAngle = fullTurn;
const confirmationDuration = 2000;

/**
 * Updates the active project's documentation from the site header.
 *
 * @returns The accessible refresh control, or no action outside a project.
 */
export function UpdateDocumentation(): ReactElement | null {
    const { pathname } = useLocation();
    const { state, store } = useDocumentation();
    const { t } = useTranslation("website");
    const icon = useRef<SVGSVGElement>(null);
    const animation = useRef<Animation | null>(null);
    const startAngle = useRef(0);
    const endAngle = useRef(spinAngle);
    const [spinning, setSpinning] = useState(false);
    const [successfulProject, setSuccessfulProject] = useState<string>();
    const attempt = useRef(0);
    const index = state.indexes.find(item => `${pathname}/`.startsWith(`/${item.project.id}/`));
    const projectId = index?.project.id;
    const confirmed = successfulProject !== undefined && successfulProject === projectId && !spinning;
    useEffect(() => {
        if (!confirmed) {
            return;
        }
        const timeout = setTimeout(() => {
            setSuccessfulProject(undefined);
        }, confirmationDuration);
        return () => {
            clearTimeout(timeout);
        };
    }, [confirmed, successfulProject]);
    useEffect(
        () => () => {
            animation.current?.cancel();
            attempt.current += 1;
        },
        [projectId],
    );
    if (index === undefined) {
        return null;
    }
    return (
        <>
            <span role="status" className="sr-only">
                {confirmed ? t("updateSucceeded") : ""}
            </span>
            <Tooltip content={t(confirmed ? "updateSucceeded" : "update")}>
                <IconButton
                    size="2"
                    variant="ghost"
                    aria-label={t("update")}
                    disabled={
                        (index.project.archiveUrl === undefined && !import.meta.env.DEV) ||
                        (state.updating[index.project.id] ?? false)
                    }
                    aria-busy={state.updating[index.project.id] ?? false}
                    loading={(state.updating[index.project.id] ?? false) && !spinning}
                    onClick={() => {
                        setSuccessfulProject(undefined);
                        const request = ++attempt.current;
                        const progress = animation.current?.effect?.getComputedTiming().progress ?? 0;
                        const from =
                            (startAngle.current + (endAngle.current - startAngle.current) * progress) % fullTurn;
                        animation.current?.cancel();
                        if (icon.current !== null && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
                            startAngle.current = from;
                            endAngle.current = Math.ceil(from / fullTurn) * fullTurn + spinAngle;
                            const current = icon.current.animate(
                                [{ transform: `rotate(${from}deg)` }, { transform: `rotate(${endAngle.current}deg)` }],
                                { duration: 2000, easing: "cubic-bezier(0.12, 0.7, 0.15, 1)", fill: "forwards" },
                            );
                            animation.current = current;
                            setSpinning(true);
                            /** Restores the upright icon and regular loading indicator after the spin ends. */
                            current.onfinish = () => {
                                if (animation.current === current) {
                                    current.cancel();
                                    animation.current = null;
                                    startAngle.current = 0;
                                    setSpinning(false);
                                }
                            };
                        } else {
                            animation.current = null;
                            startAngle.current = 0;
                            setSpinning(false);
                        }
                        void store.update(index).then(success => {
                            if (success && attempt.current === request) {
                                setSuccessfulProject(index.project.id);
                            }
                        });
                    }}
                >
                    <UpdateIcon
                        ref={icon}
                        width="16"
                        height="16"
                        aria-hidden="true"
                        className={confirmed ? "hidden" : "origin-center"}
                    />
                    {confirmed && <CheckIcon width="16" height="16" aria-hidden="true" />}
                </IconButton>
            </Tooltip>
        </>
    );
}
