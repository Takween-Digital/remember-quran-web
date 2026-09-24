import type { Metadata } from "next"

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

      <div className="mt-16 bg-card rounded-2xl shadow-sm border p-8 sm:p-10 text-center">
        <h3 className="text-base font-semibold leading-7 text-foreground">Email Support</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          For any inquiries or feedback, send us an email and we'll get back to you as soon as possible.
        </p>
        <div className="mt-8 flex justify-center">
          <a
            href="mailto:contact@rememberquran.com"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            contact@rememberquran.com
          </a>
        </div>
      </div>
    </div>
  )
}
