import styles from "./PageHero.module.css";

export function PageHero({
  breadcrumb,
  label,
  title1,
  title2,
  desc1,
  desc2,
  showArt = true,
}: {
  breadcrumb: string;
  label: string;
  title1: string;
  title2: string;
  desc1: string;
  desc2: string;
  showArt?: boolean;
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div>
          <div className={styles.breadcrumb}>HOME &gt; {breadcrumb}</div>
          <div className={styles.label}>{label}</div>
          <h1 className={styles.title}>
            {title1}
            <br />
            {title2}
          </h1>
          <div className={styles.divider} />
          <p className={styles.desc}>
            {desc1}
            <br />
            {desc2}
          </p>
        </div>
        {showArt && <div className={styles.art} />}
      </div>
    </section>
  );
}
