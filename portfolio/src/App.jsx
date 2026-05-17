import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';

/* ── SPLASH SCREEN ─────────────────────────────────────────────── */
const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState(0); // 0=typing, 1=fading
  const [txt, setTxt] = useState('');
  const target = '> INITIALIZING PORTFOLIO...';

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setTxt(target.slice(0, ++i));
      if (i >= target.length) {
        clearInterval(id);
        setTimeout(() => setPhase(1), 700);
        setTimeout(onDone, 1400);
      }
    }, 45);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div className={`splash ${phase === 1 ? 'splash-out' : ''}`}>
      <div className="splash-inner">
        <div className="splash-logo">AD</div>
        <div className="splash-line">{txt}<span className="splash-cur">█</span></div>
        <div className="splash-bar"><div className="splash-fill"></div></div>
      </div>
    </div>
  );
};

/* ── SCROLL PROGRESS BAR ───────────────────────────────────────── */
const ScrollProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${pct}%` }} />;
};

/* ── MATRIX RAIN ───────────────────────────────────────────────── */
const MatrixRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const cols = Math.floor(canvas.width / 20);
    const drops = Array(cols).fill(1);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+アイウエオカキクケコ';
    const tick = () => {
      ctx.fillStyle = 'rgba(6,6,15,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '13px JetBrains Mono, monospace';
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const alpha = Math.random() > 0.95 ? 1 : 0.15;
        ctx.fillStyle = `rgba(255,45,85,${alpha})`;
        ctx.fillText(ch, i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const interval = setInterval(tick, 60);
    return () => { clearInterval(interval); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="matrix-canvas" />;
};

/* ── COUNT UP ──────────────────────────────────────────────────── */
const CountUp = ({ target, suffix = '', decimals = 0 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const observed = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !observed.current) {
        observed.current = true;
        const num = parseFloat(target);
        const dur = 1600;
        const steps = 60;
        let step = 0;
        const id = setInterval(() => {
          step++;
          const progress = step / steps;
          const eased = 1 - Math.pow(1 - progress, 3);
          setVal((num * eased).toFixed(decimals));
          if (step >= steps) { setVal(target); clearInterval(id); }
        }, dur / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, decimals]);
  return <span ref={ref}>{val}{suffix}</span>;
};

/* ── BACK TO TOP ───────────────────────────────────────────────── */
const BackToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`back-top ${show ? 'back-top-show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
    >🚀</button>
  );
};

const Cursor = () => {
  const curRef = useRef(null);
  const curRRef = useRef(null);
  const pos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      pos.current.mx = e.clientX;
      pos.current.my = e.clientY;
      if (curRef.current) {
        curRef.current.style.left = `${pos.current.mx - 5}px`;
        curRef.current.style.top = `${pos.current.my - 5}px`;
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    const render = () => {
      pos.current.rx += (pos.current.mx - pos.current.rx) * 0.12;
      pos.current.ry += (pos.current.my - pos.current.ry) * 0.12;
      if (curRRef.current) {
        curRRef.current.style.left = `${pos.current.rx - 18}px`;
        curRRef.current.style.top = `${pos.current.ry - 18}px`;
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const addHoverEffect = () => {
      document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('mouseenter', () => {
          if (curRRef.current) {
            curRRef.current.style.transform = 'scale(2.5)';
            curRRef.current.style.opacity = '.35';
          }
        });
        el.addEventListener('mouseleave', () => {
          if (curRRef.current) {
            curRRef.current.style.transform = 'scale(1)';
            curRRef.current.style.opacity = '1';
          }
        });
      });
    };
    
    // Slight delay to allow DOM to render
    setTimeout(addHoverEffect, 500);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div className="cur" ref={curRef}></div>
      <div className="cur-r" ref={curRRef}></div>
    </>
  );
};

const Particles = () => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const p = [];
    for (let i = 0; i < 22; i++) {
      const size = Math.random() * 4 + 1;
      const colors = ['var(--r)', 'var(--b2)', 'var(--p)', 'var(--y)', 'var(--g)'];
      p.push({
        id: i,
        size,
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 14 + 8,
        delay: Math.random() * 8
      });
    }
    setParticles(p);
  }, []);

  return (
    <div className="particles">
      {particles.map(p => (
        <div key={p.id} className="p-dot" style={{
          width: p.size, height: p.size, left: `${p.left}%`,
          background: p.color, opacity: 0.7,
          animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`
        }}></div>
      ))}
    </div>
  );
};

const Typewriter = () => {
  const [text, setText] = useState('');
  
  useEffect(() => {
    const phrases = ['AI / ML Engineer', 'LLM & RAG Builder', 'NLP Specialist', 'Flask Developer', 'JARVIS Builder', 'React Developer', 'Final Year @ KIIT 2026'];
    let pi = 0, ci = 0, del = false;
    let timeoutId;
    
    const typeLoop = () => {
      const p = phrases[pi];
      if (!del && ci <= p.length) {
        setText(p.slice(0, ci++));
      } else if (del && ci >= 0) {
        setText(p.slice(0, ci--));
      }
      
      if (ci > p.length) {
        del = true;
        timeoutId = setTimeout(typeLoop, 1700);
        return;
      }
      if (ci < 0) {
        del = false;
        pi = (pi + 1) % phrases.length;
      }
      timeoutId = setTimeout(typeLoop, del ? 42 : 78);
    };
    timeoutId = setTimeout(typeLoop, 78);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return <span>{text}</span>;
};

const FadeInVisible = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
        }
      });
    }, { threshold: 0.1 });
    
    if (ref.current) obs.observe(ref.current);
    
    return () => {
      if (ref.current) obs.unobserve(ref.current);
    };
  }, []);

  return (
    <div ref={ref} className={`fiu ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
};

const ProjectCard = ({ project, delay = 0 }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    cardRef.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    cardRef.current.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  };

  return (
    <FadeInVisible delay={delay} className="pc" data-cat={project.cat}>
      <div ref={cardRef} onMouseMove={handleMouseMove} style={{display:'flex', flexDirection:'column', height:'100%', width: '100%'}}>
        <div className="pc-top">
          <div className="pc-yr">{project.year}</div>
          <div className={`fb fb-${project.cat}`}>{project.badge}</div>
        </div>
        <div className="pc-title">{project.title}</div>
        <div className="pc-desc">{project.desc}</div>
        <div className="pc-stack">
          {project.stack.map(s => <span key={s} className="st-tag">{s}</span>)}
        </div>
        <div className="pc-links">
          {project.github && <a href={project.github} target="_blank" rel="noreferrer" className="pll pll-gh">GitHub →</a>}
          {project.live && <a href={project.live} target="_blank" rel="noreferrer" className="pll pll-live">Live ↗</a>}
        </div>
      </div>
    </FadeInVisible>
  );
};

export default function App() {
  const [filter, setFilter] = useState('all');
  const [resumeOpen, setResumeOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const onSplashDone = useCallback(() => setLoaded(true), []);

  // Active nav link on scroll
  useEffect(() => {
    const sections = ['hero','about','skills','projects','experience','education','activities','contact'];
    const onScroll = () => {
      const scrollY = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollY) { setActiveSection(sections[i]); break; }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const projects = [
    { cat: 'ai', year: '2026', badge: '⭐ Featured', title: 'BookIQ — Semantic Book Search Engine', desc: 'Full-stack AI web app with automated web scraping, AI-generated book summaries, and high-accuracy conversational search. LangGraph + RAG pipelines with ChromaDB and Groq LLM. Dual-database architecture with SQLite and vector store.', stack: ['React', 'Django', 'LangGraph', 'RAG', 'ChromaDB', 'Groq'], github: 'https://github.com/Aritrraa' },
    { cat: 'ai', year: '2025', badge: '⭐ Featured', title: 'QueryNest — Document RAG AI Assistant', desc: 'Upload PDFs, Word, and Excel files and chat with them. Full RAG pipeline: LlamaIndex chunking → Gemini Embeddings → ChromaDB → Gemini 1.5 Flash synthesis. Multi-turn chat UI with markdown rendering and drag-and-drop upload.', stack: ['Flask', 'LlamaIndex', 'Gemini API', 'ChromaDB', 'RAG', 'PyPDF'], github: 'https://github.com/Aritrraa/Query-Nest---Document-RAG_AI-Assistant' },
    { cat: 'ai', year: '2025', badge: '⭐ Featured', title: 'Trvis — JARVIS-Inspired Desktop AI Assistant', desc: 'Futuristic desktop AI with animated Arc Reactor UI, full voice control, Windows desktop automation (open apps, Chrome, YouTube), and a built-in RAG engine using ChromaDB + HuggingFace. Powered by Groq/Llama 3. Runs 100% locally.', stack: ['Python', 'LangChain', 'ChromaDB', 'Groq/Llama3', 'HuggingFace', 'CustomTkinter'], github: 'https://github.com/Aritrraa/Trvis_-AI-assistant' },
    { cat: 'ai', year: '2025', badge: 'AI / ML', title: 'VoiceXChange — Real-Time AI Speech Translator', desc: 'Live production app supporting 9 languages. Flask + AssemblyAI + Google Translate + gTTS. Responsive UI with MediaRecorder and Web Audio API for live voice capture and instant playback. Fully deployed on Render.', stack: ['Flask', 'AssemblyAI', 'Google Translate', 'gTTS', 'Render'], github: 'https://github.com/Aritrraa', live: '#' },
    { cat: 'ai', year: '2025', badge: 'AI / ML', title: 'ML-Based Code Review System', desc: 'Intelligent Python code quality classifier using CodeBERT embeddings + logistic regression. Integrated Pylint for automated static analysis. Flask-powered review interface giving developers instant, actionable feedback.', stack: ['CodeBERT', 'Flask', 'scikit-learn', 'Pylint', 'NumPy'], github: 'https://github.com/Aritrraa' },
    { cat: 'web', year: '2025', badge: 'Web / React', title: 'FIN-TECH — Finance Dashboard (React)', desc: 'Modern fintech dashboard in React (Vite) — income/expense tracking, transaction history, line and pie charts, role-based UI. Deployed live on Vercel. Clean component architecture with Recharts for data visualization.', stack: ['React (Vite)', 'Recharts', 'JavaScript', 'CSS', 'Vercel'], github: 'https://github.com/Aritrraa/FIN-TECH', live: 'https://fin-tech-tau.vercel.app/' },
    { cat: 'java', year: '2024', badge: 'Java', title: 'PersonalFinanceTracker — Java Desktop App', desc: 'Desktop expense manager with PIN authentication, daily/monthly summaries, category-wise tracking, and report export. Clean Swing GUI. Demonstrates strong OOP principles and Java desktop architecture.', stack: ['Java', 'Java Swing', 'OOP', 'Collections API', 'FileWriter'], github: 'https://github.com/Aritrraa/FinanceTracker' }
  ];

  const filteredProjects = filter === 'all' ? projects : projects.filter(p => p.cat === filter);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setResumeOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      {!loaded && <SplashScreen onDone={onSplashDone} />}
      <ScrollProgress />
      <BackToTop />
      <Cursor />
      
      {/* RESUME MODAL */}
      <div className={`modal-bg ${resumeOpen ? 'open' : ''}`} id="resumeModal" onClick={(e) => { if (e.target.id === 'resumeModal') setResumeOpen(false); }}>
        <div className="modal-box">
          <div className="modal-header">
            <div className="modal-title">📄 Aritra Das — Resume</div>
            <div className="modal-actions">
              <a href="/Aritra_CV_MAIN.pdf" download="Aritra_CV_MAIN.pdf" className="modal-dl">⬇ Download PDF</a>
              <button className="modal-close" onClick={() => setResumeOpen(false)}>✕ Close</button>
            </div>
          </div>
          <iframe src="/Aritra_CV_MAIN.pdf" className="modal-frame" id="resumeFrame"></iframe>
        </div>
      </div>

      {/* NAV */}
      <nav>
        <div className="logo">AD</div>
        <ul className="nav-links">
          <li><a href="#about" className={activeSection === 'about' ? 'nav-active' : ''}>About</a></li>
          <li><a href="#skills" className={activeSection === 'skills' ? 'nav-active' : ''}>Skills</a></li>
          <li><a href="#projects" className={activeSection === 'projects' ? 'nav-active' : ''}>Projects</a></li>
          <li><a href="#experience" className={activeSection === 'experience' ? 'nav-active' : ''}>Experience</a></li>
          <li><a href="#contact" className={activeSection === 'contact' ? 'nav-active' : ''}>Contact</a></li>
        </ul>
        <div className="nav-right">
          <div className="avail"><div className="nav-dot"></div>Open to work</div>
          <button className="resume-btn" onClick={() => setResumeOpen(true)}>📄 Resume</button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-bg"></div>
        <div className="grid-bg"></div>
        <MatrixRain />
        <Particles />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-label"><div className="nav-dot"></div>Final Year · KIIT · CSE 2026</div>
            <div className="hero-name">
              <span className="hn1">Aritra</span>
              <span className="hn2">Das</span>
            </div>
            <div className="hero-typed"><Typewriter /></div>
            <p className="hero-desc">
              I build <strong>AI systems that ship</strong> — LLMs, RAG pipelines, NLP models, real-time translators, desktop AI assistants, and full-stack web apps. 6 shipped projects. 2 internships. 1 mission: build intelligent things.
            </p>
            <div className="cta-row">
              <a href="#projects" className="btn-fire">View Projects →</a>
              <button className="btn-blue" onClick={() => setResumeOpen(true)} style={{border:'none'}}>📄 View Resume</button>
              <a href="#contact" className="btn-ghost">Get In Touch</a>
            </div>
          </div>
          <div className="hero-right-col">
            <div className="photo-orbit">
              <img src="/Aritra_image.jpg" alt="Aritra Das" className="hero-photo" />
              <div className="orbit-ring or1"></div>
              <div className="orbit-ring or2"></div>
              <div className="orbit-ring or3"></div>
            </div>
            <div className="hero-stats">
              <div className="hs"><div className="hs-n"><CountUp target="6" suffix="+" /></div><div className="hs-l">Projects</div></div>
              <div className="hs"><div className="hs-n"><CountUp target="8.70" decimals={2} /></div><div className="hs-l">CGPA</div></div>
              <div className="hs"><div className="hs-n"><CountUp target="2" /></div><div className="hs-l">Internships</div></div>
            </div>
          </div>
        </div>
        <div className="scroll-cue"><span>scroll</span><div className="scroll-bar"></div></div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <div className="si">
          <div className="sl">01 / Who I Am</div>
          <div className="st">Not just another <em>AI enthusiast.</em></div>
          <div className="about-grid">
            <FadeInVisible className="at">
              <p>I'm <strong>Aritra Das</strong>, a final-year CSE student at <strong>KIIT, Bhubaneswar</strong> (CGPA: 8.70). My domain is <strong>AI/ML engineering</strong> — LLMs, RAG, NLP, and the systems that make them work in production.</p>
              <p>I've shipped 6 real projects — from JARVIS-style desktop AI assistants to document chatbots, semantic search engines, fintech dashboards, real-time voice translators, and Java desktop apps. I've interned twice as a developer and AI engineer.</p>
              <p>My strength is <strong>building full pipelines</strong> — from raw data to deployed product. I live in PyTorch and LangGraph. Flask is my backend of choice. Java is solid ground. TensorFlow is in my toolkit and growing.</p>
              <p>When I'm not coding, you'll find me at the gym, riding, watching football, or behind a lens.</p>
              <div className="h-tags">
                <span className="ht">🏋️ Gym</span>
                <span className="ht">🏍️ Riding</span>
                <span className="ht">⚽ Football</span>
                <span className="ht">📸 Photography</span>
              </div>
              <div style={{marginTop:'1.4rem', fontSize:'.65rem', color:'var(--r)', fontFamily:"'JetBrains Mono', monospace", letterSpacing:'2px', textTransform:'uppercase', marginBottom:'.5rem'}}>Languages</div>
              <div className="lang-row">
                <span className="lt">English (Professional)</span>
                <span className="lt">Hindi (Native)</span>
                <span className="lt">Bengali (Native)</span>
              </div>
            </FadeInVisible>
            <FadeInVisible delay={0.12} className="about-img-wrap">
              <img src="/about_photo.jpg" alt="Aritra Das" className="about-photo" />
              <div className="about-img-overlay"></div>
            </FadeInVisible>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills">
        <div className="si">
          <div className="sl">02 / Arsenal</div>
          <div className="st">What I <em>build with.</em></div>
          <div className="sk-grid">
            <FadeInVisible delay={0.0} className="sk-card" data-g="red"><div className="sk-ic">🧠</div><div className="sk-cat">Core Domain</div><div className="sk-nm">AI / ML Engineering</div><div className="sk-tgs"><span className="sk-tg">LLMs</span><span className="sk-tg">RAG</span><span className="sk-tg">LangGraph</span><span className="sk-tg">NLP</span><span className="sk-tg">Deep Learning</span><span className="sk-tg">Generative AI</span><span className="sk-tg">Transformers</span><span className="sk-tg">CodeBERT</span><span className="sk-tg">CNN</span></div></FadeInVisible>
            <FadeInVisible delay={0.05} className="sk-card" data-g="blue"><div className="sk-ic">🐍</div><div className="sk-cat">Primary Language</div><div className="sk-nm">Python Ecosystem</div><div className="sk-tgs"><span className="sk-tg">PyTorch</span><span className="sk-tg">HuggingFace</span><span className="sk-tg">LlamaIndex</span><span className="sk-tg">scikit-learn</span><span className="sk-tg">NumPy</span><span className="sk-tg">Pandas</span><span className="sk-tg">Matplotlib</span></div></FadeInVisible>
            <FadeInVisible delay={0.1} className="sk-card" data-g="purple"><div className="sk-ic">🔍</div><div className="sk-cat">Vector & Retrieval</div><div className="sk-nm">Semantic Search & RAG</div><div className="sk-tgs"><span className="sk-tg">ChromaDB</span><span className="sk-tg">Groq LLM</span><span className="sk-tg">Gemini API</span><span className="sk-tg">Embeddings</span><span className="sk-tg">LlamaIndex</span></div></FadeInVisible>
            <FadeInVisible delay={0.15} className="sk-card" data-g="blue"><div className="sk-ic">⚡</div><div className="sk-cat">Backend & APIs</div><div className="sk-nm">Flask & Web Dev</div><div className="sk-tgs"><span className="sk-tg">Flask</span><span className="sk-tg">Django</span><span className="sk-tg">REST APIs</span><span className="sk-tg">SQLite</span><span className="sk-tg">SQL</span><span className="sk-tg">Render</span></div></FadeInVisible>
            <FadeInVisible delay={0.2} className="sk-card" data-g="fire"><div className="sk-ic">☕</div><div className="sk-cat">Languages</div><div className="sk-nm">Programming Languages</div><div className="sk-tgs"><span className="sk-tg">Python</span><span className="sk-tg">Java</span><span className="sk-tg">C</span><span className="sk-tg">HTML/CSS/JS</span></div></FadeInVisible>
            <FadeInVisible delay={0.25} className="sk-card" data-g="green"><div className="sk-ic">🎨</div><div className="sk-cat">Frontend</div><div className="sk-nm">UI & Visualization</div><div className="sk-tgs"><span className="sk-tg">React (Vite)</span><span className="sk-tg">Recharts</span><span className="sk-tg">Java Swing</span><span className="sk-tg">CustomTkinter</span></div></FadeInVisible>
            <FadeInVisible delay={0.3} className="sk-card" data-g="purple"><div className="sk-ic">🛠️</div><div className="sk-cat">Tools & Workflow</div><div className="sk-nm">Dev Environment</div><div className="sk-tgs"><span className="sk-tg">Git/GitHub</span><span className="sk-tg">Jupyter</span><span className="sk-tg">Colab</span><span className="sk-tg">Pylint</span><span className="sk-tg">Vercel</span><span className="sk-tg">Render</span></div></FadeInVisible>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects">
        <div className="si">
          <div className="sl">03 / Built Things</div>
          <div className="st">6 projects that <em>actually ship.</em></div>
          <div className="pf-row">
            <button className={`pf-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All (6)</button>
            <button className={`pf-btn ${filter === 'ai' ? 'active' : ''}`} onClick={() => setFilter('ai')}>🧠 AI / ML</button>
            <button className={`pf-btn ${filter === 'web' ? 'active' : ''}`} onClick={() => setFilter('web')}>🌐 Web / React</button>
            <button className={`pf-btn ${filter === 'java' ? 'active' : ''}`} onClick={() => setFilter('java')}>☕ Java</button>
          </div>
          <div className="proj-grid">
            {filteredProjects.map((p, i) => (
              <ProjectCard key={p.title} project={p} delay={i * 0.06} />
            ))}
          </div>
          <div style={{textAlign:'center', marginTop:'2rem', fontFamily:"'JetBrains Mono', monospace", fontSize:'.78rem', color:'var(--muted)', padding:'.7rem 1.5rem', border:'1px dashed var(--border)', borderRadius:'100px', display:'inline-block', marginLeft:'50%', transform:'translateX(-50%)'}}>
            + More projects in progress · <a href="https://github.com/Aritrraa" target="_blank" rel="noreferrer" style={{color:'var(--r)', textDecoration:'none'}}>github.com/Aritrraa ↗</a>
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience">
        <div className="si">
          <div className="sl">04 / Experience</div>
          <div className="st">Where I've <em>worked.</em></div>
          <div className="tl">
            <FadeInVisible delay={0} className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-date">June – August 2025</div>
              <div className="tl-role">Artificial Intelligence Intern</div>
              <div className="tl-org">Baby Dino / Zenith India</div>
              <ul className="tl-pts">
                <li>Trained and fine-tuned NLP and transformer models using Python, PyTorch, and Hugging Face for automation, search, and chatbot applications.</li>
                <li>Built RAG and LangGraph pipelines powering intelligent, multi-turn conversational AI systems for production use.</li>
                <li>Managed large datasets — data cleaning, web scraping, and preparation to improve model training performance.</li>
                <li>Collaborated cross-functionally to integrate AI models into live chatbot products and generate data-driven insights.</li>
              </ul>
            </FadeInVisible>
            <FadeInVisible delay={0.1} className="tl-item">
              <div className="tl-dot"></div>
              <div className="tl-date">May – July 2024</div>
              <div className="tl-role">Front-End Developer Intern</div>
              <div className="tl-org">Techplement (Software Company)</div>
              <ul className="tl-pts">
                <li>Led front-end development of responsive and accessible web interfaces used in production.</li>
                <li>Mentored 6+ interns, assisting with sprint planning, code reviews, and onboarding.</li>
                <li>Used Git workflows to collaborate across teams and track project progress effectively.</li>
              </ul>
            </FadeInVisible>
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education">
        <div className="si">
          <div className="sl">05 / Education</div>
          <div className="st">Academic <em>foundation.</em></div>
          <div className="edu-grid">
            <FadeInVisible delay={0} className="edu-card">
              <div><div className="edu-deg">B.Tech — Computer Science & Engineering</div><div className="edu-school">Kalinga Institute of Industrial Technology, Bhubaneswar</div></div>
              <div><div className="edu-yr">2022 – Present</div><div className="edu-score">8.70 CGPA</div></div>
            </FadeInVisible>
            <FadeInVisible delay={0.08} className="edu-card">
              <div><div className="edu-deg">Intermediate — Science (CBSE)</div><div className="edu-school">Asian International School, Howrah</div></div>
              <div><div className="edu-yr">2020 – 2022</div><div className="edu-score">80%</div></div>
            </FadeInVisible>
            <FadeInVisible delay={0.16} className="edu-card">
              <div><div className="edu-deg">Matriculation (CBSE)</div><div className="edu-school">Asian International School, Howrah</div></div>
              <div><div className="edu-yr">2020</div><div className="edu-score">86%</div></div>
            </FadeInVisible>
          </div>
        </div>
      </section>

      {/* ACTIVITIES */}
      <section id="activities">
        <div className="si">
          <div className="sl">06 / Beyond the Terminal</div>
          <div className="st">Leadership & <em>activities.</em></div>
          <div className="act-grid">
            <FadeInVisible delay={0} className="ac"><div className="ac-yr">2023</div><div className="ac-ic">🩸</div><div className="ac-ttl">Youth Red Cross, KIIT</div><div className="ac-desc">Led 4+ events demonstrating strong leadership, coordination, and community-building at university level.</div></FadeInVisible>
            <FadeInVisible delay={0.08} className="ac"><div className="ac-yr">2024</div><div className="ac-ic">🎬</div><div className="ac-ttl">KIIT Film Society</div><div className="ac-desc">Boosted engagement through creative social media campaigns, content strategy, and event photography.</div></FadeInVisible>
            <FadeInVisible delay={0.16} className="ac"><div className="ac-yr">Ongoing</div><div className="ac-ic">🌐</div><div className="ac-ttl">Open Source Builder</div><div className="ac-desc">Consistently shipping real projects on GitHub. Learning in public, building across AI, web, and desktop domains.</div></FadeInVisible>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="contact-inner">
          <div className="sl" style={{textAlign:'center'}}>07 / Let's Connect</div>
          <div className="st" style={{textAlign:'center', marginBottom:'1rem'}}>Ready to build<br/><em>something great?</em></div>
          <p style={{color:'var(--muted)', lineHeight:1.85, fontSize:'.95rem'}}>I'm actively seeking <strong style={{color:'var(--text)'}}>AI/ML engineering roles</strong> and collaborations. 2 internships in. 6 projects shipped. Let's build the next one together.</p>
          <div className="c-links">
            <a href="mailto:aritradas405@gmail.com" className="c-lnk cl-mail">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              Email Me
            </a>
            <a href="https://linkedin.com/in/aritra-das-a180b4251" target="_blank" rel="noreferrer" className="c-lnk cl-li">
              <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              LinkedIn
            </a>
            <a href="https://github.com/Aritrraa" target="_blank" rel="noreferrer" className="c-lnk cl-gh">
              <svg viewBox="0 0 24 24"><path d="M12 2A10 10 0 002 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg>
              GitHub
            </a>
            <button onClick={() => setResumeOpen(true)} className="c-lnk cl-res" style={{border:'1px solid var(--border)', cursor:'none'}}>
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11zm-3-7H9v-2h6v2zm0 4H9v-2h6v2z"/></svg>
              View / Download Resume
            </button>
          </div>
        </div>
      </section>

      <footer>Aritra Das · AI/ML Engineer · KIIT Bhubaneswar · © 2026 · aritradas405@gmail.com</footer>
    </>
  );
}
