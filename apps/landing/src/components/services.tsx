import { Heading, Text } from '@whiteeclipse/core-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { services, type Service } from '../data/services';
import styles from './studio.module.css';

/** Presents a single service with a decorative icon and descriptive text. */
function ServiceCard({ title, description, icon }: Service) {
    return (
        <article className={styles.service}>
            <FontAwesomeIcon icon={icon} className={styles.serviceIcon} aria-hidden="true" />
            <Heading as="h3" size="4" weight="medium">{title}</Heading>
            <Text as="p" size="3" color="gray">{description}</Text>
        </article>
    );
}

/** Arranges the mockup's service summaries without iteration inside JSX presentation. */
export function Services() {
    const cards = services.map(service => <ServiceCard key={service.title} {...service} />);
    return <div id="landing-services" className={styles.services}>{cards}</div>;
}
