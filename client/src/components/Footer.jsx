const Footer = () => {
  return (
    <>
      <div className="rangoli-border-bottom mt-16"></div>
      <footer className="bg-transparent py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="font-heading text-3xl text-maroon mb-2">
            🙏 गणपती बाप्पा मोरया 🙏
          </p>
          <p className="text-sm font-subheading text-ink-muted">
            Collecting memories, one Ganapati at a time
          </p>
          <p className="text-xs font-subheading text-ink-light mt-4">
            © {new Date().getFullYear()} Ganapati Vahi — Made with devotion
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
