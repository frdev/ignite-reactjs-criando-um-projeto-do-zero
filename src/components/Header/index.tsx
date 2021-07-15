import Image from 'next/image';
import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={`${styles.headerContent} ${commonStyles.container}`}>
        <Link href="/">
          <a>
            <Image src="/images/logo.svg" alt="Logo" width="40" height="40" />

            <h1>
              spacetraveling<span>.</span>
            </h1>
          </a>
        </Link>
      </div>
    </header>
  );
}
