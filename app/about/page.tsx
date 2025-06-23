import { Card, CardContent } from "@/components/ui/card"
import { Sprout, Users, ShieldCheck, Leaf, Award, Heart } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Abhinav Pratap Singh",
      role: "Developer & Founder",
      image: "/placeholder.svg?height=300&width=300",
      bio: "Full-stack developer passionate about connecting farmers directly with consumers through innovative technology solutions.",
    },
  ]

  const values = [
    {
      icon: ShieldCheck,
      title: "Quality",
      description: "We ensure only the freshest, highest quality produce reaches our customers.",
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a supportive ecosystem for farmers and consumers to thrive together.",
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description: "Promoting eco-friendly farming practices and reducing food miles.",
    },
    {
      icon: Heart,
      title: "Empathy",
      description: "Understanding the challenges of rural farmers and working to improve their livelihoods.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Striving for excellence in every aspect of our service and operations.",
    },
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative bg-natural-green text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-full">
                <Sprout className="h-12 w-12 text-natural-green" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About FreshKart</h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Bridging the gap between farmers and consumers, one fresh delivery at a time
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark-olive mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                FreshKart was born from a simple yet powerful vision: to create a direct connection between farmers and
                consumers, ensuring fresh produce reaches your table while providing fair compensation to our
                hardworking farmers.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We believe that everyone deserves access to fresh, quality produce, and every farmer deserves a fair
                price for their hard work. By eliminating middlemen, we create value for both sides of the equation.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-natural-green mb-2">50+</div>
                  <div className="text-gray-600">Farmers Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-natural-green mb-2">200+</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Farmers working in field"
                width={600}
                height={500}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-olive mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment to farmers and customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="farm-card text-center">
                <CardContent className="p-6">
                  <div className="mx-auto bg-natural-green/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                    <value.icon className="h-10 w-10 text-natural-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-dark-olive mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Fresh vegetables"
                width={600}
                height={500}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark-olive mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                FreshKart started in 2025 when developer Abhinav Pratap Singh witnessed the struggles of rural farmers
                trying to get fair prices for their produce. Despite growing the freshest vegetables and fruits, farmers
                were forced to sell at low prices to middlemen.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                At the same time, urban consumers were paying high prices for produce that wasn't always fresh. We saw
                an opportunity to solve both problems by creating a direct connection between farmers and consumers
                through innovative technology.
              </p>
              <p className="text-lg text-gray-600">
                Today, FreshKart is growing to serve multiple cities across India, supporting local farmers and
                delivering fresh produce to families. We're not just a marketplace; we're a movement towards a more
                sustainable and equitable food system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-olive mb-4">Meet Our Developer</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate individual working to revolutionize the way fresh produce reaches your table
            </p>
          </div>

          <div className="flex justify-center">
            <div className="max-w-sm">
              {teamMembers.map((member, index) => (
                <Card key={index} className="farm-card text-center">
                  <CardContent className="p-8">
                    <div className="relative mb-6">
                      <Image
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        width={200}
                        height={200}
                        className="w-40 h-40 rounded-full mx-auto object-cover border-4 border-natural-green/20"
                      />
                    </div>
                    <h3 className="text-2xl font-semibold text-dark-olive mb-2">{member.name}</h3>
                    <p className="text-natural-green font-medium mb-4 text-lg">{member.role}</p>
                    <p className="text-gray-600 leading-relaxed">{member.bio}</p>

                    {/* Contact Information */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <strong>Email:</strong> freshkartapp@gmail.com
                        </p>
                        <p>
                          <strong>Phone:</strong> +91 9958686941
                        </p>
                        <p>
                          <strong>Location:</strong> New Kondli, Delhi 110096
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-natural-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Growing Impact</h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Together, we're making a difference in the lives of farmers and consumers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-green-100">Farmers Connected</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">200+</div>
              <div className="text-green-100">Families Served</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">5+</div>
              <div className="text-green-100">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">₹5L+</div>
              <div className="text-green-100">Farmer Income Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-olive mb-6">Join Our Mission</h2>
          <p className="text-lg text-gray-600 mb-8">
            Whether you're a farmer looking to reach more customers or a consumer seeking fresh produce, we invite you
            to be part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup-seller"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-dark-olive bg-sunny-yellow hover:bg-earthy-orange transition-colors"
            >
              Join as Farmer
            </a>
            <a
              href="/signup-buyer"
              className="inline-flex items-center justify-center px-8 py-3 border border-natural-green text-base font-medium rounded-md text-natural-green bg-transparent hover:bg-natural-green hover:text-white transition-colors"
            >
              Start Shopping
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
