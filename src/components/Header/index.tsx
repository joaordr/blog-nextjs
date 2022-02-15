/* eslint-disable prettier/prettier */
import Link from 'next/link';
import Image from 'next/image';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <Image src="/logo.svg" alt="logo" width={100} height={100} />
          </a>
        </Link>
      </div>
    </header>
  )
}
