'use client';
import React, { useState } from 'react';
import Generator from '@/components/Generator';
import { ArrowRight } from 'lucide-react';

function GoaIllustration() {
  return (
    <div className="goa-art" aria-hidden="true">
      <img src="/goa-scene-reference.png" alt="" className="goa-art-image" />
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState(false);
  return <div className="hh-page">
    <header className="hh-header">
      <div className="hh-brand" aria-label="Hacker House Goa 2026"><span>HACKER</span><strong>HOUSE</strong><small>GOA / 2026</small></div>
      <div className="hh-nav"><span>BUILD</span><i>•</i><span>SHIP</span><i>•</i><span>HACK</span><b>HHG / 026</b></div>
    </header>
    <main className="hh-main">
      {!active ? <section className="hero">
        <GoaIllustration />
        <div className="hero-content">
          <div className="hero-kickers"><span className="kicker kicker-pink">✦ HACKER HOUSE GOA 2026</span><span className="kicker kicker-outline">BUILDER IDENTITY GENERATOR</span></div>
          <h1><span>BUILD</span><span>SOMETHING</span><span>WORTH TAKING</span><span><em>TO</em> <strong>GOA.</strong></span></h1>
          <p className="hero-copy">Create your Hacker House Goa builder identity.<br className="desktop-only"/> Tune your vibe, add your details, and ship a pass that&apos;s all you.</p>
          <div className="hero-action"><button type="button" onClick={()=>setActive(true)} className="hh-cta">START BUILDING <ArrowRight size={17} strokeWidth={2.5}/></button><span>NO SIGNUP <i>•</i> TAKES A FEW SECONDS</span></div>
          <div className="hero-steps"><div><strong>01</strong><span>UPLOAD</span><small>YOUR PHOTO</small></div><div><strong>02</strong><span>CUSTOMIZE</span><small>YOUR PASS</small></div><div><strong>03</strong><span>SHIP IT</span><small>TO GOA</small></div></div>
        </div>
      </section> : <section className="generator-shell"><button type="button" onClick={()=>setActive(false)} className="back-button">← BACK TO HOME</button><Generator/></section>}
    </main>
    {!active && <div className="hh-pattern" aria-hidden="true"/>}
  </div>;
}
