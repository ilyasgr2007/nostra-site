"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isStoryOpen, setIsStoryOpen] = useState(false) // State for the collapsible story

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission here
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <section id="contact" className="py-20 bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6"></div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Contact</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Une question ? N'hésitez pas à nous contacter.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-bold mb-8">Envoyez-nous un message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="text"
                name="name"
                placeholder="Votre nom"
                value={formData.name}
                onChange={handleChange}
                className="h-12 bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-700"
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Votre email"
                value={formData.email}
                onChange={handleChange}
                className="h-12 bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-700"
                required
              />
              <Textarea
                name="message"
                placeholder="Votre message"
                value={formData.message}
                onChange={handleChange}
                className="min-h-[120px] bg-white dark:bg-black text-black dark:text-white border-gray-300 dark:border-gray-700"
                required
              />
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 h-12 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                Envoyer le message
              </Button>
            </form>
          </div>

          <div className="relative bg-black p-8 text-white rounded-lg shadow-lg border border-black dark:border-white bg-cover bg-center bg-no-repeat bg-[url('/images/contact-bg.jpeg')]">
            <div className="absolute inset-0 bg-black/50 rounded-lg"></div> {/* Overlay for readability */}
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-8">Informations de contact</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-white mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-gray-200">contact@nostra111.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-white mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Téléphone</h4>
                    <p className="text-gray-200">+212 631 809890</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-white mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Adresse</h4>
                    <p className="text-gray-200">
                      Mhamid Nahda
                      <br />
                      Marrakech, Maroc
                    </p>
                  </div>
                </div>
              </div>

              {/* Newsletter section */}
              <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-white flex items-center justify-center mr-3">
                    <span className="text-black font-bold text-sm">١١١</span>
                  </div>
                  <h4 className="font-bold text-white">Newsletter</h4>
                </div>
                <p className="text-gray-200 mb-4">Restez informé de nos dernières collections et actualités.</p>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Votre email"
                    className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-gray-300"
                  />
                  <Button className="bg-white hover:bg-gray-200 text-black">S'abonner</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Merged Story Section */}
          
        </div>
      </div>
    </section>
  )
}
