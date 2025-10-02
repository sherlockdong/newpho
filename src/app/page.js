'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase"; 

// @ts-ignore
import "../../public/assets/css/main.css";

const auth = getAuth(app); 
export default function Home() {
   const [showHeader, setShowHeader] = useState(true);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [user, setUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Header hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY;
      if (currentScrollPosition > lastScrollPosition && currentScrollPosition > 50) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollPosition(currentScrollPosition);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollPosition]);


  return (
    <div>
      {/* header-area */}
      <header id="home">
        <div id="sticky-header" className="tg-header__area transparent-header">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="tgmenu__wrap">
                  <nav className="tgmenu__nav">
                    <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-lg-flex">
                      <ul className="navigation">
                        <li><Link href="#home" className="section-link">Home</Link></li>
                        <li><Link href="#features" className="section-link">features</Link></li>
                        <li><Link href="#token" className="section-link">token</Link></li>
                        <li><Link href="#work" className="section-link">how it works</Link></li>
                        <li><Link href="#roadmap" className="section-link">roadmap</Link></li>
                        <li className="menu-item-has-children"><Link href="blog.html">blog</Link>
                          <ul className="sub-menu">
                            <li><Link href="blog.html">Our Blog</Link></li>
                            <li><Link href="blog-details.html">Blog Details</Link></li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <div className="tgmenu__action">
                      <ul className="list-wrap">
                        <li className="header-btn">
<div >
        {user ? (     <Link href="/user">
          <span>{user.displayName}</span>
          </Link> ) : (
          <Link href="/auth">
            <button style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>Login / Register</button>
          </Link>
        )}
      </div>
                        </li>
                      </ul>
                    </div>
                    <div className="mobile-nav-toggler"><i className="tg-flaticon-menu-1"></i></div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="tgmobile__menu">
          <nav className="tgmobile__menu-box">
            <div className="close-btn"><i className="tg-flaticon-close-1"></i></div>
            <div className="nav-logo">
              <Link href="/"><img src="/assets/img/logo/logo.svg" alt="Logo" /></Link>
            </div>
            <div className="tgmobile__search">
              <form action="#">
                <input type="text" placeholder="Search here..." />
                <button><i className="fas fa-search"></i></button>
              </form>
            </div>
            <div className="tgmobile__menu-outer">
              {/* Menu will be inserted via JS */}
            </div>
            <div className="social-links">
              <ul className="list-wrap">
                <li><Link href="#"><i className="fab fa-facebook-f"></i></Link></li>
                <li><Link href="#"><i className="fab fa-twitter"></i></Link></li>
                <li><Link href="#"><i className="fab fa-instagram"></i></Link></li>
                <li><Link href="#"><i className="fab fa-linkedin-in"></i></Link></li>
                <li><Link href="#"><i className="fab fa-youtube"></i></Link></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="tgmobile__menu-backdrop"></div>
        {/* End Mobile Menu */}

      </header>
      {/* header-area-end */}

      {/* main-area */}
      <main className="main-area fix">

        {/* banner-area */}
        <section className="banner__area banner__bg" style={{ backgroundImage: "url(/assets/img/banner/hero_bg.svg)" }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-7 col-lg-8 col-md-10">
                <div className="banner__content">
                  <h2 className="title wow fadeInUp" data-wow-delay=".4s" data-wow-duration="1s">Physics Olympiad Guide</h2>
                  <p className="wow fadeInUp" data-wow-delay=".6s" data-wow-duration="1s">An AI-Human hybrid-powered database to improve your physics to the Olympics level.</p>
                  <Link href="/rout" className="tg-btn wow fadeInUp" data-wow-delay=".8s" data-wow-duration="1s">Get Started</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="banner__shape">
            <img src="/assets/img/banner/hero_img01.png" alt="shape" className="alltuchtopdown" />
            <img src="/assets/img/banner/hero_img02.png" alt="shape" className="rotateme" />
            <img src="/assets/img/banner/hero_img03.png" alt="shape" className="alltuchtopdown" />
            <img src="/assets/img/banner/hero_bg_shape.svg" alt="shape" className="banner__bg-shape" />
          </div>
        </section>
        {/* banner-area-end */}

        {/* features-area */}
        <section id="features" className="features__area section-pt-120">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="section__title text-center mb-80">
                  <span className="sub-title">accessible for everyone</span>
                  <h2 className="title">About us</h2>
                </div>
              </div>
            </div>
            <div className="row gutter-y-40">
              <div className="col-lg-6">
                <div className="features__item">
                  <div className="features__icon">
                    <img src="/assets/img/icon/features_icon01.png" alt="icon" />
                  </div>
                  <div className="features__content">
                    <h4 className="title">Who are "we"?</h4>
                    <p>We are current highschool students who share a passion in physics, and hopes to share our knowledge to those who want to do better in this amazing subject.
                      The more people we have, the more fun it is ! If you are interested in joining and building this project together, please contact us and let us know. 
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="features__item">
                  <div className="features__icon">
                    <img src="/assets/img/icon/features_icon02.png" alt="icon" />
                  </div>
                  <div className="features__content">
                    <h4 className="title">How is PHO-Guide special?</h4>
                    <p>This website includes information from physics Olympiad in different countries, to specific categories to problems that might appear in a competitive contest. 
                      There is also some basic physics knowledge for highschool and middle school students to pave their road to become a physicist. 
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="features__item features__item-two">
                  <div className="features__icon">
                    <img src="/assets/img/icon/features_icon03.png" alt="icon" />
                  </div>
                  <div className="features__content">
                    <h4 className="title">Real-time <span>data</span></h4>
                    <p>Global reach with content available in multiple</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="features__item features__item-two">
                  <div className="features__icon">
                    <img src="/assets/img/icon/features_icon04.png" alt="icon" />
                  </div>
                  <div className="features__content">
                    <h4 className="title">Advanced <span>trading</span></h4>
                    <p>Visual dashboards for trade performance</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="features__item features__item-two">
                  <div className="features__icon">
                    <img src="/assets/img/icon/features_icon05.png" alt="icon" />
                  </div>
                  <div className="features__content">
                    <h4 className="title">Blockchain <span>compliance</span></h4>
                    <p>Exportable reports for tax and accounting purposes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="features__shape">
            <img src="/assets/img/images/features_shape.png" alt="shape" />
          </div>
        </section>
        {/* features-area-end */}

        {/* marquee-area */}
        <section className="marquee__area section-pt-120">
          <div className="slider__marquee clearfix marquee-wrap">
            <div className="marquee_mode marquee__group">
              <h6 className="marquee__item">You will hold the way you love Webzo</h6>
              <h6 className="marquee__item">You will hold the way you love Webzo</h6>
            </div>
          </div>
        </section>
        {/* marquee-area-end */}

        {/* token-area */}
        <section id="token" className="token__area section-py-120">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="token__content" data-aos="fade-right" data-aos-delay="0">
                  <div className="section__title mb-40">
                    <span className="sub-title">accessible for everyone</span>
                    <h2 className="title">Trading <span>platform</span> of the future!</h2>
                  </div>
                  <p>Leverage on any tokens with a protocol trusted with billions for its performance and reliability.</p>
                  <Link href="#!" className="tg-btn tg-btn-two">purchase now</Link>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="token__wrap" data-aos="fade-left" data-aos-delay="0">
                  <div className="token__wrap-inner">
                    <h4 className="title">Token sale ends in:</h4>
                    <div className="countdown__wrap">
                      <div className="coming-time" data-countdown="2026/12/30"></div>
                    </div>
                    <h3 className="token__received"><span>$49,222,300</span> contribution received</h3>
                    <div className="token__progress-wrap">
                      <ul className="list-wrap token__progress-title">
                        <li>$5M</li>
                        <li>$99M</li>
                      </ul>
                      <div className="progress" role="progressbar" aria-label="Example with label" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                        <div className="progress-bar" style={{ width: "50%" }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="copy-text">
                    <mark>0x2170Ed0880ac9A755fd29B2688956BD959F933F8</mark>
                    <button className="copy-btn"><img src="/assets/img/icon/copy.svg" alt="" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="token__shape">
            <img src="/assets/img/images/features_shape.png" alt="" />
          </div>
        </section>
        {/* token-area-end */}

        {/* section-divider */}
        <div className="section-divider">
          <div className="container">
            <span></span>
          </div>
        </div>
        {/* section-divider-end */}

        {/* work-area */}
        <section id="work" className="work__area section-py-120">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="section__title text-center mb-80">
                  <span className="sub-title">how it works?</span>
                  <h2 className="title">Core asset of the <span>crypto</span> marketplace</h2>
                </div>
              </div>
            </div>
            <div className="work__item-wrap">
              <div className="work__img">
                <img src="/assets/img/images/work_img.png" alt="img" className="alltuchtopdown" />
              </div>
              <div className="row">
                <div className="col-lg-6" data-aos="fade-right" data-aos-delay="0">
                  <div className="work__item">
                    <h1 className="number">01</h1>
                    <h4 className="title">Currency <span>conversion</span></h4>
                    <p>Exportable reports for tax and accounting purposes.</p>
                  </div>
                  <div className="work__item mb-0">
                    <h1 className="number">02</h1>
                    <h4 className="title">Data <span>encryption</span></h4>
                    <p>Visual dashboards for trade performance.</p>
                  </div>
                </div>
                <div className="col-lg-6" data-aos="fade-left" data-aos-delay="0">
                  <div className="work__item work__item-right">
                    <h1 className="number">03</h1>
                    <h4 className="title">Cold wallet <span>storage</span></h4>
                    <p>Regular updates on crypto trends and platform features.</p>
                  </div>
                  <div className="work__item work__item-right mb-0">
                    <h1 className="number">04</h1>
                    <h4 className="title">Transfer crypto <span>& data</span></h4>
                    <p>Guides for beginners on crypto basics and trading.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="work__shape">
            <img src="/assets/img/images/features_shape.png" alt="shape" />
          </div>
        </section>
        {/* work-area-end */}

        {/* exchange-area */}
        <section className="exchange__area section-pb-120" data-aos="fade-up" data-aos-delay="0">
          <div className="container">
            <div className="exchange__inner-wrap">
              <div className="exchange__content">
                <div className="icon">
                  <img src="/assets/img/images/exchange_img.png" alt="img" />
                </div>
                <div className="content">
                  <h4 className="title">Exchange <span>availability</span></h4>
                  <p>AI-powered tools to detect and prevent fraudulent activities.</p>
                </div>
              </div>
              <div className="exchange__icons">
                <ul className="list-wrap">
                  <li><img src="/assets/img/icon/exchange_icon01.svg" alt="icon" /></li>
                  <li><img src="/assets/img/icon/exchange_icon02.svg" alt="icon" /></li>
                  <li><img src="/assets/img/icon/exchange_icon03.svg" alt="icon" /></li>
                  <li><img src="/assets/img/icon/exchange_icon04.svg" alt="icon" /></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* exchange-area-end */}

        {/* crypto-area */}
        <section className="crypto__area section-py-120">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div className="section__title text-center mb-80">
                  <span className="sub-title">crypto direction</span>
                  <h2 className="title">Goods & assets <span>according</span> <br /> to users interests.</h2>
                </div>
              </div>
            </div>
            <div className="row gutter-y-30 justify-content-center">
              <div className="col-lg-4 col-md-6">
                <div className="crypto__item">
                  <div className="crypto__icon">
                    <img src="/assets/img/icon/crypto_icon01.svg" alt="icon" />
                  </div>
                  <div className="crypto__content">
                    <h2 className="title">Read our <span>white paper</span></h2>
                    <Link href="#!" className="tg-btn tg-btn-two">open whitepaper</Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6">
                <div className="crypto__item">
                  <div className="crypto__icon">
                    <img src="/assets/img/icon/crypto_icon02.svg" alt="icon" />
                  </div>
                  <div className="crypto__content">
                    <h2 className="title">1 CRN token price <span>0.00014 BTC</span></h2>
                    <Link href="#!" className="tg-btn tg-btn-two">Buy tokens <span>(-25%)</span></Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6">
                <div className="crypto__item">
                  <div className="crypto__icon">
                    <img src="/assets/img/icon/crypto_icon03.svg" alt="icon" />
                  </div>
                  <div className="crypto__content">
                    <h2 className="title">ICO Participants <span>370,000+</span></h2>
                    <Link href="#!" className="tg-btn tg-btn-two">join our telegram</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="crypto__shape">
            <img src="/assets/img/images/features_shape.png" alt="shape" />
          </div>
        </section>
        {/* crypto-area-end */}

        {/* faq-area */}
        <section className="faq__area section-py-120">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="faq__img" data-aos="fade-right" data-aos-delay="0">
                  <img src="/assets/img/images/faq_img.png" alt="img" />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="faq__content" data-aos="fade-left" data-aos-delay="0">
                  <div className="section__title mb-60">
                    <span className="sub-title">faq & ans</span>
                    <h2 className="title">Get every <span>single</span> <br /> answer</h2>
                  </div>
                  <div className="faq__wrap">
                    <div className="accordion" id="accordionExample">
                      <div className="accordion-item">
                        <h2 className="accordion-header">
                          <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            Main purpose of a cryptocurrency
                          </button>
                        </h2>
                        <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
                          <div className="accordion-body">
                            <p>The private key, stored securely in the wallet, allows you to sign transactions and prove ownership of the funds cryptocurrency wallet.</p>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                            How can I make refund?
                          </button>
                        </h2>
                        <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                          <div className="accordion-body">
                            <p>The private key, stored securely in the wallet, allows you to sign transactions and prove ownership of the funds cryptocurrency wallet.</p>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header">
                          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                            How do they operate on blockchain?
                          </button>
                        </h2>
                        <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
                          <div className="accordion-body">
                            <p>The private key, stored securely in the wallet, allows you to sign transactions and prove ownership of the funds cryptocurrency wallet.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* faq-area-end */}

        {/* section-divider */}
        <div className="section-divider">
          <div className="container">
            <span></span>
          </div>
        </div>
        {/* section-divider-end */}

        {/* roadmap-area */}
        <section id="roadmap" className="roadmap__area section-py-120">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="section__title text-center mb-80" data-aos="fade-up" data-aos-delay="0">
                  <span className="sub-title">roadmap</span>
                  <h2 className="title">Our <span>strategy</span> & Planning</h2>
                </div>
              </div>
            </div>
            <div className="roadmap__item-wrap" data-aos="fade-up" data-aos-delay="300">
              <div className="row gutter-y-40">
                <div className="col-lg-3 col-md-6">
                  <div className="roadmap__item">
                    <div className="roadmap__icon">
                      <img src="/assets/img/icon/roadmap_icon01.png" alt="icon" />
                    </div>
                    <div className="roadmap__content">
                      <h3 className="title">2014</h3>
                      <p>Definitions of key terms in cryptocurrency</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="roadmap__item">
                    <div className="roadmap__icon">
                      <img src="/assets/img/icon/roadmap_icon02.png" alt="icon" />
                    </div>
                    <div className="roadmap__content">
                      <h3 className="title">2017</h3>
                      <p>Automated tools for executing strategies</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="roadmap__item">
                    <div className="roadmap__icon">
                      <img src="/assets/img/icon/roadmap_icon03.png" alt="icon" />
                    </div>
                    <div className="roadmap__content">
                      <h3 className="title">2022</h3>
                      <p>APIs for developers to build custom tools</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="roadmap__item">
                    <div className="roadmap__icon">
                      <img src="/assets/img/icon/roadmap_icon04.png" alt="icon" />
                    </div>
                    <div className="roadmap__content">
                      <h3 className="title">2025</h3>
                      <p>A space for users to discuss trends</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="roadmap__shape">
            <img src="/assets/img/images/features_shape.png" alt="shape" />
          </div>
        </section>
        {/* roadmap-area-end */}

        {/* team-area */}
        <section className="team__area section-py-120">
          <div className="container">
            <div className="row">
              <div className="col-xl-6 col-lg-5">
                <div className="team__content-wrap">
                  <div className="section__title mb-40">
                    <span className="sub-title">our avengers</span>
                    <h2 className="title">Meet with <span>our</span> avengers!</h2>
                  </div>
                  <p>Webzi brings our love for cryptocurrency into Web3! Like a frog’s leap, the chart can jump at any moment. Boom!</p>
                  <div className="team__social-wrap">
                    <h6 className="title">Follow us</h6>
                    <ul className="list-wrap">
                      <li><Link href="#!">
                        <div className="shape">
                          <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                        </div>
                        <img src="/assets/img/icon/facebook.svg" alt="icon" className="icon" />
                      </Link></li>
                      <li><Link href="#!">
                        <div className="shape">
                          <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                        </div>
                        <img src="/assets/img/icon/twitter.svg" alt="icon" className="icon" />
                      </Link></li>
                      <li><Link href="#!">
                        <div className="shape">
                          <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                        </div>
                        <img src="/assets/img/icon/telegram.svg" alt="icon" className="icon" />
                      </Link></li>
                      <li><Link href="#!">
                        <div className="shape">
                          <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                        </div>
                        <img src="/assets/img/icon/discord.svg" alt="icon" className="icon" />
                      </Link></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 col-lg-7">
                <div className="team__item-wrap">
                  <div className="row gutter-y-30">
                    <div className="col-md-6">
                      <div className="team__item">
                        <div className="team__thumb">
                          <img src="/assets/img/team/team_img01.png" alt="img" />
                        </div>
                        <div className="team__content">
                          <span>founder</span>
                          <h3 className="title">Rosalina William</h3>
                        </div>
                        <div className="social__icon">
                          <Link href="#!">
                            <div className="shape">
                              <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                            </div>
                            <img src="/assets/img/icon/facebook.svg" alt="icon" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="team__item">
                        <div className="team__thumb">
                          <img src="/assets/img/team/team_img02.png" alt="img" />
                        </div>
                        <div className="team__content">
                          <span>ceo</span>
                          <h3 className="title">Alonso Dowson</h3>
                        </div>
                        <div className="social__icon">
                          <Link href="#!">
                            <div className="shape">
                              <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                            </div>
                            <img src="/assets/img/icon/telegram.svg" alt="icon" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="team__item">
                        <div className="team__thumb">
                          <img src="/assets/img/team/team_img03.png" alt="img" />
                        </div>
                        <div className="team__content">
                          <span>Designer</span>
                          <h3 className="title">Elson Nelzoon</h3>
                        </div>
                        <div className="social__icon">
                          <Link href="#!">
                            <div className="shape">
                              <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                            </div>
                            <img src="/assets/img/icon/twitter.svg" alt="icon" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="team__item">
                        <div className="team__thumb">
                          <img src="/assets/img/team/team_img04.png" alt="img" />
                        </div>
                        <div className="team__content">
                          <span>developer</span>
                          <h3 className="title">Miranda Halim</h3>
                        </div>
                        <div className="social__icon">
                          <Link href="#!">
                            <div className="shape">
                              <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                            </div>
                            <img src="/assets/img/icon/telegram.svg" alt="icon" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="team__shape">
            <img src="/assets/img/images/features_shape.png" alt="shape" />
          </div>
        </section>
        {/* team-area-end */}

      </main>
      {/* main-area-end */}

      {/* footer-area */}
      <footer className="footer__area">
        <div className="container">
          <div className="footer__top">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="footer__content">
                  <div className="footer__logo">
                    <Link href="/"><img src="/assets/img/logo/logo.svg" alt="logo" /></Link>
                  </div>
                  <span className="sub-title">Built on web3. Powered by You</span>
                  <h2 className="title">Join with our <span>future</span> of Webzo currency</h2>
                  <div className="team__social-wrap">
                    <ul className="list-wrap">
                      <li><Link href="#!">
                        <div className="shape">
                          <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                        </div>
                        <img src="/assets/img/icon/facebook.svg" alt="icon" className="icon" />
                      </Link></li>
                      <li><Link href="#!">
                        <div className="shape">
                          <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                        </div>
                        <img src="/assets/img/icon/twitter.svg" alt="icon" className="icon" />
                      </Link></li>
                      <li><Link href="#!">
                        <div className="shape">
                          <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                        </div>
                        <img src="/assets/img/icon/telegram.svg" alt="icon" className="icon" />
                      </Link></li>
                      <li><Link href="#!">
                        <div className="shape">
                          <img src="/assets/img/icon/icons_bg.svg" alt="shape" />
                        </div>
                        <img src="/assets/img/icon/discord.svg" alt="icon" className="icon" />
                      </Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <div className="copyright-text">
              <p>Copyright & design by <Link href="https://themeforest.net/user/themeadapt" target="_blank">@ThemeAdapt</Link> - 2025</p>
            </div>
          </div>
        </div>
        <div className="footer__shape">
          <img src="/assets/img/images/footer_shape01.png" alt="shape" className="alltuchtopdown" />
          <img src="/assets/img/images/footer_shape02.png" alt="shape" className="alltuchtopdown" />
        </div>
      </footer>
      {/* footer-area-end */}
    </div>
  );
}