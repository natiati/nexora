import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { requestDemo } from '../api/resources';
import { hasSession as checkSession } from '../api/session';
import { NexoraPreview, SpreadsheetPreview } from '../components/ProductPreview';
import { CONTACT_EMAIL } from '../utils/contact';
import '../styles/landing.css';

const PANEL_TITLES = { dashboard: 'Dashboard', productos: 'Listado de productos', inventario: 'Inventario / Stock' };

// La hoja de cálculo queda a la izquierda; el comparador arranca mostrando sobre todo la aplicación real
const START_PCT = 26;

const EMPTY_DEMO_FORM = { name: '', company: '', email: '' };

const PLAN_FEATURES = [
  'Productos, categorías y almacenes',
  'Inventario con reservas y movimientos',
  'Ventas, compras y facturación con pagos',
  'Clientes con historial de contacto',
  'Usuarios y roles por empresa',
];

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Anima los KPI de la maqueta cuando aparecen en pantalla
function useCountUp(rootRef) {
  useEffect(() => {
    const format = (el, value) => (el.dataset.prefix || '') + Math.round(value).toLocaleString('es-ES');

    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      if (reduceMotion()) {
        el.textContent = format(el, target);
        return;
      }
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / 900, 1);
        el.textContent = format(el, target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    rootRef.current.querySelectorAll('.kpi-value[data-count]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootRef]);
}

// Comparador "antes / después": arrastrar el punto recorta la hoja de cálculo, que va encima de Nexora
function useCompareSlider(wrapRef, beforeRef, handleRef) {
  useEffect(() => {
    // Se guardan aquí: React limpia los refs antes de que corra la limpieza de este efecto
    const wrap = wrapRef.current;
    const before = beforeRef.current;
    const handle = handleRef.current;
    let dragging = false;

    const setPct = (value) => {
      const pct = Math.max(4, Math.min(96, value));
      before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = `${pct}%`;
    };

    const pctFromEvent = (e) => {
      const rect = wrap.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * 100;
    };

    let sweep;
    const stopSweep = () => clearInterval(sweep);
    const onDown = (e) => { dragging = true; stopSweep(); setPct(pctFromEvent(e)); };
    const onMove = (e) => { if (dragging) setPct(pctFromEvent(e)); };
    const onUp = () => { dragging = false; };

    wrap.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    setPct(START_PCT);

    if (!reduceMotion()) {
      let t = 0;
      sweep = setInterval(() => {
        t += 1;
        setPct(START_PCT + Math.sin(t / 6) * 6);
        if (t > 40) stopSweep();
      }, 30);
    }

    return () => {
      stopSweep();
      wrap.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [wrapRef, beforeRef, handleRef]);
}

export default function Landing() {
  const [panel, setPanel] = useState('dashboard');
  const [demo, setDemo] = useState('closed'); // closed | form | sent
  const [demoForm, setDemoForm] = useState(EMPTY_DEMO_FORM);
  const [demoError, setDemoError] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { hash } = useLocation();
  const rootRef = useRef(null);
  const compareRef = useRef(null);
  const beforeRef = useRef(null);
  const handleRef = useRef(null);
  const hasSession = checkSession();

  useCountUp(rootRef);
  useCompareSlider(compareRef, beforeRef, handleRef);

  const openDemo = () => {
    setDemoError('');
    setDemo('form');
  };
  const closeDemo = () => setDemo('closed');

  const changeDemoField = (e) => setDemoForm({ ...demoForm, [e.target.name]: e.target.value });

  const submitDemo = async (e) => {
    e.preventDefault();
    setDemoError('');
    setSending(true);

    try {
      await requestDemo(demoForm);
      setDemoForm(EMPTY_DEMO_FORM);
      setDemo('sent');
    } catch (err) {
      // Ej. 429 "Demasiadas solicitudes" o servidor caído: el visitante no pierde lo que escribió
      setDemoError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  // Al llegar desde otra página con /#precios, baja hasta esa sección
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
  }, [hash]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setDemo('closed'); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="landing" ref={rootRef}>
      <header className="site-nav">
        <div className="wrap nav-inner">
          <div className="brand">
            <span className="logo-n">N<svg viewBox="0 0 18 18" fill="currentColor"><path d="M9 0 10.6 7.4 18 9l-7.4 1.6L9 18 7.4 10.6 0 9l7.4-1.6Z"/></svg></span>
            exora
          </div>
          <nav className="nav-links">
            <a href="#inicio">Inicio</a>
            <a href="#producto">Producto</a>
            <a href="#precios">Precios</a>
          </nav>
          <div className="nav-actions">
            <Link to={hasSession ? '/dashboard' : '/login'} className="btn btn-ghost">
              {hasSession ? 'Ir al panel' : 'Iniciar sesión'}
            </Link>
            <button className="btn btn-primary btn-sm" onClick={openDemo}>Solicitar demo</button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero wrap" id="inicio">
          <div className="hero-grid">
            <div>
              <div className="hero-eyebrow mono">Nexora — gestión de inventario y ventas</div>
              <h1 className="hero-title">
                <span className="fade">El desorden de siempre.</span>
                <span className="solid">Ahora en orden.</span>
              </h1>
              <p className="hero-sub">Productos, stock, ventas y compras en un solo lugar. Sin hojas de cálculo con veinte columnas ni "sistemas" que nadie entiende.</p>
              <div className="hero-cta">
                <button className="btn btn-primary" onClick={openDemo}>Solicitar una demo</button>
                <a href="#producto" className="btn btn-outline">Ver el producto ↓</a>
              </div>
            </div>
            <div className="hero-annotation">
              <span className="mono"><b>01</b> Minimalismo funcional — cada pantalla, un propósito.</span>
              <span className="mono"><b>02</b> Máximo 1–2 acciones principales visibles.</span>
              <span className="mono"><b>03</b> Tablas limpias. No "Excel online".</span>
            </div>
          </div>
        </section>

        <section className="compare-stage wrap">
          <div className="compare-tags">
            <span>Arrastra el punto para comparar →</span>
            <span><b>Antes</b> · <b style={{ color: 'var(--teal-700)' }}>Nexora</b></span>
          </div>
          <div className="compare-wrap" ref={compareRef}>
            <div className="compare-layer compare-after">
              <NexoraPreview />
            </div>
            <div className="compare-layer compare-before" ref={beforeRef}>
              <SpreadsheetPreview />
            </div>
            <div className="compare-handle" ref={handleRef}>
              <div className="handle-grip">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 6 3 10l4 4M13 6l4 4-4 4"/></svg>
              </div>
            </div>
            <div className="compare-hint">15 columnas vs. 7 — los mismos productos, en Nexora</div>
          </div>
        </section>

        <section className="section wrap" id="producto">
          <div className="section-head">
            <div className="marker">02 — Así se ve por dentro</div>
            <h2 className="section-title">Tres pantallas, no treinta</h2>
            <p className="section-sub">Dashboard, productos e inventario comparten la misma estructura. Cambia de sección y compruébalo.</p>
          </div>

          <div className="app-frame">
            <div className="app-body">
              <aside className="m-sidebar">
                <div className="m-brand"><span className="dot"></span> Nexora</div>
                <div className="m-nav-label">Principal</div>
                <button className={`m-nav-item${panel === 'dashboard' ? ' active' : ''}`} onClick={() => setPanel('dashboard')}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="6" height="6" rx="1.3"/><rect x="11" y="3" width="6" height="6" rx="1.3"/><rect x="3" y="11" width="6" height="6" rx="1.3"/><rect x="11" y="11" width="6" height="6" rx="1.3"/></svg>
                  Dashboard
                </button>
                <button className={`m-nav-item${panel === 'productos' ? ' active' : ''}`} onClick={() => setPanel('productos')}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6.5 10 3l7 3.5-7 3.5-7-3.5Z"/><path d="M3 6.5V14l7 3.5 7-3.5V6.5"/><path d="M10 10v7.5"/></svg>
                  Productos
                </button>
                <button className={`m-nav-item${panel === 'inventario' ? ' active' : ''}`} onClick={() => setPanel('inventario')}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="14" height="4.5" rx="1"/><rect x="3" y="9" width="14" height="4.5" rx="1"/><rect x="3" y="15" width="9" height="2" rx="1"/></svg>
                  Inventario
                </button>
                <button className="m-nav-item" onClick={() => navigate('/sales')}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 15V9l4-4 4 4v6"/><path d="M11 15V7l4-4 3 3v9"/></svg>
                  Ventas
                </button>
                <button className="m-nav-item" onClick={() => navigate('/customers')}>
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="7" cy="6" r="2.4"/><circle cx="14" cy="7" r="2"/><path d="M3 16c0-2.4 1.9-4 4-4s4 1.6 4 4"/><path d="M11.2 12.3c2 .2 3.8 1.7 3.8 3.7"/></svg>
                  Clientes
                </button>
                <div className="m-user">
                  <div className="m-avatar">MJ</div>
                  <div><div className="m-user-name">María Jiménez</div><div className="m-user-role">Operaciones</div></div>
                </div>
              </aside>

              <div className="m-main">
                <div className="m-topbar">
                  <div className="m-page-title">{PANEL_TITLES[panel]}</div>
                  <div className="m-search">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8.5" cy="8.5" r="5"/><path d="M16 16l-3.2-3.2"/></svg>
                    Buscar…
                  </div>
                </div>
                <div className="m-content">

                  <div className={`panel${panel === 'dashboard' ? ' active' : ''}`} id="panel-dashboard">
                    <div className="kpi-row">
                      <div className="kpi-card"><div className="kpi-icon teal"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 15V9l4-4 4 4v6"/><path d="M11 15V7l4-4 3 3v9"/></svg></div><div className="kpi-value nums" data-count="482300" data-prefix="$">$0</div><div className="kpi-label">Ventas del mes</div></div>
                      <div className="kpi-card"><div className="kpi-icon warn"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 2 2 17h16z"/><path d="M10 8v4M10 14h.01"/></svg></div><div className="kpi-value nums" data-count="14">0</div><div className="kpi-label">Stock crítico</div></div>
                      <div className="kpi-card"><div className="kpi-icon slate"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg></div><div className="kpi-value nums" data-count="27">0</div><div className="kpi-label">Órdenes pendientes</div></div>
                      <div className="kpi-card"><div className="kpi-icon danger"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2.5" y="5" width="15" height="10" rx="1.5"/><path d="M2.5 8.5h15"/></svg></div><div className="kpi-value nums" data-count="18900" data-prefix="$">$0</div><div className="kpi-label">Cuentas por cobrar</div></div>
                    </div>
                    <div className="split-row">
                      <div className="box">
                        <div className="box-title">Productos con stock bajo</div>
                        <div className="mini-row"><div><div className="mini-name">Cable HDMI 2m</div><div className="mini-sub">SKU-1042</div></div><span className="badge danger">Agotado</span></div>
                        <div className="mini-row"><div><div className="mini-name">Mouse inalámbrico</div><div className="mini-sub">SKU-2210</div></div><span className="badge warn">3 uds</span></div>
                        <div className="mini-row"><div><div className="mini-name">Teclado mecánico</div><div className="mini-sub">SKU-2255</div></div><span className="badge warn">5 uds</span></div>
                        <div className="mini-row"><div><div className="mini-name">Monitor 24"</div><div className="mini-sub">SKU-3390</div></div><span className="badge warn">2 uds</span></div>
                        <div className="mini-row"><div><div className="mini-name">Hub USB-C</div><div className="mini-sub">SKU-4120</div></div><span className="badge danger">Agotado</span></div>
                      </div>
                      <div className="box">
                        <div className="box-title">Últimas ventas</div>
                        <div className="mini-row"><div><div className="mini-name">Distribuidora Norte</div><div className="mini-sub">Factura #3021</div></div><span className="cell-strong nums">$4,120</span></div>
                        <div className="mini-row"><div><div className="mini-name">Comercial Andina</div><div className="mini-sub">Factura #3020</div></div><span className="cell-strong nums">$1,860</span></div>
                        <div className="mini-row"><div><div className="mini-name">Retail Sur</div><div className="mini-sub">Factura #3019</div></div><span className="cell-strong nums">$980</span></div>
                        <div className="mini-row"><div><div className="mini-name">Tienda Central</div><div className="mini-sub">Factura #3018</div></div><span className="cell-strong nums">$2,430</span></div>
                        <div className="mini-row"><div><div className="mini-name">Distribuidora Norte</div><div className="mini-sub">Factura #3017</div></div><span className="cell-strong nums">$610</span></div>
                      </div>
                    </div>
                  </div>

                  <div className={`panel${panel === 'productos' ? ' active' : ''}`} id="panel-productos">
                    <div className="table-toolbar">
                      <div className="tb-search"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8.5" cy="8.5" r="5"/><path d="M16 16l-3.2-3.2"/></svg> Buscar producto…</div>
                      <div className="tb-filter">Categoría <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l5 5 5-5"/></svg></div>
                      <div className="tb-spacer"></div>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate('/products')}>+ Nuevo producto</button>
                    </div>
                    <table className="m-table">
                      <thead><tr><th>Nombre</th><th>SKU</th><th>Categoría</th><th>Stock</th><th>Precio</th><th>Estado</th><th></th></tr></thead>
                      <tbody>
                        <tr><td className="cell-strong">Cable HDMI 2m</td><td className="cell-muted">SKU-1042</td><td>Accesorios</td><td>0</td><td className="nums">$8.50</td><td><span className="badge danger">Agotado</span></td><td className="dots">⋯</td></tr>
                        <tr><td className="cell-strong">Mouse inalámbrico</td><td className="cell-muted">SKU-2210</td><td>Periféricos</td><td>3</td><td className="nums">$14.90</td><td><span className="badge warn">Stock bajo</span></td><td className="dots">⋯</td></tr>
                        <tr><td className="cell-strong">Monitor 24"</td><td className="cell-muted">SKU-3390</td><td>Pantallas</td><td>2</td><td className="nums">$149.00</td><td><span className="badge warn">Stock bajo</span></td><td className="dots">⋯</td></tr>
                        <tr><td className="cell-strong">Teclado mecánico</td><td className="cell-muted">SKU-2255</td><td>Periféricos</td><td>26</td><td className="nums">$39.00</td><td><span className="badge ok">En stock</span></td><td className="dots">⋯</td></tr>
                        <tr><td className="cell-strong">Silla ergonómica</td><td className="cell-muted">SKU-5510</td><td>Mobiliario</td><td>12</td><td className="nums">$210.00</td><td><span className="badge ok">En stock</span></td><td className="dots">⋯</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className={`panel${panel === 'inventario' ? ' active' : ''}`} id="panel-inventario">
                    <div className="table-toolbar">
                      <div className="tb-filter">Almacén: Principal <svg width="10" height="10" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l5 5 5-5"/></svg></div>
                      <div className="tb-spacer"></div>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate('/stock')}>Ajustar</button>
                    </div>
                    <table className="m-table">
                      <thead><tr><th>Producto</th><th>Disponible</th><th>Reservado</th><th>Mínimo</th><th>Estado</th></tr></thead>
                      <tbody>
                        <tr><td className="cell-strong">Cable HDMI 2m</td><td>0</td><td>0</td><td>20</td><td><span className="badge danger">Agotado</span></td></tr>
                        <tr><td className="cell-strong">Mouse inalámbrico</td><td>3</td><td>2</td><td>15</td><td><span className="badge warn">Bajo mínimo</span></td></tr>
                        <tr><td className="cell-strong">Monitor 24"</td><td>2</td><td>1</td><td>10</td><td><span className="badge warn">Bajo mínimo</span></td></tr>
                        <tr><td className="cell-strong">Teclado mecánico</td><td>26</td><td>4</td><td>15</td><td><span className="badge ok">Óptimo</span></td></tr>
                        <tr><td className="cell-strong">Silla ergonómica</td><td>12</td><td>0</td><td>5</td><td><span className="badge ok">Óptimo</span></td></tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section wrap" id="precios">
          <div className="section-head">
            <div className="marker">03 — Precios</div>
            <h2 className="section-title">Un solo plan, con todo incluido</h2>
            <p className="section-sub">El valor depende del tamaño de tu operación. Cuéntanos cómo trabajas y te hacemos una propuesta.</p>
          </div>
          <div className="pricing-card">
            <div>
              <div className="pricing-name">Plan Nexora</div>
              <div className="pricing-price">A la medida</div>
              <button className="btn btn-primary" onClick={openDemo}>Solicitar una propuesta</button>
            </div>
            <ul className="pricing-list">
              {PLAN_FEATURES.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </div>
        </section>

        <section className="wrap" id="contacto">
          <div className="cta-flat">
            <h3 className="cta-title">¿Listo para ver Nexora con los datos de tu operación?</h3>
            <div className="cta-actions">
              <button className="btn btn-primary" onClick={openDemo}>Solicitar una demo</button>
              <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-outline">Escribir por correo</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="wrap">
        <div className="footer-grid">
          <div>
            <div className="brand">
              <span className="logo-n">N<svg viewBox="0 0 18 18" fill="currentColor"><path d="M9 0 10.6 7.4 18 9l-7.4 1.6L9 18 7.4 10.6 0 9l7.4-1.6Z"/></svg></span>
              exora
            </div>
            <p className="footer-brand-text">Gestión de inventario, ventas y compras en una sola plataforma, pensada para no perderte.</p>
          </div>
          <div className="footer-col"><div className="footer-col-title">Producto</div><a href="#producto" onClick={() => setPanel('dashboard')}>Dashboard</a><a href="#producto" onClick={() => setPanel('inventario')}>Inventario</a><Link to="/sales">Ventas</Link><Link to="/purchases">Compras</Link></div>
          <div className="footer-col"><div className="footer-col-title">Compañía</div><Link to="/nosotros">Nosotros</Link><a href="#contacto">Contacto</a><a href="#precios">Precios</a></div>
          <div className="footer-col"><div className="footer-col-title">Legal</div><Link to="/privacidad">Privacidad</Link><Link to="/terminos">Términos</Link></div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Nexora</span>
          <span>v1.0 — build local</span>
        </div>
      </footer>

      <div className={`modal-overlay${demo === 'closed' ? '' : ' open'}`} onClick={(e) => { if (e.target === e.currentTarget) closeDemo(); }}>
        <div className="modal">
          <button className="modal-close" onClick={closeDemo}>✕</button>
          <div className={`modal-form${demo === 'sent' ? ' hide' : ''}`}>
            <div className="modal-eyebrow mono">Solicitar demo</div>
            <div className="modal-title">Agenda 20 minutos con nosotros</div>
            <p className="modal-sub">Te mostramos Nexora funcionando con datos parecidos a los de tu operación. Sin compromiso.</p>
            <form onSubmit={submitDemo}>
              {demoError && <div className="modal-error" role="alert">{demoError}</div>}
              <div className="field"><label htmlFor="f-name">Nombre</label><input id="f-name" name="name" type="text" placeholder="Tu nombre" maxLength={120} required value={demoForm.name} onChange={changeDemoField} /></div>
              <div className="field"><label htmlFor="f-company">Empresa</label><input id="f-company" name="company" type="text" placeholder="Nombre de tu empresa" maxLength={150} required value={demoForm.company} onChange={changeDemoField} /></div>
              <div className="field"><label htmlFor="f-email">Correo</label><input id="f-email" name="email" type="email" placeholder="tu@empresa.com" maxLength={150} required value={demoForm.email} onChange={changeDemoField} /></div>
              <button type="submit" className="btn btn-primary modal-submit" disabled={sending}>{sending ? 'Enviando…' : 'Enviar solicitud'}</button>
            </form>
          </div>
          <div className={`modal-success${demo === 'sent' ? ' show' : ''}`}>
            <div className="check"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 10.5l4 4 8-9"/></svg></div>
            <div className="modal-title" style={{ textAlign: 'center' }}>Solicitud enviada</div>
            <p className="modal-sub" style={{ textAlign: 'center' }}>Recibimos tus datos. Te escribiremos al correo que dejaste para agendar la demo.</p>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={closeDemo}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
