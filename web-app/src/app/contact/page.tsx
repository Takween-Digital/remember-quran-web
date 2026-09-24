import type { Metadata } from "next"
import { ContactForm } from "@/components/forms/ContactForm"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the RememberQuran team.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Contact Us
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          We would love to hear from you. Whether you have a question, feature request, or found a bug, please reach out to us.
        </p>
      </div>

      <div className="mt-16">
        <ContactForm />
      </div>
    </div>
  )
}
