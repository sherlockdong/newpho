// app/study-plan/page.tsx
"use client";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import styles from "../page.module.css";

export default function StudyPlanPage() {
  const [user, setUser] = useState<any>(null);
  const [studyPlan, setStudyPlan] = useState<string>("Loading your personalized study plan...");

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
  }, []);

  useEffect(() => {
    if (user) {
      // Replace this with real AI generation or Firestore fetch later
      // For now, a placeholder or fetch from a "studyPlans" collection
      setStudyPlan(`
# Your Personalized Physics Study Plan

**Based on your recent quiz performance:**

- **Strengths**: Kinematics, Projectile Motion  
- **Areas to Improve**: Forces, Energy Conservation, Momentum  

### Week 1 Focus
- Review Newton's Laws with interactive simulations
- Practice 10 free-response problems on friction

### Recommended Resources
- PhET Simulations: Forces and Motion
- Khan Academy: Work and Energy

Keep up the great work! 🚀
      `);
    }
  }, [user]);

  if (!user) return <div>Please sign in to view your study plan.</div>;

  return (
    <div className={styles.userContainer}>
      <h1 className="quiz-title">My Study Plan</h1>
      <div className={styles.studyPlanContent}>
        <ReactMarkdown>{studyPlan}</ReactMarkdown>
      </div>
    </div>
  );
}