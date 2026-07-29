import { ProductForm } from "../ProductForm";
import styles from "../../admin.module.css";

export default function NewProductPage() {
  return (
    <div>
      <h1 className={styles.pageTitle}>제품 등록</h1>
      <ProductForm />
    </div>
  );
}
