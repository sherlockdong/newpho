'use client';
import Link from 'next/link'
const Rout =()=>{
    return (<>
        <div id="start">What do you want to know about?</div>
        <div className="container">
    <Link href='../olymco'><div className="grid">Olympics by Country</div></Link>
    <Link href='../highschool'><div className="grid">Pre-College Physics</div></Link>
        <Link href='../opset'><div className="grid">Olympiad Physics</div></Link>
    </div>
    </>
    )
}
export default Rout;