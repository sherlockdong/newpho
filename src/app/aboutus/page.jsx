'use client';

import Link from 'next/link';

const Count = () => {
    return (
      <><div className='quiz-container'>
<div id="highschool"><p> The lead developer, the initiator and the founder of this website is Sherlock Dong. For more information, please proceed to </p>

<Link href='https://sherlockdong.us' target="_blank" rel="noopener noreferrer"><p id="linkcolor">Sherlock's personal website</p></Link>
</div>
<div id="highschool"><p>Yajie Yu is the founder of Pho-Guide, a learning platform dedicated to making advanced physics competition concepts accessible through clarity and creativity. She is an IB Diploma student at Nanjing Foreign Language School specializing in physics, mathematics, and astrophysics. Yajie combines research experience in antenna design, cosmology, and fluid mechanics with a passion for visual learning and scientific communication.</p></div>
</div>
      </>
    );
  };
  
  export default Count;
  
