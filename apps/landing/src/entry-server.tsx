import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { config } from '@fortawesome/fontawesome-svg-core';
import { App } from './app';

/**
 * Generates the landing markup during the static build with the hydration-safe light appearance.
 * @throws {Error} If a component fails to render; the build must propagate the failure.
 */
export function render() {
    config.autoAddCss = false;
    return renderToString(<StrictMode><App /></StrictMode>);
}
