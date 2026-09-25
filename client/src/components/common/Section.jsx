function Section({ eyebrow, title, description, children, className = '' }) {
  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="container-shell">
        {eyebrow ? <span className="pill mb-4">{eyebrow}</span> : null}
        {title ? <h2 className="section-title max-w-2xl">{title}</h2> : null}
        {description ? <p className="mt-4 max-w-2xl text-base text-slate-600">{description}</p> : null}
        {children}
      </div>
    </section>
  );
}

export default Section;
