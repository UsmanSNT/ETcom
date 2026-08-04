import { useLanguage } from "./LanguageProvider";
import { AiIcon, CloudIcon, ChipIcon, NetworkIcon, CubeIcon } from "./icons/SolutionIcons";
import styles from "./CoreCompetencies.module.css";

const ITEMS = [
  { icon: AiIcon, titleKey: "aiData" },
  { icon: CloudIcon, titleKey: "platform" },
  { icon: ChipIcon, titleKey: "embedded" },
  { icon: NetworkIcon, titleKey: "iotConnect" },
  { icon: CubeIcon, titleKey: "solution" },
] as const;

export function CoreCompetencies() {
  const { t } = useLanguage();

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {ITEMS.map(({ icon: Icon, titleKey }) => (
          <div key={titleKey} className={styles.item}>
            <Icon className={styles.icon} />
            <div className={styles.title}>{t.core[titleKey]}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
