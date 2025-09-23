import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import ServicesOverview from "@/components/services-overview";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Tag, Shield } from "lucide-react";

export default function Landing() {
  const handleStartAssessment = () => {
    window.location.href = "/api/login";
  };

  const pricingPlans = [
    {
      name: "Free Discovery",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Basic Behavioral Assessment",
        "Simple Progress Reports",
        "3 Educational Games",
        "Parent Dashboard Access"
      ],
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Complete Development",
      price: "$49",
      description: "per month",
      features: [
        "Complete Assessment Suite",
        "Unlimited Yoga Sessions",
        "Weekly Nutrition Plans",
        "Robotics Learning Access",
        "All Educational Games",
        "Expert Parent Support"
      ],
      buttonText: "Start Premium Trial",
      buttonVariant: "default" as const,
      popular: true
    },
    {
      name: "Family Package",
      price: "$89",
      description: "for up to 3 children",
      features: [
        "Everything in Premium",
        "Up to 3 Child Profiles",
        "Family Progress Comparison",
        "Priority Expert Support",
        "Monthly Family Consultation"
      ],
      buttonText: "Choose Family Plan",
      buttonVariant: "secondary" as const,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ServicesOverview />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple steps to unlock your child's potential with our comprehensive development platform.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Create Account",
                description: "Register with separate parent and child profiles for personalized experiences.",
                color: "primary"
              },
              {
                step: 2,
                title: "Take Assessment",
                description: "Complete comprehensive behavioral and cognitive assessments tailored to your child's age.",
                color: "secondary"
              },
              {
                step: 3,
                title: "Get Results",
                description: "Receive detailed PDF reports with scientific insights and personalized recommendations.",
                color: "accent"
              },
              {
                step: 4,
                title: "Start Programs",
                description: "Access yoga, nutrition, robotics, and games based on your child's unique profile.",
                color: "primary"
              }
            ].map((step, index) => (
              <div key={index} className="text-center" data-testid={`step-${step.step}`}>
                <div className={`w-20 h-20 bg-${step.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <span className={`text-2xl font-bold text-${step.color}-foreground`} data-testid={`step-number-${step.step}`}>
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4" data-testid={`step-title-${step.step}`}>
                  {step.title}
                </h3>
                <p className="text-muted-foreground" data-testid={`step-description-${step.step}`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Parent Dashboard
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Track your child's progress with our comprehensive parent dashboard. Get insights, view reports, and monitor development across all programs.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: CheckCircle,
                    title: "Progress Tracking",
                    description: "Real-time insights into your child's development",
                    color: "primary"
                  },
                  {
                    icon: CheckCircle,
                    title: "Downloadable Reports",
                    description: "Detailed PDF assessments and recommendations",
                    color: "secondary"
                  },
                  {
                    icon: CheckCircle,
                    title: "Program Scheduling",
                    description: "Manage yoga sessions, nutrition plans, and activities",
                    color: "accent"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center" data-testid={`dashboard-feature-${index}`}>
                    <div className={`w-8 h-8 bg-${feature.color} rounded-lg flex items-center justify-center mr-4`}>
                      <feature.icon className={`text-${feature.color}-foreground text-sm`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground" data-testid={`feature-title-${index}`}>
                        {feature.title}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`feature-description-${index}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleStartAssessment}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-colors"
                data-testid="button-view-demo-dashboard"
              >
                View Demo Dashboard
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Parent dashboard interface" 
                className="rounded-2xl shadow-2xl w-full h-auto"
                data-testid="img-dashboard-preview"
              />
              
              {/* Floating notification cards */}
              <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg max-w-xs" data-testid="notification-yoga">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-secondary rounded-full mr-2"></div>
                  <span className="text-sm font-medium">Emma completed Yoga Session</span>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg max-w-xs" data-testid="notification-assessment">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-accent rounded-full mr-2"></div>
                  <span className="text-sm font-medium">New Assessment Results Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Flexible pricing options to suit every family's needs. Start with our free assessment and upgrade as you explore more programs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`bg-card p-8 rounded-2xl shadow-lg relative ${
                  plan.popular ? 'border-2 border-primary shadow-2xl' : 'border border-border'
                }`}
                data-testid={`pricing-plan-${index}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold" data-testid="popular-badge">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2" data-testid={`plan-name-${index}`}>
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-foreground mb-2" data-testid={`plan-price-${index}`}>
                    {plan.price}
                  </div>
                  <p className="text-muted-foreground" data-testid={`plan-description-${index}`}>
                    {plan.description}
                  </p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center" data-testid={`plan-feature-${index}-${featureIndex}`}>
                      <CheckCircle className="text-secondary mr-3 h-4 w-4" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.buttonVariant}
                  className="w-full py-3 rounded-xl transition-colors"
                  onClick={handleStartAssessment}
                  data-testid={`button-plan-${index}`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4" data-testid="text-guarantee">
              All plans include 14-day money-back guarantee
            </p>
            <div className="flex justify-center items-center space-x-6" data-testid="payment-methods">
              <div className="text-3xl text-muted-foreground">💳</div>
              <div className="text-3xl text-muted-foreground">🏦</div>
              <div className="text-3xl text-muted-foreground">💰</div>
              <div className="text-3xl text-muted-foreground">💴</div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* CTA Section */}
      <section className="gradient-bg py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Child's Future?
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Join thousands of families who are already seeing incredible results. Start with our free assessment today and discover your child's unique potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              onClick={handleStartAssessment}
              className="bg-accent text-accent-foreground px-10 py-5 rounded-xl text-lg font-semibold hover:bg-accent/90 transition-colors shadow-xl"
              data-testid="button-cta-start-assessment"
            >
              🚀 Start Free Assessment
            </Button>
            <Button
              variant="outline"
              className="bg-white/20 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30"
              data-testid="button-cta-schedule-consultation"
            >
              📞 Schedule Consultation
            </Button>
          </div>
          
          <div className="mt-12 flex justify-center items-center space-x-8 text-white/80">
            <div className="flex items-center" data-testid="trust-badge-secure">
              <Shield className="mr-2" />
              <span>Secure & Safe</span>
            </div>
            <div className="flex items-center" data-testid="trust-badge-quick">
              <Clock className="mr-2" />
              <span>Quick Setup</span>
            </div>
            <div className="flex items-center" data-testid="trust-badge-expert">
              <Tag className="mr-2" />
              <span>Expert Approved</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
