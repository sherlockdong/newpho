"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "../../../firebase"; // Adjust path based on your project structure

const auth = getAuth(app);

export default function QuizIndexPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const topics = [
    { slug: "electricity", name: "Electricity" },
    { slug: "induction", name: "Electromagnetic Induction" },
    { slug: "relativity", name: "Relativity" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth"); // Redirect to login/register page
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="quiz-container">
        <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">High School Physics Quiz Topics</h1>
      <p>Select a topic to start your quiz:</p>
      <ul className="topic-list">
        {topics.map((topic) => (
          <li key={topic.slug} className="topic-item">
            <Link href={`/highschoolquiz/${topic.slug}`} className="topic-link">
              {topic.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}