import Link from "next/link";
import styles from "./CtaBanner.module.css";

export function CtaBanner({
  title1,
  title2,
  desc,
  btnLabel,
  variant = "dark",
}: {
  title1: string;
  title2?: string;
  desc?: string;
  btnLabel: string;
  variant?: "dark" | "light";
}) {
  return (
    <section className={`${styles.banner} ${variant === "light" ? styles.bannerLight : ""}`}>
      <div className={styles.inner}>
        <div>
          <div className={styles.title}>
            {title1}
            {title2 && (
              <>
                <br />
                {title2}
              </>
            )}
          </div>
          {desc && <div className={styles.desc}>{desc}</div>}
        </div>
        <Link href="/contact" className={styles.btn}>
          {btnLabel} →
        </Link>
      </div>
    </section>
  );
}
