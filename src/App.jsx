import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import './App.css'

const STORAGE_KEY = 'permisos-escolares-borrador-v1'
const initialForm = {
  studentName: '', grade: '', group: '', curp: '', parentName: '', phone: '', email: '',
  permitType: '', startDate: '', endDate: '', departureTime: '', returnTime: '',
  reason: '', comments: '',
}
const school = {
  name: 'ESC. SEC. GRAL. MIGUEL HIDALGO Y COSTILLA',
  cct: 'C.C.Y. 12DES0238F',
  address: 'CALLE GABRIEL BERNAL S/N COL. LIBERTAD',
  city: 'CRUZ GRANDE, GRO.',
}
const steps = ['Estudiante', 'Tutor', 'Permiso', 'Revisar']
const curpPattern = '[A-Za-z][AEIOUaeiou][A-Za-z]{2}[0-9]{6}[HhMm](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Zb-df-hj-np-tv-z]{3}[A-Za-z0-9][0-9]'

function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { form: { ...initialForm, ...saved.form } }
  } catch {
    return { form: initialForm }
  }
}

function Field({ label, name, value, onChange, type = 'text', required = false, placeholder = '', maxLength, pattern, title, inputMode }) {
  return <label className="field">
    <span>{label}{required && <b className="required"> *</b>}</span>
    <input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} maxLength={maxLength} pattern={pattern} title={title} inputMode={inputMode} />
  </label>
}

function ReviewSection({ title, onEdit, children }) {
  return <section className="review-section"><div className="review-heading"><h3>{title}</h3><button type="button" className="link-button" onClick={onEdit}>Editar</button></div><dl>{children}</dl></section>
}

function ReviewItem({ label, value }) {
  return <div className="review-item"><dt>{label}</dt><dd>{value || '—'}</dd></div>
}

function displayDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`))
}

function App() {
  const saved = readSaved()
  const [form, setForm] = useState(saved.form)
  const [step, setStep] = useState(0)
  const [savedMessage, setSavedMessage] = useState('')
  const [qrImage, setQrImage] = useState('')
  const [qrLoaded, setQrLoaded] = useState(false)
  const [folio, setFolio] = useState('')
  const [preparingPdf, setPreparingPdf] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form }))
    setSavedMessage('Guardado en este dispositivo')
    const timer = setTimeout(() => setSavedMessage(''), 2200)
    return () => clearTimeout(timer)
  }, [form])

  useEffect(() => {
    if (!preparingPdf || !qrLoaded) return
    const timer = window.setTimeout(() => {
      window.print()
      setPreparingPdf(false)
    }, 150)
    return () => window.clearTimeout(timer)
  }, [preparingPdf, qrLoaded])

  function updateForm(event) {
    const { name, value } = event.target
    const normalizedValue = name === 'curp' ? value.toUpperCase() : name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value
    setForm(current => ({ ...current, [name]: normalizedValue }))
  }
  function nextStep(event) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    setStep(current => Math.min(current + 1, 3))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  async function generatePdf(event) {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    const newFolio = `PES-${Date.now().toString(36).toUpperCase()}`
    const payload = {
      version: 1,
      folio: newFolio,
      issuedAt: new Date().toISOString(),
      school,
      student: { name: form.studentName, grade: form.grade, group: form.group, curp: form.curp },
      guardian: { name: form.parentName, phone: form.phone, email: form.email },
      permit: {
        type: form.permitType,
        reason: form.reason,
        startDate: form.startDate,
        endDate: form.endDate,
        departureTime: form.departureTime,
        returnTime: form.returnTime,
        comments: form.comments,
      },
    }
    setNotice('')
    setQrLoaded(false)
    try {
      const image = await QRCode.toDataURL(JSON.stringify(payload), {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 420,
        color: { dark: '#172f43', light: '#ffffff' },
      })
      setFolio(newFolio)
      setQrImage(image)
      setPreparingPdf(true)
    } catch {
      setNotice('No se pudo preparar el código QR. Intenta generar el permiso nuevamente.')
    }
  }
  function clearDraft() {
    if (!window.confirm('¿Quieres borrar el borrador guardado en este dispositivo?')) return
    localStorage.removeItem(STORAGE_KEY)
    setForm(initialForm)
    setStep(0)
  }

  const dateLabel = form.permitType === 'Ausencia' ? 'Fecha de inicio' : 'Fecha del permiso'

  return <main className="page-shell">
    <div className="topbar">
      <a className="brand" href="#inicio" aria-label="Inicio">
        <span className="brand-mark">PE</span>
        <span>Permisos escolares<small>Portal de solicitudes</small></span>
      </a>
      <div className="top-actions"><span className="save-state"><i />{savedMessage || 'Guardado localmente'}</span><button type="button" className="link-button" onClick={clearDraft}>Borrar borrador</button><img className="school-logo" src="/logo.png" alt="Logotipo de la Escuela Secundaria General Miguel Hidalgo y Costilla" /></div>
    </div>

    <section className="hero" id="inicio">
      <div className="hero-copy"><span className="eyebrow">✨ PORTAL DE PERMISOS</span><h1>¡Pide tu permiso!</h1><p>Completa los datos y prepara tu solicitud en unos minutos.</p></div>
      <div className="hero-badge"><span>🔒</span><div><strong>Privado y seguro</strong><small>Tu información se guarda solo en este dispositivo.</small></div></div>
    </section>

    <div className="content-grid">
      <section className="form-card">
        <div className="stepper" aria-label="Progreso del formulario">
          {steps.map((label, index) => <button type="button" key={label} className={`step ${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} onClick={() => index <= step && setStep(index)} disabled={index > step}>
            <span className="step-number">{index < step ? '✓' : `0${index + 1}`}</span><span>{label}</span>
          </button>)}
        </div>

        <form onSubmit={step === 3 ? generatePdf : nextStep}>
          {step === 0 && <div className="form-section">
            <div className="section-heading"><span className="section-icon">🎒</span><div><h2>¿Quién necesita el permiso?</h2><p>Empecemos con los datos del estudiante.</p></div></div>
            <div className="fields">
              <Field label="Nombre completo" name="studentName" value={form.studentName} onChange={updateForm} required placeholder="Nombre(s) y apellidos" />
              <div className="field-row"><Field label="Grado de estudio" name="grade" value={form.grade} onChange={updateForm} required placeholder="Ej. 3° de secundaria" /><Field label="Grupo" name="group" value={form.group} onChange={updateForm} required placeholder="Ej. A" /></div>
              <Field label="CURP del estudiante" name="curp" value={form.curp} onChange={updateForm} required placeholder="Ej. ABCD010203HGRXXX00" maxLength={18} pattern={curpPattern} title="Escribe una CURP con 18 caracteres y estructura válida." />
            </div>
          </div>}

          {step === 1 && <div className="form-section">
            <div className="section-heading"><span className="section-icon">👋</span><div><h2>¿Quién nos acompaña?</h2><p>Datos de contacto de mamá, papá o tutor.</p></div></div>
            <div className="fields">
              <Field label="Nombre completo" name="parentName" value={form.parentName} onChange={updateForm} required placeholder="Nombre(s) y apellidos" />
              <Field label="Teléfono celular" name="phone" type="tel" value={form.phone} onChange={updateForm} required placeholder="10 dígitos" maxLength={10} pattern="[0-9]{10}" title="Escribe los 10 dígitos del teléfono celular." inputMode="numeric" />
              <Field label="Correo electrónico" name="email" type="email" value={form.email} onChange={updateForm} required placeholder="nombre@correo.com" pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}" title="Escribe un correo válido, por ejemplo nombre@correo.com." />
            </div>
          </div>}

          {step === 2 && <div className="form-section">
            <div className="section-heading"><span className="section-icon">🎟️</span><div><h2>¡Cuéntanos del permiso!</h2><p>¿Cuándo lo necesitas y cuál es el motivo?</p></div></div>
            <div className="fields">
              <label className="field"><span>Tipo de permiso<b className="required"> *</b></span><select className="select-control" name="permitType" value={form.permitType} onChange={updateForm} required><option value="">Selecciona una opción</option><option>Por tiempo (salida o entrada)</option><option>Ausencia</option><option>Otro motivo</option></select></label>
              {form.permitType && <>
                <div className="field-row"><Field label={dateLabel} name="startDate" type="date" value={form.startDate} onChange={updateForm} required />{form.permitType === 'Ausencia' && <Field label="Fecha de término" name="endDate" type="date" value={form.endDate} onChange={updateForm} required />}</div>
                {form.permitType !== 'Ausencia' && <div className="field-row"><Field label="Hora de salida" name="departureTime" type="time" value={form.departureTime} onChange={updateForm} required /><Field label="Hora de regreso (si aplica)" name="returnTime" type="time" value={form.returnTime} onChange={updateForm} /></div>}
              </>}
              <label className="field"><span>Motivo<b className="required"> *</b></span><select className="select-control" name="reason" value={form.reason} onChange={updateForm} required><option value="">Selecciona el motivo</option><option>Consulta médica</option><option>Situación familiar</option><option>Trámite</option><option>Enfermedad</option><option>Otro</option></select></label>
              <label className="field"><span>Comentarios adicionales <small>(opcional, máximo 300 caracteres)</small></span><textarea name="comments" value={form.comments} onChange={updateForm} rows="3" maxLength={300} placeholder="Agrega información que la escuela deba conocer" /></label>
            </div>
          </div>}

          {step === 3 && <div className="form-section review-form-section">
            <div className="section-heading"><span className="section-icon">🔎</span><div><h2>Revisa tu solicitud</h2><p>Confirma que todo esté correcto antes de crear el PDF.</p></div></div>
            <div className="review-list">
              <ReviewSection title="Estudiante" onEdit={() => setStep(0)}><ReviewItem label="Nombre completo" value={form.studentName} /><ReviewItem label="Grado y grupo" value={`${form.grade} ${form.group}`} /><ReviewItem label="CURP" value={form.curp} /></ReviewSection>
              <ReviewSection title="Madre, padre o tutor" onEdit={() => setStep(1)}><ReviewItem label="Nombre completo" value={form.parentName} /><ReviewItem label="Teléfono celular" value={form.phone} /><ReviewItem label="Correo electrónico" value={form.email} /></ReviewSection>
              <ReviewSection title="Permiso" onEdit={() => setStep(2)}><ReviewItem label="Tipo" value={form.permitType} /><ReviewItem label="Motivo" value={form.reason} /><ReviewItem label="Fecha" value={form.startDate ? `${displayDate(form.startDate)}${form.endDate ? ` al ${displayDate(form.endDate)}` : ''}` : ''} />{form.departureTime && <ReviewItem label="Horario" value={`Salida ${form.departureTime}${form.returnTime ? ` · Regreso ${form.returnTime}` : ''}`} />}<ReviewItem label="Comentarios" value={form.comments} /></ReviewSection>
              <div className="review-school"><strong>La solicitud incluirá los datos de:</strong><span>{school.name}</span><span>{school.cct} · {school.address} · {school.city}</span></div>
            </div>
          </div>}

          <div className="form-footer">
            {step > 0 ? <button type="button" className="button secondary" onClick={() => setStep(step - 1)}>← Anterior</button> : <span className="required-note"><b className="required">*</b> Campos obligatorios</span>}
            {notice && <p className="notice" role="alert">{notice}</p>}
            <button type="submit" className="button primary" disabled={preparingPdf}>{step < 3 ? <>¡Siguiente! <span>→</span></> : preparingPdf ? <>Preparando…</> : <>Crear mi permiso <span>✨</span></>}</button>
          </div>
        </form>
      </section>

      <aside className="side-column">
        <section className="school-card">
          <div className="side-title"><span className="school-icon">⌂</span><div><h3>Datos de la escuela</h3><p>Se incluirán en el permiso.</p></div></div>
          <div className="school-summary">
            <strong>{school.name}</strong><span><b>Clave:</b> {school.cct}</span><span>{school.address}</span><span>{school.city}</span>
          </div>
        </section>
        <section className="privacy-card"><span className="privacy-icon">✓</span><div><strong>Tu borrador está a salvo</strong><p>Guardamos los cambios automáticamente en este navegador. Puedes volver más tarde para continuar.</p><small>No se envía información a ningún servidor.</small></div></section>
        <div className="help-note"><span>i</span><p>Al finalizar podrás imprimir o guardar tu solicitud como PDF para entregarla en la escuela.</p></div>
      </aside>
    </div>

    <footer className="page-footer">Portal de permisos escolares <span>·</span> Solicitudes guardadas localmente</footer>

    <section className="print-document" aria-hidden="true">
      <div className="print-watermark"><span>SOLICITUD ESCOLAR · REQUIERE AUTORIZACIÓN</span><span>SOLICITUD ESCOLAR · REQUIERE AUTORIZACIÓN</span><span>SOLICITUD ESCOLAR · REQUIERE AUTORIZACIÓN</span><span>SOLICITUD ESCOLAR · REQUIERE AUTORIZACIÓN</span><span>SOLICITUD ESCOLAR · REQUIERE AUTORIZACIÓN</span></div>
      <header className="print-header"><div><h1>{school.name}</h1><p>{school.cct}<br />{school.address}<br />{school.city}</p></div><div className="print-header-right"><div className="print-label">SOLICITUD<br />DE PERMISO</div><img src="/logo.png" alt="Logotipo de la escuela" /></div></header>
      <p className="print-date">{school.city || 'Lugar'}, a {new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date())}</p>
      <p className="print-to">A quien corresponda:<br />Por medio de la presente solicito atentamente autorización para el permiso escolar descrito a continuación.</p>
      <section className="print-section"><h2>1. Datos del estudiante</h2><div className="print-grid"><p><b>Nombre completo</b><span>{form.studentName}</span></p><p><b>Grado y grupo</b><span>{form.grade} {form.group}</span></p><p><b>CURP</b><span>{form.curp}</span></p></div></section>
      <section className="print-section"><h2>2. Madre, padre o tutor</h2><div className="print-grid"><p><b>Nombre completo</b><span>{form.parentName}</span></p><p><b>Teléfono celular</b><span>{form.phone}</span></p><p><b>Correo electrónico</b><span>{form.email}</span></p></div></section>
      <section className="print-section"><h2>3. Detalles del permiso</h2><div className="print-grid"><p><b>Tipo de permiso</b><span>{form.permitType}</span></p><p><b>Motivo</b><span>{form.reason}</span></p><p><b>Fecha</b><span>{displayDate(form.startDate)}{form.endDate ? ` al ${displayDate(form.endDate)}` : ''}</span></p>{form.departureTime && <p><b>Horario</b><span>Salida {form.departureTime}{form.returnTime ? ` · Regreso ${form.returnTime}` : ''}</span></p>}</div></section>
      {form.comments && <div className="print-comments"><b>Comentarios adicionales</b><p>{form.comments}</p></div>}
      <p className="print-closing">Agradezco su atención y quedo al pendiente. Atentamente,</p>
      <div className="signatures"><div className="signature-box"><div className="signature-space" /><div className="signature-line" /><strong>{form.parentName}</strong><small>Nombre y firma de madre, padre o tutor</small></div><div className="signature-box"><div className="signature-space" /><div className="signature-line" /><strong>Autorización escolar</strong><small>Nombre, firma y sello de la escuela</small></div></div>
      {qrImage && <div className="print-qr-block"><img src={qrImage} onLoad={() => setQrLoaded(true)} alt="Código QR con los datos de la solicitud" /><div><strong>Datos digitales de la solicitud</strong><p>Escanea para consultar los datos incluidos en este documento.</p><small>Folio: {folio || 'Se genera al crear el permiso'}</small><small>El QR contiene los datos, pero no sustituye la firma ni confirma la autorización escolar.</small></div></div>}
    </section>
  </main>
}

export default App
