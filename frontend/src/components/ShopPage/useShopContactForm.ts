import { useState, useCallback, useEffect } from "react";
import type { FormEvent } from "react";
import emailjs from "@emailjs/browser";
import type { Product, FormData, FormErrors } from "./types";

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

function validateFormData(formData: FormData): FormErrors {
  const newErrors: FormErrors = {};
  if (!formData.name.trim()) newErrors.name = "Name is required";
  if (!formData.email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = "Please enter a valid email address";
  }
  if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
    newErrors.phone = "Please enter a valid phone number";
  }
  if (!formData.subject.trim()) newErrors.subject = "Subject is required";
  if (!formData.message.trim()) {
    newErrors.message = "Message is required";
  } else if (formData.message.trim().length < 10) {
    newErrors.message = "Message must be at least 10 characters";
  }
  return newErrors;
}

export function useShopContactForm(
  selectedProduct: Product | null,
  onCloseSuccess: () => void
) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setErrors({});
    setSubmitStatus({ type: null, message: "" });
  }, []);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey && publicKey !== "YOUR_PUBLIC_KEY") {
      emailjs.init(publicKey);
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const openWithProduct = useCallback((product: Product) => {
    setFormData({
      ...INITIAL_FORM,
      subject: `Inquiry about ${product.name}`,
      message: `I'm interested in purchasing: ${product.name} ($${product.price.toFixed(2)})\n\n`,
    });
    setErrors({});
    setSubmitStatus({ type: null, message: "" });
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const newErrors = validateFormData(formData);
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;

      setIsSubmitting(true);
      setSubmitStatus({ type: null, message: "" });

      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

        if (
          serviceId === "YOUR_SERVICE_ID" ||
          templateId === "YOUR_TEMPLATE_ID" ||
          publicKey === "YOUR_PUBLIC_KEY"
        ) {
          const productInfo = selectedProduct
            ? `\n\nProduct Inquiry: ${selectedProduct.name} ($${selectedProduct.price.toFixed(2)})`
            : "";
          const mailtoLink = `mailto:support@chibibadminton.com.au?subject=${encodeURIComponent(
            formData.subject
          )}&body=${encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${
              formData.phone || "Not provided"
            }${productInfo}\n\nMessage:\n${formData.message}`
          )}`;
          window.location.href = mailtoLink;
          setSubmitStatus({
            type: "success",
            message:
              "Opening your email client. If it doesn't open, please send an email to support@chibibadminton.com.au",
          });
          setTimeout(() => {
            resetForm();
            onCloseSuccess();
          }, 2000);
        } else {
          const productInfo = selectedProduct
            ? `Product Inquiry: ${selectedProduct.name} ($${selectedProduct.price.toFixed(2)})`
            : "";
          await emailjs.send(
            serviceId,
            templateId,
            {
              from_name: formData.name,
              from_email: formData.email,
              phone: formData.phone || "Not provided",
              subject: formData.subject,
              message: `${productInfo ? productInfo + "\n\n" : ""}${formData.message}`,
              to_email: "support@chibibadminton.com.au",
            },
            publicKey
          );
          setSubmitStatus({
            type: "success",
            message:
              "Thank you! Your message has been sent successfully. We'll get back to you soon!",
          });
          setTimeout(() => {
            resetForm();
            onCloseSuccess();
          }, 2000);
        }
      } catch (error) {
        console.error("Error sending email:", error);
        setSubmitStatus({
          type: "error",
          message:
            "Oops! Something went wrong. Please try again or contact us directly at support@chibibadminton.com.au",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, selectedProduct, onCloseSuccess, resetForm]
  );

  return {
    formData,
    errors,
    submitStatus,
    isSubmitting,
    handleChange,
    handleSubmit,
    openWithProduct,
    resetForm,
  };
}
