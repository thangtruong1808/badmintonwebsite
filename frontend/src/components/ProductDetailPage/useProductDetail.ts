import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { apiFetch } from "../../utils/api";
import { mapApiProduct, getProductPriceDisplay } from "./types";
import type { Product } from "../ShopPage";
import type { FormData, FormErrors, SelectedQuantity } from "./types";

export function useProductDetail(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState<SelectedQuantity>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [productRes, listRes] = await Promise.all([
          apiFetch(`/api/products/${id}`, { skipAuth: true }),
          apiFetch("/api/products", { skipAuth: true }),
        ]);
        if (productRes.ok) {
          const data = await productRes.json();
          setProduct(mapApiProduct(data));
          setSelectedQuantity(null);
        } else {
          setProduct(null);
        }
        if (listRes.ok) {
          const list = await listRes.json();
          setRelatedProducts(Array.isArray(list) ? list.map(mapApiProduct) : []);
        } else {
          setRelatedProducts([]);
        }
      } catch {
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey && publicKey !== "YOUR_PUBLIC_KEY") {
      emailjs.init(publicKey);
    }
  }, []);

  useEffect(() => {
    if (product) {
      document.title = `ChibiBadminton - ${product.name}`;
    } else {
      document.title = "ChibiBadminton - Product Not Found";
    }
    return () => {
      document.title = "ChibiBadminton";
    };
  }, [product]);

  useEffect(() => {
    if (product) {
      const tier =
        typeof selectedQuantity === "number"
          ? product.quantityTiers?.find((t) => t.quantity === selectedQuantity)
          : undefined;
      const unitPrice = tier ? tier.unit_price : product.price;
      const priceStr =
        typeof selectedQuantity === "number" && tier
          ? `${selectedQuantity} tube${selectedQuantity > 1 ? "s" : ""} × $${unitPrice.toFixed(2)}/tube = $${(selectedQuantity * unitPrice).toFixed(2)}`
          : selectedQuantity === "bulk"
            ? "Custom bulk quantity – please contact us for a price"
            : `$${product.price.toFixed(2)}`;
      setFormData((prev) => ({
        ...prev,
        subject: `Inquiry about ${product.name}`,
        message: `I'm interested in purchasing: ${product.name}${typeof selectedQuantity === "number" ? ` (Qty: ${selectedQuantity})` : selectedQuantity === "bulk" ? " (Custom bulk quantity)" : ""} (${priceStr})\n\n`,
      }));
    }
  }, [product, selectedQuantity]);

  const validateForm = useCallback((): boolean => {
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

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

  const buildProductInfo = useCallback(() => {
    if (!product) return "";
    const tier =
      typeof selectedQuantity === "number"
        ? product.quantityTiers?.find((t) => t.quantity === selectedQuantity)
        : undefined;
    const priceStr =
      tier && typeof selectedQuantity === "number"
        ? `${selectedQuantity} tubes × $${tier.unit_price.toFixed(2)} = $${(selectedQuantity * tier.unit_price).toFixed(2)}`
        : selectedQuantity === "bulk"
          ? "Custom bulk quantity – please contact us for a price"
          : `$${product.price.toFixed(2)}`;
    return `Product Inquiry: ${product.name}${typeof selectedQuantity === "number" ? ` (Qty: ${selectedQuantity})` : selectedQuantity === "bulk" ? " (Custom bulk quantity)" : ""} (${priceStr})`;
  }, [product, selectedQuantity]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!product || !validateForm()) return;

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
          const productInfo = `\n\n${buildProductInfo()}`;
          const mailtoLink = `mailto:support@chibibadminton.com.au?subject=${encodeURIComponent(
            formData.subject
          )}&body=${encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"}${productInfo}\n\nMessage:\n${formData.message}`
          )}`;
          window.location.href = mailtoLink;
          setSubmitStatus({
            type: "success",
            message: "Opening your email client. If it doesn't open, please send an email to support@chibibadminton.com.au",
          });
          setTimeout(() => {
            setIsModalOpen(false);
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
          }, 2000);
        } else {
          const productInfo = buildProductInfo();
          await emailjs.send(
            serviceId,
            templateId,
            {
              from_name: formData.name,
              from_email: formData.email,
              phone: formData.phone || "Not provided",
              subject: formData.subject,
              message: `${productInfo}\n\n${formData.message}`,
              to_email: "support@chibibadminton.com.au",
            },
            publicKey
          );
          setSubmitStatus({
            type: "success",
            message: "Thank you! Your message has been sent successfully. We'll get back to you soon!",
          });
          setTimeout(() => {
            setIsModalOpen(false);
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            setSubmitStatus({ type: null, message: "" });
          }, 2000);
        }
      } catch (error) {
        console.error("Error sending email:", error);
        setSubmitStatus({
          type: "error",
          message: "Oops! Something went wrong. Please try again or contact us directly at support@chibibadminton.com.au",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [product, formData, validateForm, buildProductInfo]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setErrors({});
    setSubmitStatus({ type: null, message: "" });
  }, []);

  return {
    product,
    relatedProducts,
    loading,
    selectedImageIndex,
    setSelectedImageIndex,
    selectedQuantity,
    setSelectedQuantity,
    isModalOpen,
    setIsModalOpen,
    formData,
    errors,
    submitStatus,
    isSubmitting,
    handleChange,
    handleSubmit,
    closeModal,
    getProductPriceDisplay,
  };
}
