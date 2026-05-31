'use client';

import Link from "next/link";

export default function FmapbPage() {
  return (
    <div className="container">
      <h1>F=ma / Physics Bowl Preparation</h1>

      <p>Hi, glad you are here. This page is dedicated to those who are preparing for the F=ma exam in February 2026 in US, as well as the Physics Bowl that takes 
        place between March and April.
      </p>

      <p>We pick the past exams from past 10 years and you can use A.I to create your own practice exams, as well as study plans. </p>
    <p> In the <Link href="../insights">Insights</Link> page, you can also find some resources provided by our editors. </p>
    </div>
  );
}