import styles from './artwork.module.css';

/** Source and local layout class for decorative mockup artwork. */
interface ArtworkProps {
    source: string;
    className?: string;
}

/** Places an existing decorative illustration within its reserved layout footprint. */
export function Artwork({ source, className = '' }: ArtworkProps) {
    return <img src={source} alt="" className={`${styles.artwork} ${className}`} />;
}
