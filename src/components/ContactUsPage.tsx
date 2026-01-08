const ContactUsPage = () => (
  <div className="p-4 md:p-8 max-w-4xl mx-auto bg-[var(--bg-primary)] min-h-full">
    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
      Contact Us
    </h1>
    <p className="text-base md:text-lg mb-6 text-center">
      Get in touch with us. We'd love to hear from you!
    </p>
    <div className="text-center">
      <p className="mb-2">
        <strong>Email:</strong> info@chibibadminton.com
      </p>
      <p className="mb-2">
        <strong>Phone:</strong> (123) 456-7890
      </p>
      <p>
        <strong>Address:</strong> 123 Badminton Lane, Sport City, SC 12345
      </p>
    </div>
  </div>
);

export default ContactUsPage;
