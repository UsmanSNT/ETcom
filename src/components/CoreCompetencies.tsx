import { useLanguage } from "./LanguageProvider";
import { AiIcon, CloudIcon, ChipIcon, NetworkIcon, CubeIcon, HeadsetIcon } from "./icons/SolutionIcons";
import styles from "./CoreCompetencies.module.css";

const ITEMS = [
  { icon: AiIcon, titleKey: "aiData", descKey: "aiDataDesc" },
  { icon: CloudIcon, titleKey: "platform", descKey: "platformDesc" },
  { icon: ChipIcon, titleKey: "embedded", descKey: "embeddedDesc" },
  { icon: NetworkIcon, titleKey: "iotConnect", descKey: "iotConnectDesc" },
  { icon: CubeIcon, titleKey: "solution", descKey: "solutionDesc" },
  { icon: HeadsetIcon, titleKey: "support", descKey: "supportDesc" },
] as const;

export function CoreCompetencies() {
  const { t } = useLanguage();

  return (
    <section className={styles.section}>
      <div className={styles.label}>{t.core.label}</div>
      <div className={styles.grid}>
        {ITEMS.map(({ icon: Icon, titleKey, descKey }) => (
          <div key={titleKey} className={styles.item}>
            <Icon className={styles.icon} />
            <div className={styles.title}>{t.core[titleKey]}</div>
            <div className={styles.desc}>{t.core[descKey]}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
