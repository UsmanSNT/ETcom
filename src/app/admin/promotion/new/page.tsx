import { PostForm } from "../PostForm";
import styles from "../../admin.module.css";

export default function NewPromotionPostPage() {
  return (
    <div>
      <h1 className={styles.pageTitle}>게시글 등록</h1>
      <PostForm />
    </div>
  );
}
