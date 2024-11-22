'use client';
import Link from 'next/link'
const Rout =()=>{
    return (<>
        <div id="start">What do you want to know about?</div>
        <div className="container">
        <div className="grid"><Link href='../olymco'>Olympics by Country</Link></div>
        <div className="grid">Pre-College Physics</div>
        <div className="grid">Olympiad Physics</div>
    </div>
    </>
    )
}
export default Rout;