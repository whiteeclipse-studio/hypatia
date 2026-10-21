import { CoreTheme } from '@whiteeclipse/core-ui';
import { useSystemAppearance } from './hooks/use-system-appearance';
import { LandingPage } from './landing-page';

/** Applies the system colour preference to the shared exploratory Core UI theme. */
export function App() {
    const appearance = useSystemAppearance();

    return (
        <CoreTheme appearance={appearance}>
            <LandingPage />
        </CoreTheme>
    );
}
