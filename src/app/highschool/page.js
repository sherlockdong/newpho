'use client';
import Link from 'next/link';
const Count = () => {
    return (
      <>
<div id="highschool"><p>      At this page, you can have a complete resources of high-school physics. From very basic physics ideas, to complex materials that prepare you 
for the olympics. </p>
                    <p>Topics include: accleration, circular motion, projectile motion, etc.</p>
      
<Link href='./highschool/kinematics'><h4>Kinematics</h4></Link>
<ul>
<li><a href="resource/kinematics/addimo.html">Analyzing Motions</a></li>
<li><a href="./highschool/quiz">Quizes</a></li>
<li><a href="./highschool/anapa">Circular Motion</a></li>
<li><a href="/">Pure Rotational Motion</a></li>
<li><a href="/">Test Yourself</a></li>	

</ul>
</div>

      </>
    );
  };
  
  export default Count;
  

 